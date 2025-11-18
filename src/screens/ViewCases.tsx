// src/screens/ViewCasesScreen.tsx
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
  TextInput as RNTextInput,
} from "react-native";
import {
  Card,
  TextInput,
  ActivityIndicator,
  Chip,
  Button,
  Divider,
  Paragraph,
  Portal,
  Dialog,
  Surface,
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

/* ---------- Types ---------- */
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

/* ---------- Main Screen ---------- */
export default function ViewCasesScreen() {
  type Nav = NativeStackNavigationProp<RootStackParamList, "ViewCases">;
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900; // breakpoint

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [profile, setProfile] = useState<UserRow | null>(null);
  const [agencyUsers, setAgencyUsers] = useState<UserRow[]>([]);
  const casesRef = useRef<Case[]>([]);

  // FILTER STATES (applied state)
  const [appliedSearch, setAppliedSearch] = useState(""); // used for applyFilters and to show cleared state
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

  const [filterVisible, setFilterVisible] = useState(false);

  // live typing ref + input ref (uncontrolled input)
  const searchRef = useRef<string>("");
  const inputRef = useRef<RNTextInput | null>(null);

  // Dropdown modal state (shared)
  const [activeDropdown, setActiveDropdown] = useState<
    "assigned" | "loan" | "bank" | null
  >(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOptions, setModalOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [modalTitle, setModalTitle] = useState<string>("");

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
        if ((prof as UserRow).role === "agent")
          q = q.eq("assigned_to", (prof as UserRow).id);
        else q = q.eq("agency_id", (prof as UserRow).agency_id);
        const { data: caseData } = await q;
        const list = (caseData || []) as Case[];
        casesRef.current = list;
        setCases(list);
        setFilteredCases(list);

        if ((prof as UserRow).agency_id) {
          const { data: usersData } = await supabase
            .from("users")
            .select("id,name,role,agency_id")
            .eq("agency_id", (prof as UserRow).agency_id);
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
        (v) => ({ label: v!, value: v! })
      ),
    [cases]
  );
  const bankOptions = useMemo(
    () =>
      Array.from(new Set(cases.map((c) => c.bank).filter(Boolean))).map(
        (v) => ({ label: v!, value: v! })
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
      setAppliedSearch(filters.search); // update applied state so "Clear"/button knows current applied search
    },
    []
  );

  // Debounce applyFilters reading from searchRef (not from controlled value)
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = (searchRef.current || "").trim();
      applyFilters({ search: current, assigned, loan, bank });
    }, 300);
    return () => clearTimeout(timer);
  }, [assigned, loan, bank, applyFilters]);

  // ---------- Dropdown modal helpers ----------
  const openDropdownModal = (which: "assigned" | "loan" | "bank") => {
    setActiveDropdown(which);
    if (which === "assigned") {
      setModalOptions(assignedOptions);
      setModalTitle("Assigned To");
    } else if (which === "loan") {
      setModalOptions(loanOptions);
      setModalTitle("Loan Type");
    } else {
      setModalOptions(bankOptions);
      setModalTitle("Bank");
    }
    setModalVisible(true);
  };

  const onSelectFromModal = (opt: { label: string; value: string } | null) => {
    if (activeDropdown === "assigned") setAssigned(opt);
    else if (activeDropdown === "loan") setLoan(opt);
    else if (activeDropdown === "bank") setBank(opt);
    setModalVisible(false);
    setActiveDropdown(null);
  };

  /* ---------- Render Case ---------- */
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
            { backgroundColor: COLORS.card, borderColor: COLORS.border },
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

  /* ---------- Desktop inline filter row ---------- */
  function DesktopFilterRow() {
    return (
      <View style={styles.desktopFiltersRow}>
        <View style={styles.desktopSearchWrap}>
          {/* UNCONTROLLED RN TextInput: keeps focus while typing */}
          <RNTextInput
            ref={inputRef}
            placeholder="Search by Name, Account, or Case ID"
            defaultValue={appliedSearch}
            onChangeText={(t) => {
              searchRef.current = t;

              // 🔥 LIVE real-time filtering when typing
              clearTimeout((inputRef as any)._timer);
              (inputRef as any)._timer = setTimeout(() => {
                applyFilters({
                  search: searchRef.current,
                  assigned,
                  loan,
                  bank,
                });
              }, 200);
            }}
            style={[
              styles.searchInputAlways,
              styles.searchDesktop,
              styles.rnSearch,
            ]}
            placeholderTextColor={COLORS.textSecondary}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
          />
        </View>

        <View style={styles.desktopFilterControls}>
          {profile?.role !== "agent" && (
            <TouchableOpacity
              style={styles.desktopFilterItemWrapper}
              onPress={() => openDropdownModal("assigned")}
            >
              <Surface style={styles.inlineFilterSurface}>
                <Paragraph style={styles.inlineFilterLabel}>
                  {assigned?.label || "Assigned"}
                </Paragraph>
                <Paragraph style={styles.inlineFilterChevron}>▾</Paragraph>
              </Surface>
            </TouchableOpacity>
          )}

          {profile?.role !== "agent" && (
            <TouchableOpacity
              style={styles.desktopFilterItemWrapper}
              onPress={() => openDropdownModal("loan")}
            >
              <Surface style={styles.inlineFilterSurface}>
                <Paragraph style={styles.inlineFilterLabel}>
                  {loan?.label || "Loan Type"}
                </Paragraph>
                <Paragraph style={styles.inlineFilterChevron}>▾</Paragraph>
              </Surface>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.desktopFilterItemWrapper}
            onPress={() => openDropdownModal("bank")}
          >
            <Surface style={styles.inlineFilterSurface}>
              <Paragraph style={styles.inlineFilterLabel}>
                {bank?.label || "Bank"}
              </Paragraph>
              <Paragraph style={styles.inlineFilterChevron}>▾</Paragraph>
            </Surface>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearFilterBtnDesktop}
            activeOpacity={0.85}
            onPress={() => {
              setAssigned(null);
              setLoan(null);
              setBank(null);
              searchRef.current = "";
              if (inputRef.current) inputRef.current.clear();
              applyFilters({
                search: "",
                assigned: null,
                loan: null,
                bank: null,
              });
            }}
          >
            <Paragraph style={styles.clearFilterTextDesktop}>Clear</Paragraph>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: COLORS.bg }}
    >
      <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
        {isDesktop ? (
          <DesktopFilterRow />
        ) : (
          <>
            {/* MOBILE: uncontrolled input too */}
            <RNTextInput
              ref={inputRef}
              placeholder="Search by Name, Account, or Case ID"
              defaultValue={appliedSearch}
              onChangeText={(t) => {
                searchRef.current = t;
              }}
              style={[styles.searchInputAlways, styles.rnSearch]}
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />

            <View style={styles.filterToggleWrap}>
              <TouchableOpacity
                style={styles.filterToggleButton}
                activeOpacity={0.85}
                onPress={() => setFilterVisible((p) => !p)}
              >
                <SlidersHorizontal size={16} color={COLORS.textLight} />
                <Paragraph style={styles.filterToggleText}>
                  {filterVisible ? "Hide Filters" : "Show Filters"}
                </Paragraph>
              </TouchableOpacity>
            </View>

            {filterVisible && (
              <Card
                style={[styles.filterCard, { backgroundColor: COLORS.card }]}
              >
                <Card.Content>
                  {profile?.role !== "agent" && (
                    <TouchableOpacity
                      onPress={() => openDropdownModal("assigned")}
                    >
                      <TextInput
                        label="Assigned To"
                        value={assigned?.label || ""}
                        editable={false}
                        mode="outlined"
                        right={<TextInput.Icon icon="chevron-down" />}
                        style={styles.filterInput}
                        outlineColor={COLORS.border}
                        activeOutlineColor={COLORS.primary}
                      />
                    </TouchableOpacity>
                  )}

                  {profile?.role !== "agent" && (
                    <TouchableOpacity onPress={() => openDropdownModal("loan")}>
                      <TextInput
                        label="Loan Type"
                        value={loan?.label || ""}
                        editable={false}
                        mode="outlined"
                        right={<TextInput.Icon icon="chevron-down" />}
                        style={styles.filterInput}
                        outlineColor={COLORS.border}
                        activeOutlineColor={COLORS.primary}
                      />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={() => openDropdownModal("bank")}>
                    <TextInput
                      label="Bank"
                      value={bank?.label || ""}
                      editable={false}
                      mode="outlined"
                      right={<TextInput.Icon icon="chevron-down" />}
                      style={styles.filterInput}
                      outlineColor={COLORS.border}
                      activeOutlineColor={COLORS.primary}
                    />
                  </TouchableOpacity>

                  <Divider
                    style={{
                      marginVertical: 10,
                      backgroundColor: COLORS.border,
                    }}
                  />

                  <View style={styles.filterCardFooter}>
                    <TouchableOpacity
                      style={styles.clearFilterBtn}
                      activeOpacity={0.85}
                      onPress={() => {
                        setAssigned(null);
                        setLoan(null);
                        setBank(null);
                        searchRef.current = "";
                        if (inputRef.current) inputRef.current.clear();
                        applyFilters({
                          search: "",
                          assigned: null,
                          loan: null,
                          bank: null,
                        });
                      }}
                    >
                      <Paragraph style={styles.clearFilterText}>
                        Clear
                      </Paragraph>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.applyFilterBtn}
                      activeOpacity={0.85}
                      onPress={() =>
                        applyFilters({
                          search: searchRef.current || "",
                          assigned,
                          loan,
                          bank,
                        })
                      }
                    >
                      <Paragraph style={styles.applyFilterText}>
                        Apply
                      </Paragraph>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            )}
          </>
        )}

        {loading ? (
          <ActivityIndicator
            style={{ marginTop: 40 }}
            size="large"
            color={COLORS.primary}
          />
        ) : (
          <CasesList data={filteredCases} />
        )}

        {/* ---------- SHARED BOTTOM-SHEET STYLE MODAL (Portal) ---------- */}
        <Portal>
          <Dialog
            visible={modalVisible}
            onDismiss={() => {
              setModalVisible(false);
              setActiveDropdown(null);
            }}
            style={styles.bottomSheetDialog}
          >
            <Dialog.Title
              style={{ color: COLORS.textPrimary, fontWeight: "700" }}
            >
              {modalTitle}
            </Dialog.Title>
            <Dialog.ScrollArea style={{ maxHeight: 320 }}>
              <View style={{ paddingHorizontal: 8 }}>
                <TouchableOpacity
                  onPress={() => {
                    onSelectFromModal(null);
                  }}
                  activeOpacity={0.8}
                  style={styles.popupItem}
                >
                  <Paragraph style={styles.popupText}>All</Paragraph>
                </TouchableOpacity>
                <Divider />
                {modalOptions.map((opt) => (
                  <View key={opt.value}>
                    <TouchableOpacity
                      onPress={() => onSelectFromModal(opt)}
                      activeOpacity={0.8}
                      style={styles.popupItem}
                    >
                      <Paragraph style={styles.popupText}>
                        {opt.label}
                      </Paragraph>
                    </TouchableOpacity>
                    <Divider />
                  </View>
                ))}
              </View>
            </Dialog.ScrollArea>

            <Dialog.Actions>
              <Button
                textColor={COLORS.primary}
                onPress={() => setModalVisible(false)}
              >
                Close
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.bg,
  },

  // search
  searchInputAlways: {
    backgroundColor: COLORS.card,
    height: 48,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  searchDesktop: {
    marginBottom: 0,
    height: 48,
  },

  // native RN TextInput style wrapper
  rnSearch: {
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // desktop layout: search left / filters right
  desktopFiltersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  desktopSearchWrap: {
    flex: 1,
  },
  desktopFilterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: 12,
    alignSelf: "stretch",
  },
  desktopFilterItem: {
    width: 180,
  },

  desktopFilterItemWrapper: {
    width: 160,
  },

  inlineFilterSurface: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.cardAlt,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inlineFilterLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },

  inlineFilterChevron: {
    color: COLORS.textSecondary,
    marginLeft: 8,
  },

  // filter toggle for mobile
  filterToggleWrap: {
    width: "100%",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  filterToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    elevation: 2,
  },
  filterToggleText: {
    color: COLORS.textLight,
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 14,
  },

  // filter card (mobile)
  filterCard: {
    borderRadius: 14,
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterInput: {
    marginBottom: 8,
    height: 46,
    borderRadius: 10,
    backgroundColor: COLORS.cardAlt,
  },
  filterInputCompact: {
    height: 40,
  },

  // footer inside mobile filter card
  filterCardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 6,
  },

  clearFilterBtn: {
    backgroundColor: COLORS.danger,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearFilterText: {
    color: COLORS.textLight,
    fontWeight: "700",
  },

  applyFilterBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  applyFilterText: {
    color: COLORS.textLight,
    fontWeight: "700",
  },

  // clear for desktop inline
  clearFilterBtnDesktop: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
  },
  clearFilterTextDesktop: {
    color: COLORS.textLight,
    fontWeight: "700",
  },

  // popup items
  popupItem: {
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  popupText: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },

  // bottom-sheet dialog tweaks
  bottomSheetDialog: {
    margin: 0,
    justifyContent: "flex-end",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },

  // cases list
  touchWrap: { flex: 1, marginHorizontal: 6 },
  card: {
    flex: 1,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    overflow: "hidden",
  },
  statusChip: {
    height: 28,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  gridRow: {
    justifyContent: "space-between",
    gap: 12,
  },
  empty: {
    alignItems: "center",
    marginTop: 80,
  },
});
