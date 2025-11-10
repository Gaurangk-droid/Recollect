import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  Divider,
  Snackbar,
  Dialog,
  Portal,
  Card,
} from "react-native-paper";
import { supabase } from "../lib/supabaseClient";
import { useNavigation } from "@react-navigation/native";
import { DatePickerModal } from "react-native-paper-dates";

// ---------- Helpers ----------
function generateCaseId(agencyName = "AGY", userName = "USR") {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  const agencyPart = agencyName.slice(0, 3).toUpperCase();
  const userPart = userName.slice(0, 3).toUpperCase();
  return `${agencyPart}-${userPart}-${year}-${random}`;
}

// ---------- Reusable dropdown (Dialog-based) ----------
function ModalDropdown({
  label,
  value,
  onSelect,
  options,
}: {
  label: string;
  value: string;
  onSelect: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <TextInput
          label={label}
          mode="outlined"
          value={value}
          editable={false}
          right={<TextInput.Icon icon="menu-down" />}
          style={styles.input}
        />
      </TouchableOpacity>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>{label}</Dialog.Title>
          <Dialog.Content>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  onSelect(opt.value);
                  setVisible(false);
                }}
                style={styles.dropdownItem}
              >
                <Paragraph>{opt.label}</Paragraph>
                <Divider />
              </TouchableOpacity>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

