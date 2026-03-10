// API Configuration
// Set to true for production server, false for local development
const USE_PRODUCTION = false;

const PRODUCTION_BASE_URL = "https://snadmin.enrichinsights.com";
const LOCAL_BASE_URL = "http://10.0.2.2:8000"; // Android emulator (and web/iOS simulator for local)

// For local development - uses 10.0.2.2 for Android emulator
// For production - uses the live server
const API_BASE_URL = USE_PRODUCTION ? PRODUCTION_BASE_URL : LOCAL_BASE_URL;

export const LOGIN_API_URL = `${API_BASE_URL}/api/merchant/login`;
export const REGISTER_API_URL = `${API_BASE_URL}/api/merchant/merchantregister`;

// Notification API endpoints
export const NOTIFICATIONS_API_URL = `${API_BASE_URL}/api/client/notifications`;
export const NOTIFICATION_MARK_READ_API_URL = (id: string) =>
  `${API_BASE_URL}/api/client/notifications/${id}/read`;
export const NOTIFICATION_MARK_ALL_READ_API_URL = `${API_BASE_URL}/api/client/notifications/markAllAsRead`;

// Development mode flag
export const IS_DEV = !USE_PRODUCTION;
