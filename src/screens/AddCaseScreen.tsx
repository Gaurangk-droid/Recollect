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
  Provider as PaperProvider,
  TextInput,
  Button,
  Title,
  Surface,
  Paragraph,
  Menu,
  Switch,
  Divider,
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

type AgencyUser = { id: string; name: string }

export default function AddCaseScreen() {
  const [loading, setLoading] = useState(false)

  // Dropdowns
  const [loanTypeMenuVisible, setLoanTypeMenuVisible] = useState(false)
  const [loanType, setLoanType] = useState('')
  const loanTypes = ['Personal', 'CC', '2 Wheeler', 'Auto', 'Home', 'Gold']

  const [assignedToMenuVisible, setAssignedToMenuVisible] = useState(false)
  const [assignedTo, setAssignedTo] = useState('')
  const [agencyUsers, setAgencyUsers] = useState<AgencyUser[]>([])

  // Form fields
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

  // Toggle for pending balance (false = use overdue_amount, true = use upgrade_amount)
  const [useUpgradeAmount, setUseUpgradeAmount] = useState(false)

  // store current user info
  const [userInfo, setUserInfo] = useState<{
    id: string
    name: string
    agency_id: string
    agency_code: string
  } | null>(null)

  // Load agency users on screen load
  useEffect(() => {
    const loadAgencyUsers = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) return

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, name, agency_id')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) return

        const { data: agencyRow, error: agencyError } = await supabase
          .from('agencies')
          .select('agency_code')
          .eq('id', profile.agency_id)
          .single()

        if (agencyError) console.log('Agency fetch error:', agencyError)
        const agencyCode = agencyRow?.agency_code || ''

        setUserInfo({
          id: user.id,
          name: profile.name,
          agency_id: profile.agency_id,
          agency_code: agencyCode,
        })

        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, name')
          .eq('agency_id', profile.agency_id)

        if (usersError) console.log('Users fetch error:', usersError)
        setAgencyUsers(users || [])
      } catch (err) {
        console.error('Error loading agency users:', err)
      }
    }

    loadAgencyUsers()
  }, [])

  // Auto compute pending balance
  useEffect(() => {
    if (useUpgradeAmount) {
      setPendingBalance(upgrade_amount || '')
    } else {
      setPendingBalance(overdue_amount || '')
    }
  }, [useUpgradeAmount, overdue_amount, upgrade_amount])

  // --- handle save
  const handleSave = async () => {
    if (!loanType || !account_name || !overdue_amount) {
      return Alert.alert('Missing Data', 'Loan type, account name, and overdue amount are required.')
    }
    if (!assignedTo) {
      return Alert.alert('Missing Data', 'Please select who this case is assigned to.')
    }
    if (useUpgradeAmount && !upgrade_amount) {
      return Alert.alert('Missing Data', 'Please enter upgrade amount or switch back to overdue amount.')
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
    setUseUpgradeAmount(false)
  }

  const confirmClear = () => {
    Alert.alert(
      'Confirm Clear',
      'Are you sure you want to clear the form?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: clearForm },
      ]
    )
  }

  const assignedToName = agencyUsers.find((u) => u.id === assignedTo)?.name || ''

  return (
    <PaperProvider>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container}>
          <Surface style={styles.card}>
            <Title style={styles.title}>Add New Case</Title>

            {/* Loan Type Dropdown */}
         
