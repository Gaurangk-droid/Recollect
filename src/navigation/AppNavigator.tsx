// ✅ src/navigation/AppNavigator.tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Linking from 'expo-linking'
import AgencyVerificationScreen from '../screens/AgencyVerification'
import DashboardScreen from '../screens/Dashboard'
import AddCaseScreen from '../screens/AddCase'
import LoginScreen from '../screens/Login'
import ViewCasesScreen from '../screens/ViewCases'
import CaseDetails from '../screens/CaseDetails'

export type RootStackParamList = {
  AgencyVerification: undefined
  Login: { verifiedAgencyCode: string }
  Dashboard: undefined
  AddCase: undefined
  ViewCases: undefined
  CaseDetails: { caseData: any }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      AgencyVerification: '',
      Login: 'login',
      Dashboard: 'dashboard',
      AddCase: 'addcase',
      ViewCases: 'viewcases',
      CasesDetails: 'CasesDetails',

    },
  },
}

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AgencyVerification" component={AgencyVerificationScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AddCase" component={AddCaseScreen} />
        <Stack.Screen name="ViewCases" component={ViewCasesScreen} />
        <Stack.Screen name="CaseDetails" component={CaseDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
