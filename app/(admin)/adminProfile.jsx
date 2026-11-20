import React, { useCallback, useState } from "react";
import { Alert, ScrollView, Text, View, ActivityIndicator, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, router } from "expo-router";
import { AdminScreenStyles, TabScreenStyles } from "../../src/Styles";
import Button from "../../src/components/Button";

export default function AdminProfile() {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [counts, setCounts] = useState({
    movies: 0,
    bookings: 0,
    users: 0,
    revenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadAdminData = async () => {
        try {
          const [rawUser, rawCinema, rawBookings, rawUsers, rawMovies] = await Promise.all([
            AsyncStorage.getItem("@active_user"),
            AsyncStorage.getItem("@selected_cinema"),
            AsyncStorage.getItem("@bookings"),
            AsyncStorage.getItem("@users_list"),
            AsyncStorage.getItem("@movies_list"),
          ]);

          const parsedUser = rawUser ? JSON.parse(rawUser) : null;
          const parsedCinema = rawCinema ? JSON.parse(rawCinema) : null;
          const parsedBookings = rawBookings ? JSON.parse(rawBookings) : [];
          const parsedUsers = rawUsers ? JSON.parse(rawUsers) : [];
          const parsedMovies = rawMovies ? JSON.parse(rawMovies) : [];

          const totalRevenue = parsedBookings.reduce(
            (sum, item) => sum + (Number(item.total) || 0),
            0
          );

          setAdminUser(parsedUser);
          setSelectedCinema(parsedCinema);
          setCounts({
            movies: parsedMovies.length,
            bookings: parsedBookings.length,
            users: parsedUsers.length,
            revenue: totalRevenue,
          });
          setRecentBookings(parsedBookings.slice(0, 4));
        } catch (error) {
          console.error("Error fetching admin profile data:", error);
        } finally {
          setLoading(false);
        }
      };

      loadAdminData();
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

  if (!adminUser || adminUser.role !== "admin") {
    return (
      <SafeAreaView style={TabScreenStyles.container}>
        <View style={TabScreenStyles.centerContent}>
          <Text style={TabScreenStyles.titleText}>
            Admin session not active.
          </Text>
          <Button
            title="Go to Admin Login"
            onPress={() => router.replace("/adminLoginScreen")}
          />
        </View>
      </SafeAreaView>
    );
  }

  const confirmLogout = () => {
    Alert.alert("Log out of Admin", "End the current admin session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("@active_user");
          router.dismissAll();
          router.replace("/LoginScreen");
        },
      },
    ]);
  };

  const resetLocalBookings = () => {
    Alert.alert(
      "Clear All Local Bookings",
      "This removes all stored entries under @bookings. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Bookings",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("@bookings");
            setCounts((prev) => ({ ...prev, bookings: 0, revenue: 0 }));
            setRecentBookings([]);
            Alert.alert("Cleared", "Local bookings have been cleared.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={TabScreenStyles.container}>
      <ScrollView contentContainerStyle={adminProfileStyles.content}>
        <View style={adminProfileStyles.header}>
          <Image
            source={
              adminUser.profileImage
                ? { uri: adminUser.profileImage }
                : require("../../assets/dummy-img.png")
            }
            style={adminProfileStyles.avatar}
          />
          <View style={AdminScreenStyles.badge}>
          </View>
          <Text style={adminProfileStyles.title}>{adminUser.name}</Text>
          <Text style={adminProfileStyles.email}>{adminUser.email}</Text>
        </View>

        <View style={adminProfileStyles.statsRow}>
          <View style={adminProfileStyles.stat}>
            <Text style={adminProfileStyles.statValue}>{counts.bookings}</Text>
            <Text style={adminProfileStyles.statLabel}>Bookings</Text>
          </View>
          <View style={adminProfileStyles.stat}>
            <Text style={adminProfileStyles.statValue}>{counts.users}</Text>
            <Text style={adminProfileStyles.statLabel}>Members</Text>
          </View>
          <View style={adminProfileStyles.stat}>
            <Text style={adminProfileStyles.statValue}>₱{counts.revenue}</Text>
            <Text style={adminProfileStyles.statLabel}>Total Sales</Text>
          </View>
        </View>

        <View style={adminProfileStyles.section}>
          <Text style={adminProfileStyles.sectionTitle}>Console Shortcuts</Text>
          <Text style={adminProfileStyles.label}>Active Cinema Context</Text>
          <Text style={adminProfileStyles.value}>
            {selectedCinema ? selectedCinema.name : "All Cinemas / Default"}
          </Text>

          <Pressable
            style={adminProfileStyles.secondaryButton}
            onPress={() => router.push("/(admin)")}
          >
            <Text style={adminProfileStyles.secondaryButtonText}>Manage Movies</Text>
          </Pressable>

          <Pressable
            style={adminProfileStyles.secondaryButton}
            onPress={() => router.push("/(admin)/bookings")}
          >
            <Text style={adminProfileStyles.secondaryButtonText}>Inspect All Bookings</Text>
          </Pressable>

          <Pressable
            style={adminProfileStyles.secondaryButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={adminProfileStyles.secondaryButtonText}>Preview Customer Tabs</Text>
          </Pressable>
        </View>

        <View style={adminProfileStyles.section}>
          <Text style={adminProfileStyles.sectionTitle}>Latest Bookings</Text>
          {recentBookings.length > 0 ? (
            recentBookings.map((booking, idx) => (
              <View key={booking.bookingId ?? idx} style={adminProfileStyles.activityRow}>
                <Text style={adminProfileStyles.value}>{booking.movieTitle}</Text>
                <Text style={adminProfileStyles.activityMeta}>
                  {booking.quantity} ticket(s) | ₱{booking.total}
                </Text>
                {booking.seats?.length > 0 && (
                  <Text style={adminProfileStyles.activityMeta}>
                    Seats: {booking.seats.join(', ')}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={adminProfileStyles.value}>No bookings recorded yet</Text>
          )}
        </View>

        <Button title="Change Password" onPress={() => router.push("/ChangePasswordScreen")} />
        <Button title="Log Out" onPress={confirmLogout} />

        <Pressable onPress={resetLocalBookings} style={adminProfileStyles.dangerAction}>
          <Text style={adminProfileStyles.dangerText}>Clear All Local Bookings</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const adminProfileStyles = {
  content: { padding: 20, paddingBottom: 140 },
  header: { alignItems: "center", marginBottom: 24, gap: 6 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 8 },
  title: { color: "#FFFFFF", fontSize: 26, fontWeight: "bold" },
  email: { color: "#AAAAAA", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  stat: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    padding: 14,
    alignItems: "center",
    borderRadius: 6,
  },
  statValue: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  statLabel: { color: "#AAAAAA", fontSize: 12, marginTop: 4 },
  section: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 6,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  label: {
    color: "#D62828",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 12,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 17,
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: "#333333",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: { color: "#FFFFFF", fontWeight: "bold" },
  activityRow: {
    borderTopWidth: 1,
    borderTopColor: "#333333",
    paddingVertical: 10,
  },
  activityMeta: { color: "#AAAAAA", fontSize: 13, marginTop: 4 },
  dangerAction: { alignItems: "center", padding: 14, marginTop: 8 },
  dangerText: { color: "#F87171", fontWeight: "bold" },
};