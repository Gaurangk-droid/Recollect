// ✅ src/screens/Dashboard.tsx
import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Card, Text, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { MotiView } from "moti";
import { BarChart3, TrendingUp, ClipboardList, Wallet } from "lucide-react-native";

const { width: screenWidth } = Dimensions.get("window");

// 🎨 New color palette
const COLORS = {
  bg: "#0f172a", // deep navy
  card: "#1e293b",
  accent: "#38bdf8", // electric blue
  accent2: "#f43f5e", // coral red
  accent3: "#10b981", // mint green
  text: "#f8fafc",
  subtext: "#94a3b8",
};

// Mock data
const dailyCollections = [
  { value: 12000, label: "Mon" },
  { value: 18000, label: "Tue" },
  { value: 9000, label: "Wed" },
  { value: 21000, label: "Thu" },
  { value: 12000, label: "Fri" },
  { value: 26000, label: "Sat" },
  { value: 22000, label: "Sun" },
];

const pieData = [
  { value: 40, color: COLORS.accent, text: "Home" },
  { value: 25, color: COLORS.accent2, text: "Personal" },
  { value: 15, color: COLORS.accent3, text: "Auto" },
  { value: 20, color: "#eab308", text: "Others" },
];

export default function Dashboard() {
  const navigation = useNavigation();

  return (
    <ScrollView
      style={{ backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
    >
      <Text style={styles.title}>ReCollect Insights</Text>
      <Text style={styles.subtitle}>Your performance at a glance</Text>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <AnimatedCard icon={<TrendingUp color={COLORS.accent} size={24} />} label="Total Cases" value="124" delta="+8 today" />
        <AnimatedCard icon={<Wallet color={COLORS.accent2} size={24} />} label="Collections" value="₹1.84L" delta="+12%" />
        <AnimatedCard icon={<ClipboardList color={COLORS.accent3} size={24} />} label="Pending" value="32" delta="8 urgent" />
      </View>

      {/* Charts Row */}
      <View
        style={[
          styles.gridRow,
          Platform.OS === "web" && screenWidth > 980
            ? { flexDirection: "row" }
            : { flexDirection: "column" },
        ]}
      >
        <Card style={[styles.chartCard, { flex: 2 }]}>
          <Text style={styles.chartTitle}>Weekly Collections</Text>
          <BarChart
            data={dailyCollections}
            barWidth={28}
            spacing={18}
            barBorderRadius={8}
            frontColor={COLORS.accent}
            gradientColor={COLORS.accent2}
            yAxisThickness={0}
            xAxisThickness={0}
            isAnimated
            noOfSections={4}
            yAxisTextStyle={{ color: COLORS.subtext }}
            xAxisLabelTextStyle={{ color: COLORS.subtext }}
            backgroundColor="transparent"
          />
        </Card>

        <Card style={[styles.chartCard, { flex: 1 }]}>
          <Text style={styles.chartTitle}>Case Split</Text>
          <View style={{ alignItems: "center" }}>
            <PieChart
              donut
              radius={90}
              innerRadius={55}
              data={pieData}
              focusOnPress
              sectionAutoFocus
              innerCircleColor={COLORS.card}
              centerLabelComponent={() => (
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "700" }}>
                    124
                  </Text>
                  <Text style={{ color: COLORS.subtext, fontSize: 12 }}>
                    Total Cases
                  </Text>
                </View>
              )}
            />
          </View>
        </Card>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <Button
          mode="contained"
          buttonColor={COLORS.accent}
          textColor={COLORS.bg}
          style={styles.actionBtn}
          onPress={() => navigation.navigate("AddCase" as never)}
        >
          + New Case
        </Button>
        <Button
          mode="outlined"
          textColor={COLORS.text}
          style={[styles.actionBtn, { borderColor: COLORS.accent }]}
          onPress={() => navigation.navigate("ViewCases" as never)}
        >
          View Cases
        </Button>
      </View>
    </ScrollView>
  );
}

// 🎬 Animated Card Component
function AnimatedCard({
  icon,
  label,
  value,
  delta,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600 }}
      style={styles.kpiCard}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {icon}
        <View>
          <Text style={styles.kpiLabel}>{label}</Text>
          <Text style={styles.kpiValue}>{value}</Text>
          <Text style={styles.kpiDelta}>{delta}</Text>
        </View>
      </View>
    </MotiView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: 20,
    fontSize: 14,
  },
  kpiRow: {
    flexDirection:
      Platform.OS === "web" && Dimensions.get("window").width > 980
        ? "row"
        : "column",
    gap: 14,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  kpiLabel: { color: "#cbd5e1", fontSize: 13 },
  kpiValue: { color: "#f8fafc", fontSize: 26, fontWeight: "800" },
  kpiDelta: { color: "#38bdf8", fontSize: 12, marginTop: 2 },
  gridRow: {
    gap: 16,
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 16,
  },
  chartTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection:
      Platform.OS === "web" && Dimensions.get("window").width > 600
        ? "row"
        : "column",
    gap: 12,
    justifyContent: "center",
    marginTop: 20,
  },
  actionBtn: {
    borderRadius: 8,
  },
});
