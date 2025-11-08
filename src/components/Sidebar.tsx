import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

interface SidebarProps {
  active: string
  role?: 'manager' | 'agent'
  onClose?: () => void
}

export default function Sidebar({ active, role = 'manager', onClose }: SidebarProps) {
  const navigation = useNavigation()

  const commonMenu = [
    { label: 'Dashboard', icon: 'dashboard', route: 'Dashboard' },
    { label: 'Case List', icon: 'list-alt', route: 'CaseList' },
    { label: 'Activity', icon: 'assignment', route: 'Activity' },
    { label: 'Calendar', icon: 'calendar-today', route: 'Calendar' },
  ]

  const managerMenu = [
    ...commonMenu,
    { label: 'Add Case', icon: 'add-circle-outline', route: 'AddCase' },
    { label: 'Reports', icon: 'bar-chart', route: 'Reports' },
  ]

  const menu = role === 'manager' ? managerMenu : commonMenu

  return (
    <View style={styles.sidebar}>
      <Text style={styles.logo}>Recovery Portal</Text>

      {menu.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={[styles.menuItem, active === item.route && styles.activeItem]}
          onPress={() => {
            navigation.navigate(item.route as never)
            onClose && onClose()
          }}
        >
          <MaterialIcons
            name={item.icon as any}
            size={22}
            color={active === item.route ? '#FFD700' : '#fff'}
          />
          <Text
            style={[styles.menuText, active === item.route && { color: '#FFD700' }]}
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
