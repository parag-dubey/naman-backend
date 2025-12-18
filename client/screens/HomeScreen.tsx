import React from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Pressable, 
  FlatList 
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useApp } from "@/context/AppContext"; 
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function HomeScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Context se data nikalna
  const { user, temples, services } = useApp(); 

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- HEADER --- */}
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
             <Image 
               source={require('../../assets/images/splash-icon.png')} 
               style={styles.logo}
               resizeMode="contain"
             />
          </View>
          <ThemedText type="h3" style={styles.greeting}>
            Jai Shree Mahakal, {user?.name?.split(" ")[0] || "Devotee"}! 🙏
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Shubh Muhurat: Aaj 10:30 AM - 12:00 PM
          </ThemedText>
        </View>

        {/* --- BANNER (BOOK NOW WALA) --- */}
        <View style={styles.bannerContainer}>
          <Pressable 
            style={({pressed}) => [
              styles.banner, 
              { backgroundColor: Colors.light.primary, opacity: pressed ? 0.9 : 1 }
            ]}
            // ✅ YAHAN HAI LOGIC: Click karne par Form khulega
            onPress={() => {
              if (services && services.length > 0) {
                // Pehli service ke sath Request Form khol rahe hain
                navigation.navigate("CreateRequest", { service: services[0] });
              } else {
                // Agar data load nahi hua to Services tab par bhej do
                navigation.navigate("Services" as any);
              }
            }} 
          >
             <View style={styles.bannerText}>
               <ThemedText type="h3" style={{ color: '#fff' }}>Book Online Puja</ThemedText>
               <ThemedText type="small" style={{ color: 'rgba(255,255,255,0.8)' }}>
                 Ujjain, Kashi & Nashik ke best Pandits se.
               </ThemedText>
               <View style={styles.buttonSmall}>
                 <ThemedText type="small" style={{ color: Colors.light.primary, fontWeight: 'bold' }}>Book Now</ThemedText>
               </View>
             </View>
             <Feather name="sun" size={40} color="rgba(255,255,255,0.3)" style={styles.bannerIcon} />
          </Pressable>
        </View>

        {/* --- POPULAR TEMPLES (Content Wapas Add Kiya) --- */}
        <View style={styles.sectionHeader}>
          <ThemedText type="h4">Popular Temples</ThemedText>
        </View>

        <FlatList
          data={temples}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.cardImage} 
                resizeMode="cover"
              />
              <View style={styles.cardInfo}>
                <ThemedText type="h4" numberOfLines={1} style={{ fontSize: 14 }}>{item.name}</ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Feather name="map-pin" size={10} color={theme.textSecondary} />
                  <ThemedText type="small" style={{ marginLeft: 4, color: theme.textSecondary }}>
                    {item.location}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
             <ThemedText style={{ marginLeft: Spacing.lg, color: theme.textSecondary }}>Loading Temples...</ThemedText>
          }
        />

        {/* --- FEATURED PUJAS (Content Wapas Add Kiya) --- */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <ThemedText type="h4">Featured Pujas</ThemedText>
          <Pressable onPress={() => navigation.navigate("Services" as any)}>
             <ThemedText type="small" style={{ color: Colors.light.primary }}>View All</ThemedText>
          </Pressable>
        </View>

        <FlatList
          data={services} 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable 
              style={[styles.card, { backgroundColor: theme.backgroundDefault, width: 200 }]} 
              // Yahan click karne par bhi form khulega
              onPress={() => navigation.navigate("CreateRequest", { service: item })}
            >
              <Image 
                source={{ uri: item.image }} 
                style={styles.cardImage} 
                resizeMode="cover"
              />
              <View style={styles.cardInfo}>
                <ThemedText type="h4" numberOfLines={1} style={{ fontSize: 15 }}>{item.name}</ThemedText>
                <ThemedText type="small" numberOfLines={1} style={{ color: theme.textSecondary }}>
                    {item.description}
                </ThemedText>
                <ThemedText type="h4" style={{ color: Colors.light.primary, marginTop: 4, fontSize: 14 }}>
                    ₹{item.basePrice}
                </ThemedText>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
             <ThemedText style={{ marginLeft: Spacing.lg, color: theme.textSecondary }}>Loading Pujas...</ThemedText>
          }
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    marginBottom: Spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
  },
  greeting: {
    marginTop: Spacing.xs,
  },
  bannerContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  banner: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    height: 120, 
  },
  bannerText: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  buttonSmall: {
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 30,
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
  },
  bannerIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    width: 160,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 4, 
  },
  cardImage: {
    width: '100%',
    height: 100,
  },
  cardInfo: {
    padding: Spacing.sm,
  },
});