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

// 🌈 Professional Color Palette
const COLORS = {
  bg: "#0B1120", // modern dark navy background
  card: "#1E293B", // card surface
  cardAlt: "#27364E",
  accent: "#3B82F6", // soft electric blue
  accent2: "#F59E0B", // amber highlight
  accent3: "#10B981", // mint success
  text: "#F9FAFB", // near-white text
  subtext: "#9CA3AF", // muted text
  border: "rgba(255,255,255,0.08)",
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
  { value: 20, color: "#E11D48", text: "Others" },
];

export default function Dashboard() {
  const navigation = useNavigation();

  return (
    <ScrollView
      style={{ backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>ReCollect Dashboard</Text>
        <Text style={styles.subtitle}>Overview of your collections & cases</Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <AnimatedCard
          icon={<TrendingUp color={COLORS.accent} size={24} />}
          label="Total Cases"
          value="124"
          delta="+8 today"
          deltaColor={COLORS.accent}
        />
        <AnimatedCard
          icon={<Wallet color={COLORS.accent2} size={24} />}
          label="Collections"
          value="₹1.84L"
          delta="+12%"
          deltaColor={COLORS.accent2}
        />
        <AnimatedCard
          icon={<ClipboardList color={COLORS.accent3} size={24} />}
          label="Pending"
          value="32"
          delta="8 urgent"
          deltaColor={COLORS.accent3}
        />
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
            barWidth={26}
            spacing={16}
            barBorderRadius={6}
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
          <Text style={styles.chartTitle}>Case Distribution</Text>
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
          + Add New Case
        </Button>
        <Button
          mode="outlined"
          textColor={COLORS.text}
          style={[styles.actionBtn, { borderColor: COLORS.accent }]}
          onPress={() => navigation.navigate("ViewCases" as never)}
        >
          View All Cases
        </Button>
      </View>
    </ScrollView>
  );
}

// 🎬 Animated KPI Card Component
function AnimatedCard({
  icon,
  label,
  value,
  delta,
  deltaColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  deltaColor: string;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600 }}
      style={styles.kpiCard}
    >
      <View style={styles.kpiIcon}>{icon}</View>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={[styles.kpiDelta, { color: deltaColor }]}>{delta}</Text>
    </MotiView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.subtext,
    fontSize: 14,
  },
  kpiRow: {
    flexDirection:
      Platform.OS === "web" && Dimensions.get("window").width > 980
        ? "row"
        : "column",
    gap: 14,
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "flex-start",
  },
  kpiIcon: {
    backgroundColor: COLORS.cardAlt,
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  kpiLabel: { color: COLORS.subtext, fontSize: 13, marginBottom: 2 },
  kpiValue: { color: COLORS.text, fontSize: 24, fontWeight: "800" },
  kpiDelta: { fontSize: 12, marginTop: 2 },
  gridRow: {
    gap: 16,
    marginBottom: 30,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartTitle: {
    color: COLORS.text,
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
