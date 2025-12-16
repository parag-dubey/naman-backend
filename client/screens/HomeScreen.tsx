import React from "react";
import { View, StyleSheet, FlatList, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useApp, pujaServices, PujaService } from "@/context/AppContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const temples = [
  { id: "1", name: "Mahakaleshwar Temple", location: "Ujjain", image: null },
  { id: "2", name: "Siddhivinayak Temple", location: "Mumbai", image: null },
  { id: "3", name: "ISKCON Temple", location: "Delhi", image: null },
];

interface ServiceCardProps {
  service: PujaService;
  onPress: () => void;
}

function ServiceCard({ service, onPress }: ServiceCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.serviceCard,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle
      ]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, springConfig); }}
      onPressOut={() => { scale.value = withSpring(1, springConfig); }}
    >
      <View style={[styles.serviceIconContainer, { backgroundColor: Colors.light.priceBackground }]}>
        <Feather name="sun" size={28} color={Colors.light.primary} />
      </View>
      <View style={styles.serviceInfo}>
        <ThemedText type="h4" numberOfLines={1}>{service.name}</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
          {service.temple}
        </ThemedText>
        <View style={styles.priceRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Starting from
          </ThemedText>
          <ThemedText type="priceSmall" style={{ color: Colors.light.primary, marginLeft: Spacing.xs }}>
            {"\u20B9"}{service.basePrice}
          </ThemedText>
        </View>
      </View>
      <Feather name="chevron-right" size={24} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

function TempleCard({ temple }: { temple: typeof temples[0] }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.templeCard,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle
      ]}
      onPressIn={() => { scale.value = withSpring(0.97, springConfig); }}
      onPressOut={() => { scale.value = withSpring(1, springConfig); }}
    >
      <View style={[styles.templeImage, { backgroundColor: Colors.light.backgroundTertiary }]}>
        <Feather name="home" size={32} color={Colors.light.primary} />
      </View>
      <ThemedText type="body" style={styles.templeName} numberOfLines={1}>{temple.name}</ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>{temple.location}</ThemedText>
    </AnimatedPressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <ThemedText type="h3" style={styles.greeting}>
        Namaste, {user?.name || "Devotee"}
      </ThemedText>
      <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.xl }}>
        Find divine services for your spiritual journey
      </ThemedText>

      <ThemedText type="h4" style={styles.sectionTitle}>Popular Temples</ThemedText>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={temples}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TempleCard temple={item} />}
        contentContainerStyle={styles.templesContainer}
        style={styles.templesList}
      />

      <ThemedText type="h4" style={styles.sectionTitle}>Puja Services</ThemedText>
    </View>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      ListHeaderComponent={renderHeader}
      data={pujaServices}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ServiceCard
          service={item}
          onPress={() => navigation.navigate("CreateRequest", { service: item })}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
    />
  );
}

const styles = StyleSheet.create({
  headerContent: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  templesList: {
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.xl,
  },
  templesContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  templeCard: {
    width: 160,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  templeImage: {
    width: "100%",
    height: 80,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  templeName: {
    marginBottom: Spacing.xs,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  serviceInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
});
