import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Adjust relative path based on where this file is placed inside app/
import { loadMovies } from '../src/services/movieStorage';
import { Ionicons } from '@expo/vector-icons';

export default function ViewMovie() {
  const router = useRouter();
  const { movieId } = useLocalSearchParams();
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('@selected_cinema'),
      loadMovies(),
    ]).then(([storedCinema, storedMovies]) => {
      setSelectedCinema(storedCinema ? JSON.parse(storedCinema) : null);
      setMovie(storedMovies.find((item) => String(item.movieId) === String(movieId)));
    });
  }, [movieId]);

  if (!movie) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <Text style={styles.bodyText}>No movie was found.</Text>
      </View>
    );
  } 

  //KYLA: ADDED BACK BUTTON FUNCTIONALITY
  const handleBackPress = () => {
    router.back();
  }

  const trailerUrl = `https://www.youtube.com/embed/${movie.trailerId}`;

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
        onPress={() => {
          if (!selectedCinema) {
            Alert.alert('Select a cinema first', 'Choose a branch in the Cinemas tab.');
            return;
          }

          router.push({
            pathname: '/ScheduleScreen',
            params: {
              movieId: movie.movieId,
              cinemaId: selectedCinema.cinemaId,
            },
          });
        }}
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
    paddingBottom: 200, // Extra padding to ensure content is scrollable and not cut off
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