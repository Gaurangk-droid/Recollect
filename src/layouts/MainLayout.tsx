import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import Sidebar from "../components/Sidebar";
import HeaderBar from "../components/HeaderBar";
import { SafeAreaView, StatusBar } from "react-native";
import { useRoute } from "@react-navigation/native";

const DRAWER_WIDTH = 250;
const ANIM_DURATION = 220;
const MOBILE_BREAKPOINT = 900;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isLargeScreen = Dimensions.get("window").width > MOBILE_BREAKPOINT;
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLargeScreen) {
      translateX.setValue(0);
      overlayOpacity.setValue(0);
      setDrawerOpen(false);
    } else {
      translateX.setValue(-DRAWER_WIDTH);
      overlayOpacity.setValue(0);
    }
  }, [isLargeScreen]);

  const openDrawer = () => {
    setDrawerOpen(true);
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
    ]).start();
  };

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
    ]).start(() => setDrawerOpen(false));
  };

  const route = useRoute();

  return (
    <View style={styles.appContainer}>
      {/* Sidebar (desktop always visible) */}
      {isLargeScreen && (
        <View style={styles.sidebarContainer}>
          <Sidebar active={route.name as any} />
        </View>
      )}

      {/* Main content */}
      <SafeAreaView
        style={[
          styles.mainContent,
          { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
        ]}
      >
        {/* HeaderBar for mobile */}
        {!isLargeScreen && (
          <HeaderBar
            onToggleMenu={() => (drawerOpen ? closeDrawer() : openDrawer())}
            isDrawerOpen={drawerOpen}
            name="Manager"
          />
        )}

        {/* Drawer for mobile */}
        {!isLargeScreen && drawerOpen && (
          <>
            <TouchableWithoutFeedback onPress={closeDrawer}>
              <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[styles.animatedDrawer, { transform: [{ translateX }] }]}
            >
              <Sidebar active={route.name as any} onClose={closeDrawer} />
            </Animated.View>
          </>
        )}

        {/* Actual page content */}
        <View style={{ flex: 1 }}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F5F8FC",
  },
  sidebarContainer: {
    width: DRAWER_WIDTH,
    backgroundColor: "#002B5B",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#F5F8FC",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 5,
  },
  animatedDrawer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: "#002B5B",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 6,
  },
});
