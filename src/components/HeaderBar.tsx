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
import { globalStyles } from "../styles/globalStyles";

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
    Platform.OS === "web" ? 56 : 56 + (StatusBar.currentHeight || 0);

  function DropdownItem({
    children,
    onPress,
    isLast = false,
  }: {
    children: React.ReactNode;
    onPress: () => void;
    isLast?: boolean;
  }) {
    const [hovered, setHovered] = useState(false);

    return (
      <Pressable
        onPress={onPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({ pressed }) => [
          styles.menuItem,
          !isLast && styles.menuItemBorder, // Apply border only if NOT last
          isLast && styles.noBorder, // Force remove border for last item
          (pressed || hovered) && { backgroundColor: COLORS.primaryLight },
          pressed && { opacity: 0.9 },
        ]}
      >
        <Text style={styles.menuText}>{children}</Text>
      </Pressable>
    );
  }

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

      {/* Dropdown Menu */}
      {menuVisible && (
        <Portal>
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback>
                <Surface style={[styles.dropdownMenu, { top: dropdownTop }]}>
                  <DropdownItem
                    onPress={() => {
                      closeMenu();
                      console.log("View Profile");
                    }}
                  >
                    View Profile
                  </DropdownItem>

                  <DropdownItem
                    onPress={() => {
                      closeMenu();
                      console.log("Settings");
                    }}
                  >
                    Settings
                  </DropdownItem>

                  <DropdownItem isLast onPress={handleLogout}>
                    Logout
                  </DropdownItem>
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
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  title: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  menuButton: {
    padding: 6,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    borderRadius: 8,
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
  noBorder: {
    borderBottomWidth: 0, // ✅ Force remove any inherited border
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
    borderRadius: 16,
    width: 200,
    paddingVertical: 8,
    ...Platform.select({
      android: { elevation: 6 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});
