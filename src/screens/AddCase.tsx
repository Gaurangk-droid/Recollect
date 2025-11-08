import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Easing,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import {
  Provider as PaperProvider,
  TextInput,
  Button,
  Title,
  Surface,
  Paragraph,
  Switch,
  Divider,
} from 'react-native-paper'
import Sidebar from '../components/Sidebar'
import HeaderBar from '../components/HeaderBar'
import { supabase } from '../lib/supabaseClient'

// ---------- constants ----------
const DRAWER_WIDTH = 250
const ANIM_DURATION = 220
const MOBILE_BREAKPOINT = 900
const HEADER_HEIGHT = 56

const colors = {
  primary: '#002B5B',
  accent: '#2563eb',
  lightBg: '#f6f7fb',
  white: '#fff',
  text: '#333',
}

// ---------- helper ----------
function generateCaseId(agencyCode: string, userName: string) {
  const year = new Date().getFullYear()
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `${agencyCode?.slice(0, 3).toUpperCase()}-${userName
    ?.slice(0, 3)
    .toUpperCase()}-${year}-${rand}`
}

export default function AddCase() {
  const isLarge = Dimensions.get('window').width >= MOBILE_BREAKPOINT
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [name, setName] = useState('Manager')

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current

  // ---------- animations ----------
  const openDrawer = () => {
    setDrawerOpen(true)
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: ANIM_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.4,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: ANIM_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: ANIM_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => setDrawerOpen(false))
  }

  useEffect(() => {
    if (isLarge) {
      translateX.setValue(0)
      overlayOpacity.setValue(0)
      setDrawerOpen(false)
    } else {
      translateX.setValue(-DRAWER_WIDTH)
      overlayOpacity.setValue(0)
    }
  }, [isLarge])

  // -------- form state ----------
  const [loanType, setLoanType] = useState('')
  const [accountName, setAccountName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [altNumber, setAltNumber] = useState('')
  const [officeAddress, setOfficeAddress] = useState('')
  const [custAddress, setCustAddress] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [emi, setEmi] = useState('')
  const [overdueAmt, setOverdueAmt] = useState('')
  const [overdueSince, setOverdueSince] = useState('')
  const [upgradeAmt, setUpgradeAmt] = useState('')
  const [useUpgrade, setUseUpgrade] = useState(false)
  const [pendingBal, setPendingBal] = useState('')
  const [tenure, setTenure] = useState('')
  const [bank, setBank] = useState('')
  const [branch, setBranch] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPendingBal(useUpgrade ? upgradeAmt : overdueAmt)
  }, [useUpgrade, upgradeAmt, overdueAmt])

  const handleSubmit = async () => {
    if (!accountName || !overdueAmt)
      return Alert.alert('Missing', 'Account name & overdue amount are required.')

    setLoading(true)
    try {
      // your supabase insert call ...
      Alert.alert('✅ Success', 'Case created successfully!')
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setLoanType('')
    setAccountName('')
    setCustomerName('')
    setAccountNumber('')
    setContactNumber('')
    setAltNumber('')
    setOfficeAddress('')
    setCustAddress('')
    setLoanAmount('')
    setEmi('')
    setOverdueAmt('')
    setOverdueSince('')
    setUpgradeAmt('')
    setPendingBal('')
    setTenure('')
    setBank('')
    setBranch('')
    setAssignedTo('')
    setUseUpgrade(false)
  }

  // ---------- reusable UI ----------
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Surface style={styles.section}>
      <Paragraph style={styles.sectionTitle}>{title}</Paragraph>
      <Divider style={{ marginBottom: 8 }} />
      {children}
    </Surface>
  )

  const Input = (props: any) => (
    <TextInput mode="outlined" style={styles.input} dense {...props} />
  )

  // ---------- layout ----------
  return (
    <PaperProvider>
      <View style={styles.appContainer}>
        {/* Sidebar (desktop only) */}
        {isLarge && (
          <View style={styles.sidebarContainer}>
            <Sidebar active="AddCase" />
          </View>
        )}

        <SafeAreaView
          style={[
            styles.mainContent,
            { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
          ]}
        >
          {/* Header for mobile */}
          {!isLarge && (
            <HeaderBar
              onToggleMenu={() => (drawerOpen ? closeDrawer() : openDrawer())}
              name={name}
              isDrawerOpen={drawerOpen}
            />
          )}

          {/* Overlay & animated sidebar for mobile */}
          {!isLarge && drawerOpen && (
            <>
              <TouchableWithoutFeedback onPress={closeDrawer}>
                <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
              </TouchableWithoutFeedback>

              <Animated.View style={[styles.animatedDrawer, { transform: [{ translateX }] }]}>
                <Sidebar active="AddCase" onClose={closeDrawer} />
              </Animated.View>
            </>
          )}

          {/* Page Content */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView contentContainerStyle={styles.container}>
              <Title style={styles.pageTitle}>➕ Add New Case</Title>

              <View
                style={[
                  styles.row,
                  { flexDirection: isLarge ? 'row' : 'column' },
                ]}
              >
                {/* ----- Column 1: Account & Contact ----- */}
                <Section title="Account & Contact">
                  <Input label="Account Name *" value={accountName} onChangeText={setAccountName} />
                  <Input label="Customer Name" value={customerName} onChangeText={setCustomerName} />
                  <View style={styles.rowInline}>
                    <Input
                      label="Account Number"
                      value={accountNumber}
                      onChangeText={setAccountNumber}
                      style={[styles.input, { flex: 1, marginRight: 6 }]}
                    />
                    <Input
                      label="Loan Type"
                      value={loanType}
                      onChangeText={setLoanType}
                      style={[styles.input, { flex: 1, marginLeft: 6 }]}
                    />
                  </View>
                  <View style={styles.rowInline}>
                    <Input
                      label="Contact Number"
                      value={contactNumber}
                      onChangeText={setContactNumber}
                      keyboardType="phone-pad"
                      style={[styles.input, { flex: 1, marginRight: 6 }]}
                    />
                    <Input
                      label="Alternate Number"
                      value={altNumber}
                      onChangeText={setAltNumber}
                      keyboardType="phone-pad"
                      style={[styles.input, { flex: 1, marginLeft: 6 }]}
                    />
                  </View>
                  <Input
                    label="Office Address"
                    value={officeAddress}
                    onChangeText={setOfficeAddress}
                    multiline
                  />
                  <Input
                    label="Customer Address"
                    value={custAddress}
                    onChangeText={setCustAddress}
                    multiline
                  />
                </Section>

                {/* ----- Column 2: Financials ----- */}
                <Section title="Financials">
                  <View style={styles.rowInline}>
                    <Input
                      label="Loan Amount"
                      value={loanAmount}
                      onChangeText={setLoanAmount}
                      keyboardType="numeric"
                      style={[styles.input, { flex: 1, marginRight: 6 }]}
                    />
                    <Input
                      label="Monthly EMI"
                      value={emi}
                      onChangeText={setEmi}
                      keyboardType="numeric"
                      style={[styles.input, { flex: 1, marginLeft: 6 }]}
                    />
                  </View>
                  <Input
                    label="Overdue Amount *"
                    value={overdueAmt}
                    onChangeText={setOverdueAmt}
                    keyboardType="numeric"
                  />
                  <Input
                    label="Overdue Since"
                    value={overdueSince}
                    onChangeText={setOverdueSince}
                  />
                  <Input
                    label="Upgrade Amount"
                    value={upgradeAmt}
                    onChangeText={setUpgradeAmt}
                    keyboardType="numeric"
                  />
                  <View style={styles.toggleRow}>
                    <Paragraph style={{ flex: 1 }}>
                      Pending Source: {useUpgrade ? 'Upgrade' : 'Overdue'}
                    </Paragraph>
                    <Switch value={useUpgrade} onValueChange={setUseUpgrade} />
                  </View>
                  <Input label="Pending Balance" value={pendingBal} editable={false} />
                  <Input
                    label="Loan Tenure (months)"
                    value={tenure}
                    onChangeText={setTenure}
                    keyboardType="numeric"
                  />
                </Section>

                {/* ----- Column 3: Bank & Assignment ----- */}
                <Section title="Bank & Assignment">
                  <Input label="Bank" value={bank} onChangeText={setBank} />
                  <Input label="Branch" value={branch} onChangeText={setBranch} />
                  <Input label="Assign To" value={assignedTo} onChangeText={setAssignedTo} />
                  <View style={{ marginTop: 20 }}>
                    <Button
                      mode="contained"
                      style={[styles.button, { backgroundColor: colors.accent }]}
                      onPress={handleSubmit}
                      loading={loading}
                    >
                      {loading ? 'Saving...' : 'Create Case'}
                    </Button>
                    <Button
                      mode="outlined"
                      style={[styles.button, { marginTop: 8 }]}
                      onPress={handleClear}
                    >
                      Reset
                    </Button>
                  </View>
                </Section>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </PaperProvider>
  )
}

// ---------- styles ----------
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.lightBg,
  },
  sidebarContainer: {
    width: DRAWER_WIDTH,
    backgroundColor: colors.primary,
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.lightBg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 5,
  },
  animatedDrawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: colors.primary,
    elevation: 6,
    zIndex: 6,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.lightBg,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
  rowInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    marginBottom: Dimensions.get('window').width >= MOBILE_BREAKPOINT ? 0 : 18,
    marginHorizontal: Dimensions.get('window').width >= MOBILE_BREAKPOINT ? 8 : 0,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  button: {
    borderRadius: 8,
  },
})
