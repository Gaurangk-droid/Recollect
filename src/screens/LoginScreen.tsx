import React, { useState } from 'react'
import { View, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { TextInput, Button, Title, Paragraph, Surface, ActivityIndicator } from 'react-native-paper'
import { supabase } from '../lib/supabaseClient'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/AppNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>
interface Props {
  route: { params: { verifiedAgencyCode: string } }
}

export default function LoginScreen({ route }: Props) {
  const navigation = useNavigation<NavProp>()
  const { verifiedAgencyCode } = route.params

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Please enter both email and password.')
    }

    setLoading(true)

    try {
      // Step 1 — Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })

      if (authError || !authData.user) {
        setLoading(false)
        return Alert.alert('Login failed', 'Invalid email or password')
      }

      // Step 2 — Fetch the user's agency
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('id, agency_id, email')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle()

      if (userError) {
        setLoading(false)
        return Alert.alert('Error', 'Unable to read user profile from Supabase')
      }

      if (!userRow) {
        setLoading(false)
        return Alert.alert('Login failed', 'No user profile found for this email')
      }

      // Step 3 — Check agency match
      if (userRow.agency_id !== verifiedAgencyCode) {
        await supabase.auth.signOut()
        setLoading(false)
        return Alert.alert('Access denied', 'User belongs to a different agency')
      }

      // Step 4 — Success → navigate to Dashboard
      setLoading(false)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      })
    } catch (err: any) {
      console.error('Login error:', err)
      Alert.alert('Error', err.message || 'Unexpected error during login')
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Surface style={styles.card}>
          <Title style={styles.title}>Login - Agency {verifiedAgencyCode}</Title>
          <Paragraph>Enter your email and password to continue.</Paragraph>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          {loading && <ActivityIndicator animating />}
        </Surface>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f6f7fb',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: 'white',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: { marginTop: 10 },
  button: { marginTop: 20 },
})