export default function AddCase() {
  const navigation = useNavigation();

  // ---------- State ----------
  const [profile, setProfile] = useState<any>(null);
  const [agencyUsers, setAgencyUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [confirmSubmitVisible, setConfirmSubmitVisible] = useState(false);
  const [confirmClearVisible, setConfirmClearVisible] = useState(false);

  // ---------- Form ----------
  const [loanType, setLoanType] = useState("");
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

  // ---------- Load Profile ----------
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
        Alert.alert("Error", err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // ---------- Auto Pending Balance ----------
  useEffect(() => {
    if (pendingBalanceSource === "overdue") setPendingBalance(overdueAmount);
    else if (pendingBalanceSource === "upgrade" && upgradeAmount)
      setPendingBalance(upgradeAmount);
  }, [pendingBalanceSource, overdueAmount, upgradeAmount]);

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

  // ---------- Clear ----------
  const handleClear = () => {
    setLoanType("");
    setAccountName("");
    setAccountNumber("");
    setContactNumber("");
    setOfficeNumber("");
    setCustomerName("");
    setCustomerAddress("");
    setOfficeAddress("");
    setDistrict("");
    setVillage("");
    setState("");
    setBranch("");
    setBank("");
    setLoanAmount("");
    setMonthlyEmi("");
    setOverdueAmount("");
    setOverdueSince("");
    setPendingBalance("");
    setUpgradeAmount("");
    setLoanTenureMonths("");
    setPendingBalanceSource("overdue");
    setAssignedTo("");
    setAssignedToName("");
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

      setSnackbarMsg("✅ Case created successfully!");
      setShowSnackbar(true);
      setTimeout(() => handleClear(), 3000);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to save case");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Loader ----------
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#004AAD" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  // ---------- UI ----------
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>➕ Add New Case</Title>
        <Text style={styles.subtitle}>Case ID: {previewCaseId}</Text>

        {/* ---- Account Info ---- */}
        <Card style={styles.card}>
          <Card.Title title="Account & Customer Info" titleStyle={styles.cardTitle} />
          <Card.Content>
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
          </Card.Content>
        </Card>

        {/* ---- Loan Details ---- */}
        <Card style={styles.card}>
          <Card.Title title="Loan Details" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Input label="Loan Amount" value={loanAmount} onChangeText={setLoanAmount} keyboardType="numeric" />
            <Input label="Monthly EMI" value={monthlyEmi} onChangeText={setMonthlyEmi} keyboardType="numeric" />
            <Input label="Overdue Amount *" value={overdueAmount} onChangeText={setOverdueAmount} keyboardType="numeric" />
            <TouchableOpacity onPress={() => setDatePickerOpen(true)}>
              <TextInput
                label="Overdue Since"
                mode="outlined"
                value={overdueSince}
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
                style={styles.input}
              />
            </TouchableOpacity>
            <DatePickerModal
              locale="en"
              mode="single"
              visible={datePickerOpen}
              onDismiss={() => setDatePickerOpen(false)}
              date={overdueSince ? new Date(overdueSince) : undefined}
              onConfirm={({ date }) => {
                if (date) {
                  const formatted = date.toISOString().split("T")[0];
                  setOverdueSince(formatted);
                }
                setDatePickerOpen(false);
              }}
            />
            <Input label="Upgrade Amount" value={upgradeAmount} onChangeText={setUpgradeAmount} keyboardType="numeric" />
            <View style={styles.toggleRow}>
              <Button
                mode={pendingBalanceSource === "overdue" ? "contained" : "outlined"}
                onPress={() => {
                  setPendingBalance(overdueAmount);
                  setPendingBalanceSource("overdue");
                }}
                style={styles.toggleBtn}
              >
                Overdue
              </Button>
              <Button
                mode={pendingBalanceSource === "upgrade" ? "contained" : "outlined"}
                onPress={() => {
                  if (!upgradeAmount || Number(upgradeAmount) <= 0) {
                    Alert.alert("Missing", "Please enter an Upgrade Amount first.");
                    return;
                  }
                  setPendingBalance(upgradeAmount);
                  setPendingBalanceSource("upgrade");
                }}
                style={styles.toggleBtn}
              >
                Upgrade
              </Button>
            </View>
            <Input label="Pending Balance" value={pendingBalance} editable={false} />
            <Input label="Loan Tenure (Months)" value={loanTenureMonths} onChangeText={setLoanTenureMonths} keyboardType="numeric" />
          </Card.Content>
        </Card>

        {/* ---- Loan Type ---- */}
        <Card style={styles.card}>
          <Card.Title title="Loan Type" titleStyle={styles.cardTitle} />
          <Card.Content>
            <ModalDropdown
              label="Loan Type"
              value={loanType || ""}
              onSelect={(v) => setLoanType(v)}
              options={[
                { label: "CC", value: "CC" },
                { label: "Gold Loan", value: "Gold Loan" },
                { label: "Home Loan", value: "Home Loan" },
                { label: "Personal Loan", value: "Personal Loan" },
                { label: "2 Wheeler Loan", value: "2 Wheeler Loan" },
                { label: "Auto Loan", value: "Auto Loan" },
              ]}
            />
          </Card.Content>

           <Card.Title title="Assign To" titleStyle={styles.cardTitle} />
          <Card.Content>
            <ModalDropdown
              label="Assign To"
              value={assignedToName || ""}
              onSelect={(val) => {
                setAssignedTo(val);
                const u = agencyUsers.find((x) => x.id === val);
                setAssignedToName(u ? `${u.name} (${u.role})` : "");
              }}
              options={agencyUsers.map((u) => ({
                label: `${u.name} (${u.role})`,
                value: u.id,
              }))}
            />
          </Card.Content>
        </Card>

        {/* ---- Bank Details ---- */}
        <Card style={styles.card}>
          <Card.Title title="Bank Details" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Input label="Bank" value={bank} onChangeText={setBank} />
            <Input label="Branch" value={branch} onChangeText={setBranch} />
          </Card.Content>
        </Card>

        {/* ---- Assigned To ---- */}
      

        {/* ---- Buttons ---- */}
        <View style={styles.btnRow}>
          <Button
            mode="contained"
            onPress={() => setConfirmSubmitVisible(true)}
            loading={submitting}
            style={[styles.btn, { backgroundColor: "#004AAD" }]}
          >
            {submitting ? "Saving..." : "Create Case"}
          </Button>
          <Button
            mode="outlined"
            textColor="#004AAD"
            style={styles.btn}
            onPress={() => setConfirmClearVisible(true)}
          >
            Clear
          </Button>
        </View>

        <Snackbar
          visible={showSnackbar}
          onDismiss={() => setShowSnackbar(false)}
          duration={3000}
          style={{ backgroundColor: "#004AAD" }}
        >
          {snackbarMsg}
        </Snackbar>
      </ScrollView>

      {/* ---- Confirm Dialogs ---- */}
      <Dialog visible={confirmSubmitVisible} onDismiss={() => setConfirmSubmitVisible(false)}>
        <Dialog.Title>Create Case?</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Are you sure you want to create this case?</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setConfirmSubmitVisible(false)}>No</Button>
          <Button
            onPress={() => {
              setConfirmSubmitVisible(false);
              handleSubmit();
            }}
          >
            Yes
          </Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog visible={confirmClearVisible} onDismiss={() => setConfirmClearVisible(false)}>
        <Dialog.Title>Clear Form?</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Are you sure you want to clear?</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setConfirmClearVisible(false)}>No</Button>
          <Button
            onPress={() => {
              setConfirmClearVisible(false);
              handleClear();
            }}
          >
            Yes
          </Button>
        </Dialog.Actions>
      </Dialog>
    </KeyboardAvoidingView>
  );
}

// ---------- Components ----------
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
  container: {
    padding: 18,
    backgroundColor: "#f8faff",
    flexGrow: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#004AAD",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 12,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardTitle: {
    color: "#004AAD",
    fontWeight: "600",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 10,
  },
  btn: { flex: 1, borderRadius: 6 },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 10,
  },
  toggleBtn: { flex: 1, marginHorizontal: 4 },
  dropdownItem: { paddingVertical: 8 },
});
