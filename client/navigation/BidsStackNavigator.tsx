import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MyBidsScreen from "@/screens/MyBidsScreen";
import LiveMarketScreen from "@/screens/LiveMarketScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useApp } from "@/context/AppContext";

export type BidsStackParamList = {
  MyBids: undefined;
  LiveMarket: undefined;
};

const Stack = createNativeStackNavigator<BidsStackParamList>();

export default function BidsStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user } = useApp();

  const isPandit = user?.role === "pandit";

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {isPandit ? (
        <Stack.Screen
          name="LiveMarket"
          component={LiveMarketScreen}
          options={{
            headerTitle: "Live Market",
          }}
        />
      ) : (
        <Stack.Screen
          name="MyBids"
          component={MyBidsScreen}
          options={{
            headerTitle: "My Bids",
          }}
        />
      )}
    </Stack.Navigator>
  );
}
