// ✅ src/components/Sidebar.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const SIDEBAR_ACTIVE = "#f9be3fc8";
  const SIDEBAR_INACTIVE = "#FFFFFF";

  type SafeRoutes = Exclude<keyof RootStackParamList, "Login" | "CaseDetails">;

  const commonMenu: { label: string; icon: string; route: SafeRoutes }[] = [
    { label: "Dashboard", icon: "dashboard", route: "Dashboard" },
    { label: "Case List", icon: "list-alt", route: "ViewCases" },
    { label: "Activity", icon: "assignment", route: "Dashboard" },
    { label: "Calendar", icon: "calendar-today", route: "Dashboard" },
  ];

  const managerMenu: { label: string; icon: string; route: SafeRoutes }[] = [
    ...commonMenu,
    { label: "Add Case", icon: "add-circle-outline", route: "AddCase" },
    { label: "Reports", icon: "bar-chart", route: "Dashboard" },
  ];

  const menu = role === "manager" ? managerMenu : commonMenu;

  return (
    // ✅ SafeAreaView ensures correct top & bottom spacing on Android/iOS
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View
        style={[
          styles.sidebar,
          Platform.OS === "web" && { isolation: "isolate", zIndex: 9999 },
        ]}
      >
        <Text style={styles.logo}>Recovery Portal</Text>

        {menu.map((item) => {
          const isActive = active === item.route;
          const [hovered, setHovered] = useState(false);

          return (
            <Pressable
              key={item.label}
              onPress={() => {
                navigation.navigate(item.route as any);
                onClose && onClose();
              }}
              onHoverIn={() => Platform.OS === "web" && setHovered(true)}
              onHoverOut={() => Platform.OS === "web" && setHovered(false)}
              style={[
                styles.menuItem,
                isActive && styles.activeItem,
                hovered && !isActive && styles.hoverItem,
              ]}
            >
              <View style={{ isolation: "isolate" }}>
                <MaterialIcons
                  name={item.icon as any}
                  size={22}
                  color={
                    isActive
                      ? "rgba(239, 126, 51, 0.95)"
                      : "rgba(255, 255, 255, 0.95)"
                  }
                />
              </View>

              <Text
                style={[
                  styles.menuText,
                  { color: isActive ? SIDEBAR_ACTIVE : SIDEBAR_INACTIVE },
                  isActive && { fontWeight: "700" },
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
    backgroundColor: "#002B5B", // fills top & bottom behind system bars
  },
  sidebar: {
    flex: 1,
    backgroundColor: "#002B5B",
    paddingVertical: 30,
    paddingHorizontal: 14,
    ...(Platform.OS === "web" ? { isolation: "isolate", zIndex: 10 } : {}),
  },
  logo: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 30,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  activeItem: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
  },
  hoverItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuText: {
    fontSize: 15,
    marginLeft: 12,
  },
});
