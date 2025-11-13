// ✅ src/screens/CaseDetails.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Divider,
  IconButton,
  ActivityIndicator,
  Text,
  Surface,
  Button,
} from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import { supabase } from "../lib/supabaseClient";
import TransferCaseModal from "../components/TransferCaseModal";
import MaterialCommunityIconsRaw from "@expo/vector-icons/MaterialCommunityIcons";

const MaterialCommunityIcons =
  MaterialCommunityIconsRaw as unknown as React.ComponentType<{
    name: string;
    size?: number;
    color?: string;
  }>;

export default function CaseDetails() {
  const route = useRoute();
  const { caseId } = route.params as { caseId: string };

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showTransfer, setShowTransfer] = useState(false);

  const colors = {
    primary: "#60A5FA",
    accent: "#f59e0b",
    text: "#FFFFFF",
  };

  // ✅ Fetch current user (with agency_id)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
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

  // ✅ Fetch case + assigned user
  useEffect(() => {
    const fetchCase = async () => {
      try {
        const { data, error } = await supabase
          .from("cases")
          .select("*, assigned_user:assigned_to(id, name, role)")
          .eq("id", caseId)
          .single();

        if (error) console.error("Error fetching case:", error.message);
        else setCaseData(data);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (caseId) fetchCase();
  }, [caseId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" />
        <Text style={{ marginTop: 10 }}>Loading case details...</Text>
      </View>
    );
  }

  if (!caseData) {
    return (
      <View style={styles.center}>
        <Text>Case not found.</Text>
      </View>
    );
  }

  const val = (v: any) => (v ? v : "—");

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.headerCard}>
        <Title style={styles.title}>{val(caseData.account_name)}</Title>
        <Paragraph style={styles.subTitle}>
          {val(caseData.customer_name)}
        </Paragraph>
        <Divider style={styles.divider} />
        <Paragraph style={styles.caseId}>Case ID: {val(caseData.case_id)}</Paragraph>
        <Paragraph>Status: {val(caseData.status)}</Paragraph>

        <Paragraph style={{ marginTop: 6 }}>
          Assigned To:{" "}
          <Text style={{ fontWeight: "bold", color: colors.accent }}>
            {caseData.assigned_user?.name || "Unknown"}
          </Text>
        </Paragraph>

        <Button
          mode="outlined"
          textColor={colors.primary}
          style={styles.actionBtn}
          onPress={() => setShowTransfer(true)}
        >
          Transfer
        </Button>

        <TransferCaseModal
          visible={showTransfer}
          onClose={() => setShowTransfer(false)}
          caseId={caseData.id}
          currentUser={currentUser}
          currentAssigned={caseData.assigned_user}
        />
      </Surface>

      {/* Loan, Customer, and Contact Info sections remain unchanged */}
      <Card style={styles.sectionCard}>
        <Card.Title
          title="Loan Information"
          left={(props) => <IconButton {...props} icon="file-document" />}
        />
        <Card.Content>
          <InfoRow icon="cash" label="Loan Type" value={val(caseData.loan_type)} />
          <InfoRow icon="bank" label="Bank" value={val(caseData.bank)} />
          <InfoRow icon="office-building" label="Branch" value={val(caseData.branch)} />
          <InfoRow
            icon="currency-inr"
            label="Loan Amount"
            value={`₹${val(caseData.loan_amount)}`}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: any;
}) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={20} color="#333" />
    <Paragraph style={styles.infoLabel}>{label}:</Paragraph>
    <Paragraph style={styles.infoValue}>{value}</Paragraph>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7fb", padding: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerCard: {
    backgroundColor: "white",
    elevation: 3,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  subTitle: { fontSize: 16, color: "#555", marginBottom: 6 },
  caseId: { fontSize: 14, color: "#777" },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginVertical: 4,
  },
  infoLabel: { marginLeft: 6, fontWeight: "600", fontSize: 14, width: 150 },
  infoValue: { flexShrink: 1, fontSize: 14, color: "#333" },
  divider: { marginVertical: 8 },
  actionBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderColor: "#60A5FA",
  },
});
