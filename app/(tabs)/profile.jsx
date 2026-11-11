import React, { useCallback, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { TabScreenStyles } from "../../src/Styles";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const loadUser = async () => {
                try {
                    const userData = await AsyncStorage.getItem("user");
                    if (userData) {
                        setUser(JSON.parse(userData));
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoading(false);
                }
            };

            loadUser();
        }, [])
    );

    if (loading) {
        return (
            <SafeAreaView style={TabScreenStyles.container}>
                <View style={TabScreenStyles.centerContent}>
                    <ActivityIndicator size="large" color="#38BDF8" />
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
    return (
      <SafeAreaView style={TabScreenStyles.container}>
        <View style={TabScreenStyles.centerContent}>
          <Text style={TabScreenStyles.titleText}>
            No user is currently logged in.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={TabScreenStyles.container}>
      <View style={TabScreenStyles.centerContent}>
        <Text style={TabScreenStyles.titleText}>My Profile</Text>

        <View style={{ width: "90%", marginTop: 24 }}>
          <Text style={profileStyles.label}>Name</Text>
          <Text style={profileStyles.value}>{user.name}</Text>

          <Text style={profileStyles.label}>Email</Text>
          <Text style={profileStyles.value}>{user.email}</Text>

          <Text style={profileStyles.label}>Age</Text>
          <Text style={profileStyles.value}>{user.age}</Text>

          <Text style={profileStyles.label}>Favorite Movie Category</Text>
          <Text style={profileStyles.value}>
            {user.favoriteMovieCategory}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const profileStyles = {
  label: {
    color: "#D62828",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 16,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 4,
  },
};