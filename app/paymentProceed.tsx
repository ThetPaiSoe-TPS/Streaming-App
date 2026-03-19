import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { getAuthToken } from "../config/notificationService";
import { API_BASE_URL } from "../config/api";

// Payment methods data
interface PaymentMethod {
  id: string;
  name: string;
  category: string;
  icon: string;
}

interface PaymentCategory {
  id: string;
  name: string;
  icon: string;
}

const paymentMethods: PaymentMethod[] = [
  // International Cards
  { id: "visa", name: "Visa", category: "International Cards", icon: "💳" },
  {
    id: "mastercard",
    name: "Mastercard",
    category: "International Cards",
    icon: "💳",
  },
  {
    id: "unionpay",
    name: "UnionPay",
    category: "International Cards",
    icon: "💳",
  },
  { id: "jcb", name: "JCB", category: "International Cards", icon: "💳" },
  // Domestic Card
  { id: "mpu", name: "MPU", category: "Domestic Card", icon: "💳" },
  // Mobile Wallets
  { id: "kbzpay", name: "KBZPay", category: "Mobile Wallets", icon: "📱" },
  { id: "wavepay", name: "WavePay", category: "Mobile Wallets", icon: "📱" },
  { id: "ayapay", name: "AYA Pay", category: "Mobile Wallets", icon: "📱" },
  { id: "cbpay", name: "CB Pay", category: "Mobile Wallets", icon: "📱" },
];

const paymentCategories: PaymentCategory[] = [
  { id: "international", name: "International Cards", icon: "💳" },
  { id: "domestic", name: "Domestic Card", icon: "💳" },
  { id: "mobile", name: "Mobile Wallets", icon: "📱" },
];

