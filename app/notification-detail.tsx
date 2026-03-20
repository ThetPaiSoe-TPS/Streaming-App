import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "../constants/theme";
import { useColorScheme } from "../hooks/use-color-scheme";

export default function NotificationDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const params = useLocalSearchParams();

  const id = params.id as string;
  const title = params.title as string;
  const message = params.message as string;
  const action = params.action as string;
  const created_at = params.created_at as string;
  const read_at = params.read_at as string;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          Notification Detail
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          {read_at ? (
            <View style={[styles.statusBadge, { backgroundColor: "#34C759" }]}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.statusText}>Read</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: "#007AFF" }]}>
              <Ionicons name="mail-unread" size={16} color="#fff" />
              <Text style={styles.statusText}>Unread</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          {title || "Notification"}
        </Text>

        {/* Date */}
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color={colors.icon} />
          <Text style={[styles.dateText, { color: colors.icon }]}>
            {formatDate(created_at || new Date().toISOString())}
          </Text>
        </View>

        {/* Action Type */}
        {action && (
          <View style={styles.actionContainer}>
            <Text style={[styles.actionLabel, { color: colors.icon }]}>
              Action Type:
            </Text>
            <Text style={[styles.actionValue, { color: colors.tint }]}>
              {action}
            </Text>
          </View>
        )}

        {/* Divider */}
        <View
          style={[styles.divider, { backgroundColor: colors.icon + "30" }]}
        />

        {/* Message/Description */}
        <Text style={[styles.description, { color: colors.text }]}>
          {message || "No message available."}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 28,
    color: "#333",
    fontWeight: "300",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statusContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 28,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  actionLabel: {
    fontSize: 14,
  },
  actionValue: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});
