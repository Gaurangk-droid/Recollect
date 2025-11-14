// UpdateCase.tsx
// Update an existing case. Mirrors AddCase inputs but WITHOUT assigned_to.
// Logs human-readable changes to `update_case_log` table in Supabase.

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
import { useRoute, useNavigation } from "@react-navigation/native";
import { DatePickerModal } from "react-native-paper-dates";
import { supabase } from "../lib/supabaseClient";

// ---------------- helpers ----------------
type RouteParams = { caseId: string };

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

// map of keys -> human readable label for logging
const FIELD_LABELS: Record<string, string> = {
  account_name: "Account Name",
  account_number: "Account Number",
  contact_number: "Contact Number",
  office_number: "Office Number",
  customer_name: "Customer Name",
  customer_address: "Customer Address",
  office_address: "Office Address",
  district: "District",
  village: "Village",
  state: "State",
  branch: "Branch",
  bank: "Bank",
  loan_amount: "Loan Amount",
  monthly_emi: "Monthly EMI",
  overdue_amount: "Overdue Amount",
  overdue_since: "Overdue Since",
  pending_balance: "Pending Balance",
  upgrade_amount: "Upgrade Amount",
  loan_tenure_months: "Loan Tenure (months)",
  loan_type: "Loan Type",
};

// ---------- component ----------
export default function UpdateCase() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { caseId } = route.params as RouteParams;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [confirmSaveVisible, setConfirmSaveVisible] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [originalCase, setOriginalCase] = useState<any>(null);

  // form fields (same as AddCase, excluding assigned_to)
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
  const [pendingBalanceSource, setPendingBalanceSource] = useState<
    "overdue" | "upgrade"
  >("overdue");
  const [upgradeAmount, setUpgradeAmount] = useState("");
  const [loanTenureMonths, setLoanTenureMonths] = useState("");

  const { width } = Dimensions.get("window");
    const isWeb = width > 900;

  // ---------- load current user & case ----------
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // profile
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (user) {
          const { data: p } = await supabase
            .from("users")
            .select("id, name, role, agency_id")
            .eq("id", user.id)
            .maybeSingle();
          setProfile(p || null);
        }

        // case data
        const { data: c, error } = await supabase
          .from("cases")
          .select("*")
          .eq("id", caseId)
          .single();

        if (error || !c) {
          Alert.alert("Error", "Failed to load case");
          setLoading(false);
          return;
        }

        setOriginalCase(c);

        // populate form with existing values (cast to string for inputs)
        setLoanType(c.loan_type ?? "");
        setAccountName(c.account_name ?? "");
        setAccountNumber(c.account_number ?? "");
        setContactNumber(c.contact_number ?? "");
        setOfficeNumber(c.office_number ?? "");
        setCustomerName(c.customer_name ?? "");
        setCustomerAddress(c.customer_address ?? "");
        setOfficeAddress(c.office_address ?? "");
        setDistrict(c.district ?? "");
        setVillage(c.village ?? "");
        setStateVal(c.state ?? "");
        setBranch(c.branch ?? "");
        setBank(c.bank ?? "");
        setLoanAmount(c.loan_amount != null ? String(c.loan_amount) : "");
        setMonthlyEmi(c.monthly_emi != null ? String(c.monthly_emi) : "");
        setOverdueAmount(c.overdue_amount != null ? String(c.overdue_amount) : "");
        setOverdueSince(c.overdue_since ?? "");
        setPendingBalance(c.pending_balance != null ? String(c.pending_balance) : "");
        setUpgradeAmount(c.upgrade_amount != null ? String(c.upgrade_amount) : "");
        setLoanTenureMonths(c.loan_tenure_months != null ? String(c.loan_tenure_months) : "");
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [caseId]);

  // auto pending balance logic (keeps parity with AddCase)
  useEffect(() => {
    if (pendingBalanceSource === "overdue") setPendingBalance(overdueAmount);
    else if (pendingBalanceSource === "upgrade" && upgradeAmount)
      setPendingBalance(upgradeAmount);
  }, [pendingBalanceSource, overdueAmount, upgradeAmount]);

  // ---------- helpers for change detection ----------
  const normalize = (v: any) => {
    if (v === null || v === undefined) return null;
    if (typeof v === "string" && v.trim() === "") return null;
    return v;
  };

  const buildChanges = (orig: any, currentForm: Record<string, any>) => {
    const changes: string[] = [];
    for (const key of Object.keys(FIELD_LABELS)) {
      const label = FIELD_LABELS[key] ?? key;
      const oldVal = normalize(orig?.[key]);
      const newVal = normalize(currentForm[key]);

      const changed = (() => {
        if (oldVal === null && newVal === null) return false;
        if (oldVal !== null && newVal !== null) {
          // compare numeric-ish values by coerced string to avoid 2 vs "2"
          return String(oldVal) !== String(newVal);
        }
        return true; // one is null, the other not
      })();

      if (changed) {
        changes.push(`${label}: "${oldVal ?? ""}" → "${newVal ?? ""}"`);
      }
    }
    return changes;
  };

  const getCurrentFormObject = () => ({
    loan_type: loanType || null,
    account_name: accountName || null,
    account_number: accountNumber || null,
    contact_number: contactNumber || null,
    office_number: officeNumber || null,
    customer_name: customerName || null,
    customer_address: customerAddress || null,
    office_address: officeAddress || null,
    district: district || null,
    village: village || null,
    state: stateVal || null,
    branch: branch || null,
    bank: bank || null,
    loan_amount: loanAmount ? Number(loanAmount) : null,
    monthly_emi: monthlyEmi ? Number(monthlyEmi) : null,
    overdue_amount: overdueAmount ? Number(overdueAmount) : null,
    overdue_since: overdueSince || null,
    pending_balance: pendingBalance ? Number(pendingBalance) : null,
    upgrade_amount: upgradeAmount ? Number(upgradeAmount) : null,
    loan_tenure_months: loanTenureMonths ? Number(loanTenureMonths) : null,
  });

  // ---------- Save handler ----------
  const handleSave = async () => {
    if (!originalCase) return;
    setConfirmSaveVisible(false);
    setSaving(true);

    try {
      const formObj = getCurrentFormObject();

      // prepare cleaned update payload (only keys we maintain)
      const payload = { ...formObj, updated_at: new Date().toISOString() };

      // update case in db
      const { error: updateError } = await supabase
        .from("cases")
        .update(payload)
        .eq("id", caseId);

      if (updateError) throw updateError;

      // build human readable change list
      const changes = buildChanges(originalCase, formObj);

      if (changes.length > 0) {
        const content = changes.join("\n");

        // insert into update_case_log table
        const { error: logErr } = await supabase.from("update_case_log").insert([
          {
            case_id: caseId,
            user_id: profile?.id ?? null,
            changed_at: new Date().toISOString(),
            content,
          },
        ]);
        if (logErr) console.warn("Failed to insert update_case_log:", logErr);

        // Optionally: also log as a quick note for UI visibility (uncomment if desired)
        // const { error: noteErr } = await supabase.from("notes").insert([{
        //   case_id: caseId,
        //   created_by: profile?.id ?? null,
        //   content: `Case updated:\n${content}`,
        //   created_at: new Date().toISOString()
        // }]);
        // if (noteErr) console.warn("Failed to insert note:", noteErr);
      }

      setSnackMsg("Case updated successfully");
      setShowSnackbar(true);

      // navigate back
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI / loader ----------
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#004AAD" />
        <Text style={{ marginTop: 10 }}>Loading case...</Text>
      </View>
    );
  }

  // ---------- Render form ----------
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>✏️ Update Case</Title>
        <Text style={styles.subtitle}>Case ID: {originalCase?.case_id ?? caseId}</Text>

        {/* Account & Customer */}
        {/* --- WEB / MOBILE RESPONSIVE 3 COLUMN WRAP --- */}
