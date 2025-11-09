// ✅ src/components/Sidebar.tsx
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/AppNavigator'

interface SidebarProps {
  active: keyof RootStackParamList
  role?: 'manager' | 'agent'
  onClose?: () => void
}

export default function Sidebar({ active, role = 'manager', onClose }: SidebarProps) {
  // Typed navigation
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  // Screens that can be safely navigated to without params
type SafeRoutes = Exclude<keyof RootStackParamList, "Login" | "CaseDetails">

const commonMenu: { label: string; icon: string; route: SafeRoutes }[] = [
  { label: 'Dashboard', icon: 'dashboard', route: 'Dashboard' },
  { label: 'Case List', icon: 'list-alt', route: 'ViewCases' },
  { label: 'Activity', icon: 'assignment', route: 'Dashboard' },
  { label: 'Calendar', icon: 'calendar-today', route: 'Dashboard' },
]

const managerMenu: { label: string; icon: string; route: SafeRoutes }[] = [
  ...commonMenu,
  { label: 'Add Case', icon: 'add-circle-outline', route: 'AddCase' },
  { label: 'Reports', icon: 'bar-chart', route: 'Dashboard' },
]

  const menu = role === 'manager' ? managerMenu : commonMenu

  return (
    <View style={styles.sidebar}>
      <Text style={styles.logo}>Recovery Portal</Text>

{menu.map((item) => (
  <TouchableOpacity
    key={item.label} // ✅ unique key
    style={[styles.menuItem, active === item.route && styles.activeItem]}
    onPress={() => {
      navigation.navigate(item.route as any) // ✅ correct
      onClose && onClose()
    }}
  >
    <MaterialIcons
      name={item.icon as any}
      size={22}
      color={active === item.route ? '#FFD700' : '#fff'}
    />
    <Text
      style={[
        styles.menuText,
        active === item.route && { color: '#FFD700', fontWeight: '600' },
      ]}
    >
      {item.label}
    </Text>
  </TouchableOpacity>
))}


    </View>
  )
}

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    backgroundColor: '#002B5B',
    paddingVertical: 30,
    paddingHorizontal: 14,
  },
  logo: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  activeItem: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  menuText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 12,
  },
})
