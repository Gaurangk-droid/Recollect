// globalStyles.ts
import { StyleSheet } from "react-native";
import { COLORS } from "./theme";

export const globalStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  input: {
    marginTop: 12,
    backgroundColor: COLORS.card,
  },

 button: {
  backgroundColor: COLORS.primary,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
   marginTop: 12,
  width: "100%",
  alignSelf: "stretch",   // fills parent container
  overflow: "hidden",     // lets ripple effect show fully
  minHeight: 48,          // consistent height across screens
},

  buttonText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 26,
    color: COLORS.textSecondary,
  },
});
