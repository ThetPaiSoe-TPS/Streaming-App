import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { REGISTER_API_URL } from "../config/api";

interface RegisterResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    phone: string;
  };
}

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    shopname: "",
    email: "",
    phone: "",
    district_id: "",
    township_id: "",
    password: "",
    password_confirmation: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Redirect to login after successful registration
  if (isRegistered) {
    return <Redirect href="/login" />;
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.shopname.trim()) {
      newErrors.shopname = "Shop name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.district_id) {
      newErrors.district_id = "District ID is required";
    } else if (isNaN(Number(formData.district_id))) {
      newErrors.district_id = "District ID must be a number";
    }

    if (!formData.township_id) {
      newErrors.township_id = "Township ID is required";
    } else if (isNaN(Number(formData.township_id))) {
      newErrors.township_id = "Township ID must be a number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          shopname: formData.shopname.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          district_id: Number(formData.district_id),
          township_id: Number(formData.township_id),
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });

      const responseText = await response.text();
      console.log("Register response status:", response.status);
      console.log("Register response text:", responseText);

      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response from server");
      }

      const data: RegisterResponse = JSON.parse(responseText);

      console.log("Register response:", data);

      if (response.ok && (data.success || data.token)) {
        Alert.alert(
          "Success",
          "Registration successful! Please login with your credentials.",
          [
            {
              text: "OK",
              onPress: () => setIsRegistered(true),
            },
          ],
        );
      } else {
        Alert.alert(
          "Registration Failed",
          data.message || "Unable to register. Please check your information.",
        );
      }
    } catch (error: any) {
      console.error("Register error:", error);
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        Alert.alert(
          "Error",
          "Invalid response from server. Please check if the backend is running correctly.",
        );
      } else if (error.message === "Empty response from server") {
        Alert.alert(
          "Error",
          "Server returned empty response. Please check if the backend is running.",
        );
      } else {
        Alert.alert(
          "Error",
          "Unable to connect to server. Please check if the backend is running on your computer.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    options: {
      keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
      secureTextEntry?: boolean;
      placeholder?: string;
    } = {},
  ) => {
    const {
      keyboardType = "default",
      secureTextEntry = false,
      placeholder,
    } = options;
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, errors[field] && styles.inputError]}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor="#999"
          value={formData[field]}
          onChangeText={(value) => updateField(field, value)}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          editable={!isLoading}
        />
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Merchant Registration</Text>
          <Text style={styles.subtitle}>Create your account</Text>

          {renderInput("Username", "username")}
          {renderInput("Shop Name", "shopname")}
          {renderInput("Email", "email", { keyboardType: "email-address" })}
          {renderInput("Phone Number", "phone", { keyboardType: "phone-pad" })}
          {renderInput("District ID", "district_id", {
            keyboardType: "numeric",
          })}
          {renderInput("Township ID", "township_id", {
            keyboardType: "numeric",
          })}
          {renderInput("Password", "password", { secureTextEntry: true })}
          {renderInput("Confirm Password", "password_confirmation", {
            secureTextEntry: true,
          })}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace("/login")}
            disabled={isLoading}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{" "}
              <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formContainer: {
    padding: 24,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#007AFF80",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginLinkText: {
    color: "#666",
    fontSize: 14,
  },
  loginLinkBold: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
