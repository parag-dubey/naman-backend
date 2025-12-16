import React, { useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Modal, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useApp, PujaRequest } from "@/context/AppContext";

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RequestCardProps {
  request: PujaRequest;
  onAccept: () => void;
  onCounter: () => void;
}

function RequestCard({ request, onAccept, onCounter }: RequestCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <Animated.View
      style={[
        styles.requestCard,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.serviceIcon, { backgroundColor: Colors.light.priceBackground }]}>
          <Feather name="sun" size={24} color={Colors.light.primary} />
        </View>
        <View style={styles.headerInfo}>
          <ThemedText type="h4">{request.serviceName}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {request.temple}
          </ThemedText>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Feather name="calendar" size={16} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
            {formatDate(request.date)}
          </ThemedText>
        </View>
        <View style={styles.detailItem}>
          <Feather name="clock" size={16} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
            {request.time}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.priceSection, { backgroundColor: Colors.light.priceBackground, borderColor: Colors.light.priceBorder }]}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>User Offer</ThemedText>
        <ThemedText type="price" style={{ color: Colors.light.primary }}>
          {"\u20B9"}{request.userBudgetPrice}
        </ThemedText>
      </View>

      <View style={styles.actionButtons}>
        <AnimatedPressable
          style={[styles.actionButton, styles.acceptButton, { backgroundColor: Colors.light.success }]}
          onPress={onAccept}
          onPressIn={() => { scale.value = withSpring(0.97, springConfig); }}
          onPressOut={() => { scale.value = withSpring(1, springConfig); }}
        >
          <Feather name="check" size={18} color="#FFFFFF" />
          <ThemedText type="body" style={styles.buttonText}>
            Accept @ {"\u20B9"}{request.userBudgetPrice}
          </ThemedText>
        </AnimatedPressable>
        
        <AnimatedPressable
          style={[styles.actionButton, styles.counterButton, { backgroundColor: Colors.light.counter }]}
          onPress={onCounter}
          onPressIn={() => { scale.value = withSpring(0.97, springConfig); }}
          onPressOut={() => { scale.value = withSpring(1, springConfig); }}
        >
          <Feather name="arrow-up-circle" size={18} color="#FFFFFF" />
          <ThemedText type="body" style={styles.buttonText}>
            Counter Offer
          </ThemedText>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}

interface CounterModalProps {
  visible: boolean;
  request: PujaRequest | null;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

function CounterModal({ visible, request, onClose, onSubmit }: CounterModalProps) {
  const { theme } = useTheme();
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount <= (request?.userBudgetPrice || 0)) {
      Alert.alert("Invalid Amount", "Counter offer must be higher than user's offer");
      return;
    }
    onSubmit(numAmount);
    setAmount("");
  };

  if (!request) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]} onPress={e => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">Counter Offer</ThemedText>
            <Pressable onPress={onClose} hitSlop={20}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ThemedText type="body" style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
            {request.serviceName} at {request.temple}
          </ThemedText>

          <View style={[styles.originalPrice, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              User's Offer
            </ThemedText>
            <ThemedText type="priceSmall" style={{ color: theme.textSecondary, textDecorationLine: "line-through" }}>
              {"\u20B9"}{request.userBudgetPrice}
            </ThemedText>
          </View>

          <View style={styles.inputSection}>
            <ThemedText type="small" style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Your Counter Price
            </ThemedText>
            <View style={[styles.priceInput, { backgroundColor: theme.backgroundDefault, borderColor: Colors.light.priceBorder }]}>
              <ThemedText type="price" style={{ color: Colors.light.primary, opacity: 0.6 }}>
                {"\u20B9"}
              </ThemedText>
              <TextInput
                style={[styles.amountInput, { color: Colors.light.primary }]}
                placeholder="Enter amount"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <Pressable
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <ThemedText type="body" style={{ color: theme.text }}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.submitButton, { backgroundColor: Colors.light.counter, opacity: amount ? 1 : 0.5 }]}
              onPress={handleSubmit}
              disabled={!amount}
            >
              <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Submit Offer
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function LiveMarketScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, getOpenRequestsForPandits, acceptUserPrice, submitCounterOffer } = useApp();
  
  const [counterModal, setCounterModal] = useState<{ visible: boolean; request: PujaRequest | null }>({
    visible: false,
    request: null,
  });

  const requests = getOpenRequestsForPandits();

  const handleAccept = (request: PujaRequest) => {
    Alert.alert(
      "Accept Request",
      `Accept this puja request at ${"\u20B9"}${request.userBudgetPrice}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => acceptUserPrice(request.id, user?.name || "Pandit Ji"),
          style: "default"
        }
      ]
    );
  };

  const handleCounterSubmit = (amount: number) => {
    if (counterModal.request) {
      submitCounterOffer(counterModal.request.id, user?.name || "Pandit Ji", amount);
      setCounterModal({ visible: false, request: null });
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: Colors.light.priceBackground }]}>
        <Feather name="inbox" size={48} color={Colors.light.primary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>No Open Requests</ThemedText>
      <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
        New puja requests from devotees will appear here
      </ThemedText>
    </View>
  );

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onAccept={() => handleAccept(item)}
            onCounter={() => setCounterModal({ visible: true, request: item })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListEmptyComponent={renderEmptyState}
      />
      <CounterModal
        visible={counterModal.visible}
        request={counterModal.request}
        onClose={() => setCounterModal({ visible: false, request: null })}
        onSubmit={handleCounterSubmit}
      />
    </>
  );
}

const styles = StyleSheet.create({
  requestCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  acceptButton: {},
  counterButton: {},
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    marginBottom: Spacing.lg,
  },
  originalPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    marginBottom: Spacing.sm,
  },
  priceInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    height: 64,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    marginLeft: Spacing.xs,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
