import React, { useState } from 'react'
import {
  View,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  Surface,
  ActivityIndicator,
} from 'react-native-paper'
import { supabase } from '../lib/supabaseClient'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/AppNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>

interface Props {
  route?: { params?: { verifiedAgencyCode?: string } }
}

export default function LoginScreen({ route }: Props) {
  const navigation = useNavigation<NavProp>()
  const verifiedAgencyCode = route?.params?.verifiedAgencyCode || ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Please enter both email and password.')
    }

    setLoading(true)

    try {
      // Step 1: Authenticate user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })

      if (authError || !authData.user) {
        setLoading(false)
        return Alert.alert('Login failed', 'Invalid email or password.')
      }

      // Step 2: Check user's agency match
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('id, agency_id, email')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle()

      if (userError || !userRow) {
        setLoading(false)
        return Alert.alert('Error', 'User profile not found.')
      }

      if (userRow.agency_id !== verifiedAgencyCode) {
        await supabase.auth.signOut()
        setLoading(false)
        return Alert.alert('Access denied', 'This account is not linked to your agency.')
      }

      // Step 3: Success — navigate to Dashboard
      setLoading(false)
      Alert.alert('✅ Success', 'Login successful! Redirecting...')
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      })
    } catch (err: any) {
      console.error('Login error:', err)
      Alert.alert('Error', err.message || 'Unexpected login issue')
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Surface style={styles.card}>
          <Title style={styles.title}>Agent Login</Title>
          <Paragraph style={styles.subtitle}>
            Welcome back. Please enter your credentials to access your dashboard.
          </Paragraph>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            outlineColor="#003366"
            activeOutlineColor="#003366"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            outlineColor="#003366"
            activeOutlineColor="#003366"
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor="#003366"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          {loading && <ActivityIndicator animating color="#003366" />}
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
    backgroundColor: '#f2f4f8',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    color: '#003366',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
  },
  input: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 24,
    paddingVertical: 6,
    borderRadius: 8,
  },
})
