import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Movie } from '../src/models/movie';
import { loadMovies, saveMovies } from '../src/services/movieStorage';

const EMPTY_FORM = {
  title: '',
  ticketPrice: '',
  category: '',
  runtime: '',
  rating: '',
  releaseDate: new Date().toISOString().slice(0, 10),
  posterUrl: '',
  trailerId: '',
  cast: '',
  synopsis: '',
};

function formatDateForInput(value) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function AdminMovieManagementScreen() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadAdminData = async () => {
        setLoading(true);

        try {
          const userData = await AsyncStorage.getItem('@active_user');
          const user = userData ? JSON.parse(userData) : null;

          if (!active) return;
          if (user?.role !== 'admin') {
            setAuthorized(false);
            return;
          }

          setAuthorized(true);
          const storedMovies = await loadMovies();
          if (active) setMovies(storedMovies);
        } catch (error) {
          console.error('Failed to load admin movie data:', error);
          Alert.alert('Error', 'Could not load movie management data.');
        } finally {
          if (active) setLoading(false);
        }
      };

      loadAdminData();
      return () => {
        active = false;
      };
    }, [])
  );

  const updateForm = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setEditingMovie(null);
    setForm({ ...EMPTY_FORM, releaseDate: new Date().toISOString().slice(0, 10) });
  };

  const startEditing = (movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title ?? '',
      ticketPrice: String(movie.ticketPrice ?? ''),
      category: movie.category ?? '',
      runtime: movie.runtime ?? '',
      rating: movie.rating ?? '',
      releaseDate: formatDateForInput(movie.showSchedule),
      posterUrl: movie.poster?.uri ?? '',
      trailerId: movie.trailerId ?? '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : '',
      synopsis: movie.synopsis ?? '',
    });
  };

  const pickPoster = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setForm((current) => ({ ...current, posterUrl: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Failed to select movie poster:', error);
      Alert.alert('Error', 'Could not open the photo library.');
    }
  };

  const saveMovie = async () => {
    const title = form.title.trim();
    const ticketPrice = Number(form.ticketPrice);
    const showSchedule = new Date(`${form.releaseDate}T12:00:00`);

    if (!title || !Number.isFinite(ticketPrice) || ticketPrice <= 0) {
      Alert.alert('Check movie details', 'Enter a title and a ticket price greater than zero.');
      return;
    }

    if (
      Number.isNaN(showSchedule.getTime()) ||
      showSchedule.toISOString().slice(0, 10) !== form.releaseDate
    ) {
      Alert.alert('Check release date', 'Enter a valid date in YYYY-MM-DD format.');
      return;
    }

    const updatedMovie = new Movie(
      editingMovie?.movieId ?? String(Date.now()),
      title,
      ticketPrice,
      showSchedule,
      {
        poster: form.posterUrl.trim()
          ? { uri: form.posterUrl.trim() }
          : editingMovie?.poster,
        trailerId: form.trailerId.trim(),
        runtime: form.runtime.trim(),
        releaseDate: form.releaseDate,
        category: form.category.trim(),
        rating: form.rating.trim(),
        cast: form.cast.split(',').map((name) => name.trim()).filter(Boolean),
        synopsis: form.synopsis.trim(),
        apiData: editingMovie?.apiData,
      }
    );
    const updatedMovies = editingMovie
      ? movies.map((movie) =>
          String(movie.movieId) === String(editingMovie.movieId) ? updatedMovie : movie
        )
      : [updatedMovie, ...movies];

    try {
      await saveMovies(updatedMovies);
      setMovies(updatedMovies);
      resetForm();
    } catch (error) {
      console.error('Failed to save movie:', error);
      Alert.alert('Error', 'Could not save this movie. Please try again.');
    }
  };

  const deleteMovie = (movie) => {
    Alert.alert('Delete movie', `Remove "${movie.title}" from the catalogue?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedMovies = movies.filter(
            (item) => String(item.movieId) !== String(movie.movieId)
          );
          try {
            await saveMovies(updatedMovies);
            setMovies(updatedMovies);
            if (String(editingMovie?.movieId) === String(movie.movieId)) resetForm();
          } catch (error) {
            console.error('Failed to delete movie:', error);
            Alert.alert('Error', 'Could not delete this movie. Please try again.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#D62828" />
      </View>
    );
  }

  if (!authorized) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.title}>Admin access required</Text>
        <Pressable style={styles.backButton} onPress={() => router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Back to Profile</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text style={styles.backButtonText}>Back to Profile</Text>
      </Pressable>
      <Text style={styles.eyebrow}>ADMIN DASHBOARD</Text>
      <Text style={styles.title}>Movie Management</Text>
      <Text style={styles.subtitle}>Add, edit, or remove movies from the catalogue.</Text>
      <Text style={styles.count}>{movies.length} movie(s) in catalogue</Text>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>{editingMovie ? 'Edit movie' : 'Add a movie'}</Text>
        <Text style={styles.label}>Title *</Text>
        <TextInput value={form.title} onChangeText={updateForm('title')} style={styles.input} />

        <View style={styles.fieldRow}>
          <View style={styles.fieldColumn}>
            <Text style={styles.label}>Ticket price (₱) *</Text>
            <TextInput
              value={form.ticketPrice}
              onChangeText={updateForm('ticketPrice')}
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </View>
          <View style={styles.fieldColumn}>
            <Text style={styles.label}>Category</Text>
            <TextInput value={form.category} onChangeText={updateForm('category')} style={styles.input} />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldColumn}>
            <Text style={styles.label}>Runtime</Text>
            <TextInput value={form.runtime} onChangeText={updateForm('runtime')} style={styles.input} />
          </View>
          <View style={styles.fieldColumn}>
            <Text style={styles.label}>Rating</Text>
            <TextInput value={form.rating} onChangeText={updateForm('rating')} style={styles.input} />
          </View>
        </View>

        <Text style={styles.label}>Release date (YYYY-MM-DD)</Text>
        <TextInput
          value={form.releaseDate}
          onChangeText={updateForm('releaseDate')}
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.label}>Movie poster</Text>
        <View style={styles.posterPicker}>
          {form.posterUrl ? (
            <Image source={{ uri: form.posterUrl }} style={styles.posterPreview} />
          ) : (
            <View style={[styles.posterPreview, styles.posterPlaceholder]}>
              <Ionicons name="image-outline" size={30} color="#999" />
              <Text style={styles.posterPlaceholderText}>No poster</Text>
            </View>
          )}
          <View style={styles.posterPickerActions}>
            <Pressable style={styles.choosePosterButton} onPress={pickPoster}>
              <Ionicons name="image-outline" size={18} color="#fff" />
              <Text style={styles.actionText}>Choose from device</Text>
            </Pressable>
            <Text style={styles.posterHint}>Or enter a poster URL below.</Text>
          </View>
        </View>
        <Text style={styles.label}>Poster image URL</Text>
        <TextInput
          value={form.posterUrl}
          onChangeText={updateForm('posterUrl')}
          autoCapitalize="none"
          keyboardType="url"
          placeholder="https://..."
          placeholderTextColor="#777"
          style={styles.input}
        />
        <Text style={styles.label}>Trailer YouTube ID</Text>
        <TextInput value={form.trailerId} onChangeText={updateForm('trailerId')} style={styles.input} />
        <Text style={styles.label}>Cast (comma separated)</Text>
        <TextInput value={form.cast} onChangeText={updateForm('cast')} style={styles.input} />
        <Text style={styles.label}>Synopsis</Text>
        <TextInput
          value={form.synopsis}
          onChangeText={updateForm('synopsis')}
          multiline
          style={[styles.input, styles.multilineInput]}
        />

        <Pressable style={styles.primaryButton} onPress={saveMovie}>
          <Text style={styles.primaryButtonText}>{editingMovie ? 'Save Changes' : 'Add Movie'}</Text>
        </Pressable>
        {editingMovie && (
          <Pressable style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.cancelButtonText}>Cancel Editing</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.sectionTitle}>Catalogue</Text>
      {movies.length === 0 ? (
        <Text style={styles.emptyText}>No movies yet. Add one above.</Text>
      ) : (
        movies.map((movie) => (
          <View key={String(movie.movieId)} style={styles.movieCard}>
            <Image source={movie.poster} style={styles.poster} />
            <View style={styles.movieDetails}>
              <Text style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>
              <Text style={styles.movieMeta}>
                {movie.category} · ₱{movie.ticketPrice}
              </Text>
              <View style={styles.actionRow}>
                <Pressable style={styles.editButton} onPress={() => startEditing(movie)}>
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={() => deleteMovie(movie)}>
                  <Text style={styles.actionText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  content: { padding: 18, paddingBottom: 150 },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 8 },
  backButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  eyebrow: { color: '#38BDF8', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginTop: 8 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 6 },
  subtitle: { color: '#aaa', fontSize: 14, marginTop: 6 },
  count: { color: '#ddd', fontSize: 14, marginTop: 18, marginBottom: 12 },
  form: { backgroundColor: '#1A1A1A', borderRadius: 8, padding: 16, marginBottom: 22 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 10 },
  label: { color: '#ddd', fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 5 },
  input: { backgroundColor: '#fff', borderRadius: 5, color: '#111', padding: 11 },
  posterPicker: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 6 },
  posterPreview: { width: 88, height: 132, borderRadius: 5, backgroundColor: '#292929' },
  posterPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#555', borderStyle: 'dashed' },
  posterPlaceholderText: { color: '#999', fontSize: 11, marginTop: 4 },
  posterPickerActions: { flex: 1, alignItems: 'flex-start', gap: 8 },
  choosePosterButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#334155', borderRadius: 5, paddingHorizontal: 12, paddingVertical: 10 },
  posterHint: { color: '#aaa', fontSize: 12 },
  fieldRow: { flexDirection: 'row', gap: 10 },
  fieldColumn: { flex: 1 },
  multilineInput: { minHeight: 90, textAlignVertical: 'top' },
  primaryButton: { backgroundColor: '#D62828', borderRadius: 6, alignItems: 'center', padding: 13, marginTop: 16 },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { alignItems: 'center', padding: 12 },
  cancelButtonText: { color: '#ccc', fontWeight: '600' },
  emptyText: { color: '#aaa', marginVertical: 18, textAlign: 'center' },
  movieCard: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 8, padding: 10, marginTop: 10 },
  poster: { width: 72, height: 108, backgroundColor: '#292929', borderRadius: 4 },
  movieDetails: { flex: 1, justifyContent: 'center', marginLeft: 12 },
  movieTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  movieMeta: { color: '#aaa', fontSize: 13, marginTop: 6 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  editButton: { backgroundColor: '#334155', borderRadius: 5, paddingHorizontal: 16, paddingVertical: 8 },
  deleteButton: { backgroundColor: '#7f1d1d', borderRadius: 5, paddingHorizontal: 16, paddingVertical: 8 },
  actionText: { color: '#fff', fontWeight: '600' },
});
