// API Configuration
// Set to true for production server, false for local development
const USE_PRODUCTION = true;

const PRODUCTION_BASE_URL = "https://snadmin.enrichinsights.com";
const LOCAL_BASE_URL = "http://10.0.2.2:8000"; // Android emulator (and web/iOS simulator for local)

// For local development - uses 10.0.2.2 for Android emulator
// For production - uses the live server
const API_BASE_URL = USE_PRODUCTION ? PRODUCTION_BASE_URL : LOCAL_BASE_URL;

export const LOGIN_API_URL = `${API_BASE_URL}/api/merchant/login`;
export const REGISTER_API_URL = `${API_BASE_URL}/api/merchant/merchantregister`;

// Branch Notification API endpoints (merchant/branch based)
export const BRANCH_NOTIFICATIONS_API_URL = (merchantId: string) =>
  `${API_BASE_URL}/api/branch/notifications/${merchantId}`;
export const BRANCH_NOTIFICATIONS_UNREAD_API_URL = (merchantId: string) =>
  `${API_BASE_URL}/api/branch/notificationsUnread/${merchantId}`;
export const BRANCH_NOTIFICATION_MARK_READ_API_URL = (
  merchantId: string,
  notificationId: string,
) => `${API_BASE_URL}/api/branch/notifications/${merchantId}/read`;
export const BRANCH_NOTIFICATION_MARK_ALL_READ_API_URL = (merchantId: string) =>
  `${API_BASE_URL}/api/branch/notifications/${merchantId}/markAllAsRead`;

// Development mode flag
export const IS_DEV = !USE_PRODUCTION;
