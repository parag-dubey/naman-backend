import React from "react";
import { View, StyleSheet, Pressable, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, danger }: MenuItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.menuItem,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle
      ]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98, springConfig); }}
      onPressOut={() => { scale.value = withSpring(1, springConfig); }}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? Colors.light.counter + "20" : Colors.light.priceBackground }]}>
        <Feather name={icon} size={20} color={danger ? Colors.light.counter : Colors.light.primary} />
      </View>
      <View style={styles.menuContent}>
        <ThemedText type="body" style={[danger && { color: Colors.light.counter }]}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, logout, getMyBookings } = useApp();

  const bookings = getMyBookings();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: logout, style: "destructive" }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete",
          onPress: async () => {
            await logout();
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={[styles.profileHeader, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.avatar, { backgroundColor: Colors.light.priceBackground }]}>
          <Image
            source={require("../../assets/images/icon.webp")}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.profileInfo}>
          <ThemedText type="h3">{user?.name || "Guest"}</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {user?.phone || "Not logged in"}
          </ThemedText>
          <View style={[styles.roleBadge, { backgroundColor: Colors.light.primary + "20" }]}>
            <ThemedText type="small" style={{ color: Colors.light.primary, fontWeight: "600" }}>
              {user?.role === "pandit" ? "Pandit" : "Devotee"}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.statsContainer, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.statItem}>
          <ThemedText type="h2" style={{ color: Colors.light.primary }}>
            {bookings.length}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {user?.role === "pandit" ? "Completed" : "Bookings"}
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <ThemedText type="h2" style={{ color: Colors.light.success }}>
            {user?.role === "pandit" ? "4.8" : "Active"}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {user?.role === "pandit" ? "Rating" : "Status"}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>Account</ThemedText>
      
      <View style={styles.menuGroup}>
        <MenuItem
          icon="user"
          title="Edit Profile"
          subtitle="Update your name and contact info"
        />
        <MenuItem
          icon="bell"
          title="Notifications"
          subtitle="Manage notification preferences"
        />
        <MenuItem
          icon="help-circle"
          title="Help & Support"
          subtitle="Get help with your bookings"
        />
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>More</ThemedText>
      
      <View style={styles.menuGroup}>
        <MenuItem
          icon="info"
          title="About NamanDarshan"
          subtitle="Learn about our mission"
        />
        <MenuItem
          icon="file-text"
          title="Terms of Service"
        />
        <MenuItem
          icon="shield"
          title="Privacy Policy"
        />
      </View>

      <View style={[styles.menuGroup, { marginTop: Spacing.xl }]}>
        <MenuItem
          icon="log-out"
          title="Logout"
          onPress={handleLogout}
          danger
        />
        <MenuItem
          icon="trash-2"
          title="Delete Account"
          onPress={handleDeleteAccount}
          danger
        />
      </View>

      <ThemedText type="small" style={[styles.version, { color: theme.textSecondary }]}>
        NamanDarshan v1.0.0
      </ThemedText>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  avatarImage: {
    width: 50,
    height: 50,
  },
  profileInfo: {
    flex: 1,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.sm,
  },
  statsContainer: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    marginHorizontal: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  menuGroup: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  version: {
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});