export default function PaymentProceedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    amount: parseInt(params.price as string) || 30000,
    currency: "mmk",
    orderType: "App\\Models\\StreamPackage",
    orderId: parseInt(params.id as string) || 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentPayload, setPaymentPayload] = useState<any>(null);

  const categoryDropdownRef = useRef<View>(null);
  const methodDropdownRef = useRef<View>(null);

  const handleSubmit = async () => {
    if (!selectedPaymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get auth token from notification service
      const authToken = getAuthToken();

      if (!authToken) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...formData,
          paymentMethod: selectedPaymentMethod,
        }),
      });

      const data = await response.json();
      console.log("res data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Payment creation failed");
      }

      // Store payment payload for CyberSource
      setPaymentPayload(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  // Group payment methods by category
  const groupedMethods: Record<string, PaymentMethod[]> = {
    "International Cards": paymentMethods.filter(
      (m) => m.category === "International Cards",
    ),
    "Domestic Card": paymentMethods.filter(
      (m) => m.category === "Domestic Card",
    ),
    "Mobile Wallets": paymentMethods.filter(
      (m) => m.category === "Mobile Wallets",
    ),
  };

  const getCategoryMethods = (): PaymentMethod[] => {
    if (!selectedCategory) return [];
    const categoryMap: Record<string, string> = {
      international: "International Cards",
      domestic: "Domestic Card",
      mobile: "Mobile Wallets",
    };
    const categoryName = categoryMap[selectedCategory];
    if (!categoryName) return [];
    return groupedMethods[categoryName] || [];
  };

  const getCategoryName = (id: string) => {
    const cat = paymentCategories.find((c) => c.id === id);
    return cat?.name || "";
  };

  const getSelectedMethod = () => {
    return paymentMethods.find((m) => m.id === selectedPaymentMethod);
  };

  // If we have payment payload, show redirect screen
  if (paymentPayload) {
    return (
      <View style={styles.container}>
        <View style={styles.redirectCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
          <Text style={styles.redirectTitle}>Redirecting to Payment...</Text>
          <Text style={styles.redirectDescription}>
            You will be redirected to the payment gateway to complete your
            transaction securely.
          </Text>

          <TouchableOpacity
            style={styles.proceedButton}
            onPress={() => {
              // For web platform, create and submit a form
              if (Platform.OS === "web" && typeof document !== "undefined") {
                const form = document.createElement("form");
                form.method = "post";
                form.action =
                  "https://testsecureacceptance.cybersource.com/pay";

                Object.entries(paymentPayload).forEach(([key, value]) => {
                  const input = document.createElement("input");
                  input.type = "hidden";
                  input.name = key;
                  input.value = String(value);
                  form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
              } else {
                // For mobile, try to open the URL
                const formUrl =
                  "https://testsecureacceptance.cybersource.com/pay";
                Linking.openURL(formUrl).catch((err) => {
                  console.error("Failed to open payment URL:", err);
                });
              }
            }}
          >
            <Text style={styles.proceedButtonText}>
              Proceed to Payment Gateway
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Payment</Text>
      <Text style={styles.subtitle}>Complete your payment</Text>

      {/* Payment Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Amount to Pay</Text>
            <Text style={styles.summaryAmount}>
              {formData.amount.toLocaleString()} MMK
            </Text>
          </View>
          <View style={styles.summaryIcon}>
            <Text style={styles.cardIcon}>💳</Text>
          </View>
        </View>
      </View>

      {/* Payment Method Selection */}
      <View style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>💳 Select Payment Method</Text>

        {/* Category Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownLabel}>1. Select Category</Text>
          <TouchableOpacity
            style={[
              styles.dropdown,
              selectedCategory && styles.dropdownSelected,
            ]}
            onPress={() => {
              setCategoryDropdownOpen(!categoryDropdownOpen);
              setMethodDropdownOpen(false);
            }}
          >
            <View style={styles.dropdownContent}>
              {selectedCategory ? (
                <>
                  <Text style={styles.dropdownIcon}>
                    {
                      paymentCategories.find((c) => c.id === selectedCategory)
                        ?.icon
                    }
                  </Text>
                  <Text style={styles.dropdownText}>
                    {getCategoryName(selectedCategory)}
                  </Text>
                </>
              ) : (
                <Text style={styles.dropdownPlaceholder}>
                  Choose a category
                </Text>
              )}
            </View>
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>

          {categoryDropdownOpen && (
            <View style={styles.dropdownMenu}>
              {paymentCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setSelectedPaymentMethod(null);
                    setCategoryDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemIcon}>{category.icon}</Text>
                  <Text style={styles.dropdownItemText}>{category.name}</Text>
                  {selectedCategory === category.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Method Dropdown */}
        {selectedCategory && (
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>2. Select Payment Method</Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                selectedPaymentMethod && styles.dropdownSelected,
              ]}
              onPress={() => {
                setMethodDropdownOpen(!methodDropdownOpen);
                setCategoryDropdownOpen(false);
              }}
            >
              <View style={styles.dropdownContent}>
                {selectedPaymentMethod ? (
                  <>
                    <Text style={styles.dropdownIcon}>
                      {getSelectedMethod()?.icon}
                    </Text>
                    <Text style={styles.dropdownText}>
                      {getSelectedMethod()?.name}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>
                    Choose {getCategoryName(selectedCategory)}
                  </Text>
                )}
              </View>
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>

            {methodDropdownOpen && (
              <View style={[styles.dropdownMenu, styles.dropdownMenuMaxHeight]}>
                {getCategoryMethods().map((method: PaymentMethod) => (
                  <TouchableOpacity
                    key={method.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedPaymentMethod(method.id);
                      setMethodDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemIcon}>{method.icon}</Text>
                    <Text style={styles.dropdownItemText}>{method.name}</Text>
                    {selectedPaymentMethod === method.id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Error message */}
        {!selectedPaymentMethod && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Please select a payment method to continue
            </Text>
          </View>
        )}

        {/* Selected Payment Display */}
        {selectedPaymentMethod && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              ✓ Selected: {getSelectedMethod()?.name}
            </Text>
          </View>
        )}
      </View>

      {/* Payment Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Payment Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Product</Text>
          <Text style={styles.detailValue}>
            {params.title || "Stream Package"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>
            {formData.amount.toLocaleString()} MMK
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Currency</Text>
          <Text style={styles.detailValue}>
            {formData.currency.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Pay Button */}
      <TouchableOpacity
        style={[
          styles.payButton,
          (!selectedPaymentMethod || loading) && styles.payButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!selectedPaymentMethod || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>💰 Pay Now</Text>
        )}
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#B3D4FF",
    fontSize: 14,
    fontWeight: "500",
  },
  summaryAmount: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  summaryIcon: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIcon: {
    fontSize: 24,
  },
  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
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
    marginBottom: 15,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    padding: 15,
    backgroundColor: "#fff",
  },
  dropdownSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F7FF",
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dropdownIcon: {
    fontSize: 24,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  chevron: {
    fontSize: 12,
    color: "#999",
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  dropdownMenuMaxHeight: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownItemIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  checkmark: {
    fontSize: 16,
    color: "#34C759",
    fontWeight: "bold",
  },
  warningBox: {
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  warningText: {
    color: "#856404",
    fontSize: 14,
  },
  successBox: {
    backgroundColor: "#D4EDDA",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  successText: {
    color: "#155724",
    fontSize: 14,
    fontWeight: "600",
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  errorBox: {
    backgroundColor: "#F8D7DA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  errorText: {
    color: "#721C24",
    fontSize: 14,
  },
  payButton: {
    backgroundColor: "#34C759",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  payButtonDisabled: {
    backgroundColor: "#C7C7CC",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#8E8E93",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  // Redirect screen styles
  redirectCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 30,
    margin: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D4EDDA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 40,
  },
  redirectTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  redirectDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  proceedButton: {
    backgroundColor: "#34C759",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: "100%",
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#8E8E93",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 30,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
