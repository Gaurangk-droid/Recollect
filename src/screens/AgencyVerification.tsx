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
            autoCapitalize="characters"
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

          <Button
          mode="contained"
          onPress={handleVerify}
          loading={loading}
          disabled={loading || !agencyCode.trim()}
          style={[globalStyles.button, { width: "100%", alignSelf: "stretch" }]}
          contentStyle={{
            height: 50,                 // ensures ripple fills full height
            justifyContent: "center",
          }}
          labelStyle={globalStyles.buttonText}
          buttonColor={COLORS.primary}
        >
          {loading ? "Verifying..." : "Verify Agency"}
        </Button>

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
