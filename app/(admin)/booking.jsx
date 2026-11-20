import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@bookings').then((raw) => {
        setBookings(raw ? JSON.parse(raw) : []);
      });
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>All Bookings ({bookings.length})</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item, idx) => String(item.bookingId || idx)}
        contentContainerStyle={{ paddingBottom: 140, gap: 10 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No bookings saved yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.movieTitle}>{item.movieTitle}</Text>
            <Text style={styles.meta}>
              User: {item.userEmail} • Cinema: {item.cinemaId}
            </Text>
            <Text style={styles.meta}>
              Qty: {item.quantity} • Total: ₱{item.total}
            </Text>
            {item.seats?.length > 0 && (
              <Text style={styles.meta}>Seats: {item.seats.join(', ')}</Text>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 16 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 12 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 24 },
  card: { backgroundColor: '#1A1A1A', padding: 12, borderRadius: 8, gap: 4 },
  movieTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  meta: { color: '#ccc', fontSize: 13 },
});