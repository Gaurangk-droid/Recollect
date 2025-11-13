// ✅ src/screens/Dashboard.tsx
import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Title, Surface, ActivityIndicator, Button } from 'react-native-paper'
import { PieChart, BarChart } from 'react-native-gifted-charts'
import { supabase } from '../lib/supabaseClient'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/AppNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>

export default function DashboardScreen() {
  const navigation = useNavigation<NavProp>()
  const [loading, setLoading] = useState(true)
  const [caseCount, setCaseCount] = useState(0)
  const [openCases, setOpenCases] = useState(0)
  const [closedCases, setClosedCases] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.from('cases').select('status')
        if (error) throw error
        setCaseCount(data.length)
        const open = data.filter((c) => c.status !== 'Closed').length
        const closed = data.filter((c) => c.status === 'Closed').length
        setOpenCases(open)
        setClosedCases(closed)
      } catch (err) {
        console.error('Error loading cases:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" />
        <Text style={{ marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    )
  }

  // --- Chart data
  const pieData = [
    { value: openCases, color: '#ffb703', text: 'Open' },
    { value: closedCases, color: '#219ebc', text: 'Closed' },
  ]

  const barData = [
    { value: openCases, label: 'Open', frontColor: '#ffb703' },
    { value: closedCases, label: 'Closed', frontColor: '#219ebc' },
  ]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Dashboard Overview</Title>

      <Surface style={styles.card}>
        <Text style={styles.metricLabel}>Total Cases</Text>
        <Text style={styles.metricValue}>{caseCount}</Text>
      </Surface>

      <Surface style={styles.chartCard}>
        <Text style={styles.chartTitle}>Case Status Distribution</Text>
        <PieChart
          data={pieData}
          donut
          radius={80}
          innerRadius={50}
          centerLabelComponent={() => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{caseCount}</Text>
              <Text style={{ fontSize: 12, color: '#555' }}>Cases</Text>
            </View>
          )}
        />
      </Surface>

      <Surface style={styles.chartCard}>
        <Text style={styles.chartTitle}>Open vs Closed</Text>
        <BarChart
          data={barData}
          barWidth={40}
          spacing={40}
          yAxisThickness={0}
          xAxisThickness={0}
          xAxisLabelTextStyle={{ color: '#555', fontSize: 12 }}
          yAxisTextStyle={{ color: '#555', fontSize: 12 }}
        />
      </Surface>

      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          style={styles.button}
          icon="plus"
          onPress={() => navigation.navigate('AddCase')}
        >
          Add Case
        </Button>

        <Button
          mode="outlined"
          style={styles.button}
          icon="eye"
          onPress={() => navigation.navigate('ViewCases' as never)}
        >
          View Cases
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f6f7fb',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  card: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 3,
    marginVertical: 10,
  },
  metricLabel: { fontSize: 16, color: '#555' },
  metricValue: { fontSize: 28, fontWeight: 'bold', color: '#003366' },
  chartCard: {
    width: '90%',
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 3,
    padding: 20,
    alignItems: 'center',
    marginVertical: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginVertical: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
