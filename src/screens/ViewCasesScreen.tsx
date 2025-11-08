// ✅ src/screens/ViewCasesScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import {
  Provider as PaperProvider,
  Card,
  Title,
  Paragraph,
  TextInput,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native'
import { supabase } from '../lib/supabaseClient'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/AppNavigator'

type Case = {
  id: string
  case_id: string
  account_name: string
  customer_name: string
  bank: string
  branch: string
  pending_balance: number
  status: string
}

export default function ViewCasesScreen() {
    type ViewCasesNav = NativeStackNavigationProp<RootStackParamList, 'ViewCases'>
const navigation = useNavigation<ViewCasesNav>()
   
  const [loading, setLoading] = useState(true)
  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const [userInfo, setUserInfo] = useState<{
    id: string
    role: 'agent' | 'manager'
    agency_id: string
  } | null>(null)

  // Load cases
  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('id, role, agency_id')
          .eq('id', user.id)
          .single()

        if (!profile) return

        setUserInfo({
          id: profile.id,
          role: profile.role,
          agency_id: profile.agency_id,
        })

        let query = supabase.from('cases').select('*')

        if (profile.role === 'agent') {
          query = query.eq('assigned_to', profile.id)
        } else if (profile.role === 'manager') {
          query = query.eq('agency_id', profile.agency_id)
        }

        const { data: casesData, error } = await query
        if (error) {
          console.error(error)
          return
        }

        setCases(casesData || [])
        setFilteredCases(casesData || [])
      } catch (err) {
        console.error('Error loading cases:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCases()
  }, [])

  // Live filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCases(cases)
    } else {
      const q = searchQuery.toLowerCase()
      setFilteredCases(
        cases.filter(
          (c) =>
            c.account_name?.toLowerCase().includes(q) ||
            c.customer_name?.toLowerCase().includes(q) ||
            c.case_id?.toLowerCase().includes(q)
        )
      )
    }
  }, [searchQuery, cases])

 
  const renderCaseCard = ({ item }: { item: Case }) => (
  <TouchableOpacity onPress={() => navigation.navigate('CaseDetails', { caseData: item })}>
    <Card style={styles.card} mode="elevated">
      <Card.Title
        title={item.account_name}
        subtitle={`${item.bank} | ${item.branch}`}
        left={(props) => <IconButton {...props} icon="account" />}
      />
      <Card.Content>
        <Paragraph style={styles.balance}>
          💰 Pending Balance: ₹{item.pending_balance ?? 0}
        </Paragraph>
        <Paragraph style={styles.status}>
          📌 Status: {item.status || 'Open'}
        </Paragraph>
      </Card.Content>
    </Card>
  </TouchableOpacity>
)

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <TextInput
            placeholder="Search by Account, Customer, or Case ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            style={styles.search}
            left={<TextInput.Icon icon="magnify" />}
          />

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredCases}
              keyExtractor={(item) => item.id}
              renderItem={renderCaseCard}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f6f7fb' },
  search: { marginBottom: 12 },
  card: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#fff',
    
  },
  balance: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  status: { fontSize: 14, color: '#555', marginTop: 2 },
})
