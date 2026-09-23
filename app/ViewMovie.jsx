import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Adjust relative path based on where this file is placed inside app/
import { movies } from '../src/models/movie';

export default function ViewMovie() {
  const router = useRouter();
  const { movieId } = useLocalSearchParams();

  const movie = movies.find(
    ({ movieId: id }) => id === movieId
  );

  if (!movie) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <Text style={styles.bodyText}>No movie was found.</Text>
      </View>
    );
  }

  const trailerUrl = `https://www.youtube.com/embed/${movie.trailerId}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{movie.title}</Text>

      <View style={styles.trailerContainer}>
        <WebView
          source={{ uri: trailerUrl }}
          style={styles.trailer}
          allowsFullscreenVideo
        />
      </View>

      <TouchableOpacity
        style={styles.showtimesButton}
        onPress={() =>
          router.push({
            pathname: '/ScheduleScreen',
            params: { movieId: movie.movieId },
          })
        }
      >
        <Text style={styles.showtimesText}>View Showtimes</Text>
      </TouchableOpacity>

      <View style={styles.movieInfo}>
        <Image source={movie.poster} style={styles.poster} />

        <View style={styles.details}>
          <Text style={styles.detail}>Runtime: {movie.runtime}</Text>
          <Text style={styles.detail}>Release Date: {movie.releaseDate}</Text>
          <Text style={styles.detail}>Category: {movie.category}</Text>
          <Text style={styles.detail}>Rated: {movie.rating}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Cast</Text>
      <Text style={styles.bodyText}>{movie.cast?.join(', ') || 'Cast details coming soon.'}</Text>

      <Text style={styles.sectionTitle}>Synopsis</Text>
      <Text style={styles.bodyText}>{movie.synopsis}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  trailerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 18,
  },
  trailer: {
    flex: 1,
  },
  showtimesButton: {
    backgroundColor: '#d62828',
    padding: 15,
    alignItems: 'center',
    marginBottom: 24,
  },
  showtimesText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  movieInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  poster: {
    width: 130,
    height: 195,
    resizeMode: 'cover',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  detail: {
    color: '#eee',
    fontSize: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
  },
  bodyText: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
  },
});