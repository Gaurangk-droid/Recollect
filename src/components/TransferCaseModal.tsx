// ✅ src/components/TransferCaseModal.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabaseClient";
import { Button, Card } from "react-native-paper";
import { User2, ArrowRight, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react-native";

export default function TransferCaseModal({
  visible,
  onClose,
  caseId,
  currentUser,
  currentAssigned,
}: {
  visible: boolean;
  onClose: () => void;
  caseId: string;
  currentUser: any;
  currentAssigned: any;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const colors = {
    bg: "#0f172a",
    card: "#1e293b",
    accent: "#f59e0b",
    text: "#f8fafc",
    sub: "#94a3b8",
  };

  // ✅ Fetch users by agency_id (not agency_code)
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.agency_id) return;
      const { data, error } = await supabase
        .from("users")
        .select("id, name, role, agency_id")
        .eq("agency_id", currentUser.agency_id)
        .neq("id", currentAssigned?.id);

      if (!error && data) {
        setUsers(data);
        setFiltered(data);
      } else console.error("Error fetching users:", error?.message);
    };

    if (visible) fetchUsers();
  }, [visible]);

  // ✅ Search filter
  useEffect(() => {
    if (!search.trim()) setFiltered(users);
    else {
      const lower = search.toLowerCase();
      setFiltered(
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(lower) ||
            u.role.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, users]);

  // ✅ Perform Transfer
  const handleTransfer = async () => {
    if (!selectedUser) return;
    setLoading(true);

    // 1️⃣ Update case assignment
    const { error: updateErr } = await supabase
      .from("cases")
      .update({ assigned_to: selectedUser.id })
      .eq("id", caseId);

    if (updateErr) {
      console.error("❌ Error updating case:", updateErr);
      alert("Error updating case assignment.");
      setLoading(false);
      return;
    }

    // 2️⃣ Log in transfers
    const { error: insertErr } = await supabase.from("transfers").insert([
      {
        case_uuid: caseId,
        from_user: currentAssigned?.id,
        to_user: selectedUser.id,
        created_by: currentUser.id,
        status: "completed",
      },
    ]);

    setLoading(false);
    setConfirming(false);
    onClose();

    if (insertErr) alert("Error logging transfer: " + insertErr.message);
    else alert("✅ Case transferred successfully!");
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {!confirming ? (
          <Card style={styles.modal}>
            <Text style={styles.title}>Transfer Case</Text>

            {/* Current Assigned User */}
            <Text style={styles.label}>Current Assigned User</Text>
            <View style={styles.currentBox}>
              <User2 size={18} color={colors.accent} />
              <Text style={styles.currentText}>
                {currentAssigned?.name || "Unknown"}
              </Text>
            </View>

            {/* Dropdown */}
            <TouchableOpacity
              style={styles.dropdownToggle}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Text style={styles.dropdownLabel}>
                {selectedUser
                  ? `${selectedUser.name} (${selectedUser.role})`
                  : "Select new user"}
              </Text>
              {dropdownOpen ? (
                <ChevronUp size={18} color={colors.accent} />
              ) : (
                <ChevronDown size={18} color={colors.accent} />
              )}
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownContainer}>
                <TextInput
                  placeholder="Search users..."
                  placeholderTextColor={colors.sub}
                  value={search}
                  onChangeText={setSearch}
                  style={styles.input}
                />
                {filtered.length === 0 ? (
                  <Text style={{ color: colors.sub, textAlign: "center", marginTop: 8 }}>
                    No users found
                  </Text>
                ) : (
                  <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    style={{ maxHeight: 150 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.userRow,
                          selectedUser?.id === item.id && styles.selectedRow,
                        ]}
                        onPress={() => {
                          setSelectedUser(item);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.userText}>
                          {item.name} <Text style={styles.roleText}>({item.role})</Text>
                        </Text>
                        {selectedUser?.id === item.id && (
                          <CheckCircle2 size={18} color={colors.accent} />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={onClose}
                textColor={colors.text}
                style={{ borderColor: colors.accent }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                buttonColor={colors.accent}
                textColor={colors.bg}
                onPress={() => setConfirming(true)}
                disabled={!selectedUser}
              >
                Transfer
              </Button>
            </View>
          </Card>
        ) : (
          <Card style={styles.modal}>
            <Text style={styles.title}>Confirm Transfer</Text>
            <View style={styles.row}>
              <Text style={styles.name}>{currentAssigned?.name}</Text>
              <ArrowRight color={colors.accent} size={22} />
              <Text style={[styles.name, { color: colors.accent }]}>
                {selectedUser?.name}
              </Text>
            </View>
            <View style={styles.actions}>
              <Button
                mode="outlined"
                textColor={colors.text}
                onPress={() => setConfirming(false)}
                style={{ borderColor: colors.accent }}
              >
                Back
              </Button>
              <Button
                mode="contained"
                buttonColor={colors.accent}
                textColor={colors.bg}
                loading={loading}
                onPress={handleTransfer}
              >
                Confirm
              </Button>
            </View>
          </Card>
        )}
      </View>
    </Modal>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: Platform.OS === "web" ? 400 : "95%",
    borderRadius: 14,
    backgroundColor: "#1e293b",
    padding: 16,
  },
  title: { color: "#f8fafc", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  label: { color: "#94a3b8", fontSize: 13, marginBottom: 6 },
  currentBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  currentText: { color: "#f8fafc", marginLeft: 8 },
  dropdownToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  dropdownLabel: { color: "#f8fafc", fontSize: 14 },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    backgroundColor: "#0f172a",
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 6,
    padding: 8,
    color: "#f8fafc",
    marginBottom: 8,
    fontSize: 14,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  selectedRow: { backgroundColor: "rgba(245,158,11,0.15)" },
  userText: { color: "#f8fafc" },
  roleText: { color: "#94a3b8" },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14, gap: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  name: { color: "#f8fafc", fontWeight: "600" },
});
