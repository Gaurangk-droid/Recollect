// ✅ src/screens/CaseDetails.tsx
import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import {
  Card,
  Title,
  Paragraph,
  Divider,
  IconButton,
  ActivityIndicator,
  Text,
  Surface,
} from 'react-native-paper'

import { useRoute } from '@react-navigation/native'
import { supabase } from '../lib/supabaseClient'

import MaterialCommunityIconsRaw from '@expo/vector-icons/MaterialCommunityIcons'
const MaterialCommunityIcons = MaterialCommunityIconsRaw as unknown as React.ComponentType<{
  name: string
  size?: number
  color?: string
}>

export default function CaseDetails() {
  const route = useRoute()
  const { caseId } = route.params as { caseId: string }

  const [caseData, setCaseData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .eq('id', caseId)
          .single()

        if (error) console.error('Error fetching case:', error.message)
        else setCaseData(data)
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (caseId) fetchCase()
  }, [caseId])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" />
        <Text style={{ marginTop: 10 }}>Loading case details...</Text>
      </View>
    )
  }

  if (!caseData) {
    return (
      <View style={styles.center}>
        <Text>Case not found.</Text>
      </View>
    )
  }

  // Helper for placeholder values
  const val = (v: any) => (v ? v : '—')

  return (
    <ScrollView style={styles.container}>
      {/* --- HEADER CARD --- */}
      <Surface style={styles.headerCard}>
        <Title style={styles.title}>{val(caseData.account_name)}</Title>
        <Paragraph style={styles.subTitle}>{val(caseData.customer_name)}</Paragraph>
        <Divider style={styles.divider} />
        <Paragraph style={styles.caseId}>Case ID: {val(caseData.case_id)}</Paragraph>
        <Paragraph>Status: {val(caseData.status)}</Paragraph>
      </Surface>

      {/* --- SECTION: LOAN INFO --- */}
      <Card style={styles.sectionCard}>
        <Card.Title
          title="Loan Information"
          left={(props) => <IconButton {...props} icon="file-document" />}
        />
        <Card.Content>
          <InfoRow icon="cash" label="Loan Type" value={val(caseData.loan_type)} />
          <InfoRow icon="bank" label="Bank" value={val(caseData.bank)} />
          <InfoRow icon="office-building" label="Branch" value={val(caseData.branch)} />
          <InfoRow icon="currency-inr" label="Loan Amount" value={`₹${val(caseData.loan_amount)}`} />
          <InfoRow icon="calendar-clock" label="Overdue Since" value={val(caseData.overdue_since)} />
          <InfoRow icon="cash-fast" label="Pending Balance" value={`₹${val(caseData.pending_balance)}`} />
          <InfoRow icon="repeat" label="Monthly EMI" value={`₹${val(caseData.monthly_emi)}`} />
        </Card.Content>
      </Card>

      {/* --- SECTION: CUSTOMER INFO --- */}
      <Card style={styles.sectionCard}>
        <Card.Title
          title="Customer Details"
          left={(props) => <IconButton {...props} icon="account" />}
        />
        <Card.Content>
          <InfoRow icon="account-card-details" label="Customer Name" value={val(caseData.customer_name)} />
          <InfoRow icon="map-marker" label="Address" value={val(caseData.customer_address)} />
          <InfoRow icon="map-marker-outline" label="Alternate Address" value={val(caseData.alternate_address)} />
          <InfoRow icon="city" label="District" value={val(caseData.district)} />
          <InfoRow icon="home-group" label="Village" value={val(caseData.village)} />
          <InfoRow icon="earth" label="State" value={val(caseData.state)} />
        </Card.Content>
      </Card>

      {/* --- SECTION: CONTACT INFO --- */}
      <Card style={styles.sectionCard}>
        <Card.Title
          title="Contact Information"
          left={(props) => <IconButton {...props} icon="phone" />}
        />
        <Card.Content>
          <InfoRow icon="phone" label="Contact Number" value={val(caseData.contact_number)} />
          <InfoRow icon="office-building" label="Office Number" value={val(caseData.office_number)} />
          <InfoRow icon="cellphone" label="Alternate Number" value={val(caseData.alternate_number)} />
        </Card.Content>
      </Card>

      {/* --- SECTION: FINANCIAL DETAILS --- */}
      <Card style={styles.sectionCard}>
        <Card.Title
          title="Financial Summary"
          left={(props) => <IconButton {...props} icon="finance" />}
        />
        <Card.Content>
          <InfoRow icon="currency-inr" label="EMI Amount" value={`₹${val(caseData.emi_amount)}`} />
          <InfoRow icon="trending-up" label="Upgrade Amount" value={`₹${val(caseData.upgrade_amount)}`} />
          <InfoRow icon="timeline-clock" label="Loan Tenure (months)" value={val(caseData.loan_tenure_months)} />
          <InfoRow icon="cash-check" label="Overdue Amount" value={`₹${val(caseData.overdue_amount)}`} />
        </Card.Content>
      </Card>

      {/* --- FOOTER --- */}
      <Surface style={styles.footerCard}>
        <Paragraph style={{ color: '#666' }}>
          Created at: {new Date(caseData.created_at).toLocaleString()}
        </Paragraph>
        {caseData.updated_at && (
          <Paragraph style={{ color: '#666' }}>
            Updated at: {new Date(caseData.updated_at).toLocaleString()}
          </Paragraph>
        )}
      </Surface>
    </ScrollView>
  )
}

// --- SMALL REUSABLE COMPONENT ---
const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: any }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={20} color="#333" />
    <Paragraph style={styles.infoLabel}>{label}:</Paragraph>
    <Paragraph style={styles.infoValue}>{value}</Paragraph>
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard: {
    backgroundColor: 'white',
    elevation: 3,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  subTitle: { fontSize: 16, color: '#555', marginBottom: 6 },
  caseId: { fontSize: 14, color: '#777' },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  infoLabel: { marginLeft: 6, fontWeight: '600', fontSize: 14, width: 150 },
  infoValue: { flexShrink: 1, fontSize: 14, color: '#333' },
  divider: { marginVertical: 8 },
  footerCard: {
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
})
