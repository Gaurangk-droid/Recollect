import React from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

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

  return (
    <View style={styles.header}>
      {/* Left: Toggle Icon — only visible on mobile/tablet */}
      {!isLargeScreen && (
        <TouchableOpacity onPress={onToggleMenu} style={styles.menuButton}>
          <Ionicons
            name={isDrawerOpen ? "close" : "menu"}
            size={26}
            color="#fff"
          />
        </TouchableOpacity>
      )}

      {/* Center: App Title */}
      <View style={styles.logoContainer}>
        <Text style={styles.title}>Recovery Portal</Text>
      </View>

      {/* Right: Welcome */}
      <Text style={styles.welcome}>Hi, {name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: "#002B5B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    elevation: 4,
  },
  menuButton: {
    padding: 6,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  welcome: {
    color: "#fff",
    fontSize: 14,
  },
});
