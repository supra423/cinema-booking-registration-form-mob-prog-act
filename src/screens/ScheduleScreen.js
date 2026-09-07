import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { movies } from '../models/movie';

export default function ScheduleScreen({ route, navigation }) {
  const movie = movies.find(
	  ({ movieId }) => movieId === route.params?.movieId
  );

  if (!movie) {
	  return <Text>Movie not found</Text>
  }

  const schedules = [movie.showSchedule];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Showtimes</Text>
      <Text style={styles.subtitle}>{movie.title}</Text>
      {schedules.map((schedule) => (
        <TouchableOpacity
          key={schedule.toISOString()}
          style={styles.card}
          onPress={() => navigation.navigate('TicketSelectionScreen', { movieId: movie.movieId, schedule: schedule.toISOString(), })}
        >
          <Text style={styles.cardLabel}>Available screening</Text>
          <Text style={styles.cardTime}>{schedule.toLocaleString()}</Text>
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
