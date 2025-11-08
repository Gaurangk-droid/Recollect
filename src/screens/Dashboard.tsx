import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native'
import { Title, Button, Surface, Text } from 'react-native-paper'
import Sidebar from '../components/Sidebar'
import HeaderBar from '../components/HeaderBar'
import { useNavigation } from '@react-navigation/native'

const DRAWER_WIDTH = 250
const ANIM_DURATION = 220
const MOBILE_BREAKPOINT = 900 // Sidebar fixed on desktop only

export default function Dashboard() {
  const navigation = useNavigation()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [name, setName] = useState('Manager')
  const isLargeScreen = Dimensions.get('window').width > MOBILE_BREAKPOINT

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isLargeScreen) {
      translateX.setValue(0)
      overlayOpacity.setValue(0)
      setDrawerVisible(false)
    } else {
      translateX.setValue(-DRAWER_WIDTH)
      overlayOpacity.setValue(0)
    }
  }, [isLargeScreen])

  const openDrawer = () => {
    setDrawerVisible(true)
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
        easing: Easing.out(Easing.cubic),
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
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setDrawerVisible(false))
  }

  return (
    <View style={styles.appContainer}>
      {/* ✅ Sidebar (Desktop only) */}
      {isLargeScreen && (
        <View style={styles.sidebarContainer}>
          <Sidebar active="Dashboard" />
        </View>
      )}

      {/* ✅ Main content area */}
      <SafeAreaView
        style={[
          styles.mainContent,
          {
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
          },
        ]}
      >
        {/* ✅ Header for Mobile */}
        {!isLargeScreen && (
          <HeaderBar onMenuPress={openDrawer} name={name} />
        )}

        {/* ✅ Sidebar Drawer (Mobile) */}
        {!isLargeScreen && (
          <Modal visible={drawerVisible} transparent animationType="none">
            <View style={styles.modalRoot}>
              <TouchableWithoutFeedback onPress={closeDrawer}>
                <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
              </TouchableWithoutFeedback>

              <Animated.View
                style={[styles.animatedDrawer, { transform: [{ translateX }] }]}
              >
                <Sidebar active="Dashboard" onClose={closeDrawer} />
              </Animated.View>
            </View>
          </Modal>
        )}

        {/* ✅ Dashboard content */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Surface style={styles.card}>
            <Title style={styles.title}>Dashboard Overview</Title>
            <Text style={styles.subtitle}>Welcome back, {name} 👋</Text>

            <View style={styles.statsRow}>
              <Surface style={styles.statCard}>
                <Text style={styles.statLabel}>Total Cases</Text>
                <Text style={styles.statValue}>124</Text>
              </Surface>

              <Surface style={styles.statCard}>
                <Text style={styles.statLabel}>Payments Collected</Text>
                <Text style={[styles.statValue, { color: '#0B874B' }]}>₹56,000</Text>
              </Surface>
            </View>

            <View style={styles.actions}>
              <Button
                mode="contained"
                style={styles.button}
                onPress={() => navigation.navigate('AddCase' as never)}
              >
                ➕ Add New Case
              </Button>

              <Button
                mode="outlined"
                style={styles.button}
                onPress={() => navigation.navigate('CaseList' as never)}
              >
                📋 View Case List
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F8FC',
  },
  sidebarContainer: {
    width: DRAWER_WIDTH,
    backgroundColor: '#002B5B',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  animatedDrawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#002B5B',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  card: {
    width: '100%',
    maxWidth: 700,
    padding: 30,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002B5B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fc',
    alignItems: 'center',
    elevation: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#002B5B',
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
  },
})
