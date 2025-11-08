import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import AgencyVerificationScreen from '../screens/AgencyVerification'
import LoginScreen from '../screens/Login'
import DashboardScreen from '../screens/Dashboard'
import AddCaseScreen from '../screens/AddCase'

export type RootStackParamList = {
  AgencyVerification: undefined
  Login: { verifiedAgencyCode: string }
  Dashboard: undefined
  AddCase: undefined  
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AgencyVerification" component={AgencyVerificationScreen} />
w        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AddCase" component={AddCaseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
