import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loadMovies } from '../src/services/movieStorage';
import { cinemas, loadCinemas } from '../src/models/cinema';
import { getShowtime } from '../src/models/showtimes';
import { loadShowtimes } from '../src/services/showtimeStorage';

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

function getTimeKey(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { movieId, cinemaId } = useLocalSearchParams();

  const [movie, setMovie] = useState(null);
  const [cinema, setCinema] = useState(null);
  const [customShowtimes, setCustomShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);

      Promise.all([loadMovies(), loadCinemas(), loadShowtimes()])
        .then(([storedMovies, storedCinemas, storedShowtimes]) => {
          if (!active) return;

          const matchedMovie = (storedMovies || []).find(
            (item) => String(item.movieId) === String(movieId)
          );
          const availableCinemas = storedCinemas?.length ? storedCinemas : cinemas;
          const matchedCinema =
            availableCinemas.find(
              (item) => String(item.cinemaId) === String(cinemaId)
            ) || null;

          setMovie(matchedMovie || null);
          setCinema(matchedCinema);
          setCustomShowtimes(Array.isArray(storedShowtimes) ? storedShowtimes : []);
        })
        .catch((err) => {
          console.error('Error loading schedule data:', err);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [movieId, cinemaId])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.statusText}>Loading schedule...</Text>
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.statusText}>Movie not found</Text>
      </SafeAreaView>
    );
  }

  if (!cinemaId) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.statusText}>
          Select a cinema before choosing a showtime.
        </Text>
      </SafeAreaView>
    );
  }

  const cinemaSchedule = getShowtime(movie.movieId, cinemaId, movie.showSchedule);
  const moviePrice =
    Number(movie.ticketPrice) > 0 ? Number(movie.ticketPrice) : 250;
  const basePrice = cinemaSchedule?.ticketPrice ?? moviePrice;

  const normalizedRouteMovieId = String(movieId ?? '').trim();
  const normalizedRouteCinemaId = String(cinemaId ?? '').trim();

  const adminSlots = customShowtimes
    .filter((item) => {
      const itemMovieId = String(item.movieId ?? '').trim();
      const itemCinemaId = String(item.cinemaId ?? '').trim();

      const sameMovie =
        itemMovieId === String(movie.movieId).trim() ||
        (normalizedRouteMovieId && itemMovieId === normalizedRouteMovieId);

      const sameCinema =
        !itemCinemaId ||
        !normalizedRouteCinemaId ||
        itemCinemaId === normalizedRouteCinemaId;

      return sameMovie && sameCinema;
    })
    .map((item) => {
      const parsedItemPrice = Number(item.ticketPrice);
      return {
        schedule: item.schedule,
        ticketPrice:
          Number.isFinite(parsedItemPrice) && parsedItemPrice > 0
            ? parsedItemPrice
            : basePrice,
        isAdminSlot: true,
      };
    });

  const defaultSlots = (cinemaSchedule?.schedules || []).map((schedule) => ({
    schedule,
    ticketPrice: basePrice,
    isAdminSlot: false,
  }));

  const mergedMap = new Map();
  [...defaultSlots, ...adminSlots].forEach((slot) => {
    const key = getTimeKey(slot.schedule);
    if (!mergedMap.has(key) || slot.isAdminSlot) {
      mergedMap.set(key, slot);
    }
  });

  const now = Date.now();
  const allSlots = Array.from(mergedMap.values())
    .filter((slot) => {
      const time = new Date(slot.schedule).getTime();
      return Number.isNaN(time) || time > now;
    })
    .sort((a, b) => {
      const timeA = new Date(a.schedule).getTime();
      const timeB = new Date(b.schedule).getTime();
      if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 0;
      return timeA - timeB;
    });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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

        {allSlots.length === 0 ? (
          <Text style={styles.emptyText}>
            No upcoming showtimes available for this cinema yet.
          </Text>
        ) : (
          allSlots.map((slot, index) => (
            <TouchableOpacity
              key={`${getTimeKey(slot.schedule)}-${index}`}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/TicketSelectionScreen',
                  params: {
                    movieId: String(movie.movieId),
                    cinemaId: String(cinemaId),
                    schedule: String(slot.schedule),
                    ticketPrice: String(slot.ticketPrice),
                  },
                })
              }
            >
              <Text style={styles.cardLabel}>
                {cinema ? `${cinema.name} • ${cinema.hours}` : 'Available screening'}
                {slot.isAdminSlot ? ' • Admin Schedule' : ''}
              </Text>
              <Text style={styles.cardTime}>{formatScreeningTime(slot.schedule)}</Text>
              <Text style={styles.cardAction}>
                Select showtime • ₱{slot.ticketPrice}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  backBtn: { marginBottom: 8, alignSelf: 'flex-start' },
  statusText: { color: '#fff', padding: 20, fontSize: 15 },
  emptyText: { color: '#aaa', fontSize: 14, marginTop: 8 },
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