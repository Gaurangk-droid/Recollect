import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Linking from 'expo-linking'

import AgencyVerificationScreen from '../screens/AgencyVerification'
import DashboardScreen from '../screens/Dashboard'
import AddCaseScreen from '../screens/AddCase'
import LoginScreen from '../screens/Login'

export type RootStackParamList = {
  AgencyVerification: undefined
  Login: { verifiedAgencyCode?: string } // ← made optional to avoid TS param mismatch
  Dashboard: undefined
  AddCase: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

// 🌐 Enable proper browser URLs and refresh persistence
const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      AgencyVerification: '',
      Login: 'login',
      Dashboard: 'dashboard',
      AddCase: 'addcase',
    },
  },
}

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="AgencyVerification"
          component={AgencyVerificationScreen}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AddCase" component={AddCaseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
