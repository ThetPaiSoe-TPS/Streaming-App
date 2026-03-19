import { Tabs } from "expo-router";
import React from "react";
import { View, TouchableOpacity, Image, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import NotificationBell from "@/components/notification/NotificationBell";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getUserProfile,
  getMerchantId,
} from "../../config/notificationService";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../config/api";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const merchantId = getMerchantId();
      const merchantIdNum = merchantId ? parseInt(merchantId) : 1;
      const data: any = await getUserProfile(merchantIdNum);
      if (data) {
        // Handle different response formats
        let users: any = data;
        if (data.merchantUser) {
          users = data.merchantUser;
        }
        if (Array.isArray(users) && users.length > 0) {
          setUserProfile(users[0]);
        }
      }
    };
    fetchProfile();
  }, []);

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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerTitle: "ShopNest Streams",
          headerRight: () => (
            <View
              style={{
                marginRight: 16,
                flexDirection: "row",
                gap: 16,
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                style={{ padding: 4 }}
              >
                {userProfile?.profile ? (
                  <Image
                    source={{
                      uri: `${BASE_URL}/storage/${userProfile.profile}`,
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#ddd",
                    }}
                  />
                ) : (
                  <Ionicons name="person-circle" size={32} color="#333" />
                )}
              </TouchableOpacity>
              <NotificationBell />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          href: "/profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
