import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import {
  TextInput,
  Title,
  Paragraph,
  Surface,
  ActivityIndicator,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabaseClient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { COLORS } from "../styles/theme";
import { globalStyles } from "../styles/globalStyles";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Login">;

interface Props {
  route?: { params?: { verifiedAgencyCode?: string } };
}

export default function LoginScreen({ route }: Props) {
  const navigation = useNavigation<NavProp>();
  const verifiedAgencyCode = route?.params?.verifiedAgencyCode || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async () => {
    let valid = true;

    if (!email.trim()) {
      setEmailError("Please enter your email.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    setLoading(true);
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        });

      if (authError || !authData.user) {
        setLoading(false);
        setPasswordError("Invalid email or password.");
        return;
      }

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("id, agency_id, email")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (userError || !userRow) {
        setLoading(false);
        Alert.alert("Error", "User profile not found.");
        return;
      }

      if (userRow.agency_id !== verifiedAgencyCode) {
        await supabase.auth.signOut();
        setLoading(false);
        Alert.alert(
          "Access denied",
          "This account is not linked to your agency."
        );
        return;
      }

      setLoading(false);
      Alert.alert("✅ Success", "Login successful! Redirecting...");
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    } catch (err: any) {
      console.error("Login error:", err);
      Alert.alert("Error", err.message || "Unexpected login issue");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={globalStyles.card}>
          <Title style={globalStyles.title}>Agent Login</Title>
          <Paragraph style={globalStyles.subtitle}>
            Welcome back. Please enter your credentials to access your
            dashboard.
          </Paragraph>

          {/* Email Field */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={globalStyles.input}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          {/* Password Field */}
          <View style={styles.passwordContainer}>
            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              style={[globalStyles.input, { flex: 1 }]}
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          {/* Login Button */}
          <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                globalStyles.button,
                {
                  width: "100%",
                  maxWidth: 400,
                  opacity: pressed || loading ? 0.8 : 1,
                  backgroundColor: COLORS.primary,
                },
              ]}
            >
              <Text style={globalStyles.buttonText}>
                {loading ? "Logging in..." : "Login"}
              </Text>
            </Pressable>
          </View>

          {loading && (
            <ActivityIndicator
              animating
              color={COLORS.primary}
              style={{ marginTop: 10 }}
            />
          )}
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 30,
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 6,
    alignSelf: "flex-start",
  },
});
