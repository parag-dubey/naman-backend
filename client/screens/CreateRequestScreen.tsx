import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Platform, Alert, Modal, Linking, Text } from "react-native";
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
import { useApp } from "@/context/AppContext";
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

  // --- FORM STATE ---
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState(""); // New Email Field
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("Morning (6-9 AM)");
  const [budget, setBudget] = useState(service?.basePrice?.toString() || "");
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const timeSlots = [
    "Morning (6-9 AM)", "Mid-Morning (9-12 PM)", "Afternoon (12-3 PM)", "Evening (5-8 PM)",
  ];

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  const handleSubmit = async () => {
    // 1. Validation
    if (!userName.trim() || !userPhone.trim() || !userEmail.trim()) {
      Alert.alert("Details Missing", "Please fill in Name, Phone, and Email.");
      return;
    }
    
    if (!service || !budget) {
      Alert.alert("Missing Information", "Please enter your bid amount.");
      return;
    }

    const budgetNum = parseInt(budget, 10);
    // Check Minimum Bid
    if (!budgetNum || budgetNum < service.basePrice) {
      Alert.alert("Low Bid", `Minimum bid for this service is ₹${service.basePrice}`);
      return;
    }

    // 2. SEND TO SERVER (WordPress)
    try {
      const YOUR_IP = "10.112.200.81"; // Apne IP se match karein
      const SERVER_URL = `http://${YOUR_IP}:5000/api/leads`;

      console.log("🔄 Sending Form Data...", SERVER_URL);

      await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          phone: userPhone,
          email: userEmail, // Email bhi bhej rahe hain
          service: `${service.name} | Bid: ₹${budgetNum} | Date: ${formatDate(date)} | Time: ${time}`
        })
      });

      console.log("✅ Data sent to server!");

    } catch (error) {
      console.log("⚠️ Network Error (Background):", error);
    }

    // 3. APP LOGIC
    createRequest({
      serviceName: service.name,
      temple: service.temple,
      date: date.toISOString(),
      time,
      userBudgetPrice: budgetNum,
    });

    setShowThankYou(true);

    setTimeout(() => {
      setShowThankYou(false);
      // WhatsApp Message me bhi Email jod diya
      const adminPhoneNumber = "919454186429"; 
      const message = `Namaste! 🙏\nNew Puja Request:\n\n*Name:* ${userName}\n*Phone:* ${userPhone}\n*Email:* ${userEmail}\n*Service:* ${service.name}\n*Bid:* ₹${budgetNum}\n*Date:* ${date.toLocaleDateString()}`;
      
      const url = `whatsapp://send?phone=${adminPhoneNumber}&text=${encodeURIComponent(message)}`;

      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "WhatsApp is not installed");
      });
      navigation.goBack(); 
    }, 3000);
  };

  if (!service) return <ThemedView><ThemedText>No service selected</ThemedText></ThemedView>;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Header */}
        <View style={[styles.serviceHeader, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.serviceIcon, { backgroundColor: Colors.light.priceBackground }]}>
            <Feather name="sun" size={32} color={Colors.light.primary} />
          </View>
          <View style={styles.serviceInfo}>
            <ThemedText type="h3">{service.name}</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>{service.temple}</ThemedText>
          </View>
        </View>

        {/* 1. Personal Details Form */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Your Details</ThemedText>
          
          <TextInput 
            style={[styles.inputBox, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
            placeholder="Full Name"
            placeholderTextColor={theme.textSecondary}
            value={userName}
            onChangeText={setUserName}
          />
          
          <TextInput 
            style={[styles.inputBox, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
            placeholder="Phone Number"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
            maxLength={10}
            value={userPhone}
            onChangeText={setUserPhone}
          />

          <TextInput 
            style={[styles.inputBox, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
            placeholder="Email Address"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            value={userEmail}
            onChangeText={setUserEmail}
          />
        </View>

        {/* 2. Date & Time */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Schedule</ThemedText>
          <Pressable
            style={[styles.dateButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather name="calendar" size={20} color={Colors.light.primary} />
            <ThemedText type="body" style={{ marginLeft: Spacing.md }}>{formatDate(date)}</ThemedText>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker value={date} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} minimumDate={new Date()} onChange={(e, d) => { setShowDatePicker(Platform.OS === "ios"); if (d) setDate(d); }} />
          )}

          <View style={styles.timeSlots}>
            {timeSlots.map((slot) => (
              <Pressable key={slot} style={[styles.timeSlot, { backgroundColor: time === slot ? Colors.light.primary : theme.backgroundDefault, borderColor: theme.border }]} onPress={() => setTime(slot)}>
                <ThemedText type="small" style={{ color: time === slot ? "#FFFFFF" : theme.text }}>{slot}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 3. Bid Amount */}
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Your Bid</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: 5 }}>
            Minimum Bid: ₹{service.basePrice}
          </ThemedText>
          
          <View style={[styles.budgetInputContainer, { backgroundColor: Colors.light.priceBackground, borderColor: Colors.light.priceBorder }]}>
            <ThemedText type="price" style={{ color: Colors.light.primary }}>{"\u20B9"}</ThemedText>
            <TextInput
              style={[styles.budgetInput, { color: Colors.light.primary }]}
              placeholder={`${service.basePrice}`}
              keyboardType="number-pad"
              value={budget}
              onChangeText={setBudget}
            />
          </View>
        </View>

        <AnimatedPressable
          style={[styles.submitButton, { backgroundColor: Colors.light.primary }, animatedButtonStyle]}
          onPress={handleSubmit}
        >
          <Feather name="send" size={20} color="#FFFFFF" />
          <ThemedText type="body" style={styles.submitButtonText}>Post Request</ThemedText>
        </AnimatedPressable>
      </KeyboardAwareScrollViewCompat>

      <Modal visible={showThankYou} transparent={true} animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}><Feather name="check" size={40} color="#FFFFFF" /></View>
            <Text style={styles.modalTitle}>Request Submitted!</Text>
            <Text style={styles.timerText}>Redirecting to WhatsApp...</Text>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg },
  serviceHeader: { flexDirection: "row", alignItems: "center", padding: Spacing.lg, borderRadius: BorderRadius.md, marginBottom: Spacing.xl },
  serviceIcon: { width: 64, height: 64, borderRadius: BorderRadius.sm, alignItems: "center", justifyContent: "center", marginRight: Spacing.lg },
  serviceInfo: { flex: 1 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { marginBottom: Spacing.md },
  inputBox: { height: 50, borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: 15, marginBottom: 12, fontSize: 16 },
  dateButton: { flexDirection: "row", alignItems: "center", height: 50, paddingHorizontal: 15, borderRadius: BorderRadius.sm, borderWidth: 1, marginBottom: 12 },
  timeSlots: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timeSlot: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.sm, borderWidth: 1 },
  budgetInputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 2, borderRadius: BorderRadius.md, paddingHorizontal: 15, height: 60 },
  budgetInput: { flex: 1, fontSize: 24, fontWeight: "700", marginLeft: 10 },
  submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 50, borderRadius: BorderRadius.sm, marginTop: 20 },
  submitButtonText: { color: "#FFFFFF", fontWeight: "600", marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '80%', padding: 24, borderRadius: 20, alignItems: 'center' },
  successIcon: { width: 60, height: 60, backgroundColor: '#22C55E', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  timerText: { color: '#666' }
});