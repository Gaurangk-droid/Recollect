import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Text, Menu, Avatar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { COLORS } from "../styles/theme";
import { RootStackParamList } from "../navigation/AppNavigator"; // 👈 adjust path if needed

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

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  // 👇 Logout Function
  const handleLogout = async () => {
    try {
      closeMenu();
      // Clear saved user/session data if any
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");

      // Navigate to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.log("Logout failed:", error);
    }
  };

  return (
    <View style={styles.header}>
      {/* Left: Toggle Icon — only visible on mobile/tablet */}
      {!isLargeScreen && (
        <TouchableOpacity onPress={onToggleMenu} style={styles.menuButton}>
          <Ionicons
            name={isDrawerOpen ? "close" : "menu"}
            size={26}
            color={COLORS.textLight}
          />
        </TouchableOpacity>
      )}

      {/* Center: App Title */}
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Recovery Portal</Text>
      </View>

      {/* Right: Notification + Profile */}
      <View style={styles.rightSection}>
        {/* Notification Icon */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textLight} />
          {notifCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notifCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Menu */}
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity onPress={openMenu} style={styles.profileContainer}>
              <Avatar.Text
                size={30}
                label={name.charAt(0).toUpperCase()}
                style={{ backgroundColor: COLORS.accent2 }}
                color={COLORS.textLight}
              />
              {isLargeScreen && (
                <Text style={styles.profileName}>{name}</Text>
              )}
              <Ionicons name="chevron-down" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          }
          contentStyle={styles.menuContent}
        >
          <Menu.Item
            onPress={() => {
              closeMenu();
              console.log("View Profile");
            }}
            title="View Profile"
            leadingIcon="account-outline"
          />
          <Menu.Item
            onPress={() => {
              closeMenu();
              console.log("Settings");
            }}
            title="Settings"
            leadingIcon="cog-outline"
          />
          <Menu.Item
            onPress={handleLogout}
            title="Logout"
            leadingIcon="logout"
          />
        </Menu>
      </View>
    </View>
  );
}

// ---------- Styles ----------
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
    zIndex: 20,
  },
  menuButton: {
    padding: 6,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: COLORS.textLight,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    padding: 6,
    position: "relative",
  },
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
  badgeText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: "700",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profileName: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: "500",
  },
  menuContent: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    marginTop: Platform.OS === "ios" ? 10 : 4,
  },
});
