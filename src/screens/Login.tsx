import React, { useState } from "react";
import {
  View,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Please enter both email and password.");
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        });

      if (authError || !authData.user) {
        setLoading(false);
        return Alert.alert("Login failed", "Invalid email or password.");
      }

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("id, agency_id, email")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (userError || !userRow) {
        setLoading(false);
        return Alert.alert("Error", "User profile not found.");
      }

      if (userRow.agency_id !== verifiedAgencyCode) {
        await supabase.auth.signOut();
        setLoading(false);
        return Alert.alert(
          "Access denied",
          "This account is not linked to your agency."
        );
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
            Welcome back. Please enter your credentials to access your dashboard.
          </Paragraph>

          {/* Email Field */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            mode="outlined"
            style={globalStyles.input}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
          />

          {/* Password Field */}
          <View style={styles.passwordContainer}>
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
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

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={globalStyles.button}
            buttonColor={COLORS.primary}
            contentStyle={{ paddingVertical: 6 }}
            labelStyle={globalStyles.buttonText}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

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
});
