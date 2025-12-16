import React from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
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
import { pujaServices, PujaService } from "@/context/AppContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ServiceItemProps {
  service: PujaService;
  onPress: () => void;
}

function ServiceItem({ service, onPress }: ServiceItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.serviceItem,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle
      ]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, springConfig); }}
      onPressOut={() => { scale.value = withSpring(1, springConfig); }}
    >
      <View style={[styles.iconContainer, { backgroundColor: Colors.light.priceBackground }]}>
        <Feather name="sun" size={32} color={Colors.light.primary} />
      </View>
      <ThemedText type="h4" style={styles.serviceName}>{service.name}</ThemedText>
      <ThemedText type="small" style={[styles.description, { color: theme.textSecondary }]}>
        {service.description}
      </ThemedText>
      <View style={styles.footer}>
        <View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {service.temple}
          </ThemedText>
        </View>
        <View style={[styles.priceTag, { backgroundColor: Colors.light.priceBackground, borderColor: Colors.light.priceBorder }]}>
          <ThemedText type="priceSmall" style={{ color: Colors.light.primary }}>
            {"\u20B9"}{service.basePrice}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={pujaServices}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <ServiceItem
          service={item}
          onPress={() => navigation.navigate("CreateRequest", { service: item })}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: "space-between",
  },
  serviceItem: {
    width: "48%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  serviceName: {
    marginBottom: Spacing.xs,
  },
  description: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
});
