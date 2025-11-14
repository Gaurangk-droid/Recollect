// CASEDETAILSV2.TSX
// --------------------------------------------------
// Modern UI, Light Mode, Web + Mobile safe
// Reuses TransferCaseModal + same case fields
// Bottom Call/SMS/Email bar for mobile
// --------------------------------------------------

import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Divider,
  Surface,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabaseClient";
import TransferCaseModal from "../components/TransferCaseModal";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get("window");
const isMobile = width < 700;

export default function CaseDetailsV2() {
  // ---------- NAV & ROUTE ----------
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { caseId } = route.params as { caseId: string };

  // ---------- STATE ----------
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showTransfer, setShowTransfer] = useState(false);

  // ---------- HELPERS ----------
  const maskAcc = (acc: string | null) => {
    if (!acc) return "—";
    if (acc.length < 4) return "****";
    return "XXXX-XXXX-" + acc.slice(-4);
  };

  const val = (v: any) => (v ? v : "—");

  // ---------- LOAD DATA ----------
  useEffect(() => {
    const load = async () => {
      // current user
      const { data: userAuth } = await supabase.auth.getUser();
      if (userAuth?.user) {
        const { data: p } = await supabase
          .from("users")
          .select("*")
          .eq("id", userAuth.user.id)
          .single();
        setCurrentUser(p);
      }

      // case data
      const { data } = await supabase
        .from("cases")
        .select("*, assigned_user:assigned_to(id, name, role)")
        .eq("id", caseId)
        .single();
      setCaseData(data);

      // notes
      const { data: n } = await supabase
        .from("notes")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });
      setNotes(n || []);

      setLoading(false);
    };

    load();
  }, [caseId]);

  // ---------- LOADING / EMPTY ----------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#004AAD" />
        <Text style={{ marginTop: 8 }}>Loading case...</Text>
      </View>
    );
  }

  if (!caseData) {
    return (
      <View style={styles.center}>
        <Text>No case found.</Text>
      </View>
    );
  }

  // ---------- UI ----------
  return (
    <View style={{ flex: 1, backgroundColor: "#f6f9ff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* ---------- TOP HEADER ---------- */}
        <Surface style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Title style={styles.headerTitle}>
                {val(caseData.account_name)}
              </Title>
              <Paragraph style={styles.subText}>
                {val(caseData.bank)} • {val(caseData.branch)}
              </Paragraph>
            </View>
            <Chip style={styles.statusChip}>{val(caseData.status)}</Chip>
          </View>

          <View style={styles.actionRow}>

          {currentUser?.role === "manager" && (<>

            <Button
              mode="contained"
              buttonColor="#130848ff"
              onPress={() => setShowTransfer(true)}
              icon="swap-horizontal"
            >
              Transfer
            </Button>

            <Button
              mode="contained"
              buttonColor="#05ae54ff"
              icon="pencil"
              onPress={() =>
                navigation.navigate("UpdateCase", {
                  caseId: caseData.id,
                })
              }
            >
              Update
            </Button>

            </>
            )}


            <Button
              mode="contained"
              buttonColor="#e11d1dff"
              icon="close"
              onPress={() => navigation.goBack()}
            >
              Close
            </Button>
          </View>
        </Surface>

        {/* ---------- FINANCIAL GRID ---------- */}
        <View style={styles.grid}>
          {[
            { label: "Loan Type", value: caseData.loan_type },
            { label: "Pending Amount", value: caseData.pending_balance },
            { label: "Monthly EMI", value: caseData.monthly_emi },
            { label: "Upgrade Amount", value: caseData.upgrade_amount },
            { label: "Overdue Amount", value: caseData.overdue_amount },
            { label: "Loan Amount", value: caseData.loan_amount },
          ].map((item, i) => (
            <Card key={i} style={styles.metricCard}>
              <Card.Content>
                <Paragraph style={styles.metricLabel}>{item.label}</Paragraph>
                <Title style={styles.metricValue}>₹{val(item.value)}</Title>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* ---------- CASE & ADDRESS DETAILS ---------- */}
        <Card style={styles.sectionCard}>
          <Card.Title
            title="Case Details"
            left={(props) => <MaterialIcons {...props} name="bookmark" />}
          />
          <Card.Content>
            <Paragraph>
              Account Number: {maskAcc(caseData.account_number)}
            </Paragraph>
            <Paragraph>
              Assigned To: {val(caseData.assigned_user?.name)}
            </Paragraph>
            <Paragraph>
              Created On:{" "}
              {caseData.created_at
                ? new Date(caseData.created_at).toLocaleDateString()
                : "—"}
            </Paragraph>
            <Paragraph>Contact: {val(caseData.contact_number)}</Paragraph>
            <Paragraph>Office Number: {val(caseData.office_number)}</Paragraph>

            <Divider style={{ marginVertical: 10 }} />

            <Text style={styles.boldLabel}>Customer Address</Text>
            <Paragraph>{val(caseData.customer_address)}</Paragraph>

            <Text style={[styles.boldLabel, { marginTop: 10 }]}>
              Office Address
            </Text>
            <Paragraph>{val(caseData.office_address)}</Paragraph>
          </Card.Content>
        </Card>

        {/* ---------- NOTES + CALENDAR ---------- */}
        <View
          style={[
            styles.rowWrap,
            { flexDirection: isMobile ? "column" : "row" },
          ]}
        >
          {/* Notes */}
          <Card style={[styles.sectionCard, { flex: 1 }]}>
            <Card.Title title="Notes" />
            <Card.Content>
              {notes.length === 0 ? (
                <Paragraph style={{ color: "#94a3b8" }}>
                  No notes yet.
                </Paragraph>
              ) : (
                notes.map((n) => (
                  <View key={n.id} style={styles.noteItem}>
                    <MaterialIcons name="comment" size={18} color="#004AAD" />
                    <View style={{ marginLeft: 10 }}>
                      <Paragraph>{n.content}</Paragraph>
                      <Text style={{ fontSize: 12, color: "#64748b" }}>
                        {new Date(n.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Card.Content>
          </Card>

          {/* Calendar */}
          <Card
            style={[
              styles.sectionCard,
              { flex: 1, marginLeft: isMobile ? 0 : 10 },
            ]}
          >
            <Card.Title title="Follow-up Calendar" />
            <Card.Content>
              <Calendar
                style={{ borderRadius: 12 }}
                theme={{
                  todayTextColor: "#004AAD",
                  selectedDayBackgroundColor: "#004AAD",
                }}
                markedDates={{
                  // later: replace with actual follow-up dates from DB
                  "2025-11-16": { marked: true, dotColor: "#004AAD" },
                }}
              />
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* ---------- MOBILE BOTTOM ACTION BAR ---------- */}
      {isMobile && (
        <View style={styles.bottomBar}>
          <Button
            mode="contained"
            buttonColor="#10b981"
            icon="phone"
            onPress={() =>
              caseData.contact_number &&
              Linking.openURL(`tel:${caseData.contact_number}`)
            }
            style={styles.bottomBtn}
          >
            Call
          </Button>

          <Button
            mode="contained"
            buttonColor="#b07541ff"
            icon="message"
            onPress={() =>
              caseData.contact_number &&
              Linking.openURL(`sms:${caseData.contact_number}`)
            }
            style={styles.bottomBtn}
          >
            SMS
          </Button>

          <Button
            mode="contained"
            buttonColor="#3b82f6"
            icon="email"
            onPress={() => {
              // If you add email column later, plug it here
              const email = caseData.customer_email || "";
              if (email) Linking.openURL(`mailto:${email}`);
            }}
            style={styles.bottomBtn}
          >
            Email
          </Button>
        </View>
      )}

      {/* ---------- TRANSFER MODAL ---------- */}
      <TransferCaseModal
        visible={showTransfer}
        onClose={() => setShowTransfer(false)}
        caseId={caseData.id}
        currentUser={currentUser}
        currentAssigned={caseData.assigned_user}
      />
    </View>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    padding: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
  },
  subText: { color: "#475569" },
  statusChip: {
    backgroundColor: "#e2e8f0",
    marginLeft: 10,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

grid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
},

metricCard: {
  backgroundColor: "#fff",
  alignItems:"center",
  borderRadius: 5,
  elevation: 1,
  margin: 8,                  // spacing
  width: "45%",               // keeps layout tidy
},
  metricLabel: { color: "#64748b", fontSize: 13 },
  metricValue: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },

  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 12,
  },

  boldLabel: {
    fontWeight: "700",
    color: "#1e293b",
  },

  rowWrap: { marginTop: 12 },

  noteItem: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    marginVertical: 6,
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  bottomBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
});
