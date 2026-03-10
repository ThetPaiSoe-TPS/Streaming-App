import {
  NOTIFICATIONS_API_URL,
  NOTIFICATION_MARK_READ_API_URL,
  NOTIFICATION_MARK_ALL_READ_API_URL,
} from "./api";

// Token storage - using global variable for simplicity
// In production, use SecureStore or AsyncStorage
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export interface NotificationData {
  id: string;
  type: string;
  data: {
    title: string;
    message: string;
    action?: string;
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  data: NotificationData[];
  current_page: number;
  last_page: number;
  total: number;
}

// Fetch all notifications
export async function getNotifications(): Promise<NotificationsResponse | null> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No auth token found");
      return null;
    }

    const response = await fetch(NOTIFICATIONS_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch notifications:", response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
}

// Mark a single notification as read
export async function markNotificationAsRead(
  notificationId: string,
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No auth token found");
      return false;
    }

    const response = await fetch(
      NOTIFICATION_MARK_READ_API_URL(notificationId),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.ok;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error("No auth token found");
      return false;
    }

    const response = await fetch(NOTIFICATION_MARK_ALL_READ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

// Get unread count from notifications
export function getUnreadCount(notifications: NotificationData[]): number {
  return notifications.filter((n) => !n.read_at).length;
}
