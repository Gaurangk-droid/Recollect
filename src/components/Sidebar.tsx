import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons'

interface SidebarProps {
  role: 'manager' | 'agent'
  active: string
}

export default function Sidebar({ role, active }: SidebarProps) {
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
          style={[
            styles.menuItem,
            active === item.route && styles.activeItem,
          ]}
          onPress={() => navigation.navigate(item.route as never)}
        >
          <MaterialIcons
            name={item.icon as any}
            size={22}
            color={active === item.route ? '#FFD700' : '#fff'}
          />
          <Text
            style={[
              styles.menuText,
              active === item.route && { color: '#FFD700' },
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            try {
              const { error } = await (await import('../lib/supabaseClient')).supabase.auth.signOut()
              if (!error) navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] })
            } catch (e) {
              console.error('Logout error:', e)
            }
          }}
        >
          <MaterialIcons name="logout" size={22} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: '#002B5B',
    paddingVertical: 30,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 30,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  activeItem: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  menuText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 10,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
  },
})
