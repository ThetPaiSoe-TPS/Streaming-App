import React, { useState, useEffect, useCallback } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  getNotifications,
  getUnreadCount,
  startNotificationPolling,
  stopNotificationPolling,
  isPollingActive,
  NotificationData,
} from "../../config/notificationService";
import { subscribeToFirestoreNotifications } from "../../config/firebaseNotificationService";

interface NotificationBellProps {
  onPress?: () => void;
  refreshTrigger?: number;
}

export default function NotificationBell({
  onPress,
  refreshTrigger,
}: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchUnreadCount = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getNotifications();
      console.log(
        "NotificationBell - Full response:",
        JSON.stringify(response),
      );
      console.log(
        "NotificationBell - response.data:",
        JSON.stringify(response?.data),
      );
      if (response && response.data) {
        const count = getUnreadCount(response.data);
        console.log("NotificationBell - Unread count:", count);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle real-time notification updates
  const handleNotificationsUpdate = useCallback(
    (notifications: NotificationData[]) => {
      const count = getUnreadCount(notifications);
      console.log("NotificationBell - Real-time update, unread count:", count);
      setUnreadCount(count);
    },
    [],
  );

  useEffect(() => {
    let unsubscribe: null | (() => void) = null;

    // Prefer Firestore real-time updates when available
    unsubscribe = subscribeToFirestoreNotifications(handleNotificationsUpdate);
    if (unsubscribe) {
      if (isPollingActive()) {
        stopNotificationPolling();
      }
    } else if (!isPollingActive()) {
      // Fallback to polling for real-time updates
      startNotificationPolling(handleNotificationsUpdate, 5000); // Poll every 5 seconds
    }

    // Initial fetch
    fetchUnreadCount();

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchUnreadCount, handleNotificationsUpdate]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push("/notifications");
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#333" />
      ) : (
        <View>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
