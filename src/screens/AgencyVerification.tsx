import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { supabase } from '../lib/supabaseClient'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/AppNavigator'

export default function AgencyVerificationScreen() {
  const [agencyCode, setAgencyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const handleVerify = async () => {
    if (!agencyCode.trim()) {
      setError('Please enter your agency ID.')
      return
    }

    setError('')
    setLoading(true)

    const { data, error } = await supabase
      .from('agencies')
      .select('id')
      .eq('agency_code', agencyCode.trim())
      .single()

    setLoading(false)

    if (error || !data) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= 3) {
        Alert.alert(
          'Too Many Attempts',
          'You have entered an invalid ID 3 times.\nPlease contact your administrator for assistance.'
        )
        setAttempts(0)
      } else {
        setError('Invalid agency ID. Please try again.')
      }
    } else {
      Alert.alert('✅ Success', 'Agency verified successfully!')
      navigation.navigate('Login', { verifiedAgencyCode: data.id })
      setAttempts(0)
    }
  }

  const handleChange = (text: string) => {
    setAgencyCode(text)
    if (error) setError('')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Agency Verification</Text>
        <Text style={styles.subtitle}>Enter your agency ID to continue</Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Enter Agency ID"
          placeholderTextColor="#888"
          value={agencyCode}
          onChangeText={handleChange}
          autoCapitalize="characters"
          maxLength={20}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[
            styles.button,
            (loading || !agencyCode.trim()) && styles.buttonDisabled,
          ]}
          onPress={handleVerify}
          disabled={loading || !agencyCode.trim()}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify Agency'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#ff5a5f',
  },
  errorText: {
    color: '#ff5a5f',
    fontSize: 13,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
