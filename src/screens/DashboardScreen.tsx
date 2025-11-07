import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Title, Button, Surface } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

export default function DashboardScreen() {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <Surface style={styles.card}>
        <Title style={styles.title}>Dashboard</Title>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => navigation.navigate('AddCase' as never)} // optional future route
        >
          ➕ Add Case
        </Button>
        <Button
          mode="outlined"
          style={styles.button}
          onPress={() => navigation.navigate('UpdateCase' as never)} // optional future route
        >
          ✏️ Update Case
        </Button>
      </Surface>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f7fb' },
  card: { padding: 20, borderRadius: 10, elevation: 3, backgroundColor: 'white', width: '80%', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  button: { width: '100%', marginVertical: 10 },
})
