import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useApp, UserRole } from "@/context/AppContext";

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { login } = useApp();

  const [role, setRole] = useState<UserRole>("user");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleLogin = async () => {
    if (!phone.trim()) return;
    
    setIsLoading(true);
    try {
      await login(phone, role, name || undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, springConfig);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, springConfig);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h1" style={styles.appTitle}>NamanDarshan</ThemedText>
          <ThemedText type="body" style={[styles.tagline, { color: theme.textSecondary }]}>
            Divine Services at Your Doorstep
          </ThemedText>
        </View>

        <View style={styles.roleToggleContainer}>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            I am a
          </ThemedText>
          <View style={[styles.roleToggle, { backgroundColor: theme.backgroundDefault }]}>
            <Pressable
              style={[
                styles.roleButton,
                role === "user" && { backgroundColor: Colors.light.primary }
              ]}
              onPress={() => setRole("user")}
            >
              <ThemedText
                type="body"
                style={[
                  styles.roleText,
                  { color: role === "user" ? "#FFFFFF" : theme.text }
                ]}
              >
                Devotee
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.roleButton,
                role === "pandit" && { backgroundColor: Colors.light.primary }
              ]}
              onPress={() => setRole("pandit")}
            >
              <ThemedText
                type="body"
                style={[
                  styles.roleText,
                  { color: role === "pandit" ? "#FFFFFF" : theme.text }
                ]}
              >
                Pandit
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
              Your Name
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                }
              ]}
              placeholder={role === "pandit" ? "Pandit Ji" : "Your Name"}
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
              Phone Number
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                }
              ]}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor={theme.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>
        </View>

        <AnimatedPressable
          style={[
            styles.loginButton,
            { backgroundColor: Colors.light.primary, opacity: phone.trim() ? 1 : 0.5 },
            animatedButtonStyle
          ]}
          onPress={handleLogin}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!phone.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText type="body" style={styles.loginButtonText}>
              {role === "pandit" ? "Start Serving" : "Begin Journey"}
            </ThemedText>
          )}
        </AnimatedPressable>

        <ThemedText type="small" style={[styles.disclaimer, { color: theme.textSecondary }]}>
          By continuing, you agree to our Terms of Service
        </ThemedText>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  appTitle: {
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    textAlign: "center",
  },
  roleToggleContainer: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  roleToggle: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  roleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  roleText: {
    fontWeight: "600",
  },
  formContainer: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  loginButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  disclaimer: {
    textAlign: "center",
  },
});
