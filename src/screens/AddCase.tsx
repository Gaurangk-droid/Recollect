// ✅ src/screens/AddCase.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  Surface,
  Paragraph,
  Divider,
  Menu,
} from "react-native-paper";
import { supabase } from "../lib/supabaseClient";
import { useNavigation } from "@react-navigation/native";

// ---------- Helpers ----------
function generateCaseId(agencyName = "AGY", userName = "USR") {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
  const agencyPart = agencyName.slice(0, 3).toUpperCase();
  const userPart = userName.slice(0, 3).toUpperCase();
  return `${agencyPart}-${userPart}-${year}-${random}`;
}

// ---------- Main Component ----------
export default function AddCase() {
  const navigation = useNavigation();

  // ---------- States ----------
  const [profile, setProfile] = useState<any>(null);
  const [agencyUsers, setAgencyUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // ---------- Form Fields ----------
  const [loanType, setLoanType] = useState("");
  const [loanMenuVisible, setLoanMenuVisible] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [officeNumber, setOfficeNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [state, setState] = useState("");
  const [branch, setBranch] = useState("");
  const [bank, setBank] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [monthlyEmi, setMonthlyEmi] = useState("");
  const [overdueAmount, setOverdueAmount] = useState("");
  const [overdueSince, setOverdueSince] = useState("");
  const [pendingBalance, setPendingBalance] = useState("");
  const [pendingBalanceSource, setPendingBalanceSource] = useState<
    "overdue" | "upgrade"
  >("overdue");
  const [upgradeAmount, setUpgradeAmount] = useState("");
  const [loanTenureMonths, setLoanTenureMonths] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [previewCaseId, setPreviewCaseId] = useState("");

  // ---------- Load Profile & Agency ----------
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

        if (!prof) throw new Error("User not found");

        let agencyName = "AGY";
        if (prof.agency_id) {
          const { data: agency } = await supabase
            .from("agencies")
            .select("name")
            .eq("id", prof.agency_id)
            .maybeSingle();
          if (agency?.name) agencyName = agency.name;
        }

        setProfile({ ...prof, agency_name: agencyName });
        const userName = prof?.name ?? "USR";
        setPreviewCaseId(generateCaseId(agencyName, userName));

        if (prof.agency_id) {
          const { data: users } = await supabase
            .from("users")
            .select("id, name, role")
            .eq("agency_id", prof.agency_id);
          setAgencyUsers(users || []);
          setAssignedTo(prof.id);
          setAssignedToName(prof.name);
        }
      } catch (err: any) {
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // ---------- Auto-update Pending Balance ----------
  useEffect(() => {
    if (pendingBalanceSource === "overdue") {
      setPendingBalance(overdueAmount);
    } else if (pendingBalanceSource === "upgrade" && upgradeAmount) {
      setPendingBalance(upgradeAmount);
    }
  }, [pendingBalanceSource, overdueAmount, upgradeAmount]);

  // ---------- Validation ----------
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
      const case_id = generateCaseId(
        profile?.agency_name ?? "AGY",
        profile?.name ?? "USR"
      );

      const payload = {
        case_id,
        agency_id: profile?.agency_id ?? null,
        assigned_to: assignedTo || profile?.id,
        created_by: profile?.id,
        loan_type: loanType || null,
        account_name: accountName || null,
        account_number: accountNumber || null,
        contact_number: contactNumber || null,
        office_number: officeNumber || null,
        customer_name: customerName || null,
        customer_address: customerAddress || null,
        office_address: officeAddress || null,
        district,
        village,
        state,
        branch,
        bank,
        loan_amount: loanAmount ? Number(loanAmount) : null,
        monthly_emi: monthlyEmi ? Number(monthlyEmi) : null,
        overdue_amount: overdueAmount ? Number(overdueAmount) : null,
        overdue_since: overdueSince || null,
        pending_balance: pendingBalance ? Number(pendingBalance) : null,
        upgrade_amount: upgradeAmount ? Number(upgradeAmount) : null,
        loan_tenure_months: loanTenureMonths
          ? Number(loanTenureMonths)
          : null,
        status: "open",
        is_deleted: false,
      };

      const { error } = await supabase.from("cases").insert([payload]);
      if (error) throw error;

      Alert.alert("✅ Success", `Case created successfully!\nID: ${case_id}`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#004AAD" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.card}>
        <Title style={styles.title}>➕ Add New Case</Title>
        <Text style={styles.subtitle}>Case ID: {previewCaseId}</Text>

        {/* Account Info */}
        <Section title="Account & Customer Info">
          <Input label="Account Name *" value={accountName} onChangeText={setAccountName} />
          <Input label="Account Number" value={accountNumber} onChangeText={setAccountNumber} />
          <Input label="Contact Number" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
          <Input label="Office Number" value={officeNumber} onChangeText={setOfficeNumber} keyboardType="phone-pad" />
          <Input label="Customer Name" value={customerName} onChangeText={setCustomerName} />
          <Input label="Customer Address" value={customerAddress} onChangeText={setCustomerAddress} multiline />
          <Input label="Office Address" value={officeAddress} onChangeText={setOfficeAddress} multiline />
          <Input label="District" value={district} onChangeText={setDistrict} />
          <Input label="Village" value={village} onChangeText={setVillage} />
          <Input label="State" value={state} onChangeText={setState} />
        </Section>

        {/* Loan Info */}
        <Section title="Loan Details">
          <Menu
            visible={loanMenuVisible}
            onDismiss={() => setLoanMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setLoanMenuVisible(true)}>
                <TextInput
                  label="Loan Type"
                  mode="outlined"
                  value={loanType}
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" />}
                />
              </TouchableOpacity>
            }
          >
            {["Home Loan", "Gold Loan", "2 Wheeler Loan", "Auto Loan", "Personal Loan", "CC"].map((type) => (
              <Menu.Item
                key={type}
                onPress={() => {
                  setLoanType(type);
                  setLoanMenuVisible(false);
                }}
                title={type}
              />
            ))}
          </Menu>

          <Input label="Loan Amount" value={loanAmount} onChangeText={setLoanAmount} keyboardType="numeric" />
          <Input label="Monthly EMI" value={monthlyEmi} onChangeText={setMonthlyEmi} keyboardType="numeric" />
          <Input label="Overdue Amount *" value={overdueAmount} onChangeText={setOverdueAmount} keyboardType="numeric" />
          <Input label="Overdue Since (YYYY-MM-DD)" value={overdueSince} onChangeText={setOverdueSince} />
          <Input label="Upgrade Amount" value={upgradeAmount} onChangeText={setUpgradeAmount} keyboardType="numeric" />

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleOption, pendingBalanceSource === "overdue" && styles.activeToggle]}
              onPress={() => {
                setPendingBalance(overdueAmount);
                setPendingBalanceSource("overdue");
              }}
            >
              <Text style={[styles.toggleText, pendingBalanceSource === "overdue" && styles.activeToggleText]}>
                Overdue
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleOption, pendingBalanceSource === "upgrade" && styles.activeToggle]}
              onPress={() => {
                if (!upgradeAmount || Number(upgradeAmount) <= 0) {
                  Alert.alert("Missing", "Please enter an Upgrade Amount before selecting.");
                  return;
                }
                setPendingBalance(upgradeAmount);
                setPendingBalanceSource("upgrade");
              }}
            >
              <Text style={[styles.toggleText, pendingBalanceSource === "upgrade" && styles.activeToggleText]}>
                Upgrade
              </Text>
            </TouchableOpacity>
          </View>

          <Input label="Pending Balance" value={pendingBalance} editable={false} />
          <Input label="Loan Tenure (Months)" value={loanTenureMonths} onChangeText={setLoanTenureMonths} keyboardType="numeric" />
        </Section>

        {/* Bank & Assignment */}
        <Section title="Bank & Assignment">
          <Input label="Bank" value={bank} onChangeText={setBank} />
          <Input label="Branch" value={branch} onChangeText={setBranch} />

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <TextInput
                  label="Assign To"
                  mode="outlined"
                  value={assignedToName}
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" />}
                />
              </TouchableOpacity>
            }
          >
            {agencyUsers.length > 0 ? (
              agencyUsers.map((u) => (
                <Menu.Item
                  key={u.id}
                  onPress={() => {
                    setAssignedTo(u.id);
                    setAssignedToName(`${u.name} (${u.role})`);
                    setMenuVisible(false);
                  }}
                  title={`${u.name} (${u.role})`}
                />
              ))
            ) : (
              <Menu.Item title="No agents found" />
            )}
          </Menu>
        </Section>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitBtn}
          buttonColor="#004AAD"
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
    outlineColor="#004AAD"
    activeOutlineColor="#004AAD"
    style={styles.input}
    {...props}
  />
);

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f8faff" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    maxWidth: 950,
    alignSelf: "center",
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#004AAD", textAlign: "center" },
  subtitle: { textAlign: "center", color: "#666", marginBottom: 18 },
  section: { backgroundColor: "#fefefe", borderRadius: 10, padding: 14, marginBottom: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#004AAD", marginBottom: 6 },
  input: { marginBottom: 12, backgroundColor: "#fff" },
  submitBtn: { marginTop: 12, borderRadius: 8, paddingVertical: 6 },
  toggleContainer: { flexDirection: "row", borderWidth: 1, borderColor: "#ccc", borderRadius: 10, overflow: "hidden", marginBottom: 10 },
  toggleOption: { flex: 1, paddingVertical: 10, backgroundColor: "#f5f5f5", alignItems: "center" },
  activeToggle: { backgroundColor: "#004AAD" },
  toggleText: { color: "#555", fontWeight: "500" },
  activeToggleText: { color: "#fff", fontWeight: "bold" },
});
