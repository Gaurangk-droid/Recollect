// ✅ src/screens/CaseDetails.tsx
import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Card, Title, Paragraph, Divider, IconButton } from 'react-native-paper'
import { useRoute } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function CaseDetails() {
  const route = useRoute()
  const { caseData } = route.params as any

  return (
    <ScrollView style={styles.container}>
      <Card mode="outlined" style={styles.card}>
        <Card.Title
          title={caseData.account_name}
          subtitle={caseData.customer_name}
          left={(props) => <IconButton {...props} icon="account" />}
        />
        <Card.Content>
          <Divider style={styles.divider} />
          <View style={styles.row}>
            <MaterialCommunityIcons name="bank" size={20} />
            <Paragraph style={styles.text}>Bank: {caseData.bank}</Paragraph>
          </View>

          <View style={styles.row}>
            <MaterialCommunityIcons name="office-building" size={20} />
            <Paragraph style={styles.text}>Branch: {caseData.branch}</Paragraph>
          </View>

          <View style={styles.row}>
            <MaterialCommunityIcons name="file-document" size={20} />
            <Paragraph style={styles.text}>Case ID: {caseData.case_id}</Paragraph>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.row}>
            <MaterialCommunityIcons name="cash" size={20} />
            <Paragraph style={styles.text}>
              Pending Balance: ₹{caseData.pending_balance ?? 0}
            </Paragraph>
          </View>

          <View style={styles.row}>
            <MaterialCommunityIcons name="progress-clock" size={20} />
            <Paragraph style={styles.text}>Status: {caseData.status}</Paragraph>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: 16 },
  card: { borderRadius: 12 },
  divider: { marginVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  text: { marginLeft: 8, fontSize: 15 },
})
