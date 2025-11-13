// ✅ src/screens/CaseDetails.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Divider,
  Button,
  Chip,
  ActivityIndicator,
  Text,
  Surface,
} from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import { supabase } from "../lib/supabaseClient";
import TransferCaseModal from "../components/TransferCaseModal";
import { Calendar } from "react-native-calendars";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function CaseDetails() {
  const route = useRoute();
  const { caseId } = route.params as { caseId: string };

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);

  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    accent: "#f97316",
    text: "#f8fafc",
    sub: "#94a3b8",
  };

  // ✅ Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();
        setCurrentUser(profile);
      }
    };
    fetchCurrentUser();
  }, []);

  // ✅ Fetch case data + notes
  useEffect(() => {
    const fetchCase = async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*, assigned_user:assigned_to(id, name, role)")
        .eq("id", caseId)
        .single();
      if (!error && data) setCaseData(data);
      setLoading(false);
    };

    const fetchNotes = async () => {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });
      if (data) setNotes(data);
    };

    if (caseId) {
      fetchCase();
      fetchNotes();
    }
  }, [caseId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading case details...</Text>
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

  const val = (v: any) => (v ? v : "—");

  // ---------- UI ----------
  return (
    <ScrollView style={styles.container}>
      {/* ---------- HEADER ---------- */}
      <Surface style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Title style={styles.title}>{val(caseData.account_name)}</Title>
          <Chip style={styles.statusChip}>{val(caseData.status)}</Chip>
        </View>
        <Paragraph style={styles.subTitle}>
          Bank: {val(caseData.bank)} | Branch: {val(caseData.branch)}
        </Paragraph>
        <Paragraph style={styles.subTitle}>
          Assigned To:{" "}
          <Text style={{ fontWeight: "bold", color: colors.accent }}>
            {caseData.assigned_user?.name || "Unknown"}
          </Text>
        </Paragraph>
        <View style={styles.actionRow}>
          <Button
            mode="outlined"
            textColor={colors.accent}
            onPress={() => setShowTransfer(true)}
          >
            Transfer
          </Button>
          <Button mode="contained" buttonColor="#22c55e" textColor="#fff">
            Update Case
          </Button>
          <Button mode="contained" buttonColor="#e11d48" textColor="#fff">
            Close
          </Button>
        </View>
      </Surface>

      {/* ---------- FINANCIAL CARDS ---------- */}
      <View style={styles.cardGrid}>
        {[
          { label: "EMI Amount", value: caseData.emi_amount },
          { label: "Pending Balance", value: caseData.pending_balance },
          { label: "Overdue", value: caseData.overdue_amount },
          { label: "Upgrade Amount", value: caseData.upgrade_amount },
          { label: "Amount Received", value: caseData.amount_received },
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

      {/* ---------- CUSTOMER DETAILS ---------- */}
      <Card style={styles.sectionCard}>
        <Card.Title
          title="Customer Details"
          left={(props) => <MaterialIcons {...props} name="person" />}
        />
        <Card.Content>
          <Paragraph>Name: {val(caseData.customer_name)}</Paragraph>
          <Paragraph>Contact: {val(caseData.contact_number)}</Paragraph>
          <Paragraph>Office Number: {val(caseData.office_number)}</Paragraph>
          <Divider style={{ marginVertical: 6 }} />
          <Paragraph style={{ fontWeight: "600" }}>Customer Address</Paragraph>
          <Paragraph>{val(caseData.customer_address)}</Paragraph>
          <Paragraph style={{ fontWeight: "600", marginTop: 8 }}>
            Office Address
          </Paragraph>
          <Paragraph>{val(caseData.alternate_address)}</Paragraph>
        </Card.Content>
      </Card>

      {/* ---------- NOTES + CALENDAR ---------- */}
      <View
        style={[
          styles.noteCalendarWrap,
          { flexDirection: width > 800 ? "row" : "column" },
        ]}
      >
        {/* Notes */}
        <Card style={[styles.sectionCard, { flex: 1 }]}>
          <Card.Title title="Notes" />
          <Card.Content>
            {notes.length === 0 ? (
              <Paragraph style={{ color: colors.sub }}>
                No notes available.
              </Paragraph>
            ) : (
              notes.map((note) => (
                <View key={note.id} style={styles.noteItem}>
                  <MaterialIcons
                    name="comment"
                    size={18}
                    color={colors.accent}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Paragraph style={{ color: colors.text }}>
                      {note.content}
                    </Paragraph>
                    <Text style={{ color: colors.sub, fontSize: 12 }}>
                      {new Date(note.created_at).toLocaleString()}
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
            { flex: 1, marginLeft: width > 800 ? 10 : 0 },
          ]}
        >
          <Card.Title title="Follow-up Calendar" />
          <Card.Content>
            <Calendar
              style={{
                borderRadius: 10,
                borderWidth: 0,
              }}
              theme={{
                backgroundColor: "white",
                calendarBackground: "white",
                todayTextColor: colors.accent,
              }}
              markedDates={{
                "2025-11-15": { marked: true, dotColor: colors.accent },
              }}
            />
          </Card.Content>
        </Card>
      </View>

      {/* ---------- MODAL ---------- */}
      <TransferCaseModal
        visible={showTransfer}
        onClose={() => setShowTransfer(false)}
        caseId={caseData.id}
        currentUser={currentUser}
        currentAssigned={caseData.assigned_user}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 10,
  },
  headerTop: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", flex: 1 },
  statusChip: {
    backgroundColor: "#e2e8f0",
    color: "#1e293b",
    fontWeight: "600",
  },
  subTitle: { color: "#475569", marginTop: 4 },
  actionRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    flexBasis: "48%",
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  metricLabel: { color: "#64748b", fontSize: 13 },
  metricValue: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 10,
    elevation: 2,
  },
  noteCalendarWrap: { marginTop: 10 },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 6,
    backgroundColor: "#0f172a",
    padding: 8,
    borderRadius: 8,
  },
});
