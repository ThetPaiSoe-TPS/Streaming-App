import {
  BRANCH_NOTIFICATIONS_API_URL,
  BRANCH_NOTIFICATION_MARK_READ_API_URL,
  BRANCH_NOTIFICATION_MARK_ALL_READ_API_URL,
  API_BASE_URL,
} from "./api";

// Token and merchant ID storage - using global variable for simplicity
// In production, use SecureStore or AsyncStorage
let authToken: string | null = null;
let merchantId: string | null = null;
let userId: string | null = null;

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

export function setUserId(id: string | null): void {
  userId = id;
}

export function getUserId(): string | null {
  return userId;
}

export interface NotificationData {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: {
    title: string;
    message: string;
    action?: string;
    district_merchant_id?: number;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
  __source?: "api" | "firestore";
}

export interface NotificationsResponse {
  data: NotificationData[];
  current_page: number;
  last_page: number;
  total: number;
}

// Fetch all notifications for a merchant
export async function getNotifications(): Promise<NotificationsResponse | null> {
  const token = getAuthToken();
  const mid = getMerchantId();

  // Return null if not logged in (no token or merchant ID)
  if (!token || !mid) {
    return null;
  }

  try {
    const response = await fetch(BRANCH_NOTIFICATIONS_API_URL(mid), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
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
  if (!notifications || !Array.isArray(notifications)) {
    return 0;
  }
  return notifications.filter((n) => !n.read_at).length;
}

// User profile interface
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  username?: string;
  merchantUser?: {
    id: number;
    merchant_id: number;
    district_merchant_id: number;
    user_id: number;
    status: string;
  };
}

// Polling interval in milliseconds (5 seconds)
const DEFAULT_POLL_INTERVAL = 5000;

// Callback type for notification updates
type NotificationCallback = (notifications: NotificationData[]) => void;

// Store for polling interval ID and callback
let pollingIntervalId: ReturnType<typeof setInterval> | null = null;
let currentCallback: NotificationCallback | null = null;

// Start polling for real-time notifications
export function startNotificationPolling(
  callback: NotificationCallback,
  intervalMs: number = DEFAULT_POLL_INTERVAL,
): void {
  // Stop any existing polling
  stopNotificationPolling();

  // Store callback
  currentCallback = callback;

  // Initial fetch
  fetchAndNotify();

  // Set up interval
  pollingIntervalId = setInterval(fetchAndNotify, intervalMs);
}

// Stop polling
export function stopNotificationPolling(): void {
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }
  currentCallback = null;
}

// Fetch notifications and notify callback
async function fetchAndNotify(): Promise<void> {
  if (!currentCallback) return;

  try {
    const response = await getNotifications();
    if (response && response.data) {
      currentCallback(response.data);
    }
  } catch (error) {
    // Silently handle error
  }
}

// Check if polling is active
export function isPollingActive(): boolean {
  return pollingIntervalId !== null;
}

// Fetch user profile
export async function getUserProfile(merchantId: number): Promise<any | null> {
  try {
    const token = getAuthToken();

    console.log("getUserProfile called with merchantId:", merchantId);
    console.log("Auth token available:", !!token);

    if (!token) {
      console.error("No auth token found");
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/merchant/getUsers/${merchantId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("Profile API response status:", response.status);

    if (response.status === 403) {
      console.error("Access denied - not authorized to view this profile");
      return null;
    }

    if (!response.ok) {
      console.error("Failed to fetch user profile:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("Profile API data received:", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
