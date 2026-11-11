import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Button from "../src/components/Button";
import { LoginScreenStyles } from "../src/Styles";

export default function UpdateProfileScreen() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [favoriteMovieCategory, setFavoriteMovieCategory] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("@active_user");

      if (storedUser) {
        const activeUser = JSON.parse(storedUser);

        setUser(activeUser);
        setName(activeUser.name || "");
        setEmail(activeUser.email || "");
        setAge(String(activeUser.age || ""));
        setFavoriteMovieCategory(activeUser.favoriteMovieCategory || "");
      }
    };

    loadUser();
  }, []);

  const handleUpdate = async () => {
    if (!user || !name || !email || !age || !favoriteMovieCategory) {
      Alert.alert("Error", "Please complete all fields.");
      return;
    }

    try {
      const updatedUser = {
        ...user,
        name,
        email,
        age,
        favoriteMovieCategory,
      };

      await AsyncStorage.setItem(
        "@active_user",
        JSON.stringify(updatedUser)
      );

      const storedUsers = await AsyncStorage.getItem("@users_list");
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];

      const updatedUsers = usersList.map((existingUser) =>
        existingUser.email === user.email ? updatedUser : existingUser
      );

      await AsyncStorage.setItem(
        "@users_list",
        JSON.stringify(updatedUsers)
      );

      Alert.alert("Success", "Profile updated successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/profile"),
        },
      ]);
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
    >
      <View style={LoginScreenStyles.container}>
        <Text style={LoginScreenStyles.title}>Update Profile</Text>

        <Text style={LoginScreenStyles.label}>Name</Text>
        <TextInput
          style={LoginScreenStyles.field}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
        />

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

        <Button title="Save Changes" onPress={handleUpdate} />
      </View>
    </ScrollView>
  );
}