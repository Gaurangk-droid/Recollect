import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Pressable,
  Platform,
  StatusBar,
} from "react-native";
import { Text, Avatar, Surface, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { COLORS } from "../styles/theme";
import { RootStackParamList } from "../navigation/AppNavigator";

interface HeaderBarProps {
  onToggleMenu: () => void;
  name: string;
  isDrawerOpen?: boolean;
}

export default function HeaderBar({
  onToggleMenu,
  name,
  isDrawerOpen,
}: HeaderBarProps) {
  const isLargeScreen = Dimensions.get("window").width > 900;
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const toggleMenu = () => setMenuVisible((prev) => !prev);
  const closeMenu = () => setMenuVisible(false);

  const handleLogout = async () => {
    closeMenu();
    await AsyncStorage.multiRemove(["userToken", "userData"]);
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "AgencyVerification" }],
      });
    }, 150);
  };

  // Calculate safe offset below header
  const dropdownTop =
    Platform.OS === "web"
      ? 56 // header height only
      : 56 + (StatusBar.currentHeight || 0); // header + status bar

  return (
    <View style={styles.header}>
      {/* Left: Drawer toggle */}
      {!isLargeScreen && (
        <TouchableOpacity onPress={onToggleMenu} style={styles.menuButton}>
          <Ionicons
            name={isDrawerOpen ? "close" : "menu"}
            size={26}
            color={COLORS.textLight}
          />
        </TouchableOpacity>
      )}

      {/* Center: Title */}
      <Text style={styles.title}>Recovery Portal</Text>

      {/* Right: Notifications + Profile */}
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.textLight}
          />
          {notifCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notifCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMenu} style={styles.profileContainer}>
          <Avatar.Text
            size={30}
            label={name ? name.charAt(0).toUpperCase() : "U"}
            style={{ backgroundColor: COLORS.accent2 }}
            color={COLORS.textLight}
          />
          {isLargeScreen && <Text style={styles.profileName}>{name}</Text>}
          <Ionicons name="chevron-down" size={18} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* Dropdown menu (anchored below header) */}
      {menuVisible && (
        <Portal>
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback>
                <Surface style={[styles.dropdownMenu, { top: dropdownTop }]}>
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      closeMenu();
                      console.log("View Profile");
                    }}
                  >
                    <Text style={styles.menuText}>View Profile</Text>
                  </Pressable>
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      closeMenu();
                      console.log("Settings");
                    }}
                  >
                    <Text style={styles.menuText}>Settings</Text>
                  </Pressable>
                  <Pressable style={styles.menuItem} onPress={handleLogout}>
                    <Text style={styles.menuText}>Logout</Text>
                  </Pressable>
                </Surface>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Portal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: COLORS.header,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    zIndex: 10,
  },
  title: {
    color: COLORS.textLight,
    fontSize: 17,
    fontWeight: "700",
  },
  menuButton: { padding: 6 },
  rightSection: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconButton: { padding: 6, position: "relative" },
  badge: {
    position: "absolute",
    right: 2,
    top: 2,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: COLORS.textLight, fontSize: 10, fontWeight: "700" },
  profileContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  profileName: { color: COLORS.textLight, fontSize: 14, fontWeight: "500" },

  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  dropdownMenu: {
    position: "absolute",
    right: 10,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    elevation: 6,
    width: 200,
    paddingVertical: 6,
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14 },
  menuText: { color: COLORS.textPrimary, fontSize: 14 },
});
