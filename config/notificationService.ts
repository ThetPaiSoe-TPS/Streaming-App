import {
  BRANCH_NOTIFICATIONS_API_URL,
  BRANCH_NOTIFICATION_MARK_READ_API_URL,
  BRANCH_NOTIFICATION_MARK_ALL_READ_API_URL,
} from "./api";

// Token and merchant ID storage - using global variable for simplicity
// In production, use SecureStore or AsyncStorage
let authToken: string | null = null;
let merchantId: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setMerchantId(id: string | null): void {
  merchantId = id;
}

export function getMerchantId(): string | null {
  return merchantId;
}

export interface NotificationData {
  id: string;
  merchant_id: string;
  title: string;
  description: string;
  schedule_at: string | null;
  status: string;
  created_by: string;
  created_at: string;
  read_at?: string | null;
}

export interface NotificationsResponse {
  data: NotificationData[];
  current_page: number;
  last_page: number;
  total: number;
}

// Fetch all notifications for a merchant
export async function getNotifications(): Promise<NotificationsResponse | null> {
  try {
    const token = getAuthToken();
    const mid = getMerchantId();

    if (!token) {
      console.error("No auth token found");
      return null;
    }

    if (!mid) {
      console.error("No merchant ID found");
      return null;
    }

    const response = await fetch(BRANCH_NOTIFICATIONS_API_URL(mid), {
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
    const mid = getMerchantId();

    if (!token) {
      console.error("No auth token found");
      return false;
    }

    if (!mid) {
      console.error("No merchant ID found");
      return false;
    }

    const response = await fetch(
      BRANCH_NOTIFICATION_MARK_READ_API_URL(mid, notificationId),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notification_id: notificationId }),
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
    const mid = getMerchantId();

    if (!token) {
      console.error("No auth token found");
      return false;
    }

    if (!mid) {
      console.error("No merchant ID found");
      return false;
    }

    const response = await fetch(
      BRANCH_NOTIFICATION_MARK_ALL_READ_API_URL(mid),
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
    console.error("Error marking all notifications as read:", error);
    return false;
  }
}

// Get unread count from notifications
export function getUnreadCount(notifications: NotificationData[]): number {
  return notifications.filter((n) => !n.read_at).length;
}
