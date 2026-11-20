import React, { useCallback, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchMoviesFromApi,
  loadMovies,
  saveMovies,
} from '../../src/services/movieStorage';
import { RegisterScreenStyles } from '../../src/Styles';

const MOVIE_CATEGORIES = [
  'Action',
  'Adventure',
  'Animation',
  'Anime',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Superhero',
  'Thriller',
  'Western',
];

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Action');
  const [rating, setRating] = useState('PG-13');

  // Category dropdown state (matching RegisterScreen)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Action');

  const filteredCategories = MOVIE_CATEGORIES.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const loadAdminMovies = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const apiMovies = await fetchMoviesFromApi();
      setMovies(apiMovies);
      await saveMovies(apiMovies);
    } catch (error) {
      console.error('Error loading admin movies:', error);
      const cachedMovies = await loadMovies();
      setMovies(cachedMovies || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAdminMovies();
    }, [loadAdminMovies])
  );

  const resetForm = () => {
    setEditingMovieId(null);
    setTitle('');
    setCategory('Action');
    setSearchQuery('Action');
    setRating('PG-13');
    setIsDropdownOpen(false);
  };

  const handleCategorySearch = (text) => {
    setSearchQuery(text);
    setCategory(text);
    if (!isDropdownOpen) setIsDropdownOpen(true);
  };

  const handleSelectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setSearchQuery(selectedCategory);
    setIsDropdownOpen(false);
  };

  const handleSaveMovie = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Missing title', 'Please enter a movie title.');
      return;
    }

    const normalizedTitle = trimmedTitle.toLowerCase();
    const isDuplicate = movies.some(
      (m) =>
        m.title?.trim().toLowerCase() === normalizedTitle &&
        String(m.movieId) !== String(editingMovieId ?? '')
    );

    if (isDuplicate) {
      Alert.alert(
        'Duplicate Movie',
        `"${trimmedTitle}" already exists in the movie list.`
      );
      return;
    }

    const finalCategory = (category || searchQuery).trim() || 'Action';

    try {
      setIsDropdownOpen(false);

      if (editingMovieId) {
        const updated = movies.map((m) =>
          String(m.movieId) === String(editingMovieId)
            ? {
                ...m,
                title: trimmedTitle,
                category: finalCategory,
                rating: rating.trim() || 'PG-13',
                showSchedule: m.showSchedule || new Date().toISOString(),
                ticketPrice: m.ticketPrice ?? 250,
              }
            : m
        );
        setMovies(updated);
        await saveMovies(updated);
        resetForm();
      } else {
        const nowIso = new Date().toISOString();
        const newMovie = {
          movieId: String(Date.now()),
          title: trimmedTitle,
          category: finalCategory,
          rating: rating.trim() || 'PG-13',
          ticketPrice: 250,
          showSchedule: nowIso,
          releaseDate: nowIso.slice(0, 10),
          runtime: '2h 00m',
          trailerId: '',
          synopsis: 'Added from local Admin dashboard.',
          cast: [],
          poster: require('../../assets/dummy-img.png'),
        };

        const updated = [newMovie, ...movies];
        setMovies(updated);
        await saveMovies(updated);
        resetForm();
      }
    } catch (error) {
      Alert.alert('Save Error', error?.message || 'Could not save movie.');
    }
  };

  const handleStartEdit = (movie) => {
    const currentCategory = movie.category || 'Action';
    setEditingMovieId(String(movie.movieId));
    setTitle(movie.title || '');
    setCategory(currentCategory);
    setSearchQuery(currentCategory);
    setRating(movie.rating || 'PG-13');
    setIsDropdownOpen(false);
  };

  const handleDeleteMovie = (movieId) => {
    Alert.alert('Delete Movie', 'Remove this movie from the list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = movies.filter(
            (m) => String(m.movieId) !== String(movieId)
          );
          setMovies(updated);
          await saveMovies(updated);
          if (String(editingMovieId) === String(movieId)) {
            resetForm();
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@active_user');
    router.replace('/LoginScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.form}>
        <Text style={styles.formHeader}>
          {editingMovieId ? 'Edit Movie Details' : 'Add New Movie'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Movie title"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.rowInputs}>
          <View style={{ flex: 1, zIndex: 1000 }}>
            <TextInput
              style={styles.input}
              placeholder="Type or select a category"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleCategorySearch}
              onFocus={() => setIsDropdownOpen(true)}
            />

            {isDropdownOpen && (
              <View style={[RegisterScreenStyles.dropdownContainer, styles.dropdownOverride]}>
                <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 150 }}>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={RegisterScreenStyles.dropdownItem}
                        onPress={() => handleSelectCategory(item)}
                      >
                        <Text style={RegisterScreenStyles.itemText}>{item}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <TouchableOpacity
                      style={RegisterScreenStyles.dropdownItem}
                      onPress={() => handleSelectCategory(`Others (${searchQuery})`)}
                    >
                      <Text style={RegisterScreenStyles.othersText}>
                        Others (Use: "{searchQuery}")
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          <TextInput
            style={[styles.input, { width: 100 }]}
            placeholder="Rating"
            placeholderTextColor="#888"
            value={rating}
            onChangeText={setRating}
          />
        </View>

        <View style={styles.rowInputs}>
          <Pressable
            style={[styles.addBtn, { flex: 1 }]}
            onPress={handleSaveMovie}
          >
            <Text style={styles.btnText}>
              {editingMovieId ? 'Save Changes' : '+ Add Movie'}
            </Text>
          </Pressable>
          {editingMovieId && (
            <Pressable style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#D62828" />
          <Text style={styles.loadingText}>Loading movies...</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => String(item.movieId)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 140, gap: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadAdminMovies(true)}
              tintColor="#D62828"
              colors={['#D62828']}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No movies available.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.movieTitle}>{item.title}</Text>
                <Text style={styles.meta}>
                  {item.category || 'Uncategorized'} • {item.rating || 'N/A'}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={styles.editBtn}
                  onPress={() => handleStartEdit(item)}
                >
                  <Text style={styles.btnText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.delBtn}
                  onPress={() => handleDeleteMovie(item.movieId)}
                >
                  <Text style={styles.btnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.btnText}>Log Out Admin</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 16 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 12 },
  form: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 14,
  },
  formHeader: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rowInputs: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  input: {
    backgroundColor: '#fff',
    color: '#111',
    padding: 10,
    borderRadius: 6,
  },
  dropdownOverride: {
    position: 'relative',
    marginTop: 4,
    marginBottom: 4,
    width: '100%',
    zIndex: 2000,
  },
  addBtn: {
    backgroundColor: '#D62828',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#475569',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 6,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  movieTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  meta: { color: '#aaa', fontSize: 12, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 6 },
  editBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  delBtn: {
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#AAA',
    marginTop: 8,
  },
  empty: {
    color: '#AAA',
    textAlign: 'center',
    marginTop: 24,
  },
  logoutBtn: {
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 70,
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
