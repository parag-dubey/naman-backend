import React from "react";
import { View, StyleSheet, FlatList, Pressable, Image, Platform, ActivityIndicator } from "react-native";
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
// ✅ Fixed: Removed 'pujaServices', added 'useApp'
import { useApp, PujaService } from "@/context/AppContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: false,
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
        { 
          backgroundColor: theme.backgroundDefault,
          shadowColor: "#000", 
        },
        animatedStyle
      ]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, springConfig); }}
      onPressOut={() => { scale.value = withSpring(1, springConfig); }}
    >
      {/* Top Section: Image/Icon */}
      <View style={styles.mediaContainer}>
        {service.image ? (
          <Image 
            // ✅ Fixed: Server URL ke liye 'uri' use karte hain
            source={{ uri: service.image }} 
            style={styles.cardImage} 
            resizeMode="cover" 
          />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: Colors.light.primary + '15' }]}>
            <Feather name="sun" size={28} color={Colors.light.primary} />
          </View>
        )}
        
        <View style={styles.categoryBadge}>
             <ThemedText type="small" style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>
               POPULAR
             </ThemedText>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <ThemedText type="h4" numberOfLines={1} style={styles.serviceName}>{service.name}</ThemedText>
        
        <ThemedText 
          type="small" 
          numberOfLines={2} 
          style={[styles.description, { color: theme.textSecondary }]}
        >
          {service.description}
        </ThemedText>

        {/* Divider Line */}
        <View style={{ height: 1, backgroundColor: theme.backgroundRoot, marginVertical: Spacing.sm }} />

        {/* Footer: Location & Price */}
        <View style={styles.footer}>
          <View style={styles.locationContainer}>
             <Feather name="map-pin" size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
             <ThemedText type="small" numberOfLines={1} style={{ color: theme.textSecondary, flex: 1, fontSize: 11 }}>
              {service.temple}
            </ThemedText>
          </View>
          
          <View style={[styles.priceTag, { backgroundColor: Colors.light.primary }]}>
            <ThemedText style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              {"\u20B9"}{service.basePrice}
            </ThemedText>
          </View>
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

  // ✅ Fixed: Context se data aur loading state nikala
  const { services, isLoading } = useApp();

  // Loading Check
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.backgroundRoot }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={{ marginTop: 10, color: theme.textSecondary }}>Loading Services...</ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <FlatList
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        
        // ✅ Fixed: Data ab API wala 'services' hai
        data={services}
        
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ServiceItem
            service={item}
            onPress={() => navigation.navigate("CreateRequest", { service: item })}
          />
        )}
        ListFooterComponent={<View style={{ height: Spacing.xl }} />}
        
        // Empty State Handler
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <ThemedText>No services found.</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Check server connection.</ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  serviceItem: {
    width: "48%",
    borderRadius: BorderRadius.lg,
    elevation: 4, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible', 
  },
  mediaContainer: {
    height: 100,
    width: '100%',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  contentContainer: {
    padding: Spacing.sm,
  },
  serviceName: {
    fontSize: 15,
    marginBottom: 2,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    height: 32, 
    marginBottom: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 4,
  },
  priceTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});