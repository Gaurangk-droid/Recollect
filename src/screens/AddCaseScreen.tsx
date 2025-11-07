// ✅ src/screens/AddCaseScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import {
  TextInput,
  Button,
  Title,
  Surface,
  Paragraph,
  Menu,
} from 'react-native-paper'
import { supabase } from '../lib/supabaseClient'

// 🔹 Helper: Generate case ID
function generateCaseId(agencyCode: string, userName: string) {
  const year = new Date().getFullYear()
  const random = Math.floor(100000 + Math.random() * 900000)
  const agencyPart = (agencyCode || 'AGY').substring(0, 3).toUpperCase()
  const userPart = (userName || 'USR').substring(0, 3).toUpperCase()
  return `${agencyPart}-${userPart}-${year}-${random}`
}

export default function AddCaseScreen() {
  const [loading, setLoading] = useState(false)

  // Dropdowns and form fields
  const [loanTypeMenuVisible, setLoanTypeMenuVisible] = useState(false)
  const [loanType, setLoanType] = useState('')
  const loanTypes = ['Personal', 'CC', '2 Wheeler', 'Auto', 'Home', 'Gold']

  const [assignedToMenuVisible, setAssignedToMenuVisible] = useState(false)
  const [assignedTo, setAssignedTo] = useState('')
  const [agencyUsers, setAgencyUsers] = useState<{ id: string; name: string }[]>([])

  const [account_name, setAccountName] = useState('')
  const [account_number, setAccountNumber] = useState('')
  const [contact_number, setContactNumber] = useState('')
  const [office_number, setOfficeNumber] = useState('')
  const [alternate_number, setAlternateNumber] = useState('')
  const [customer_name, setCustomerName] = useState('')
  const [customer_address, setCustomerAddress] = useState('')
  const [office_address, setOfficeAddress] = useState('')
  const [alternate_address, setAlternateAddress] = useState('')
  const [district, setDistrict] = useState('')
  const [village, setVillage] = useState('')
  const [state, setState] = useState('')
  const [branch, setBranch] = useState('')
  const [bank, setBank] = useState('')
  const [loan_amount, setLoanAmount] = useState('')
  const [monthly_emi, setMonthlyEmi] = useState('')
  const [overdue_amount, setOverdueAmount] = useState('')
  const [overdue_since, setOverdueSince] = useState('')
  const [pending_balance, setPendingBalance] = useState('')
  const [emi_amount, setEmiAmount] = useState('')
  const [upgrade_amount, setUpgradeAmount] = useState('')
  const [loan_tenure_months, setLoanTenureMonths] = useState('')

  // Load agency users on screen load
  useEffect(() => {
    const loadAgencyUsers = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) return

        // fetch current user info (agency_id + name)
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, name, agency_id')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) return

        // fetch agency_code from agencies table
        const { data: agencyRow } = await supabase
          .from('agencies')
          .select('agency_code')
          .eq('id', profile.agency_id)
          .single()

        const agencyCode = agencyRow?.agency_code || ''
        setUserInfo({
          id: user.id,
          name: profile.name,
          agency_id: profile.agency_id,
          agency_code: agencyCode,
        })

        // fetch all users in same agency
        const { data: users } = await supabase
          .from('users')
          .select('id, name')
          .eq('agency_id', profile.agency_id)

        setAgencyUsers(users || [])
      } catch (err) {
        console.error('Error loading agency users:', err)
      }
    }

    loadAgencyUsers()
  }, [])

  // store current user info
  const [userInfo, setUserInfo] = useState<{
    id: string
    name: string
    agency_id: string
    agency_code: string
  } | null>(null)

  // --- handle save
  const handleSave = async () => {
    if (!loanType || !account_name || !overdue_amount) {
      return Alert.alert('Missing Data', 'Loan type, account name, and overdue amount are required.')
    }
    if (!assignedTo) {
      return Alert.alert('Missing Data', 'Please select who this case is assigned to.')
    }

    setLoading(true)

    try {
      if (!userInfo) {
        setLoading(false)
        return Alert.alert('Error', 'User profile not loaded yet.')
      }

      const case_id = generateCaseId(userInfo.agency_code, userInfo.name)

      const payload = {
        case_id,
        agency_id: userInfo.agency_id,
        assigned_to: assignedTo,
        created_by: userInfo.id,
        loan_type: loanType,
        account_name,
        account_number,
        contact_number,
        office_number,
        alternate_number,
        customer_name,
        customer_address,
        office_address,
        alternate_address,
        district,
        village,
        state,
        branch,
        bank,
        loan_amount: loan_amount ? Number(loan_amount) : null,
        monthly_emi: monthly_emi ? Number(monthly_emi) : null,
        overdue_amount: overdue_amount ? Number(overdue_amount) : null,
        overdue_since: overdue_since || null,
        pending_balance: pending_balance ? Number(pending_balance) : null,
        emi_amount: emi_amount ? Number(emi_amount) : null,
        upgrade_amount: upgrade_amount ? Number(upgrade_amount) : null,
        loan_tenure_months: loan_tenure_months ? Number(loan_tenure_months) : null,
      }

      const { error } = await supabase.from('cases').insert([payload])

      if (error) {
        console.error(error)
        Alert.alert('Error', error.message)
      } else {
        Alert.alert('✅ Success', 'Case added successfully!')
        clearForm()
      }
    } catch (err: any) {
      console.error(err)
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setLoanType('')
    setAssignedTo('')
    setAccountName('')
    setAccountNumber('')
    setContactNumber('')
    setOfficeNumber('')
    setAlternateNumber('')
    setCustomerName('')
    setCustomerAddress('')
    setOfficeAddress('')
    setAlternateAddress('')
    setDistrict('')
    setVillage('')
    setState('')
    setBranch('')
    setBank('')
    setLoanAmount('')
    setMonthlyEmi('')
    setOverdueAmount('')
    setOverdueSince('')
    setPendingBalance('')
    setEmiAmount('')
    setUpgradeAmount('')
    setLoanTenureMonths('')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Surface style={styles.card}>
          <Title style={styles.title}>Add New Case</Title>

          {/* Loan Type Dropdown */}
          <Menu
            visible={loanTypeMenuVisible}
            onDismiss={() => setLoanTypeMenuVisible(false)}
            anchor={
              <TextInput
                label="Loan Type"
                value={loanType}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="menu-down" />}
                onPressIn={() => setLoanTypeMenuVisible(true)}
                style={styles.input}
              />
            }
          >
            {loanTypes.map((type) => (
              <Menu.Item
                key={type}
                onPress={() => {
                  setLoanType(type)
                  setLoanTypeMenuVisible(false)
                }}
                title={type}
              />
            ))}
          </Menu>

          {/* Assigned To Dropdown */}
          <Paragraph style={{ marginTop: 10, marginBottom: 4 }}>Assign To</Paragraph>
          <Menu
            visible={assignedToMenuVisible}
            onDismiss={() => setAssignedToMenuVisible(false)}
            anchor={
              <TextInput
                label="Assigned To"
                value={agencyUsers.find((u) => u.id === assignedTo)?.name || ''}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="menu-down" />}
                onPressIn={() => setAssignedToMenuVisible(true)}
                style={styles.input}
              />
            }
          >
            {agencyUsers.map((u) => (
              <Menu.Item
                key={u.id}
                onPress={() => {
                  setAssignedTo(u.id)
                  setAssignedToMenuVisible(false)
                }}
                title={u.name || u.id}
              />
            ))}
          </Menu>

          {/* Remaining fields */}
          <TextInput label="Account Name" value={account_name} onChangeText={setAccountName} mode="outlined" style={styles.input} />
          <TextInput label="Account Number" value={account_number} onChangeText={setAccountNumber} mode="outlined" style={styles.input} />
          <TextInput label="Contact Number" value={contact_number} onChangeText={setContactNumber} mode="outlined" style={styles.input} />
          <TextInput label="Overdue Amount" value={overdue_amount} onChangeText={setOverdueAmount} mode="outlined" style={styles.input} />

          <Button mode="contained" onPress={handleSave} loading={loading} style={styles.saveButton}>
            {loading ? 'Saving...' : 'Save Case'}
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f6f7fb' },
  card: { padding: 16, borderRadius: 10, backgroundColor: 'white', elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { marginVertical: 6 },
  saveButton: { marginTop: 16 },
})
