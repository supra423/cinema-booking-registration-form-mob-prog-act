import React, { useCallback, useState } from "react";
import { Alert, ScrollView, Text, View, ActivityIndicator, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, router } from "expo-router";
import { TabScreenStyles } from "../../src/Styles";
import Button from "../../src/components/Button";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const userData = await AsyncStorage.getItem("@active_user");
          const cinemaData = await AsyncStorage.getItem("@selected_cinema");
          const bookings = await AsyncStorage.getItem("@bookings");
          const storedBookings = bookings ? JSON.parse(bookings) : [];
          setUser(userData ? JSON.parse(userData) : null);
          setSelectedCinema(cinemaData ? JSON.parse(cinemaData) : null);
          setBookingCount(storedBookings.length);
          setRecentBookings(storedBookings.slice(0, 3));
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
          <Button  title="Log In" onPress={() => router.push("/LoginScreen")} />
          <Button  title="Sign Up" onPress={() => router.push("/RegisterScreen")} />
        </View>
      </SafeAreaView>
    );
  }

  const confirmLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("@active_user");
          router.replace("/LoginScreen");
        },
      },
    ]);
  };

  const deleteAccount = () => {
    Alert.alert("Delete account", "This permanently removes your local account data.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const storedUsers = await AsyncStorage.getItem("@users_list");
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          const remainingUsers = users.filter((item) => item.email !== user.email);

          await AsyncStorage.setItem("@users_list", JSON.stringify(remainingUsers));
          await AsyncStorage.multiRemove([
            "@active_user",
            "@bookings",
          ]);
          router.replace("/RegisterScreen");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={TabScreenStyles.container}>
      <ScrollView contentContainerStyle={profileStyles.content}>
        <View style={profileStyles.header}>
          <Image
                    source={
                        user.profileImage
                        ? { uri: user.profileImage }
                        : require("../../assets/dummy-img.png")
                    }
                    style={profileStyles.avatar}
                    />
          <Text style={profileStyles.title}>My Profile</Text>
          <Text style={profileStyles.email}>{user.email}</Text>
          <Text style={profileStyles.role}>{user.role === "admin" ? "ADMIN" : "MEMBER"}</Text>
        </View>

        <View style={profileStyles.statsRow}>
          <View style={profileStyles.stat}>
            <Text style={profileStyles.statValue}>{bookingCount}</Text>
            <Text style={profileStyles.statLabel}>Bookings</Text>
          </View>
        </View>

        <View style={profileStyles.section}>
          <Text style={profileStyles.sectionTitle}>Account details</Text>
          <Text style={profileStyles.label}>Name</Text>
          <Text style={profileStyles.value}>{user.name}</Text>
          <Text style={profileStyles.label}>Age</Text>
          <Text style={profileStyles.value}>{user.age}</Text>
          <Text style={profileStyles.label}>Favorite Movie Category</Text>
          <Text style={profileStyles.value}>{user.favoriteMovieCategory}</Text>
        </View>

        <View style={profileStyles.section}>
          <Text style={profileStyles.sectionTitle}>Cinema preference</Text>
          <Text style={profileStyles.value}>
            {selectedCinema ? selectedCinema.name : "No cinema selected"}
          </Text>
          <Pressable style={profileStyles.secondaryButton} onPress={() => router.push("/(tabs)/cinemas")}>
            <Text style={profileStyles.secondaryButtonText}>Choose Cinema</Text>
          </Pressable>
        </View>

        <View style={profileStyles.section}>
          <Text style={profileStyles.sectionTitle}>Recent bookings</Text>
          {recentBookings.length > 0 ? recentBookings.map((booking) => (
            <View key={booking.bookingId} style={profileStyles.activityRow}>
              <Text style={profileStyles.value}>{booking.movieTitle}</Text>
              <Text style={profileStyles.activityMeta}>
                {booking.quantity} ticket(s) | ₱{booking.total}
              </Text>
            </View>
          )) : (
            <Text style={profileStyles.value}>No bookings yet</Text>
          )}
        </View>

        <Button title="Update Profile" onPress={() => router.push("/UpdateProfileScreen")} />
        <Button title="Change Password" onPress={() => router.push("/ChangePasswordScreen")} />
        <Button title="Log Out" onPress={confirmLogout} />
        <Pressable onPress={deleteAccount} style={profileStyles.deleteButton}>
          <Text style={profileStyles.deleteText}>Delete Account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const profileStyles = {
  content: { padding: 20, paddingBottom: 140 },
  header: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 14 },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold" },
  email: { color: "#AAAAAA", fontSize: 14, marginTop: 6 },
  role: { color: "#38BDF8", fontSize: 12, fontWeight: "bold", marginTop: 8 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  stat: { flex: 1, backgroundColor: "#1A1A1A", padding: 16, alignItems: "center", borderRadius: 6 },
  statValue: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  statLabel: { color: "#AAAAAA", fontSize: 12, marginTop: 4 },
  section: { backgroundColor: "#1A1A1A", padding: 16, borderRadius: 6, marginBottom: 16 },
  sectionTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold", marginBottom: 6 },
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
  secondaryButton: { backgroundColor: "#333333", padding: 12, alignItems: "center", marginTop: 14 },
  secondaryButtonText: { color: "#FFFFFF", fontWeight: "bold" },
  activityRow: { borderTopWidth: 1, borderTopColor: "#333333", paddingVertical: 10 },
  activityMeta: { color: "#AAAAAA", fontSize: 13, marginTop: 4 },
  deleteButton: { alignItems: "center", padding: 14, marginTop: 8 },
  deleteText: { color: "#F87171", fontWeight: "bold" },
};