import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { TextInput, Button, Title, Surface, Paragraph, Divider } from "react-native-paper";
import { supabase } from "../lib/supabaseClient";
import { useNavigation } from "@react-navigation/native";

// ---------- Helpers ----------
function generateCaseId(agencyCode = "A") {
  const y = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${agencyCode}-${y}-${rand}`;
}

// ---------- Main Component ----------
export default function AddCase() {
  const navigation = useNavigation();

  // ---------- States ----------
  const [profile, setProfile] = useState<any>(null);
  const [agencyUsers, setAgencyUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ---------- Form Fields ----------
  const [loanType, setLoanType] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [monthlyEmi, setMonthlyEmi] = useState("");
  const [overdueAmount, setOverdueAmount] = useState("");
  const [overdueSince, setOverdueSince] = useState("");
  const [branch, setBranch] = useState("");
  const [bank, setBank] = useState("");
  const [loanTenureMonths, setLoanTenureMonths] = useState("");
  const [upgradeAmount, setUpgradeAmount] = useState("");
  const [pendingBalance, setPendingBalance] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [previewCaseId, setPreviewCaseId] = useState("");

  // ---------- Load Profile & Agency Users ----------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) return setLoading(false);

        const { data: prof } = await supabase
          .from("users")
          .select("id, name, role, agency_id")
          .eq("id", user.id)
          .maybeSingle();

        setProfile(prof);

        // Generate Case ID preview
        const code = prof?.agency_id ? String(prof.agency_id).slice(0, 4).toUpperCase() : "A";
        setPreviewCaseId(generateCaseId(code));

        // Fetch users from same agency
        if (prof?.agency_id) {
          const { data: users } = await supabase
            .from("users")
            .select("id, name, role")
            .eq("agency_id", prof.agency_id);

          setAgencyUsers(users || []);
          setAssignedTo(prof.id);
        }
      } catch (err: any) {
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ---------- Validate ----------
  const validate = () => {
    if (!accountName.trim()) {
      Alert.alert("Validation", "Account name is required");
      return false;
    }
    if (!overdueAmount || Number(overdueAmount) <= 0) {
      Alert.alert("Validation", "Overdue amount must be greater than 0");
      return false;
    }
    return true;
  };

  // ---------- Submit ----------
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      const agencyCode = profile?.agency_id
        ? String(profile.agency_id).slice(0, 4).toUpperCase()
        : "A";
      const case_id = generateCaseId(agencyCode);

      const payload = {
        case_id,
        agency_id: profile?.agency_id ?? null,
        assigned_to: assignedTo || profile?.id,
        created_by: profile?.id,
        loan_type: loanType || null,
        account_name: accountName || null,
        account_number: accountNumber || null,
        contact_number: contactNumber || null,
        office_number: null,
        alternate_number: alternateNumber || null,
        customer_name: customerName || null,
        customer_address: customerAddress || null,
        office_address: officeAddress || null,
        alternate_address: null,
        district: null,
        village: null,
        state: null,
        branch: branch || null,
        bank: bank || null,
        loan_amount: loanAmount ? Number(loanAmount) : null,
        monthly_emi: monthlyEmi ? Number(monthlyEmi) : null,
        overdue_amount: overdueAmount ? Number(overdueAmount) : null,
        overdue_since: overdueSince || null,
        pending_balance: pendingBalance ? Number(pendingBalance) : null,
        emi_amount: null,
        upgrade_amount: upgradeAmount ? Number(upgradeAmount) : null,
        loan_tenure_months: loanTenureMonths ? Number(loanTenureMonths) : null,
        status: "open",
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("cases")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      Alert.alert("✅ Success", `Case created successfully!\nID: ${case_id}`);
      navigation.navigate("ViewCases");
    } catch (err: any) {
      console.error("Insert failed:", err);
      Alert.alert("Error", err.message || "Something went wrong while saving the case.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.card}>
        <Title style={styles.title}>➕ Add New Case</Title>
        <Text style={styles.subtitle}>Case ID Preview: {previewCaseId}</Text>

        {/* Section 1: Account Info */}
        <Section title="Account & Contact">
          <Input label="Account Name *" value={accountName} onChangeText={setAccountName} />
          <Input label="Customer Name" value={customerName} onChangeText={setCustomerName} />
          <Input label="Account Number" value={accountNumber} onChangeText={setAccountNumber} />
          <Input label="Loan Type" value={loanType} onChangeText={setLoanType} />
          <Input label="Contact Number" value={contactNumber} onChangeText={setContactNumber} />
          <Input label="Alternate Number" value={alternateNumber} onChangeText={setAlternateNumber} />
          <Input label="Office Address" value={officeAddress} onChangeText={setOfficeAddress} multiline />
          <Input label="Customer Address" value={customerAddress} onChangeText={setCustomerAddress} multiline />
        </Section>

        {/* Section 2: Financials */}
        <Section title="Financials">
          <Input label="Loan Amount" value={loanAmount} onChangeText={setLoanAmount} keyboardType="numeric" />
          <Input label="Monthly EMI" value={monthlyEmi} onChangeText={setMonthlyEmi} keyboardType="numeric" />
          <Input label="Overdue Amount *" value={overdueAmount} onChangeText={setOverdueAmount} keyboardType="numeric" />
          <Input label="Overdue Since" value={overdueSince} onChangeText={setOverdueSince} />
          <Input label="Upgrade Amount" value={upgradeAmount} onChangeText={setUpgradeAmount} keyboardType="numeric" />
          <Input label="Pending Balance" value={pendingBalance} onChangeText={setPendingBalance} keyboardType="numeric" />
          <Input label="Loan Tenure (months)" value={loanTenureMonths} onChangeText={setLoanTenureMonths} keyboardType="numeric" />
        </Section>

        {/* Section 3: Bank & Assignment */}
        <Section title="Bank & Assignment">
          <Input label="Bank" value={bank} onChangeText={setBank} />
          <Input label="Branch" value={branch} onChangeText={setBranch} />

          <Paragraph style={{ marginTop: 8, marginBottom: 4 }}>Assign To:</Paragraph>
          {agencyUsers.length > 0 ? (
            agencyUsers.map((u) => (
              <Button
                key={u.id}
                mode={assignedTo === u.id ? "contained" : "outlined"}
                style={{ marginVertical: 2 }}
                onPress={() => setAssignedTo(u.id)}
              >
                {u.name} ({u.role})
              </Button>
            ))
          ) : (
            <Text style={{ color: "#666" }}>No agents found</Text>
          )}
        </Section>

        <Divider style={{ marginVertical: 12 }} />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitBtn}
          buttonColor="#003366"
        >
          {submitting ? "Saving..." : "Create Case"}
        </Button>
      </Surface>
    </ScrollView>
  );
}

// ---------- Components ----------
const Section = ({ title, children }: any) => (
  <Surface style={styles.section}>
    <Paragraph style={styles.sectionTitle}>{title}</Paragraph>
    <Divider style={{ marginBottom: 8 }} />
    {children}
  </Surface>
);

const Input = (props: any) => (
  <TextInput
    mode="outlined"
    dense
    outlineColor="#003366"
    activeOutlineColor="#003366"
    style={styles.input}
    {...props}
  />
);

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f6fa",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#002B5B",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 4,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  submitBtn: {
    marginTop: 8,
    borderRadius: 8,
  },
});
