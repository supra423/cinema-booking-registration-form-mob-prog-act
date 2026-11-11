import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// Adjust relative path depending on whether this file lives in app/ or app/(app)/
import { loadMovies } from '../src/services/movieStorage';
import { getShowtime } from '../src/models/showtimes';
import { Ionicons } from '@expo/vector-icons';

export default function ScheduleScreen() {
  const router = useRouter();
  const { movieId, cinemaId } = useLocalSearchParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies()
      .then((storedMovies) => {
        setMovie(storedMovies.find((item) => String(item.movieId) === String(movieId)));
      })
      .finally(() => setLoading(false));
  }, [movieId]);

  if (loading) {
    return <Text style={{ color: '#fff', padding: 20 }}>Loading movie...</Text>;
  }

  if (!movie) {
    return <Text style={{ color: '#fff', padding: 20 }}>Movie not found</Text>;
  }

  if (!cinemaId) {
    return (
      <Text style={{ color: '#fff', padding: 20 }}>
        Select a cinema before choosing a showtime.
      </Text>
    );
  }

  const cinemaSchedule = getShowtime(movieId, cinemaId, movie.showSchedule);

  //KYLA: ADDED BACK BUTTON FUNCTIONALITY
  const handleBackPress = () => {
    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

       {/* KYLA: ADDED BACK BUTTON */}
                  <TouchableOpacity onPress={handleBackPress} style={{ marginBottom: 16 }}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                  </TouchableOpacity>
                  
      <Text style={styles.title}>Showtimes</Text>
      <Text style={styles.subtitle}>{movie.title}</Text>
      {cinemaSchedule.schedules.map((schedule) => (
        <TouchableOpacity
          key={schedule}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: '/TicketSelectionScreen',
              params: {
                movieId: movie.movieId,
                cinemaId: String(cinemaId),
                schedule,
                ticketPrice: String(cinemaSchedule.ticketPrice),
              },
            })
          }
        >
          <Text style={styles.cardLabel}>Available screening</Text>
          <Text style={styles.cardTime}>{new Date(schedule).toLocaleString()}</Text>
          <Text style={styles.cardAction}>Select showtime</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  content: { padding: 20, gap: 12 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#bbb', fontSize: 18, marginBottom: 12 },
  card: { backgroundColor: '#222', borderLeftWidth: 4, borderLeftColor: '#d62828', padding: 18 },
  cardLabel: { color: '#aaa', fontSize: 13 },
  cardTime: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 6 },
  cardAction: { color: '#f05a5a', marginTop: 12, fontWeight: '600' },
});