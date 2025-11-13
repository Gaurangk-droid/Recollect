import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../styles/theme";
import { RootStackParamList } from "../navigation/AppNavigator";

interface SidebarProps {
  active: keyof RootStackParamList;
  role?: "manager" | "agent";
  onClose?: () => void;
}

export default function Sidebar({
  active,
  role = "manager",
  onClose,
}: SidebarProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const SIDEBAR_ACTIVE = COLORS.accent;
  const SIDEBAR_INACTIVE = COLORS.textSecondary;

  type SafeRoutes = Exclude<keyof RootStackParamList, "Login" | "CaseDetails">;

  const commonMenu: { label: string; icon: string; route: SafeRoutes }[] = [
    { label: "Dashboard", icon: "dashboard", route: "Dashboard" },
    { label: "Case List", icon: "list-alt", route: "ViewCases" },
    { label: "Activity", icon: "assignment", route: "Activity" },
    { label: "Calendar", icon: "calendar-today", route: "Calendar" },
  ];

  const managerMenu: { label: string; icon: string; route: SafeRoutes }[] = [
    ...commonMenu,
    { label: "Add Case", icon: "add-circle-outline", route: "AddCase" },
    { label: "Reports", icon: "bar-chart", route: "Reports" },
  ];

  const menu = role === "manager" ? managerMenu : commonMenu;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.sidebar}>
        {menu.map((item, index) => {
          const isActive = active === item.route;
          const isHovered = hoveredIndex === index && !isActive;

          return (
            <Pressable
              key={item.label}
              onPress={() => {
                navigation.navigate(item.route as any);
                onClose && onClose();
              }}
              onHoverIn={() => Platform.OS === "web" && setHoveredIndex(index)}
              onHoverOut={() => Platform.OS === "web" && setHoveredIndex(null)}
              style={({ pressed }) => [
                styles.menuItem,
                isActive && styles.activeItem,
                isHovered && styles.hoverItem,
                pressed && { opacity: 0.9 },
              ]}
            >
              <MaterialIcons
                name={item.icon as any}
                size={22}
                color={isActive ? SIDEBAR_ACTIVE : SIDEBAR_INACTIVE}
              />

              <Text
                style={[
                  styles.menuText,
                  { color: isActive ? SIDEBAR_ACTIVE : SIDEBAR_INACTIVE },
                  isActive && styles.menuTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryLight, // soft blue background
  },
  sidebar: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 30,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  activeItem: {
    backgroundColor: COLORS.card, // white background for active
    shadowColor: COLORS.border,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  hoverItem: {
    backgroundColor: COLORS.primaryHover || "#E7F3FF", // light blue hover
    transform: [{ scale: 1.02 }],
  },
  menuText: {
    fontSize: 15,
    marginLeft: 12,
    color: COLORS.textSecondary,
  },
  menuTextActive: {
    fontWeight: "900",
    color: COLORS.accent,
  },
});
