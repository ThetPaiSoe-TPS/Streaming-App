import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  startNotificationPolling,
  stopNotificationPolling,
  isPollingActive,
  NotificationData,
} from "../config/notificationService";
import {
  subscribeToFirestoreNotifications,
  markNotificationAsRead as markFirestoreNotificationAsRead,
} from "../config/firebaseNotificationService";
import { Colors } from "../constants/theme";
import { useColorScheme } from "../hooks/use-color-scheme";

type FilterType = "all" | "unread" | "read";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [firestoreNotifications, setFirestoreNotifications] = useState<
    NotificationData[]
  >([]);
  const [apiNotifications, setApiNotifications] = useState<NotificationData[]>(
    [],
  );
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const isMounted = useRef(true);

  // Combine API and Firestore notifications
  const combineNotifications = useCallback(
    (
      api: NotificationData[],
      firestore: NotificationData[],
    ): NotificationData[] => {
      const combined = [...api, ...firestore];
      // Remove duplicates based on ID
      const seen = new Set();
      return combined
        .filter((notification) => {
          const duplicate = seen.has(notification.id);
          seen.add(notification.id);
          return !duplicate;
        })
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    },
    [],
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getNotifications();
      if (response && response.data && isMounted.current) {
        const apiNotifs = response.data.map((n) => ({
          ...n,
          __source: "api" as const,
        }));
        setApiNotifications(apiNotifs);
        // Combine with Firestore notifications if available
        setNotifications(
          combineNotifications(apiNotifs, firestoreNotifications),
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [firestoreNotifications, combineNotifications]);

  // Handle real-time notification updates from Firestore
  const handleFirestoreNotificationsUpdate = useCallback(
    (data: NotificationData[]) => {
      console.log(
        "Notifications screen - Firestore real-time update received, count:",
        data.length,
      );
      if (isMounted.current) {
        setFirestoreNotifications(data);
        setIsFirestoreConnected(true);
        // Combine with API notifications
        setNotifications(combineNotifications(apiNotifications, data));
      }
    },
    [apiNotifications, combineNotifications],
  );

  // Handle polling-based updates (fallback)
  const handlePollingNotificationsUpdate = useCallback(
    (data: NotificationData[]) => {
      console.log(
        "Notifications screen - Polling update received, count:",
        data.length,
      );
      if (isMounted.current) {
        const pollingNotifs = data.map((n) => ({
          ...n,
          __source: "api" as const,
        }));
        setApiNotifications(pollingNotifs);
        setNotifications(
          combineNotifications(pollingNotifs, firestoreNotifications),
        );
      }
    },
    [firestoreNotifications, combineNotifications],
  );

  useEffect(() => {
    isMounted.current = true;
    let unsubscribe: null | (() => void) = null;

    // Initial fetch
    fetchNotifications();

    // Prefer Firestore real-time updates when available
    try {
      unsubscribe = subscribeToFirestoreNotifications(
        handleFirestoreNotificationsUpdate,
      );
      if (unsubscribe) {
        console.log("Notifications screen - Firestore subscription successful");
        setIsFirestoreConnected(true);
        if (isPollingActive()) {
          stopNotificationPolling();
        }
      } else {
        console.log(
          "Notifications screen - Firestore subscription not available, using polling fallback",
        );
        setIsFirestoreConnected(false);
        if (!isPollingActive()) {
          startNotificationPolling(handlePollingNotificationsUpdate, 5000);
        }
      }
    } catch (error) {
      console.error(
        "Notifications screen - Error setting up Firestore subscription:",
        error,
      );
      // Fallback to polling
      if (!isPollingActive()) {
        startNotificationPolling(handlePollingNotificationsUpdate, 5000);
      }
    }

    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [
    fetchNotifications,
    handleFirestoreNotificationsUpdate,
    handlePollingNotificationsUpdate,
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const target = notifications.find((n) => n.id === notificationId);
    if (target?.__source === "firestore") {
      await markFirestoreNotificationAsRead(notificationId);
      // Update both the main notifications and firestore notifications
      setFirestoreNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n,
        ),
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n,
        ),
      );
      return;
    }

    const success = await markNotificationAsRead(notificationId);
    if (success) {
      // Update both the main notifications and api notifications
      setApiNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n,
        ),
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n,
        ),
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const now = new Date().toISOString();
    const firestoreUnread = notifications.filter(
      (n) => n.__source === "firestore" && !n.read_at,
    );
    if (firestoreUnread.length > 0) {
      await Promise.all(
        firestoreUnread.map((n) => markFirestoreNotificationAsRead(n.id)),
      );
      // Update firestore notifications
      setFirestoreNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at || now,
        })),
      );
    }

    const hasApiNotifications = notifications.some(
      (n) => n.__source !== "firestore",
    );
    if (hasApiNotifications) {
      const success = await markAllNotificationsAsRead();
      if (!success) {
        return;
      }
      // Update api notifications
      setApiNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at || now,
        })),
      );
    }

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read_at: n.read_at || now,
      })),
    );
  };

  const handleNotificationPress = (notification: NotificationData) => {
    // Mark as read when opening detail
    if (!notification.read_at) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to detail page
    router.push({
      pathname: "/notification-detail",
      params: {
        id: notification.id,
        title: notification.data?.title || "Notification",
        message: notification.data?.message || "",
        action: notification.data?.action || "",
        created_at: notification.created_at,
        read_at: notification.read_at || "",
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read_at;
    if (filter === "read") return !!n.read_at;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const readCount = notifications.filter((n) => !!n.read_at).length;

  const renderNotification = ({ item }: { item: NotificationData }) => {
    const isRead = !!item.read_at;
    const title = item.data?.title || "Notification";
    const message = item.data?.message || "";

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: isRead ? colors.background : `${colors.tint}10` },
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[styles.notificationTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {!isRead && <View style={styles.unreadDot} />}
          </View>
          <Text
            style={[styles.notificationMessage, { color: colors.icon }]}
            numberOfLines={2}
          >
            {message}
          </Text>
          <Text style={[styles.notificationDate, { color: colors.icon }]}>
            {formatDate(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            style={styles.headerButton}
          >
            <Text style={[styles.headerButtonText, { color: colors.tint }]}>
              Read All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Connection Status Indicator */}
      <View
        style={[styles.statusContainer, { backgroundColor: colors.background }]}
      >
        <View style={styles.statusIndicator}>
          <Ionicons
            name={isFirestoreConnected ? "cloud-done" : "cloud-offline"}
            size={14}
            color={isFirestoreConnected ? "#34C759" : "#FF9500"}
          />
          <Text style={[styles.statusText, { color: colors.icon }]}>
            {isFirestoreConnected ? "Real-time" : "Polling (5s)"}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View
        style={[styles.filterContainer, { backgroundColor: colors.background }]}
      >
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "all" && { backgroundColor: colors.tint },
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === "all" ? "#fff" : colors.text },
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "unread" && { backgroundColor: colors.tint },
          ]}
          onPress={() => setFilter("unread")}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === "unread" ? "#fff" : colors.text },
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "read" && { backgroundColor: colors.tint },
          ]}
          onPress={() => setFilter("read")}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === "read" ? "#fff" : colors.text },
            ]}
          >
            Read ({readCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="notifications-outline"
            size={64}
            color={colors.icon}
          />
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            {filter === "all"
              ? "No notifications yet"
              : filter === "unread"
                ? "No unread notifications"
                : "No read notifications"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  headerButton: {
    padding: 4,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
