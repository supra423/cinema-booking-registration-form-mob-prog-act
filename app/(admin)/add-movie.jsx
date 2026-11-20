import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { loadMovies, saveMovies } from '../../src/services/movieStorage';
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

export default function AddMovieScreen() {
  const [movies, setMovies] = useState([]);
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

  useFocusEffect(
    useCallback(() => {
      loadMovies().then((list) => setMovies(list || []));
    }, [])
  );

  const filteredCategories = MOVIE_CATEGORIES.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

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

  const trimmedPoster = posterUri.trim();
  const resolvedImageSource =
    trimmedPoster && !posterFailed ? { uri: trimmedPoster } : DEFAULT_POSTER;

  const handleCreateMovie = async () => {
    setIsDropdownOpen(false);
    setIsRatingDropdownOpen(false);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Failed to Add Movie', 'Please enter a movie title.');
      return;
    }

    const normalizedTitle = trimmedTitle.toLowerCase();
    const isDuplicate = movies.some(
      (m) => m.title?.trim().toLowerCase() === normalizedTitle
    );

    if (isDuplicate) {
      Alert.alert(
        'Failed to Add Movie',
        `"${trimmedTitle}" already exists in the movie list.`
      );
      return;
    }

    const parsedPrice = Number(ticketPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert(
        'Failed to Add Movie',
        'Please enter a valid ticket price greater than 0.'
      );
      return;
    }

    const finalCategory = (category || searchQuery).trim() || 'Action';
    const finalRating = MTRCB_RATINGS.includes(rating) ? rating : 'PG';
    const nowIso = new Date().toISOString();

    const finalPosterValue =
      trimmedPoster && !posterFailed ? trimmedPoster : DEFAULT_POSTER;

    const newMovie = {
      movieId: String(Date.now()),
      title: trimmedTitle,
      category: finalCategory,
      rating: finalRating,
      ticketPrice: parsedPrice,
      showSchedule: nowIso,
      releaseDate: nowIso.slice(0, 10),
      runtime: runtime.trim() || '2h 00m',
      trailerId: '',
      synopsis: synopsis.trim() || 'Added from local Admin dashboard.',
      cast: [],
      poster: finalPosterValue,
      posterUrl: trimmedPoster && !posterFailed ? trimmedPoster : '',
    };

    try {
      const updated = [newMovie, ...movies];
      await saveMovies(updated);
      setMovies(updated);

      setTitle('');
      setCategory('Action');
      setSearchQuery('Action');
      setRating('PG');
      setTicketPrice('250');
      setRuntime('2h 00m');
      setPosterUri('');
      setPosterFailed(false);
      setSynopsis('');

      Alert.alert(
        'Movie Added Successfully',
        `"${trimmedTitle}" (${finalRating}) has been saved to the movie list.`,
        [
          {
            text: 'View in Dashboard',
            onPress: () => router.replace('/(admin)'),
          },
          { text: 'Add Another', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error adding movie:', error);
      Alert.alert(
        'Failed to Add Movie',
        error?.message || 'An unexpected error occurred while saving the movie.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add New Movie</Text>
        <Text style={styles.subtitle}>
          Create a screening entry for SB Cinema
        </Text>

        <View style={styles.form}>
          {/* Poster Preview (same { uri } + dummy-img.png fallback style as Profile) */}
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
                : 'Default poster (dummy-img.png)'}
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
            placeholder="Enter movie title"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Category & MTRCB Rating</Text>
          <View style={styles.rowInputs}>
            <View style={{ flex: 1, zIndex: 1000 }}>
              <TextInput
                style={styles.input}
                placeholder="Type or select category"
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

            {/* MTRCB Rating Dropdown */}
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

          <Pressable style={styles.submitBtn} onPress={handleCreateMovie}>
            <Text style={styles.btnText}>Create Movie</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  content: { padding: 16, paddingBottom: 130, gap: 10 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#aaa', fontSize: 14, marginBottom: 6 },
  form: {
    backgroundColor: '#1A1A1A',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  posterPreviewWrap: {
    alignItems: 'center',
    marginBottom: 6,
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
  submitBtn: {
    backgroundColor: '#D62828',
    padding: 13,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});