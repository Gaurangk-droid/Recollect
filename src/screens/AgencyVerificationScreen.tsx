import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabaseClient'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/AppNavigator'

export default function AgencyVerificationScreen() {
  const [agencyCode, setAgencyCode] = useState('')
  const [loading, setLoading] = useState(false)
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()


const handleVerify = async () => {
  console.log('Navigation object:', typeof navigation)
  if (!agencyCode.trim()) return Alert.alert('Please enter an agency code.')

  setLoading(true)
  const { data, error } = await supabase
    .from('agencies')
    .select('id')
    .eq('agency_code', agencyCode.trim())
    .single()

  setLoading(false)

  if (error || !data) {
    Alert.alert('Verification failed', 'Agency not found.')
  } else {
    Alert.alert('✅ Success', 'Agency verified successfully!')
    navigation.navigate('Login', { verifiedAgencyCode: agencyCode.trim() })
  }
}



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agency Verification</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Agency Code"
        value={agencyCode}
        onChangeText={setAgencyCode}
      />
      <Button title={loading ? 'Verifying...' : 'Verify'} onPress={handleVerify} disabled={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
})
