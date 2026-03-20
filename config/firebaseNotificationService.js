// @ts-nocheck
import db from "./firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getMerchantId, getUserId } from "./notificationService";

// Firestore collection path
const getNotificationsPath = () => {
  const merchantId = getMerchantId();
  const userId = getUserId();
  if (!merchantId || !userId) {
    console.log("Firestore path not ready - missing merchantId/userId");
    return null;
  }
  return `notifications/merchant_${merchantId}/user_${userId}/items`;
};

const normalizeDate = (value) => {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
};

const normalizeFirestoreNotification = (docSnap) => {
  const data = docSnap.data() || {};
  const createdAt = normalizeDate(data.createdAt || data.created_at);
  const updatedAt = normalizeDate(
    data.updatedAt || data.updated_at || createdAt,
  );

  return {
    id: docSnap.id,
    type: data.type || "firebase",
    notifiable_type: data.notifiable_type || "firebase",
    notifiable_id: data.notifiable_id || 0,
    data: {
      title: data.title || data.data?.title || "Notification",
      message: data.message || data.data?.message || "",
      action: data.action || data.data?.action,
      district_merchant_id:
        data.district_merchant_id || data.data?.district_merchant_id,
    },
    read_at: data.read_at || (data.read ? createdAt : null),
    created_at: createdAt,
    updated_at: updatedAt,
    __source: "firestore",
  };
};

// Listen to real-time notifications from Firestore
export const subscribeToFirestoreNotifications = (callback) => {
  // Check if Firestore is initialized
  if (!db) {
    return null;
  }

  // Check if merchantId and userId are available
  const merchantId = getMerchantId();
  const userId = getUserId();

  if (!merchantId || !userId) {
    return null;
  }

  const path = `notifications/merchant_${merchantId}/user_${userId}/items`;

  try {
    const notificationsRef = collection(db, path);

    // Query for notifications, ordered by creation time
    const q = query(notificationsRef, orderBy("createdAt", "desc"));

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = [];
        snapshot.forEach((docSnap) => {
          notifications.push(normalizeFirestoreNotification(docSnap));
        });
        callback(notifications);
      },
      (error) => {
        // Handle snapshot error gracefully - just return empty
        callback([]);
      },
    );

    return unsubscribe;
  } catch (error) {
    return null;
  }
};

// Get unread count from Firestore notifications
export const getFirestoreUnreadCount = (notifications) => {
  if (!notifications || !Array.isArray(notifications)) {
    return 0;
  }
  return notifications.filter((n) => !n.read_at).length;
};

// Add a notification to Firestore (for testing)
export const addTestNotification = async (title, message) => {
  if (!db) {
    console.log("Firestore not initialized");
    return;
  }

  try {
    const path = getNotificationsPath();
    if (!path) return;
    const notificationsRef = collection(db, path);
    await addDoc(notificationsRef, {
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });
    console.log("Test notification added to Firestore");
  } catch (error) {
    console.error("Error adding notification to Firestore:", error);
  }
};

// Mark notification as read in Firestore
export const markNotificationAsRead = async (notificationId) => {
  if (!db) {
    console.log("Firestore not initialized");
    return;
  }

  try {
    const path = getNotificationsPath();
    if (!path) return;
    const notificationRef = doc(db, path, notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
    console.log("Notification marked as read in Firestore");
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};
