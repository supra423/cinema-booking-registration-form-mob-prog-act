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
import Button from "../src/components/Button";
import { LoginScreenStyles } from "../src/Styles";
import * as ImagePicker from "expo-image-picker";

export default function UpdateProfileScreen() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
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

        setUser(activeUser);
        setName(activeUser.name || "");
        setPassword(activeUser.password || "");
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
    const trimmedEmail = email.trim();
    const trimmedAge = age.trim();
    const trimmedCategory = favoriteMovieCategory.trim();

    if (isAdmin) {
      if (!trimmedName || !trimmedPassword) {
        Alert.alert("Error", "Please complete all fields.");
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
      const updatedUser = isAdmin
        ? {
            ...user,
            name: trimmedName,
            password: trimmedPassword,
            profileImage,
          }
        : {
            ...user,
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

      const storedUsers = await AsyncStorage.getItem("@users_list");
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];

      const updatedUsers = usersList.map((existingUser) =>
        existingUser.email === previousEmail ? updatedUser : existingUser
      );

      await AsyncStorage.setItem(
        "@users_list",
        JSON.stringify(updatedUsers)
      );

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
            <TextInput
              style={LoginScreenStyles.field}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Enter password"
            />
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