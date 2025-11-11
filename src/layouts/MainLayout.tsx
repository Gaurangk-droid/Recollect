import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  TouchableWithoutFeedback,
  StatusBar,
} from "react-native";
import Sidebar from "../components/Sidebar";
import HeaderBar from "../components/HeaderBar";
import { SafeAreaView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { COLORS } from "../styles/theme";

const DRAWER_WIDTH = 250;
const ANIM_DURATION = 220;
const MOBILE_BREAKPOINT = 900;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const route = useRoute();
  const isLargeScreen = Dimensions.get("window").width > MOBILE_BREAKPOINT;

  // animation values (one source of truth)
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // header + status bar offsets
  const headerHeight = useHeaderHeight() || 56; // fallback if not provided
  const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
  const topOffset = headerHeight + statusBarHeight;

  // Keep initial state consistent when switching screen sizes
  useEffect(() => {
    if (isLargeScreen) {
      // desktop: sidebar visible, reset mobile states
      translateX.setValue(0);
      overlayOpacity.setValue(0);
      setDrawerOpen(false);
    } else {
      // mobile: ensure drawer hidden initially
      translateX.setValue(-DRAWER_WIDTH);
      overlayOpacity.setValue(0);
    }
  }, [isLargeScreen, translateX, overlayOpacity]);

  // open animation
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

  // close animation
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
    ]).start(() => {
      // ensure state reflects closed after animation
      setDrawerOpen(false);
    });
  };

  // Render exactly one Sidebar instance:
  // - On large screens: always-visible sidebar (desktop)
  // - On mobile: Sidebar appears only inside the animated drawer when drawerOpen (single instance)
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header (always above mobile drawer) */}
       <View style={[styles.headerWrapper, { paddingTop: statusBarHeight, zIndex: 20 }]}>
  <HeaderBar
    onToggleMenu={() => (drawerOpen ? closeDrawer() : openDrawer())}
    isDrawerOpen={drawerOpen}
    name="Manager"
  />
</View>


        <View style={styles.contentRow}>
          {/* Desktop sidebar (single instance on large screens) */}
          {isLargeScreen && (
            <View style={styles.sidebarContainer}>
              <Sidebar active={route.name as any} />
            </View>
          )}

          {/* Main content area */}
          <View style={styles.pageContent}>
            {children}
          </View>
        </View>

        {/* Mobile overlay + animated drawer (rendered only when NOT large screen) */}
        {!isLargeScreen && (
          <>
            {/* Overlay - mounted always but transparent when closed.
                Use pointerEvents to ensure tapping overlay closes the drawer only when open */}
            <Animated.View
              pointerEvents={drawerOpen ? "auto" : "none"}
              style={[
                styles.overlay,
                {
                  top: topOffset,
                  opacity: overlayOpacity,
                },
              ]}
            >
              {drawerOpen ? (
                <TouchableWithoutFeedback onPress={closeDrawer}>
                  <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
              ) : null}
            </Animated.View>

            {/* Animated drawer container (keeps a single Sidebar instance) */}
            <Animated.View
              style={[
                styles.animatedDrawer,
                {
                  top: topOffset,
                  height: Dimensions.get("window").height - topOffset,
                  transform: [{ translateX }],
                },
              ]}
            >
              {/* single Sidebar instance for mobile drawer */}
              <Sidebar active={route.name as any} onClose={closeDrawer} />
            </Animated.View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  headerWrapper: {
    backgroundColor: COLORS.card,
    elevation: 10,
    shadowOpacity: 0.05,
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
  },
  sidebarContainer: {
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.primaryLight,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  pageContent: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    zIndex: 15,
  },
  animatedDrawer: {
    position: "absolute",
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.primaryLight,
    zIndex: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
});
