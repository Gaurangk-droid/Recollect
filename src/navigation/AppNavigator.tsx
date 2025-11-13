// ✅ src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";

// ✅ Screens
import AgencyVerificationScreen from "../screens/AgencyVerification";
import DashboardScreen from "../screens/Dashboard";
import AddCaseScreen from "../screens/AddCase";
import LoginScreen from "../screens/Login";
import ViewCasesScreen from "../screens/ViewCases";
import CaseDetails from "../screens/CaseDetails";
import MainLayout from "../layouts/MainLayout";

// ✅ Navigation types
export type RootStackParamList = {
  AgencyVerification: undefined;
  Login: { verifiedAgencyCode: string };
  Dashboard: undefined;
  AddCase: undefined;
  ViewCases: undefined;
  Activity: undefined;
  Calendar: undefined;
  Reports: undefined;
  CaseDetails: { caseData?: any; caseId?: string }; // ✅ ← closed properly
};

// ✅ Create Stack
const Stack = createNativeStackNavigator<RootStackParamList>();

// ✅ Deep linking config
const linking = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      AgencyVerification: "",
      Login: "login",
      Dashboard: "dashboard",
      AddCase: "addcase",
      ViewCases: "viewcases",
      CaseDetails: "viewcases/id/:caseId", // ✅ dynamic route support
    },
  },
};

// ✅ Main Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="AgencyVerification"
          component={AgencyVerificationScreen}
        />
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* ✅ Layout-wrapped screens */}
        <Stack.Screen name="Dashboard">
          {() => (
            <MainLayout>
              <DashboardScreen />
            </MainLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="AddCase">
          {() => (
            <MainLayout>
              <AddCaseScreen />
            </MainLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="ViewCases">
          {() => (
            <MainLayout>
              <ViewCasesScreen />
            </MainLayout>
          )}
        </Stack.Screen>

        <Stack.Screen name="CaseDetails">
          {() => (
            <MainLayout>
              <CaseDetails />
            </MainLayout>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
