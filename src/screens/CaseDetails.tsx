// src/screens/CaseDetails.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  Paragraph,
  Chip,
  Button,
  ActivityIndicator,
  Surface,
} from "react-native-paper";
import { supabase } from "../lib/supabaseClient";
import { useRoute } from "@react-navigation/native";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import TransferCaseModal from "../components/TransferCaseModal";

const { width } = Dimensions.get("window");

export default function CaseDetails() {
  const route = useRoute();
  const { caseId } = (route.params as any) ?? {};

  const [caseData, setCaseData] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransfer, setShowTransfer] = useState(false);

  const colors = {
    bg: "#F5F7FA",
    surface: "#FFFFFF",
    primary: "#2563EB",
    accent: "#F97316",
    text: "#1E293B",
    muted: "#64748B",
    border: "#E2E8F0",
  };

  // ---------------- Fetch Case + Notes ----------------
  useEffect(() => {
    const loadAll = async () => {
      try {
        const { data } = await supabase
          .from("cases")
          .select("*, assigned_user:assigned_to(id, name, role)")
          .eq("id", caseId)
          .single();

        setCaseData(data);

        const { data: notesList } = await supabase
          .from("notes")
          .select("*")
          .eq("case_id", caseId)
          .order("created_at", { ascending: false });

        setNotes(notesList || []);
      } catch (e) {
        console.log("Load error:", e);
      } finally {
        setLoading(false);
      }
    };

    if (caseId) loadAll();
  }, [caseId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.muted }}>
          Loading Case Details...
        </Text>
      </View>
    );
  }

  if (!caseData) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.muted }}>Case not found.</Text>
      </View>
    );
  }

  const val = (v: any) => (v || v === 0 ? v : "—");

  // ---------------- UI Rendering ----------------
  return (
    <View style={[styles.page, { backgroundColor: colors.bg }]}>
      {/* 🔵 TOP SUMMARY BAR */}
      <Surface style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.caseTitle, { color: colors.text }]}>
            {val(caseData.account_name)}
          </Text>

          <View style={styles.headerRow}>
            <Chip textStyle={{ color: colors.primary }}>
              {String(caseData.status).toUpperCase()}
            </Chip>

            <Text style={[styles.subText, { marginLeft: 8 }]}>
              {val(caseData.bank)} • {val(caseData.branch)}
            </Text>
          </View>

          <Text style={[styles.subText, { marginTop: 6 }]}>
            Assigned to:{" "}
            <Text style={{ color: colors.primary, fontWeight: "700" }}>
              {caseData.assigned_user?.name ?? "—"}
            </Text>
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.headerActions}>
          <Button
            mode="outlined"
            compact
            textColor={colors.primary}
            onPress={() => setShowTransfer(true)}
            style={styles.smallBtn}
          >
            Transfer
          </Button>

          <Button
            mode="contained"
            compact
            buttonColor={colors.primary}
            textColor="#fff"
            style={styles.smallBtn}
          >
            Update
          </Button>

          <Button
            mode="outlined"
            compact
            textColor="#EF4444"
            style={styles.smallBtn}
          >
            Close
          </Button>
        </View>
      </Surface>

      {/* 🔵 MIDDLE GRID: FINANCIAL + CUSTOMER */}
      <View
        style={[
          styles.middleGrid,
          { flexDirection: width > 900 ? "row" : "column" },
        ]}
      >
        {/* Financial Summary */}
        <View style={{ flex: 1 }}>
          <Card style={[styles.finCardParent]}>
            <Card.Title
              title="Financial Summary"
              left={() => (
                <MaterialIcons
                  name="analytics"
                  size={22}
                  color={colors.primary}
                />
              )}
            />

            <Card.Content>
              <View style={styles.finGrid}>
                <FinCard
                  icon="cash-multiple"
                  label="EMI Amount"
                  value={val(caseData.emi_amount)}
                />
                <FinCard
                  icon="cash-remove"
                  label="Pending"
                  value={val(caseData.pending_balance)}
                />
                <FinCard
                  icon="calendar-clock"
                  label="Overdue"
                  value={val(caseData.overdue_amount)}
                />
                <FinCard
                  icon="trending-up"
                  label="Upgrade"
                  value={val(caseData.upgrade_amount)}
                />
                <FinCard
                  icon="cash-check"
                  label="Received"
                  value={val(caseData.amount_received)}
                />
                <FinCard
                  icon="bank"
                  label="Loan Amount"
                  value={val(caseData.loan_amount)}
                />
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Customer Details */}
        <View
          style={{
            width: width > 900 ? 360 : "100%",
            marginTop: width > 900 ? 0 : 12,
          }}
        >
          <Card style={styles.customerCard}>
            <Card.Title
              title="Customer Details"
              left={() => (
                <MaterialCommunityIcons
                  name="account"
                  size={22}
                  color={colors.primary}
                />
              )}
            />

            <Card.Content>
              <DetailRow label="Name" value={val(caseData.customer_name)} />
              <DetailRow label="Phone" value={val(caseData.contact_number)} />
              <DetailRow label="Office" value={val(caseData.office_number)} />

              <Text style={styles.rowLabel}>Address</Text>
              <Text style={styles.rowValue}>{val(caseData.customer_address)}</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* 🔵 BOTTOM GRID: NOTES + CALENDAR */}
      <View
        style={[
          styles.bottomGrid,
          { flexDirection: width > 900 ? "row" : "column" },
        ]}
      >
        {/* Notes */}
        <View style={{ flex: 1 }}>
          <Card style={styles.notesCard}>
            <Card.Title
              title="Notes"
              left={() => (
                <MaterialCommunityIcons
                  name="note-text"
                  size={20}
                  color={colors.primary}
                />
              )}
            />

            <Card.Content>
              <ScrollView style={{ maxHeight: 350 }}>
                {notes.length === 0 ? (
                  <Text style={{ color: colors.muted }}>No notes.</Text>
                ) : (
                  notes.map((n) => (
                    <View key={n.id} style={styles.noteRow}>
                      <MaterialIcons
                        name="comment"
                        size={18}
                        color={colors.primary}
                      />
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.noteText}>{n.content}</Text>
                        <Text style={styles.noteTime}>
                          {new Date(n.created_at).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </Card.Content>
          </Card>
        </View>

        {/* Calendar */}
        <View
          style={{
            width: width > 900 ? 340 : "100%",
            marginLeft: width > 900 ? 12 : 0,
            marginTop: width > 900 ? 0 : 12,
          }}
        >
          <Card style={styles.calendarCard}>
            <Card.Title
              title="Follow-up Calendar"
              left={() => (
                <MaterialIcons
                  name="event"
                  size={22}
                  color={colors.primary}
                />
              )}
            />

            <Card.Content>
              <MiniCalendar />
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Transfer Modal */}
      <TransferCaseModal
        visible={showTransfer}
        onClose={() => setShowTransfer(false)}
        caseId={caseData.id}
        currentAssigned={caseData.assigned_user}
        currentUser={null}
      />
    </View>
  );
}

// ------------------- Reusable Components -------------------

function FinCard({ icon, label, value }: any) {
  return (
    <View style={styles.finCard}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color="#2563EB"
        style={{ marginBottom: 4 }}
      />
      <Text style={styles.finLabel}>{label}</Text>
      <Text style={styles.finValue}>₹ {value}</Text>
    </View>
  );
}

function DetailRow({ label, value }: any) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// clean small inline calendar (no libs)
function MiniCalendar() {
  const today = new Date().toDateString();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <View>
      <View style={styles.calHeader}>
        <Text style={styles.calHeaderText}>This Week</Text>
      </View>

      <View style={styles.calWeekRow}>
        {days.map((d) => (
          <View key={d} style={styles.calDayBox}>
            <Text style={styles.calDayText}>{d}</Text>
            <View style={styles.calDot} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ------------------- Styles -------------------
const styles = StyleSheet.create({
  page: { flex: 1, padding: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    padding: 14,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
  },
  headerLeft: { flex: 1 },
  caseTitle: { fontSize: 22, fontWeight: "700" },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  subText: { color: "#64748B", fontSize: 13 },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallBtn: { paddingHorizontal: 6, paddingVertical: 2 },

  middleGrid: { gap: 12, marginTop: 6 },
  finCardParent: { borderRadius: 10 },
  finGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },

  finCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    elevation: 1,
    alignItems: "center",
  },
  finLabel: { color: "#64748B", fontSize: 12 },
  finValue: { fontSize: 16, fontWeight: "700", marginTop: 3 },

  customerCard: { borderRadius: 10, elevation: 2 },

  rowLabel: { fontSize: 12, color: "#64748B" },
  rowValue: { fontSize: 15, fontWeight: "600", color: "#1E293B" },

  bottomGrid: { marginTop: 10, gap: 12 },
  notesCard: { borderRadius: 10 },
  noteRow: { flexDirection: "row", marginBottom: 10 },
  noteText: { color: "#1E293B" },
  noteTime: { color: "#64748B", fontSize: 12 },

  calendarCard: { borderRadius: 10 },

  calHeader: { alignItems: "center", marginBottom: 10 },
  calHeaderText: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  calWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  calDayBox: { alignItems: "center" },
  calDayText: { color: "#64748B", fontSize: 12 },
  calDot: {
    width: 6,
    height: 6,
    backgroundColor: "#2563EB",
    marginTop: 4,
    borderRadius: 50,
  },
});

