import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import {
  Card,
  TextInput,
  ActivityIndicator,
  Chip,
  Button,
  Divider,
  Paragraph,
  Dialog,
  Portal,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabaseClient";
import {
  Banknote,
  User2,
  Building2,
  Layers,
  SlidersHorizontal,
} from "lucide-react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { COLORS } from "../styles/theme";

type Case = {
  id: string;
  case_id: string;
  account_name: string;
  customer_name: string;
  bank: string;
  branch: string;
  pending_balance: number | null;
  loan_type: string | null;
  assigned_to: string | null;
  status: string | null;
  agency_id: string | null;
};

type UserRow = {
  id: string;
  name: string;
  role: "agent" | "manager" | "super_admin";
  agency_id: string | null;
};

// ---------- Dropdown ----------
function Dropdown({
  label,
  valueLabel,
  onSelect,
  options,
}: {
  label: string;
  valueLabel: string;
  onSelect: (v: { label: string; value: string } | null) => void;
  options: { label: string; value: string }[];
}) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} activeOpacity={0.8}>
        <TextInput
          label={label}
          mode="outlined"
          value={valueLabel || "All"}
          editable={false}
          right={<TextInput.Icon icon="menu-down" />}
          style={styles.filterInput}
          textColor={COLORS.textPrimary}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />
      </TouchableOpacity>
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>{label}</Dialog.Title>
          <Dialog.Content>
            <TouchableOpacity
              onPress={() => {
                onSelect(null);
                setVisible(false);
              }}
              style={styles.dropdownItem}
            >
              <Paragraph>All</Paragraph>
              <Divider />
            </TouchableOpacity>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  onSelect(opt);
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

// ---------- Filter Card ----------
const FilterCard = memo(function FilterCard({
  profile,
  assignedOptions,
  loanOptions,
  bankOptions,
  applyFilters,
}: {
  profile: UserRow | null;
  assignedOptions: { label: string; value: string }[];
  loanOptions: { label: string; value: string }[];
  bankOptions: { label: string; value: string }[];
  applyFilters: (filters: {
    search: string;
    assigned: { label: string; value: string } | null;
    loan: { label: string; value: string } | null;
    bank: { label: string; value: string } | null;
  }) => void;
}) {
  const [search, setSearch] = useState("");
  const [assigned, setAssigned] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [loan, setLoan] = useState<{ label: string; value: string } | null>(
    null
  );
  const [bank, setBank] = useState<{ label: string; value: string } | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters({ search, assigned, loan, bank });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, assigned, loan, bank, applyFilters]);

  return (
    <Card style={[styles.filterCard, { backgroundColor: COLORS.card }]}>
      <Card.Title
        title="Filters"
        left={() => <SlidersHorizontal size={18} color={COLORS.primary} />}
        titleStyle={{ color: COLORS.textPrimary, fontWeight: "700" }}
      />
      <Card.Content>
        <TextInput
          placeholder="Search by Name, Account, or Case ID"
          value={search}
          onChangeText={setSearch}
          mode="outlined"
          style={styles.searchInput}
          textColor={COLORS.textPrimary}
          placeholderTextColor={COLORS.textSecondary}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
          blurOnSubmit={false}
        />
        {profile?.role !== "agent" && (
          <Dropdown
            label="Assigned To"
            valueLabel={assigned?.label || ""}
            options={assignedOptions}
            onSelect={setAssigned}
          />
        )}
        {profile?.role !== "agent" && (
          <Dropdown
            label="Loan Type"
            valueLabel={loan?.label || ""}
            options={loanOptions}
            onSelect={setLoan}
          />
        )}
        <Dropdown
          label="Bank"
          valueLabel={bank?.label || ""}
          options={bankOptions}
          onSelect={setBank}
        />
        <Divider
          style={{ marginVertical: 8, backgroundColor: COLORS.border }}
        />
      </Card.Content>
    </Card>
  );
});

