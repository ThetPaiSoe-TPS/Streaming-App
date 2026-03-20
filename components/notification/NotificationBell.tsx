import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  const router = useRouter();
  const isMounted = useRef(true);

  const fetchUnreadCount = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getNotifications();
      if (response && response.data && isMounted.current) {
        const notificationsWithSource = response.data.map((n) => ({
          ...n,
          __source: "api" as const,
        }));
        const count = getUnreadCount(notificationsWithSource);
        setUnreadCount(count);
      }
    } catch (error) {
      // Silently handle error
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Handle real-time notification updates from Firestore
  const handleFirestoreNotificationsUpdate = useCallback(
    (notifications: NotificationData[]) => {
      const count = getUnreadCount(notifications);
      if (isMounted.current) {
        setUnreadCount(count);
        setIsFirestoreConnected(true);
      }
    },
    [],
  );

  // Handle polling-based updates (fallback)
  const handlePollingNotificationsUpdate = useCallback(
    (notifications: NotificationData[]) => {
      const notificationsWithSource = notifications.map((n) => ({
        ...n,
        __source: "api" as const,
      }));
      const count = getUnreadCount(notificationsWithSource);
      if (isMounted.current) {
        setUnreadCount(count);
        setIsFirestoreConnected(false);
      }
    },
    [],
  );

  useEffect(() => {
    isMounted.current = true;
    let unsubscribe: null | (() => void) = null;

    // Prefer Firestore real-time updates when available
    try {
      unsubscribe = subscribeToFirestoreNotifications(
        handleFirestoreNotificationsUpdate,
      );
      if (unsubscribe) {
        setIsFirestoreConnected(true);
        if (isPollingActive()) {
          stopNotificationPolling();
        }
      } else {
        setIsFirestoreConnected(false);
        if (!isPollingActive()) {
          startNotificationPolling(handlePollingNotificationsUpdate, 5000);
        }
      }
    } catch (error) {
      // Fallback to polling
      if (!isPollingActive()) {
        startNotificationPolling(handlePollingNotificationsUpdate, 5000);
      }
    }

    // Initial fetch
    fetchUnreadCount();

    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [
    fetchUnreadCount,
    handleFirestoreNotificationsUpdate,
    handlePollingNotificationsUpdate,
  ]);

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
