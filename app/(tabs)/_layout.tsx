import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import NotificationBell from "@/components/notification/NotificationBell";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e5e5e5",
          borderTopWidth: 1,
        },
        tabBarInactiveTintColor: "#8e8e93",
        headerShown: true,
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#333",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          headerTitle: "ShopNest Streams",
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <NotificationBell />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
