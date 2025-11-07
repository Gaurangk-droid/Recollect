import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import AgencyVerificationScreen from '../screens/AgencyVerificationScreen'
import LoginScreen from '../screens/LoginScreen'

export type RootStackParamList = {
  AgencyVerification: undefined
  Login: { verifiedAgencyCode: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AgencyVerification" component={AgencyVerificationScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
