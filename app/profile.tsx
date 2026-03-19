import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getUserProfile,
  getUserId,
  getMerchantId,
} from "../config/notificationService";
import { BASE_URL } from "../config/api";

// Define the API response structure (new format - array of users)
interface UserData {
  id: number;
  username: string;
  email: string;
  phone: string;
  profile: string | null;
  gender: string | null;
  status: string;
  merchant: {
    id: number;
    merchant_id: number;
    district_merchant_id: number;
    user_id: number;
    user_type: number;
    status: string;
  };
  created_at: string;
  updated_at: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  console.log("user data:", userData);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userId = getUserId();
      const merchantId = getMerchantId();

      // Use merchant ID from auth (default to 1)
      const merchantIdNum = merchantId ? parseInt(merchantId) : 1;

      console.log("Fetching profile with merchantId:", merchantIdNum);

      // Call API - returns array of users
      const data = await getUserProfile(merchantIdNum);

      console.log("User data raw:", JSON.stringify(data));
      console.log("Data type:", typeof data);
      console.log("Is array:", Array.isArray(data));

      // Handle different response formats
      let usersArray: any = data;

      // Check if data is wrapped in a response object (like {data: [...]})
      if (data && typeof data === "object" && !Array.isArray(data)) {
        console.log("Data keys:", Object.keys(data));
        // Try common wrapper formats
        if (data.merchantUser && Array.isArray(data.merchantUser)) {
          // This is the format: { merchantUser: [...] }
          usersArray = data.merchantUser;
        } else if (data.data && Array.isArray(data.data)) {
          usersArray = data.data;
        } else if (data.users && Array.isArray(data.users)) {
          usersArray = data.users;
        } else if (data.results && Array.isArray(data.results)) {
          usersArray = data.results;
        }
      }

      console.log("Users array:", JSON.stringify(usersArray));
      console.log("Users array length:", usersArray?.length);

      if (usersArray && Array.isArray(usersArray) && usersArray.length > 0) {
        // Get the first user from the array (or filter by userId if needed)
        const userIdNum = userId ? parseInt(userId) : null;
        let selectedUser = usersArray[0];

        // If we have a userId, try to find matching user
        if (userIdNum) {
          const foundUser = usersArray.find(
            (u: UserData) => u.id === userIdNum,
          );
          if (foundUser) {
            selectedUser = foundUser;
          }
        }

        console.log("Selected user:", JSON.stringify(selectedUser));
        console.log("User profile path:", selectedUser.profile);
        console.log("Full image URL:", `${BASE_URL}/${selectedUser.profile}`);
        setUserData(selectedUser as any);
      } else {
        console.log("No valid users found in response");
        setError("Failed to load user profile. Please try again.");
      }
    } catch (err) {
      setError("Error loading profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Get the user data from the new structure (direct access)
  const user = userData;
  const merchant = userData?.merchant;

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {user?.profile ? (
            <Image
              source={{
                uri: `${BASE_URL}/storage/${user.profile}`,
              }}
              style={styles.avatar}
              resizeMode="cover"
              onError={(error) => console.log("Image load error:", error)}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={50} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{user?.username || "User"}</Text>
        <Text style={styles.userEmail}>{user?.email || "No email"}</Text>
        {user?.status && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {user.status === "active" ? "Active" : "Inactive"}
            </Text>
          </View>
        )}
      </View>

      {/* User Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>User Information</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="person-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{user?.username || "-"}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="mail-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || "-"}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="call-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user?.phone || "-"}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="transgender-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{user?.gender || "-"}</Text>
          </View>
        </View>
      </View>

      {/* Merchant Info */}
      {merchant && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Merchant Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="business-outline" size={20} color="#34C759" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Merchant ID</Text>
              <Text style={styles.infoValue}>{merchant.merchant_id}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location-outline" size={20} color="#34C759" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>District Merchant ID</Text>
              <Text style={styles.infoValue}>
                {merchant.district_merchant_id}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#34C759"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>
                {merchant.status === "active" ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace("/login")}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
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
  profileCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  errorBox: {
    backgroundColor: "#FFE5E5",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    marginHorizontal: 16,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
