import React, { useCallback, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import {
  fetchMoviesFromApi,
  loadMovies,
  saveMovies,
} from '../../src/services/movieStorage';
import { RegisterScreenStyles } from '../../src/Styles';
import RuntimeClockPicker from '../../src/components/RuntimeClock';

const DEFAULT_POSTER = require('../../assets/dummy-img.png');

const MTRCB_RATINGS = ['G', 'PG', 'R-13', 'R-16', 'R-18'];

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

function extractPosterString(movie) {
  if (typeof movie?.posterUrl === 'string' && movie.posterUrl.trim()) {
    return movie.posterUrl.trim();
  }
  if (typeof movie?.poster === 'string' && movie.poster.trim()) {
    return movie.poster.trim();
  }
  if (
    movie?.poster &&
    typeof movie.poster === 'object' &&
    typeof movie.poster.uri === 'string'
  ) {
    return movie.poster.uri.trim();
  }
  return '';
}

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editingMovieId, setEditingMovieId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Action');
  const [rating, setRating] = useState('PG');
  const [ticketPrice, setTicketPrice] = useState('250');
  const [runtime, setRuntime] = useState('2h 00m');
  const [posterUri, setPosterUri] = useState('');
  const [posterFailed, setPosterFailed] = useState(false);
  const [synopsis, setSynopsis] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
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
      const [cachedMovies, apiMovies] = await Promise.all([
        loadMovies(),
        fetchMoviesFromApi(),
      ]);

      const localList = Array.isArray(cachedMovies) ? cachedMovies : [];
      const apiList = Array.isArray(apiMovies) ? apiMovies : [];

      const apiIds = new Set(apiList.map((m) => String(m.movieId)));
      const localMap = new Map(localList.map((m) => [String(m.movieId), m]));

      const mergedApiMovies = apiList.map((apiMovie) => {
        const existingLocal = localMap.get(String(apiMovie.movieId));
        return existingLocal
          ? {
              ...apiMovie,
              ...existingLocal,
              ticketPrice:
                Number(existingLocal.ticketPrice) > 0
                  ? Number(existingLocal.ticketPrice)
                  : apiMovie.ticketPrice,
            }
          : apiMovie;
      });

      const customOnlyMovies = localList.filter(
        (m) => !apiIds.has(String(m.movieId))
      );

      const mergedMovies = [...customOnlyMovies, ...mergedApiMovies];
      setMovies(mergedMovies);
      await saveMovies(mergedMovies);
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

  const resetEditForm = () => {
    setEditingMovieId(null);
    setTitle('');
    setCategory('Action');
    setSearchQuery('Action');
    setRating('PG');
    setTicketPrice('250');
    setRuntime('2h 00m');
    setPosterUri('');
    setPosterFailed(false);
    setSynopsis('');
    setIsDropdownOpen(false);
    setIsRatingDropdownOpen(false);
  };

  const handleCategorySearch = (text) => {
    setSearchQuery(text);
    setCategory(text);
    setIsRatingDropdownOpen(false);
    if (!isDropdownOpen) setIsDropdownOpen(true);
  };

  const handleSelectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setSearchQuery(selectedCategory);
    setIsDropdownOpen(false);
  };

  const handleSelectRating = (selectedRating) => {
    setRating(selectedRating);
    setIsRatingDropdownOpen(false);
  };

  const handlePickDeviceImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Gallery Access Failed',
          'Permission is required to pick a poster image from your device.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setPosterFailed(false);
        setPosterUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        'Image Picker Failed',
        error?.message || 'Could not open device gallery.'
      );
    }
  };

  const handlePosterInputChange = (text) => {
    setPosterFailed(false);
    setPosterUri(text);
  };

  const handleStartEdit = (movie) => {
    const currentCategory = movie.category || 'Action';
    const currentRating = MTRCB_RATINGS.includes(movie.rating)
      ? movie.rating
      : movie.rating || 'PG';

    setEditingMovieId(String(movie.movieId));
    setTitle(movie.title || '');
    setCategory(currentCategory);
    setSearchQuery(currentCategory);
    setRating(currentRating);
    setTicketPrice(String(movie.ticketPrice ?? 250));
    setRuntime(movie.runtime || '2h 00m');
    setPosterUri(extractPosterString(movie));
    setPosterFailed(false);
    setSynopsis(movie.synopsis || '');
    setIsDropdownOpen(false);
    setIsRatingDropdownOpen(false);
  };

  const handleUpdateMovie = async () => {
    if (!editingMovieId) return;

    setIsDropdownOpen(false);
    setIsRatingDropdownOpen(false);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Missing title', 'Please enter a movie title.');
      return;
    }

    const normalizedTitle = trimmedTitle.toLowerCase();
    const isDuplicate = movies.some(
      (m) =>
        m.title?.trim().toLowerCase() === normalizedTitle &&
        String(m.movieId) !== String(editingMovieId)
    );

    if (isDuplicate) {
      Alert.alert(
        'Duplicate Movie',
        `"${trimmedTitle}" already exists in the movie list.`
      );
      return;
    }

    const parsedPrice = Number(ticketPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert(
        'Invalid Price',
        'Please enter a valid ticket price greater than 0.'
      );
      return;
    }

    const finalCategory = (category || searchQuery).trim() || 'Action';
    const finalRating = rating.trim() || 'PG';
    const trimmedPoster = posterUri.trim();
    const hasCustomPoster = Boolean(trimmedPoster && !posterFailed);

    try {
      const updated = movies.map((m) => {
        if (String(m.movieId) !== String(editingMovieId)) return m;

        const nextPoster = hasCustomPoster
          ? trimmedPoster
          : typeof m.poster === 'number'
            ? m.poster
            : DEFAULT_POSTER;

        return {
          ...m,
          title: trimmedTitle,
          category: finalCategory,
          rating: finalRating,
          ticketPrice: parsedPrice,
          runtime: runtime.trim() || '2h 00m',
          synopsis: synopsis.trim(),
          poster: nextPoster,
          posterUrl: hasCustomPoster ? trimmedPoster : '',
          showSchedule: m.showSchedule || new Date().toISOString(),
        };
      });

      setMovies(updated);
      await saveMovies(updated);
      resetEditForm();
      Alert.alert('Movie Updated', `"${trimmedTitle}" changes have been saved.`);
    } catch (error) {
      Alert.alert('Update Error', error?.message || 'Could not update movie.');
    }
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
            resetEditForm();
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@active_user');
    router.replace('/LoginScreen');
  };

  const trimmedPoster = posterUri.trim();
  const existingTarget = movies.find(
    (m) => String(m.movieId) === String(editingMovieId)
  );
  const fallbackPoster =
    typeof existingTarget?.poster === 'number'
      ? existingTarget.poster
      : DEFAULT_POSTER;
  const resolvedImageSource =
    trimmedPoster && !posterFailed ? { uri: trimmedPoster } : fallbackPoster;

  const renderEditForm = () => {
    if (!editingMovieId) return null;

    return (
      <View style={styles.form}>
        <Text style={styles.formHeader}>Edit Movie Details</Text>

        <View style={styles.posterPreviewWrap}>
          <Image
            source={resolvedImageSource}
            style={styles.posterPreview}
            resizeMode="cover"
            onError={() => {
              if (trimmedPoster) setPosterFailed(true);
            }}
          />
          <Text style={styles.posterHint}>
            {trimmedPoster && !posterFailed
              ? 'Custom poster active'
              : 'Default / existing poster'}
          </Text>
        </View>

        <Text style={styles.label}>Movie Poster (Image URL or Device)</Text>
        <View style={styles.rowInputs}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Paste image URL or pick photo"
            placeholderTextColor="#888"
            value={posterUri}
            onChangeText={handlePosterInputChange}
            autoCapitalize="none"
          />
          <Pressable style={styles.pickBtn} onPress={handlePickDeviceImage}>
            <Text style={styles.btnText}>Gallery</Text>
          </Pressable>
          {trimmedPoster ? (
            <Pressable
              style={styles.clearBtn}
              onPress={() => {
                setPosterUri('');
                setPosterFailed(false);
              }}
            >
              <Text style={styles.btnText}>Clear</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.label}>Movie Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Movie title"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Category & MTRCB Rating</Text>
        <View style={styles.rowInputs}>
          <View style={{ flex: 1, zIndex: 1000 }}>
            <TextInput
              style={styles.input}
              placeholder="Type or select a category"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleCategorySearch}
              onFocus={() => {
                setIsRatingDropdownOpen(false);
                setIsDropdownOpen(true);
              }}
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

          <View style={{ width: 112, zIndex: 1100 }}>
            <TouchableOpacity
              style={styles.ratingSelectBtn}
              onPress={() => {
                setIsDropdownOpen(false);
                setIsRatingDropdownOpen((prev) => !prev);
              }}
            >
              <Text style={styles.ratingSelectText}>{rating}</Text>
              <Text style={styles.ratingArrow}>
                {isRatingDropdownOpen ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {isRatingDropdownOpen && (
              <View
                style={[
                  RegisterScreenStyles.dropdownContainer,
                  styles.dropdownOverride,
                ]}
              >
                {MTRCB_RATINGS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={RegisterScreenStyles.dropdownItem}
                    onPress={() => handleSelectRating(item)}
                  >
                    <Text style={RegisterScreenStyles.itemText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <Text style={styles.label}>Ticket Price (₱)</Text>
        <TextInput
          style={styles.input}
          placeholder="250"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={ticketPrice}
          onChangeText={setTicketPrice}
        />

        <Text style={styles.label}>Running Time</Text>
        <RuntimeClockPicker value={runtime} onChange={setRuntime} />

        <Text style={styles.label}>Synopsis</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Short movie description (optional)"
          placeholderTextColor="#888"
          multiline
          numberOfLines={3}
          value={synopsis}
          onChangeText={setSynopsis}
        />

        <View style={styles.rowInputs}>
          <Pressable
            style={[styles.saveBtn, { flex: 1 }]}
            onPress={handleUpdateMovie}
          >
            <Text style={styles.btnText}>Save Changes</Text>
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={resetEditForm}>
            <Text style={styles.btnText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

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
          ListHeaderComponent={renderEditForm}
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
                  {item.category || 'Uncategorized'} • {item.rating || 'N/A'} • ₱
                  {item.ticketPrice ?? 250}
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
    padding: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 14,
  },
  formHeader: { color: '#fff', fontSize: 16, fontWeight: '700' },
  posterPreviewWrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  posterPreview: {
    width: 110,
    height: 155,
    borderRadius: 8,
    backgroundColor: '#262626',
  },
  posterHint: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 6,
  },
  label: { color: '#ddd', fontSize: 13, fontWeight: '600', marginTop: 4 },
  rowInputs: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  input: {
    backgroundColor: '#fff',
    color: '#111',
    padding: 10,
    borderRadius: 6,
  },
  ratingSelectBtn: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingSelectText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 14,
  },
  ratingArrow: {
    color: '#333',
    fontSize: 11,
  },
  textArea: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  pickBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 6,
  },
  clearBtn: {
    backgroundColor: '#475569',
    paddingHorizontal: 10,
    paddingVertical: 11,
    borderRadius: 6,
  },
  dropdownOverride: {
    position: 'relative',
    marginTop: 4,
    marginBottom: 4,
    width: '100%',
    zIndex: 2000,
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBtn: {
    backgroundColor: '#475569',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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