import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { loadMovies } from '../src/services/movieStorage';
import { cinemas, loadCinemas } from '../src/models/cinema';
import { getShowtime } from '../src/models/showtimes';
import { Ionicons } from '@expo/vector-icons';

function formatScreeningTime(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { movieId, cinemaId } = useLocalSearchParams();
  const [movie, setMovie] = useState(null);
  const [cinema, setCinema] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadMovies(), loadCinemas()])
      .then(([storedMovies, storedCinemas]) => {
        setMovie(
          (storedMovies || []).find(
            (item) => String(item.movieId) === String(movieId)
          ) || null
        );
        const list = storedCinemas?.length ? storedCinemas : cinemas;
        setCinema(
          list.find((item) => String(item.cinemaId) === String(cinemaId)) || null
        );
      })
      .finally(() => setLoading(false));
  }, [movieId, cinemaId]);

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

  const cinemaSchedule = getShowtime(movie.movieId, cinemaId, movie.showSchedule);
  const moviePrice =
    Number(movie.ticketPrice) > 0 ? Number(movie.ticketPrice) : 250;
  const effectivePrice = cinemaSchedule?.ticketPrice ?? moviePrice;

  const handleBackPress = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={handleBackPress} style={{ marginBottom: 16 }}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Showtimes</Text>
      <Text style={styles.subtitle}>{movie.title}</Text>

      {cinema && (
        <View style={styles.venueCard}>
          <View style={styles.venueRow}>
            <Ionicons name="location-outline" size={16} color="#f05a5a" />
            <Text style={styles.venueName}>{cinema.name}</Text>
          </View>
          <Text style={styles.venueAddress}>{cinema.address}</Text>
          <View style={styles.venueRow}>
            <Ionicons name="time-outline" size={15} color="#bbb" />
            <Text style={styles.venueHours}>Open: {cinema.hours}</Text>
          </View>
        </View>
      )}

      {(cinemaSchedule?.schedules || []).map((schedule) => (
        <TouchableOpacity
          key={schedule}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: '/TicketSelectionScreen',
              params: {
                movieId: String(movie.movieId),
                cinemaId: String(cinemaId),
                schedule,
                ticketPrice: String(effectivePrice),
              },
            })
          }
        >
          <Text style={styles.cardLabel}>
            {cinema ? `${cinema.name} • ${cinema.hours}` : 'Available screening'}
          </Text>
          <Text style={styles.cardTime}>{formatScreeningTime(schedule)}</Text>
          <Text style={styles.cardAction}>
            Select showtime • ₱{effectivePrice}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  content: { padding: 20, gap: 12 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#bbb', fontSize: 18, marginBottom: 4 },
  venueCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 8,
    padding: 14,
    gap: 6,
    marginBottom: 6,
  },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  venueName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  venueAddress: { color: '#bbb', fontSize: 13, paddingLeft: 22 },
  venueHours: { color: '#f05a5a', fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#222',
    borderLeftWidth: 4,
    borderLeftColor: '#d62828',
    padding: 18,
  },
  cardLabel: { color: '#aaa', fontSize: 13 },
  cardTime: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 6 },
  cardAction: { color: '#f05a5a', marginTop: 12, fontWeight: '600' },
});