// ---------- Main ----------
export default function ViewCasesScreen() {
  type Nav = NativeStackNavigationProp<RootStackParamList, "ViewCases">;
  const navigation = useNavigation<Nav>();

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [profile, setProfile] = useState<UserRow | null>(null);
  const [agencyUsers, setAgencyUsers] = useState<UserRow[]>([]);
  const casesRef = React.useRef<Case[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) return;
        const { data: prof } = await supabase
          .from("users")
          .select("id,name,role,agency_id")
          .eq("id", user.id)
          .maybeSingle();
        if (!prof) return;
        setProfile(prof as UserRow);

        let q = supabase.from("cases").select("*");
        if (prof.role === "agent") q = q.eq("assigned_to", prof.id);
        else q = q.eq("agency_id", prof.agency_id);
        const { data: caseData } = await q;
        const list = (caseData || []) as Case[];
        casesRef.current = list;
        setCases(list);
        setFilteredCases(list);

        if (prof.agency_id) {
          const { data: usersData } = await supabase
            .from("users")
            .select("id,name,role,agency_id")
            .eq("agency_id", prof.agency_id);
          setAgencyUsers((usersData || []) as UserRow[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loanOptions = useMemo(
    () =>
      Array.from(new Set(cases.map((c) => c.loan_type).filter(Boolean))).map(
        (v) => ({
          label: v!,
          value: v!,
        })
      ),
    [cases]
  );
  const bankOptions = useMemo(
    () =>
      Array.from(new Set(cases.map((c) => c.bank).filter(Boolean))).map(
        (v) => ({
          label: v!,
          value: v!,
        })
      ),
    [cases]
  );
  const assignedOptions = useMemo(
    () => agencyUsers.map((u) => ({ label: u.name, value: u.id })),
    [agencyUsers]
  );

  const applyFilters = useCallback(
    (filters: {
      search: string;
      assigned: { label: string; value: string } | null;
      loan: { label: string; value: string } | null;
      bank: { label: string; value: string } | null;
    }) => {
      const q = filters.search.trim().toLowerCase();
      const list = casesRef.current.filter((c) => {
        const textMatch =
          !q ||
          c.account_name?.toLowerCase().includes(q) ||
          c.customer_name?.toLowerCase().includes(q) ||
          c.case_id?.toLowerCase().includes(q);
        const assignedMatch =
          !filters.assigned || c.assigned_to === filters.assigned.value;
        const loanMatch = !filters.loan || c.loan_type === filters.loan.value;
        const bankMatch = !filters.bank || c.bank === filters.bank.value;
        return textMatch && assignedMatch && loanMatch && bankMatch;
      });
      setFilteredCases(list);
    },
    []
  );

  const renderCase = useCallback(
    ({ item }: { item: Case }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("CaseDetails", { caseId: String(item.id) })
        }
        style={styles.touchWrap}
      >
        <Card
          style={[
            styles.card,
            {
              backgroundColor: COLORS.card,
              borderColor: COLORS.border,
            },
          ]}
        >
          <Card.Title
            title={item.account_name || "Unknown Account"}
            subtitle={`${item.bank || "Unknown Bank"} • ${item.branch || "—"}`}
            titleStyle={{ color: COLORS.textPrimary, fontWeight: "700" }}
            subtitleStyle={{ color: COLORS.textSecondary }}
            left={() => <User2 size={22} color={COLORS.primary} />}
            right={() => (
              <Chip
                style={[styles.statusChip, { backgroundColor: COLORS.success }]}
                textStyle={{ color: COLORS.textLight, fontWeight: "700" }}
              >
                {(item.status || "OPEN").toUpperCase()}
              </Chip>
            )}
          />
          <Card.Content>
            <View style={styles.row}>
              <Banknote size={18} color={COLORS.primary} />
              <Paragraph style={{ color: COLORS.textPrimary }}>
                Pending: ₹{item.pending_balance ?? 0}
              </Paragraph>
            </View>
            <View style={styles.row}>
              <Building2 size={18} color={COLORS.primary} />
              <Paragraph style={{ color: COLORS.textSecondary }}>
                Case ID: {item.case_id}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    ),
    [navigation]
  );

  const CasesList = memo(({ data }: { data: Case[] }) => {
    const numColumns = Platform.OS === "web" ? 3 : 1;
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderCase}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
        contentContainerStyle={{ paddingBottom: 64 }}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Layers size={48} color={COLORS.textSecondary} />
            <Paragraph style={{ color: COLORS.textSecondary, marginTop: 8 }}>
              No cases found
            </Paragraph>
          </View>
        }
      />
    );
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: COLORS.bg }}
    >
      <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
        <FilterCard
          profile={profile}
          assignedOptions={assignedOptions}
          loanOptions={loanOptions}
          bankOptions={bankOptions}
          applyFilters={applyFilters}
        />
        {loading ? (
          <ActivityIndicator
            style={{ marginTop: 40 }}
            size="large"
            color={COLORS.primary}
          />
        ) : (
          <CasesList data={filteredCases} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filterCard: {
    marginBottom: 14,
    borderRadius: 12,
    elevation: 3,
  },
  filterInput: {
    marginBottom: 10,
    backgroundColor: COLORS.cardAlt,
  },
  searchInput: {
    marginBottom: 10,
    backgroundColor: COLORS.cardAlt,
  },
  dropdownItem: { paddingVertical: 10 },
  gridRow: { justifyContent: "space-between", gap: 12 },
  touchWrap: { flex: 1, marginHorizontal: 6 },
  card: {
    flex: 1,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusChip: { height: 28, alignItems: "center" },
  empty: { alignItems: "center", marginTop: 60 },
});
