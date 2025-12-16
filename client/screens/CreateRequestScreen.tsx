import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useApp, PujaService } from "@/context/AppContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CreateRequestRouteProp = RouteProp<RootStackParamList, "CreateRequest">;

export default function CreateRequestScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<CreateRequestRouteProp>();
  const { theme } = useTheme();
  const { createRequest } = useApp();

  const service = route.params?.service;

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("Morning (6-9 AM)");
  const [budget, setBudget] = useState(service?.basePrice?.toString() || "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const timeSlots = [
    "Morning (6-9 AM)",
    "Mid-Morning (9-12 PM)",
    "Afternoon (12-3 PM)",
    "Evening (5-8 PM)",
  ];

  const handleSubmit = () => {
    if (!service || !budget) {
      Alert.alert("Missing Information", "Please enter your budget to continue");
      return;
    }

    const budgetNum = parseInt(budget, 10);
    if (!budgetNum || budgetNum < 100) {
      Alert.alert("Invalid Budget", "Please enter a valid budget amount (minimum 100)");
      return;
    }

    createRequest({
      serviceName: service.name,
      temple: service.temple,
      date: date.toISOString(),
      time,
      userBudgetPrice: budgetNum,
    });

    Alert.alert(
      "Request Posted!",
      "Your puja request has been posted. Pandits will respond soon.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  if (!service) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No service selected</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + Spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.serviceHeader, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.serviceIcon, { backgroundColor: Colors.light.priceBackground }]}>
            <Feather name="sun" size={32} color={Colors.light.primary} />
          </View>
          <View style={styles.serviceInfo}>
            <ThemedText type="h3">{service.name}</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {service.temple}
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Select Date</ThemedText>
          <Pressable
            style={[styles.dateButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather name="calendar" size={20} color={Colors.light.primary} />
            <ThemedText type="body" style={{ marginLeft: Spacing.md, flex: 1 }}>
              {formatDate(date)}
            </ThemedText>
            <Feather name="chevron-down" size={20} color={theme.textSecondary} />
          </Pressable>
          {showDatePicker ? (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) setDate(selectedDate);
              }}
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Preferred Time</ThemedText>
          <View style={styles.timeSlots}>
            {timeSlots.map((slot) => (
              <Pressable
                key={slot}
                style={[
                  styles.timeSlot,
                  {
                    backgroundColor: time === slot ? Colors.light.primary : theme.backgroundDefault,
                    borderColor: time === slot ? Colors.light.primary : theme.border,
                  }
                ]}
                onPress={() => setTime(slot)}
              >
                <ThemedText
                  type="small"
                  style={{ color: time === slot ? "#FFFFFF" : theme.text, fontWeight: "500" }}
                >
                  {slot}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Your Budget</ThemedText>
          <ThemedText type="small" style={[styles.budgetHint, { color: theme.textSecondary }]}>
            Enter what you'd like to pay for this puja
          </ThemedText>
          
          <View style={[styles.budgetInputContainer, { backgroundColor: Colors.light.priceBackground, borderColor: Colors.light.priceBorder }]}>
            <ThemedText type="price" style={{ color: Colors.light.primary, opacity: 0.6 }}>
              {"\u20B9"}
            </ThemedText>
            <TextInput
              style={[styles.budgetInput, { color: Colors.light.primary }]}
              placeholder="Enter amount"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={budget}
              onChangeText={setBudget}
            />
          </View>

          <View style={[styles.suggestedPrices, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Suggested: Starting from {"\u20B9"}{service.basePrice}
            </ThemedText>
          </View>
        </View>

        <AnimatedPressable
          style={[
            styles.submitButton,
            { backgroundColor: Colors.light.primary, opacity: budget ? 1 : 0.5 },
            animatedButtonStyle
          ]}
          onPress={handleSubmit}
          onPressIn={() => { buttonScale.value = withSpring(0.96, springConfig); }}
          onPressOut={() => { buttonScale.value = withSpring(1, springConfig); }}
          disabled={!budget}
        >
          <Feather name="send" size={20} color="#FFFFFF" />
          <ThemedText type="body" style={styles.submitButtonText}>
            Post Request
          </ThemedText>
        </AnimatedPressable>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  serviceIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  serviceInfo: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  timeSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  budgetHint: {
    marginBottom: Spacing.md,
  },
  budgetInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: 80,
    marginBottom: Spacing.md,
  },
  budgetInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    marginLeft: Spacing.xs,
  },
  suggestedPrices: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