<View style={[isWeb ? styles.webRow : {}]}>
  
  {/* Column 1: Account & Customer */}
  <View style={[isWeb ? styles.webCol1 : {}]}>
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
        <Input label="State" value={stateVal} onChangeText={setStateVal} />
      </Card.Content>
    </Card>
  </View>

  {/* Column 2: Loan Details */}
  <View style={[isWeb ? styles.webCol2 : {}]}>
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
  </View>

  {/* Column 3: Loan Type & Bank */}
  <View style={[isWeb ? styles.webCol3 : {}]}>
    <Card style={styles.card}>
      <Card.Title title="Loan Type & Bank" titleStyle={styles.cardTitle} />
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
        <Input label="Bank" value={bank} onChangeText={setBank} />
        <Input label="Branch" value={branch} onChangeText={setBranch} />
      </Card.Content>
    </Card>

            {/* Buttons inside column 3 */}
            <View style={styles.btnRow}>
            <Button
                mode="contained"
                onPress={() => setConfirmSaveVisible(true)}
                loading={saving}
                style={[styles.btn, { backgroundColor: "#004AAD" }]}
            >
                {saving ? "Saving..." : "Save Changes"}
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

       
        <Snackbar visible={showSnackbar} onDismiss={() => setShowSnackbar(false)} duration={3000} style={{ backgroundColor: "#004AAD" }}>
          {snackMsg}
        </Snackbar>
      </ScrollView>

      {/* Confirm Save Dialog */}
      <Dialog visible={confirmSaveVisible} onDismiss={() => setConfirmSaveVisible(false)}>
        <Dialog.Title>Save changes?</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Are you sure you want to save these changes?</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setConfirmSaveVisible(false)}>No</Button>
          <Button
            onPress={() => {
              handleSave();
            }}
          >
            Yes
          </Button>
        </Dialog.Actions>
      </Dialog>
    </KeyboardAvoidingView>
  );
}

// ---------- styles ----------
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
    fontSize: 22,
    fontWeight: "700",
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

  webRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  gap: 16,
},

webCol1: {
  width: "35%",
},

webCol2: {
  width: "35%",
},

webCol3: {
  width: "30%",
},

  toggleBtn: { flex: 1, marginHorizontal: 4 },
  dropdownItem: { paddingVertical: 8 },
});
