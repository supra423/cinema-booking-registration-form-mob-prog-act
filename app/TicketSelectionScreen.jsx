import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Adjust relative path based on your folder structure (e.g., ../../src/models/movie if inside app/(app)/)
import { Ionicons } from '@expo/vector-icons';
import {
  fetchMoviesFromApi,
  loadMovies,
  saveMovies,
} from '../src/services/movieStorage';

export default function TicketSelectionScreen() {
  const router = useRouter();
  const {
    movieId,
    cinemaId,
    schedule,
    ticketPrice,
    quantity: quantityParam,
    selectedSeats: selectedSeatsParam,
  } = useLocalSearchParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  useEffect(() => {
    const requestedQuantity = Number(quantityParam);
    if (Number.isInteger(requestedQuantity) && requestedQuantity > 0) {
      setQuantity(requestedQuantity);
    }

    if (typeof selectedSeatsParam === 'string' && selectedSeatsParam) {
      setSelectedSeats(
        selectedSeatsParam
          .split(',')
          .map((seat) => seat.trim())
          .filter(Boolean)
      );
    }

    const loadSelectedMovie = async () => {
      try {
        let storedMovies = await loadMovies();
        let selectedMovie = storedMovies.find(
          (item) => String(item.movieId) === String(movieId)
        );

        if (!selectedMovie) {
          const apiMovies = await fetchMoviesFromApi();
          selectedMovie = apiMovies.find(
            (item) => String(item.movieId) === String(movieId)
          );

          if (apiMovies.length > 0) {
            await saveMovies(apiMovies);
          }
        }

        setMovie(selectedMovie || null);

        const storedBookings = await AsyncStorage.getItem('@bookings');
        const bookings = storedBookings ? JSON.parse(storedBookings) : [];
        const occupied = bookings
          .filter((booking) =>
            String(booking.movieId) === String(movieId) &&
            String(booking.cinemaId) === String(cinemaId) &&
            String(booking.schedule) === String(schedule)
          )
          .flatMap((booking) => booking.seats || []);
        setOccupiedSeats([...new Set(occupied)]);
      } catch (error) {
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    loadSelectedMovie();
  }, [movieId, cinemaId, schedule, quantityParam, selectedSeatsParam]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingState]}>
        <Text style={styles.title}>Loading movie...</Text>
      </View>
    );
  }

  if (!movie) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Movie Not Found</Text>
      </ScrollView>
    );
  }

  const price = Number(ticketPrice || 250);
  const total = quantity * price;

  const changeQuantity = (nextQuantity) => {
    const safeQuantity = Math.max(1, Math.min(12, nextQuantity));
    setQuantity(safeQuantity);
    setSelectedSeats((current) => current.slice(0, safeQuantity));
  };

  const toggleSeat = (seatCode) => {
    if (occupiedSeats.includes(seatCode)) return;

    setSelectedSeats((current) => {
      if (current.includes(seatCode)) {
        return current.filter((seat) => seat !== seatCode);
      }
      if (current.length >= quantity) {
        Alert.alert(
          'Seat limit reached',
          `Select exactly ${quantity} seat${quantity === 1 ? '' : 's'} for this booking.`
        );
        return current;
      }
      return [...current, seatCode];
    });
  };

  const handleBookTickets = async () => {
    if (selectedSeats.length !== quantity) {
      Alert.alert(
        'Choose seats',
        `Please select ${quantity} seat${quantity === 1 ? '' : 's'} before booking.`
      );
      return;
    }

    try {
      // Check if an active user exists in local storage
      const activeUser = await AsyncStorage.getItem('@active_user');

      if (activeUser) {
        const user = JSON.parse(activeUser);
        const storedBookings = await AsyncStorage.getItem('@bookings');
        const bookings = storedBookings ? JSON.parse(storedBookings) : [];
        const conflictingSeat = bookings
          .filter((booking) =>
            String(booking.movieId) === String(movie.movieId) &&
            String(booking.cinemaId) === String(cinemaId) &&
            String(booking.schedule) === String(schedule)
          )
          .flatMap((booking) => booking.seats || [])
          .find((seat) => selectedSeats.includes(seat));

        if (conflictingSeat) {
          Alert.alert(
            'Seat unavailable',
            `Seat ${conflictingSeat} was just booked. Please choose another seat.`
          );
          setSelectedSeats((current) => current.filter((seat) => seat !== conflictingSeat));
          setOccupiedSeats((current) =>
            current.includes(conflictingSeat) ? current : [...current, conflictingSeat]
          );
          return;
        }

        bookings.unshift({
          bookingId: `${Date.now()}-${movie.movieId}`,
          userEmail: user.email,
          movieId: movie.movieId,
          movieTitle: movie.title,
          cinemaId: cinemaId || 'unknown',
          schedule: schedule || null,
          quantity,
          ticketPrice: price,
          total,
          seats: selectedSeats,
          createdAt: new Date().toISOString(),
        });

        await AsyncStorage.setItem('@bookings', JSON.stringify(bookings));
        
        // User is logged in -> Process booking successfully
        Alert.alert(
          'Booking Successful!',
          `Thank you, ${user.name}! You booked ${quantity} ticket(s) for "${movie.title}" at ${cinemaId}. Seat${quantity === 1 ? '' : 's'}: ${selectedSeats.join(', ')}. Total: ₱${total}.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'), // Navigate to Home / ShowingScreen
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
                    cinemaId,
                    schedule,
                    ticketPrice: price.toString(),
                    quantity: quantity.toString(),
                    total: total.toString(),
                    movieTitle: movie.title,
                    selectedSeats: selectedSeats.join(','),
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

  //KYLA: ADDED BACK BUTTON FUNCTIONALITY
  const handleBackPress = () => {
    router.back();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* KYLA: ADDED BACK BUTTON */}
            <TouchableOpacity onPress={handleBackPress} style={{ marginBottom: 16 }}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>

      <Text style={styles.title}>Select Tickets</Text>
      <Text style={styles.movie}>{movie.title}</Text>
      <Text style={styles.schedule}>
        {schedule ? new Date(schedule).toLocaleString() : 'No schedule selected'}
      </Text>

      <Text style={styles.label}>Number of tickets</Text>
      <View style={styles.counter}>
        <TouchableOpacity
          style={styles.control}
          onPress={() => changeQuantity(quantity - 1)}
        >
          <Text style={styles.controlText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity
          style={styles.control}
          onPress={() => changeQuantity(quantity + 1)}
        >
          <Text style={styles.controlText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.seatLabel}>
        Choose {quantity} seat{quantity === 1 ? '' : 's'}
      </Text>
      <Text style={styles.selectedSeats}>
        {selectedSeats.length > 0
          ? `Selected: ${selectedSeats.join(', ')}`
          : 'No seats selected'}
      </Text>

      <View style={styles.screen}>
        <Text style={styles.screenText}>SCREEN</Text>
      </View>

      <View style={styles.seatGrid}>
        {['A', 'B', 'C', 'D', 'E', 'F'].map((row) => (
          <View key={row} style={styles.seatRow}>
            {Array.from({ length: 10 }, (_, index) => {
              const seatCode = `${row}${index + 1}`;
              const occupied = occupiedSeats.includes(seatCode);
              const selected = selectedSeats.includes(seatCode);
              return (
                <TouchableOpacity
                  key={seatCode}
                  disabled={occupied}
                  onPress={() => toggleSeat(seatCode)}
                  style={[
                    styles.seat,
                    occupied && styles.seatOccupied,
                    selected && styles.seatSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.seatText,
                      occupied && styles.seatTextMuted,
                      selected && styles.seatTextSelected,
                    ]}
                  >
                    {seatCode}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={styles.price}>Price per ticket: ₱{price}</Text>
      <Text style={styles.total}>Total: ₱{total}</Text>

      {/* Button always says "Book Tickets" */}
      <TouchableOpacity style={styles.bookButton} onPress={handleBookTickets}>
        <Text style={styles.bookButtonText}>Book Tickets</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  content: { padding: 20, paddingBottom: 140 },
  loadingState: { padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  movie: { color: '#fff', fontSize: 21, marginTop: 24 },
  schedule: { color: '#aaa', marginTop: 6 },
  label: { color: '#ddd', fontSize: 16, marginTop: 40 },
  counter: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  seatLabel: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 24 },
  selectedSeats: { color: '#38BDF8', marginTop: 6, minHeight: 18 },
  screen: {
    height: 24,
    backgroundColor: '#334155',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  screenText: { color: '#CBD5E1', fontSize: 11, letterSpacing: 2 },
  seatGrid: { marginTop: 14, gap: 8 },
  seatRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  seat: {
    width: '9%',
    aspectRatio: 1,
    maxWidth: 34,
    maxHeight: 34,
    borderRadius: 5,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatOccupied: { backgroundColor: '#374151', opacity: 0.55 },
  seatSelected: { backgroundColor: '#D62828' },
  seatText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  seatTextMuted: { color: '#9CA3AF' },
  seatTextSelected: { color: '#FFFFFF' },
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
