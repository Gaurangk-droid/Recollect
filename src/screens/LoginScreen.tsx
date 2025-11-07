import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabaseClient'

interface Props {
  route: { params: { verifiedAgencyCode: string } }
}

export default function LoginScreen({ route }: Props) {
  const { verifiedAgencyCode } = route.params
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

 


  const handleLogin = async () => {
  if (!username.trim() || !password.trim()) {
    return Alert.alert('Please enter username and password')
  }

  setLoading(true)

  // Step 1 — Find the email for the entered username
  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('id, email, agency_id,username')
    .eq('username', username.trim())
    .single()

  if (userError || !userRow) {
    setLoading(false)
    return Alert.alert('Login failed', 'Username not found')
  }

  // Step 2 — Authenticate using email + password via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: userRow.email,
    password: password.trim(),
  })

  if (authError || !authData.user) {
    setLoading(false)
    return Alert.alert('Login failed', 'Invalid password')
  }

  // Step 3 — Verify agency match
  if (userRow.agency_id !== verifiedAgencyCode) {
    await supabase.auth.signOut()
    setLoading(false)
    return Alert.alert('Access denied', 'User belongs to a different agency')
  }

  setLoading(false)
  Alert.alert('✅ Success', `Welcome ${username.trim()}!`)
}




  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login - Agency {verifiedAgencyCode}</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
})