<View style={{ zIndex: 10 }}>
  <Menu
    visible={loanTypeMenuVisible}
    onDismiss={() => setLoanTypeMenuVisible(false)}
    anchor={
      <Button
        mode="outlined"
        icon="menu-down"
        onPress={() => setLoanTypeMenuVisible(true)}
        style={styles.input}
        contentStyle={{ justifyContent: 'space-between' }}
      >
        {loanType || 'Select Loan Type'}
      </Button>
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
</View>





            {/* Assigned To Dropdown */}
<View style={{ zIndex: 9 }}>
  <Paragraph style={{ marginTop: 10, marginBottom: 4 }}>Assign To</Paragraph>
  <Menu
    visible={assignedToMenuVisible}
    onDismiss={() => setAssignedToMenuVisible(false)}
    anchor={
      <Button
        mode="outlined"
        icon="menu-down"
        onPress={() => setAssignedToMenuVisible(true)}
        style={styles.input}
        contentStyle={{ justifyContent: 'space-between' }}
      >
        {agencyUsers.find((u) => u.id === assignedTo)?.name || 'Select User'}
      </Button>
    }
  >
    {agencyUsers.length > 0 ? (
      agencyUsers.map((u) => (
        <Menu.Item
          key={u.id}
          onPress={() => {
            setAssignedTo(u.id)
            setAssignedToMenuVisible(false)
          }}
          title={u.name || u.id}
        />
      ))
    ) : (
      <Menu.Item title="No users found in agency" />
    )}
  </Menu>
</View>


            {/* Core required fields */}
            <TextInput
              label="Account Name *"
              value={account_name}
              onChangeText={setAccountName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Overdue Amount *"
              value={overdue_amount}
              onChangeText={setOverdueAmount}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />

            {/* Toggle for Pending Balance Source */}
            <View style={styles.toggleRow}>
              <Paragraph style={{ flex: 1 }}>
                Pending balance source: {useUpgradeAmount ? 'Upgrade amount' : 'Overdue amount'}
              </Paragraph>
              <Switch
                value={useUpgradeAmount}
                onValueChange={(v) => setUseUpgradeAmount(v)}
              />
            </View>

            <TextInput
              label="Upgrade Amount"
              value={upgrade_amount}
              onChangeText={setUpgradeAmount}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Pending Balance (auto)"
              value={pending_balance}
              mode="outlined"
              editable={false}
              style={styles.input}
            />

            {/* Remaining fields */}
            <Divider style={{ marginVertical: 8 }} />
            <TextInput label="Account Number" value={account_number} onChangeText={setAccountNumber} mode="outlined" style={styles.input} keyboardType="numeric" />
            <TextInput label="Contact Number" value={contact_number} onChangeText={setContactNumber} mode="outlined" style={styles.input} keyboardType="phone-pad" />
            <TextInput label="Office Number" value={office_number} onChangeText={setOfficeNumber} mode="outlined" style={styles.input} keyboardType="phone-pad" />
            <TextInput label="Alternate Number" value={alternate_number} onChangeText={setAlternateNumber} mode="outlined" style={styles.input} keyboardType="phone-pad" />
            <TextInput label="Customer Name" value={customer_name} onChangeText={setCustomerName} mode="outlined" style={styles.input} />
            <TextInput label="Customer Address" value={customer_address} onChangeText={setCustomerAddress} mode="outlined" style={styles.input} multiline />
            <TextInput label="Office Address" value={office_address} onChangeText={setOfficeAddress} mode="outlined" style={styles.input} multiline />
            <TextInput label="Alternate Address" value={alternate_address} onChangeText={setAlternateAddress} mode="outlined" style={styles.input} multiline />
            <TextInput label="District" value={district} onChangeText={setDistrict} mode="outlined" style={styles.input} />
            <TextInput label="Village" value={village} onChangeText={setVillage} mode="outlined" style={styles.input} />
            <TextInput label="State" value={state} onChangeText={setState} mode="outlined" style={styles.input} />
            <TextInput label="Branch" value={branch} onChangeText={setBranch} mode="outlined" style={styles.input} />
            <TextInput label="Bank" value={bank} onChangeText={setBank} mode="outlined" style={styles.input} />
            <TextInput label="Loan Amount" value={loan_amount} onChangeText={setLoanAmount} mode="outlined" style={styles.input} keyboardType="numeric" />
            <TextInput label="Monthly EMI" value={monthly_emi} onChangeText={setMonthlyEmi} mode="outlined" style={styles.input} keyboardType="numeric" />
            <TextInput label="EMI Amount" value={emi_amount} onChangeText={setEmiAmount} mode="outlined" style={styles.input} keyboardType="numeric" />
            <TextInput label="Overdue Since" value={overdue_since} onChangeText={setOverdueSince} mode="outlined" style={styles.input} />
            <TextInput label="Loan Tenure (months)" value={loan_tenure_months} onChangeText={setLoanTenureMonths} mode="outlined" style={styles.input} keyboardType="numeric" />

            {/* Actions */}
            <View style={styles.actionsRow}>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={loading}
                style={[styles.button, { backgroundColor: '#2563eb' }]}
              >
                {loading ? 'Saving...' : 'Submit'}
              </Button>
              <Button
                mode="outlined"
                onPress={confirmClear}
                style={styles.button}
              >
                Clear
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f6f7fb' },
  card: { padding: 16, borderRadius: 10, backgroundColor: 'white', elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { marginVertical: 6 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
})
