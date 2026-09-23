import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Adjust relative path based on your folder structure (e.g., ../../src/models/movie if inside app/(app)/)
import { movies } from '../src/models/movie';

export default function TicketSelectionScreen() {
  const router = useRouter();
  const { movieId } = useLocalSearchParams();

  const movie = movies.find(({ movieId: id }) => id === movieId);

  if (!movie) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Movie Not Found</Text>
      </View>
    );
  }

  const schedule = movie.showSchedule;
  const [quantity, setQuantity] = useState(1);
  const total = quantity * movie.ticketPrice;

  const handleBookTickets = async () => {
    try {
      // Check if an active user exists in local storage
      const activeUser = await AsyncStorage.getItem('@active_user');

      if (activeUser) {
        const user = JSON.parse(activeUser);
        
        // User is logged in -> Process booking successfully
        Alert.alert(
          'Booking Successful!',
          `Thank you, ${user.name}! You booked ${quantity} ticket(s) for "${movie.title}". Total: ₱${total}.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/'), // Navigate to Home / ShowingScreen
            },
          ]
        );
      } else {
        // User is NOT logged in -> Prompt to log in / register first
        Alert.alert(
          'Login Required',
          'Please log in or register an account to complete your booking.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Log In / Register',
              onPress: () =>
                router.push({
                  pathname: '/LoginScreen',
                  params: {
                    movieId: movie.movieId,
                    quantity: quantity.toString(),
                    total: total.toString(),
                    movieTitle: movie.title,
                  },
                }),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify user session.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Tickets</Text>
      <Text style={styles.movie}>{movie.title}</Text>
      <Text style={styles.schedule}>
        {Array.isArray(schedule) ? schedule.join(', ') : schedule?.toString()}
      </Text>

      <Text style={styles.label}>Number of tickets</Text>
      <View style={styles.counter}>
        <TouchableOpacity
          style={styles.control}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <Text style={styles.controlText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity
          style={styles.control}
          onPress={() => setQuantity(quantity + 1)}
        >
          <Text style={styles.controlText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.price}>Price per ticket: ₱{movie.ticketPrice}</Text>
      <Text style={styles.total}>Total: ₱{total}</Text>

      {/* Button always says "Book Tickets" */}
      <TouchableOpacity style={styles.bookButton} onPress={handleBookTickets}>
        <Text style={styles.bookButtonText}>Book Tickets</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  movie: { color: '#fff', fontSize: 21, marginTop: 24 },
  schedule: { color: '#aaa', marginTop: 6 },
  label: { color: '#ddd', fontSize: 16, marginTop: 40 },
  counter: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  control: { width: 48, height: 48, backgroundColor: '#d62828', alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  controlText: { color: '#fff', fontSize: 28 },
  quantity: { color: '#fff', fontSize: 24, width: 64, textAlign: 'center' },
  price: { color: '#bbb', fontSize: 16, marginTop: 30 },
  total: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 10 },
  bookButton: {
    backgroundColor: '#d62828',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});