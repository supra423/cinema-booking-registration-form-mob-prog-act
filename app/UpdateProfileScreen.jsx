import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Eye, EyeOff } from "lucide-react-native";
import Button from "../src/components/Button";
import { LoginScreenStyles } from "../src/Styles";
import * as ImagePicker from "expo-image-picker";

const ADMIN_ACCOUNT_KEY = "@admin_account";

export default function UpdateProfileScreen() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [favoriteMovieCategory, setFavoriteMovieCategory] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const isAdmin = user?.role === "admin";

  const chooseProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("@active_user");

      if (storedUser) {
        const activeUser = JSON.parse(storedUser);
        const existingPassword = activeUser.password || "";

        setUser(activeUser);
        setName(activeUser.name || "");
        setPassword(existingPassword);
        setConfirmPassword(activeUser.confirmPassword || existingPassword);
        setHidePassword(true);
        setHideConfirmPassword(true);
        setEmail(activeUser.email || "");
        setAge(activeUser.age ? String(activeUser.age) : "");
        setFavoriteMovieCategory(activeUser.favoriteMovieCategory || "");
        setProfileImage(activeUser.profileImage || null);
      }
    };

    loadUser();
  }, []);

  const handleUpdate = async () => {
    if (!user) return;

    const trimmedName = name.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const trimmedEmail = email.trim();
    const trimmedAge = age.trim();
    const trimmedCategory = favoriteMovieCategory.trim();

    if (isAdmin) {
      if (!trimmedName || !trimmedPassword || !trimmedConfirmPassword) {
        Alert.alert("Error", "Please complete all fields.");
        return;
      }

      if (trimmedPassword.length < 6) {
        Alert.alert("Weak Password", "Password must be at least 6 characters.");
        return;
      }

      if (trimmedPassword !== trimmedConfirmPassword) {
        Alert.alert("Mismatch", "Password and confirm password do not match.");
        return;
      }
    } else {
      if (!trimmedName || !trimmedEmail || !trimmedAge || !trimmedCategory) {
        Alert.alert("Error", "Please complete all fields.");
        return;
      }
    }

    try {
      const previousEmail = user.email;
      const stableUserId = user.userId || `user-${Date.now()}`;
      const storedUsers = await AsyncStorage.getItem("@users_list");
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];
      const duplicateEmail = !isAdmin && usersList.some(
        (existingUser) =>
          String(existingUser.email).trim().toLowerCase() !==
            String(previousEmail).trim().toLowerCase() &&
          String(existingUser.email).trim().toLowerCase() ===
            trimmedEmail.toLowerCase()
      );

      if (duplicateEmail) {
        Alert.alert("Error", "An account with this email already exists.");
        return;
      }

      const updatedUser = isAdmin
        ? {
            ...user,
            userId: stableUserId,
            name: trimmedName,
            username: trimmedName,
            password: trimmedPassword,
            confirmPassword: trimmedConfirmPassword,
            profileImage,
            role: "admin",
          }
        : {
            ...user,
            userId: stableUserId,
            name: trimmedName,
            email: trimmedEmail,
            age: trimmedAge,
            favoriteMovieCategory: trimmedCategory,
            profileImage,
          };

      await AsyncStorage.setItem(
        "@active_user",
        JSON.stringify(updatedUser)
      );

      if (isAdmin) {
        await AsyncStorage.setItem(
          ADMIN_ACCOUNT_KEY,
          JSON.stringify(updatedUser)
        );
      }

      const updatedUsers = usersList.map((existingUser) =>
        (existingUser.userId && existingUser.userId === stableUserId) ||
        String(existingUser.email).trim().toLowerCase() ===
          String(previousEmail).trim().toLowerCase()
          ? updatedUser
          : existingUser
      );

      await AsyncStorage.setItem(
        "@users_list",
        JSON.stringify(updatedUsers)
      );

      if (!isAdmin && trimmedEmail !== previousEmail) {
        const storedBookings = await AsyncStorage.getItem("@bookings");
        const bookings = storedBookings ? JSON.parse(storedBookings) : [];
        const previousEmailNormalized = String(previousEmail).trim().toLowerCase();
        const migratedBookings = bookings.map((booking) =>
          String(booking.userEmail).trim().toLowerCase() === previousEmailNormalized
            ? { ...booking, userEmail: trimmedEmail, userId: stableUserId }
            : booking
        );
        await AsyncStorage.setItem("@bookings", JSON.stringify(migratedBookings));
      }

      const destination = isAdmin
        ? "/(admin)/adminProfile"
        : "/(tabs)/profile";

      Alert.alert(
        "Success",
        isAdmin
          ? "Admin profile updated successfully."
          : "Profile updated successfully.",
        [
          {
            text: "OK",
            onPress: () => router.replace(destination),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Could not update profile.");
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: "#101010" }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={LoginScreenStyles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 6,
            marginBottom: 14,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
            Back
          </Text>
        </TouchableOpacity>

        <Text style={LoginScreenStyles.title}>
          {isAdmin ? "Update Admin Profile" : "Update Profile"}
        </Text>

        <TouchableOpacity
          onPress={chooseProfileImage}
          style={{ alignItems: "center" }}
        >
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../assets/def-pfp.jpg")
            }
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              marginBottom: 12,
            }}
          />

          <Text style={{ color: "#FFFFFF", marginBottom: 20 }}>
            Change Profile Picture
          </Text>
        </TouchableOpacity>

        <Text style={LoginScreenStyles.label}>Name</Text>
        <TextInput
          style={LoginScreenStyles.field}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
        />

        {isAdmin ? (
          <>
            <Text style={LoginScreenStyles.label}>Password</Text>
            <View
              style={{
                width: "90%",
                maxWidth: 360,
                alignSelf: "center",
                justifyContent: "center",
                marginTop: 6,
              }}
            >
              <TextInput
                style={[
                  LoginScreenStyles.field,
                  { width: "100%", maxWidth: "100%", marginTop: 0, paddingRight: 44 },
                ]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={hidePassword}
                autoCapitalize="none"
                placeholder="Enter password"
              />
              <TouchableOpacity
                onPress={() => setHidePassword((prev) => !prev)}
                accessibilityLabel={
                  hidePassword ? "Show password" : "Hide password"
                }
                style={{
                  position: "absolute",
                  right: 10,
                  padding: 6,
                }}
              >
                {hidePassword ? (
                  <Eye size={22} color="#111111" />
                ) : (
                  <EyeOff size={22} color="#111111" />
                )}
              </TouchableOpacity>
            </View>

            <Text style={LoginScreenStyles.label}>Confirm Password</Text>
            <View
              style={{
                width: "90%",
                maxWidth: 360,
                alignSelf: "center",
                justifyContent: "center",
                marginTop: 6,
              }}
            >
              <TextInput
                style={[
                  LoginScreenStyles.field,
                  { width: "100%", maxWidth: "100%", marginTop: 0, paddingRight: 44 },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={hideConfirmPassword}
                autoCapitalize="none"
                placeholder="Confirm password"
              />
              <TouchableOpacity
                onPress={() => setHideConfirmPassword((prev) => !prev)}
                accessibilityLabel={
                  hideConfirmPassword
                    ? "Show confirm password"
                    : "Hide confirm password"
                }
                style={{
                  position: "absolute",
                  right: 10,
                  padding: 6,
                }}
              >
                {hideConfirmPassword ? (
                  <Eye size={22} color="#111111" />
                ) : (
                  <EyeOff size={22} color="#111111" />
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={LoginScreenStyles.label}>Email</Text>
            <TextInput
              style={LoginScreenStyles.field}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter email"
            />

            <Text style={LoginScreenStyles.label}>Age</Text>
            <TextInput
              style={LoginScreenStyles.field}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Enter age"
            />

            <Text style={LoginScreenStyles.label}>
              Favorite Movie Category
            </Text>
            <TextInput
              style={LoginScreenStyles.field}
              value={favoriteMovieCategory}
              onChangeText={setFavoriteMovieCategory}
              placeholder="Enter favorite category"
            />
          </>
        )}

        <Button title="Save Changes" onPress={handleUpdate} />
      </View>
    </ScrollView>
  );
}