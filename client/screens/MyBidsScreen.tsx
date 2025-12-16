import React from "react";
import { View, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useApp, PujaRequest, PanditResponse } from "@/context/AppContext";

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BidCardProps {
  request: PujaRequest;
  responses: PanditResponse[];
  onAcceptOffer: (responseId: string) => void;
}

function StatusBadge({ status }: { status: PujaRequest["status"] }) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return { color: Colors.light.warning, text: "Waiting for Pandits", icon: "clock" as const };
      case "accepted":
        return { color: Colors.light.success, text: "Accepted!", icon: "check-circle" as const };
      case "countered":
        return { color: Colors.light.info, text: "Counter Offer", icon: "message-circle" as const };
      case "confirmed":
        return { color: Colors.light.success, text: "Confirmed", icon: "check" as const };
      default:
        return { color: Colors.light.warning, text: "Pending", icon: "clock" as const };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.color + "20" }]}>
      <Feather name={config.icon} size={12} color={config.color} />
      <ThemedText type="small" style={[styles.badgeText, { color: config.color }]}>
        {config.text}
      </ThemedText>
    </View>
  );
}

function BidCard({ request, responses, onAcceptOffer }: BidCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const acceptedResponse = responses.find(r => r.type === "accepted");
  const counterResponses = responses.filter(r => r.type === "counter");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <Animated.View
      style={[
        styles.bidCard,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <ThemedText type="h4">{request.serviceName}</ThemedText>
          <StatusBadge status={request.status} />
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {request.temple}
        </ThemedText>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Feather name="calendar" size={16} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
            {formatDate(request.date)} at {request.time}
          </ThemedText>
        </View>

        <View style={[styles.priceContainer, { backgroundColor: Colors.light.priceBackground, borderColor: Colors.light.priceBorder }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Your Offer</ThemedText>
          <ThemedText type="price" style={{ color: Colors.light.primary }}>
            {"\u20B9"}{request.userBudgetPrice}
          </ThemedText>
        </View>
      </View>

      {request.status === "accepted" && acceptedResponse ? (
        <View style={styles.responseSection}>
          <View style={[styles.acceptedBanner, { backgroundColor: Colors.light.success + "15" }]}>
            <Feather name="check-circle" size={20} color={Colors.light.success} />
            <View style={styles.acceptedInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {acceptedResponse.panditName} accepted!
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Ready to proceed with your puja
              </ThemedText>
            </View>
          </View>
        </View>
      ) : null}

      {request.status === "countered" && counterResponses.length > 0 ? (
        <View style={styles.responseSection}>
          <ThemedText type="small" style={[styles.responseTitle, { color: theme.textSecondary }]}>
            Counter Offers Received
          </ThemedText>
          {counterResponses.map((response) => (
            <View key={response.id} style={[styles.counterCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={styles.counterInfo}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {response.panditName}
                </ThemedText>
                <ThemedText type="priceSmall" style={{ color: Colors.light.counter }}>
                  asks {"\u20B9"}{response.counterAmount}
                </ThemedText>
              </View>
              <AnimatedPressable
                style={[styles.acceptButton, { backgroundColor: Colors.light.success }]}
                onPress={() => onAcceptOffer(response.id)}
                onPressIn={() => { scale.value = withSpring(0.95, springConfig); }}
                onPressOut={() => { scale.value = withSpring(1, springConfig); }}
              >
                <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Accept Deal
                </ThemedText>
              </AnimatedPressable>
            </View>
          ))}
        </View>
      ) : null}

      {request.status === "confirmed" ? (
        <View style={[styles.confirmedBanner, { backgroundColor: Colors.light.success + "15" }]}>
          <Feather name="check" size={20} color={Colors.light.success} />
          <ThemedText type="body" style={{ color: Colors.light.success, fontWeight: "600", marginLeft: Spacing.sm }}>
            Booking Confirmed
          </ThemedText>
        </View>
      ) : null}
    </Animated.View>
  );
}

export default function MyBidsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { getRequestsForUser, getResponsesForRequest, acceptPanditOffer } = useApp();

  const requests = getRequestsForUser();

  const handleAcceptOffer = (requestId: string, responseId: string) => {
    Alert.alert(
      "Confirm Booking",
      "Accept this pandit's offer and confirm your booking?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept",
          onPress: () => acceptPanditOffer(requestId, responseId),
          style: "default"
        }
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: Colors.light.priceBackground }]}>
        <Feather name="inbox" size={48} color={Colors.light.primary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>No Requests Yet</ThemedText>
      <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
        Start by browsing services and creating your first puja request
      </ThemedText>
    </View>
  );

  return (
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
        <BidCard
          request={item}
          responses={getResponsesForRequest(item.id)}
          onAcceptOffer={(responseId) => handleAcceptOffer(item.id, responseId)}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      ListEmptyComponent={renderEmptyState}
    />
  );
}

const styles = StyleSheet.create({
  bidCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  badgeText: {
    marginLeft: Spacing.xs,
    fontWeight: "600",
  },
  cardBody: {
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  priceContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: "center",
  },
  responseSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: Spacing.md,
  },
  responseTitle: {
    marginBottom: Spacing.sm,
  },
  acceptedBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  acceptedInfo: {
    marginLeft: Spacing.md,
  },
  counterCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  counterInfo: {
    flex: 1,
  },
  acceptButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  confirmedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
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
});
