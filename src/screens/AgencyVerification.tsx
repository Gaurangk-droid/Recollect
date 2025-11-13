import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";
import { TextInput, Button, Surface } from "react-native-paper";
import { supabase } from "../lib/supabaseClient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { Pressable } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import { COLORS } from "../styles/theme";

export default function AgencyVerificationScreen() {
  const [agencyCode, setAgencyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleVerify = async () => {
    if (!agencyCode.trim()) {
      setError("Please enter your agency ID.");
      return;
    }

    setError("");
    setLoading(true);

    const { data, error } = await supabase
      .from("agencies")
      .select("id")
      .eq("agency_code", agencyCode.trim())
      .single();

    setLoading(false);

    if (error || !data) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        Alert.alert(
          "Too Many Attempts",
          "You have entered an invalid ID 3 times.\nPlease contact your administrator."
        );
        setAttempts(0);
      } else {
        setError("Invalid agency ID. Please try again.");
      }
    } else {
      Alert.alert("✅ Success", "Agency verified successfully!");
      navigation.navigate("Login", { verifiedAgencyCode: data.id });
      setAttempts(0);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={globalStyles.card}>
          <Text style={[globalStyles.title, { color: COLORS.primary }]}>
            Agency Verification
          </Text>

          <Text style={globalStyles.subtitle}>
            Enter your agency ID to continue
          </Text>

          <TextInput
            label="Agency ID"
            value={agencyCode}
            onChangeText={(text) => {
              setAgencyCode(text);
              if (error) setError("");
            }}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            style={[globalStyles.input, { width: "100%" }]}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            theme={{
              colors: {
                text: COLORS.textPrimary,
                placeholder: COLORS.textSecondary,
                background: COLORS.card,
              },
            }}
          />

          {error ? (
            <Text style={{ color: COLORS.danger, marginTop: 8 }}>{error}</Text>
          ) : null}

          <View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
            <Pressable
              onPress={handleVerify}
              disabled={loading || !agencyCode.trim()}
              style={({ pressed }) => {
                const isDisabled = loading || !agencyCode.trim();
                return [
                  globalStyles.button,
                  {
                    width: "100%",
                    maxWidth: 400,
                    backgroundColor: isDisabled
                      ? COLORS.disabled || "#B0B0B0" // fallback grey if not defined
                      : COLORS.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ];
              }}
            >
              <Text style={globalStyles.buttonText}>
                {loading ? "Verifying..." : "Verify Agency"}
              </Text>
            </Pressable>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});
