import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

interface HeaderBarProps {
  onMenuPress?: () => void
  name?: string
  branch?: string
  logoUri?: string
}

export default function HeaderBar({ onMenuPress, name, branch, logoUri }: HeaderBarProps) {
  return (
    <View style={styles.header}>
      {/* Left section: logo & toggle */}
      <View style={styles.left}>
        <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
          <MaterialIcons name="menu" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.logoWrap}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoImg} />
          ) : (
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>RP</Text>
            </View>
          )}
        </View>
      </View>

      {/* Center: welcome text */}
      <View style={styles.center}>
        <Text style={styles.welcomeText}>
          Welcome{ name ? `, ${name}` : '' }
        </Text>
        {branch ? <Text style={styles.branchText}>{branch}</Text> : null}
      </View>

      {/* Right: placeholder to balance layout */}
      <View style={{ width: 40 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002B5B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginRight: 10,
  },
  logoWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    backgroundColor: '#FFD700',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#002B5B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoImg: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  center: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  branchText: {
    color: '#FFD700',
    fontSize: 12,
  },
})
