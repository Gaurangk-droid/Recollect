// Updated AddCase.tsx with same 3-column responsive UI as UpdateCase
// NOTE: Replace your existing AddCase.tsx with this.

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
  Dimensions,
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

// Case ID Generator
function generateCaseId(agencyName = "AGY", userName = "USR") {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  const agencyPart = agencyName.slice(0, 3).toUpperCase();
  const userPart = userName.slice(0, 3).toUpperCase();
  return `${agencyPart}-${userPart}-${year}-${random}`;
}

// Dropdown Component
function ModalDropdown({ label, value, onSelect, options }) {
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

  const { width } = Dimensions.get("window");
  const isWeb = width > 900;

  // STATE
  const [profile, setProfile] = useState(null);
  const [agencyUsers, setAgencyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [confirmSubmitVisible, setConfirmSubmitVisible] = useState(false);

  // FORM FIELDS
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
  const [stateVal, setStateVal] = useState("");
  const [branch, setBranch] = useState("");
  const [bank, setBank] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [monthlyEmi, setMonthlyEmi] = useState("");
  const [overdueAmount, setOverdueAmount] = useState("");
  const [overdueSince, setOverdueSince] = useState("");
  const [pendingBalance, setPendingBalance] = useState("");
  const [pendingBalanceSource, setPendingBalanceSource] = useState("overdue");
  const [upgradeAmount, setUpgradeAmount] = useState("");
  const [loanTenureMonths, setLoanTenureMonths] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedToName, setAssignedToName] = useState("");

  // LOAD PROFILE
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
        setAssignedTo(prof.id);
        setAssignedToName(prof.name);

        // load agency users
        if (prof.agency_id) {
          const { data: users } = await supabase
            .from("users")
            .select("id, name, role")
            .eq("agency_id", prof.agency_id);
          setAgencyUsers(users || []);
        }
      } catch (e) {
        Alert.alert("Error", e.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Auto pending balance
  useEffect(() => {
    if (pendingBalanceSource === "overdue") setPendingBalance(overdueAmount);
    else if (pendingBalanceSource === "upgrade" && upgradeAmount)
      setPendingBalance(upgradeAmount);
  }, [pendingBalanceSource, overdueAmount, upgradeAmount]);

  // Validation
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

  // Submit
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
        assigned_to: assignedTo,
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
        state: stateVal,
        branch,
        bank,
        loan_amount: loanAmount ? Number(loanAmount) : null,
        monthly_emi: monthlyEmi ? Number(monthlyEmi) : null,
        overdue_amount: overdueAmount ? Number(overdueAmount) : null,
        overdue_since: overdueSince || null,
        pending_balance: pendingBalance ? Number(pendingBalance) : null,
        upgrade_amount: upgradeAmount ? Number(upgradeAmount) : null,
        loan_tenure_months: loanTenureMonths ? Number(loanTenureMonths) : null,
        status: "open",
        is_deleted: false,
      };

      const { error } = await supabase.from("cases").insert([payload]);
      if (error) throw error;

      setSnackbarMsg("Case created successfully");
      setShowSnackbar(true);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#004AAD" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>➕ Add New Case</Title>

        {/* ROW WRAPPER */}
        <View style={[isWeb ? styles.webRow : {}]}>
          {/* COL 1 */}
          <View style={[isWeb ? styles.webCol1 : {}]}>
            <Card style={styles.card}>
              <Card.Title
                title="Account & Customer Info"
                titleStyle={styles.cardTitle}
              />
              <Card.Content>
                <TextInput
                  style={styles.input}
                  label="Account Name *"
                  mode="outlined"
                  value={accountName}
                  onChangeText={setAccountName}
                />
                <TextInput
                  style={styles.input}
                  label="Account Number"
                  mode="outlined"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                />
                <TextInput
                  style={styles.input}
                  label="Contact Number"
                  mode="outlined"
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  label="Office Number"
                  mode="outlined"
                  value={officeNumber}
                  onChangeText={setOfficeNumber}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  label="Customer Name"
                  mode="outlined"
                  value={customerName}
                  onChangeText={setCustomerName}
                />
                <TextInput
                  style={styles.input}
                  label="Customer Address"
                  mode="outlined"
                  value={customerAddress}
                  onChangeText={setCustomerAddress}
                  multiline
                />
                <TextInput
                  style={styles.input}
                  label="Office Address"
                  mode="outlined"
                  value={officeAddress}
                  onChangeText={setOfficeAddress}
                  multiline
                />
                <TextInput
                  style={styles.input}
                  label="District"
                  mode="outlined"
                  value={district}
                  onChangeText={setDistrict}
                />
                <TextInput
                  style={styles.input}
                  label="Village"
                  mode="outlined"
                  value={village}
                  onChangeText={setVillage}
                />
                <TextInput
                  style={styles.input}
                  label="State"
                  mode="outlined"
                  value={stateVal}
                  onChangeText={setStateVal}
                />
              </Card.Content>
            </Card>
          </View>

          {/* COL 2 */}
          <View style={[isWeb ? styles.webCol2 : {}]}>
            <Card style={styles.card}>
              <Card.Title title="Loan Details" titleStyle={styles.cardTitle} />
              <Card.Content>
                <TextInput
                  style={styles.input}
                  label="Loan Amount"
                  mode="outlined"
                  value={loanAmount}
                  onChangeText={setLoanAmount}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  label="Monthly EMI"
                  mode="outlined"
                  value={monthlyEmi}
                  onChangeText={setMonthlyEmi}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  label="Overdue Amount *"
                  mode="outlined"
                  value={overdueAmount}
                  onChangeText={setOverdueAmount}
                  keyboardType="numeric"
                />

                <TouchableOpacity onPress={() => setDatePickerOpen(true)}>
                  <TextInput
                    label="Overdue Since"
                    mode="outlined"
                    value={overdueSince}
                    editable={false}
                    style={styles.input}
                    right={<TextInput.Icon icon="calendar" />}
                  />
                </TouchableOpacity>

                <DatePickerModal
                  locale="en"
                  mode="single"
                  visible={datePickerOpen}
                  onDismiss={() => setDatePickerOpen(false)}
                  date={overdueSince ? new Date(overdueSince) : undefined}
                  onConfirm={({ date }) => {
                    if (date) setOverdueSince(date.toISOString().split("T")[0]);
                    setDatePickerOpen(false);
                  }}
                />

                <TextInput
                  style={styles.input}
                  label="Upgrade Amount"
                  mode="outlined"
                  value={upgradeAmount}
                  onChangeText={setUpgradeAmount}
                  keyboardType="numeric"
                />

                <View style={styles.toggleRow}>
                  <Button
                    mode={
                      pendingBalanceSource === "overdue"
                        ? "contained"
                        : "outlined"
                    }
                    onPress={() => {
                      setPendingBalanceSource("overdue");
                      setPendingBalance(overdueAmount);
                    }}
                    style={styles.toggleBtn}
                  >
                    Overdue
                  </Button>
                  <Button
                    mode={
                      pendingBalanceSource === "upgrade"
                        ? "contained"
                        : "outlined"
                    }
                    onPress={() => {
                      if (!upgradeAmount)
                        return Alert.alert("Enter upgrade amount first");
                      setPendingBalanceSource("upgrade");
                      setPendingBalance(upgradeAmount);
                    }}
                    style={styles.toggleBtn}
                  >
                    Upgrade
                  </Button>
                </View>

                <TextInput
                  style={styles.input}
                  label="Pending Balance"
                  mode="outlined"
                  value={pendingBalance}
                  editable={false}
                />
                <TextInput
                  style={styles.input}
                  label="Loan Tenure (Months)"
                  mode="outlined"
                  value={loanTenureMonths}
                  onChangeText={setLoanTenureMonths}
                  keyboardType="numeric"
                />
              </Card.Content>
            </Card>
          </View>

          {/* COL 3 */}
          <View style={[isWeb ? styles.webCol3 : {}]}>
            <Card style={styles.card}>
              <Card.Title
                title="Loan Type & Assignment"
                titleStyle={styles.cardTitle}
              />
              <Card.Content>
                <ModalDropdown
                  label="Loan Type"
                  value={loanType || ""}
                  onSelect={setLoanType}
                  options={[
                    { label: "CC", value: "CC" },
                    { label: "Gold Loan", value: "Gold Loan" },
                    { label: "Home Loan", value: "Home Loan" },
                    { label: "Personal Loan", value: "Personal Loan" },
                    { label: "2 Wheeler Loan", value: "2 Wheeler Loan" },
                    { label: "Auto Loan", value: "Auto Loan" },
                  ]}
                />

                <TextInput
                  style={styles.input}
                  label="Bank"
                  mode="outlined"
                  value={bank}
                  onChangeText={setBank}
                />
                <TextInput
                  style={styles.input}
                  label="Branch"
                  mode="outlined"
                  value={branch}
                  onChangeText={setBranch}
                />

                <ModalDropdown
                  label="Assigned To"
                  value={assignedToName}
                  onSelect={(id) => {
                    setAssignedTo(id);
                    const u = agencyUsers.find((x) => x.id === id);
                    setAssignedToName(u?.name || "");
                  }}
                  options={agencyUsers.map((u) => ({
                    label: u.name,
                    value: u.id,
                  }))}
                />
              </Card.Content>
            </Card>

            {/* BUTTONS */}
            <View style={styles.btnRow}>
              <Button
                mode="contained"
                onPress={() => setConfirmSubmitVisible(true)}
                loading={submitting}
                style={[styles.btn, { backgroundColor: "#004AAD" }]}
              >
                {submitting ? "Creating..." : "Create Case"}
              </Button>

              <Button
                mode="outlined"
                textColor="#004AAD"
                style={styles.btn}
                onPress={() => navigation.goBack()}
              >
                Cancel
              </Button>
            </View>
          </View>
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

      {/* Confirm Submit */}
      <Dialog
        visible={confirmSubmitVisible}
        onDismiss={() => setConfirmSubmitVisible(false)}
      >
        <Dialog.Title>Create Case?</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Are you sure you want to create this case?</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setConfirmSubmitVisible(false)}>No</Button>
          <Button onPress={handleSubmit}>Yes</Button>
        </Dialog.Actions>
      </Dialog>
    </KeyboardAvoidingView>
  );
}

// ------------- Styles -------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24, // a bit wider so content never hugs the edges
    paddingVertical: 20,
    backgroundColor: "#f8faff",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#004AAD",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 18,
    padding: 14, // add inner padding so fields don't touch card edges
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardTitle: {
    color: "#004AAD",
    fontWeight: "600",
  },
  btnRow: {
    flexDirection: "column",
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

  webRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  webCol1: { width: "35%", paddingHorizontal: 12 },
  webCol2: { width: "35%", paddingHorizontal: 12 },
  webCol3: { width: "30%", paddingHorizontal: 12 },
});
