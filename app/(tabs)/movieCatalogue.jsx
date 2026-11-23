import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
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
import { fetchMoviesFromApi, loadMovies, saveMovies } from '../../src/services/movieStorage';

const SMART_FILTERS = ['All', 'Popular', 'Top Rated', 'Recent'];
const FALLBACK_POSTER = require('../../assets/dummy-img.png');

function isBareImageBaseUrl(url) {
    if (!url || typeof url !== 'string') return true;
    const normalized = url.trim().replace(/\/+$/, '');
    return (
        normalized === 'https://image.tmdb.org/t/p/original' ||
        normalized === 'https://image.tmdb.org/t/p/w500' ||
        normalized === 'https://image.tmdb.org/t/p/w342' ||
        normalized === 'https://image.tmdb.org/t/p/w185' ||
        normalized === 'https://image.tmdb.org/t/p/w780'
    );
}

function resolvePosterSource(poster) {
    if (typeof poster === 'number') return poster;
    const rawUri =
        poster && typeof poster === 'object' && typeof poster.uri === 'string'
            ? poster.uri.trim()
            : typeof poster === 'string'
                ? poster.trim()
                : '';

    if (rawUri.length > 0 && !isBareImageBaseUrl(rawUri) && !rawUri.startsWith('data:image')) {
        return { uri: rawUri };
    }
    return FALLBACK_POSTER;
}

function normalizeToken(value) {
    return String(value ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function extractReleaseYear(releaseDate) {
    if (!releaseDate) return null;
    const match = String(releaseDate).match(/(?:^|\D)(\d{4})(?:\D|$)/);
    if (match) return Number(match[1]);
    const parsed = new Date(releaseDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed.getFullYear();
}

export default function MovieCatalogue() {
    const router = useRouter();
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            const loadCatalogue = async () => {
                try {
                    const savedMovies = await AsyncStorage.getItem('@movies_list');
                    const cachedMovies = savedMovies ? await loadMovies() : [];

                    if (active && cachedMovies.length > 0) {
                        setMovies(cachedMovies);
                        setLoading(false);
                    } else if (active) {
                        setLoading(true);
                    }

                    try {
                        const apiMovies = await fetchMoviesFromApi();
                        if (!active) return;

                        if (savedMovies) {
                            const apiById = new Map(apiMovies.map((movie) => [String(movie.movieId), movie]));
                            const cachedById = new Map(cachedMovies.map((movie) => [String(movie.movieId), movie]));
                            const mergedApiMovies = apiMovies.map((movie) => {
                                const cachedMovie = cachedById.get(String(movie.movieId));
                                return cachedMovie
                                    ? {
                                          ...movie,
                                          category:
                                              cachedMovie.category && cachedMovie.category !== 'Uncategorized'
                                                  ? cachedMovie.category
                                                  : movie.category,
                                          rating:
                                              cachedMovie.rating && cachedMovie.rating !== 'PG'
                                                  ? cachedMovie.rating
                                                  : movie.rating,
                                          cast: cachedMovie.cast?.length ? cachedMovie.cast : movie.cast,
                                          synopsis: cachedMovie.synopsis ? cachedMovie.synopsis : movie.synopsis,
                                          poster: cachedMovie.poster || movie.poster,
                                          ticketPrice: cachedMovie.ticketPrice || movie.ticketPrice,
                                      }
                                    : movie;
                            });
                            const localOnlyMovies = cachedMovies.filter(
                                (movie) => !apiById.get(String(movie.movieId))
                            );
                            const mergedMovies = [...mergedApiMovies, ...localOnlyMovies];
                            await saveMovies(mergedMovies);
                            if (active) setMovies(mergedMovies);
                        } else {
                            await saveMovies(apiMovies);
                            if (active) setMovies(apiMovies);
                        }
                    } catch {
                        if (active && cachedMovies.length === 0) {
                            const fallbackMovies = await loadMovies();
                            if (active) setMovies(fallbackMovies);
                        }
                    }
                } catch {
                    if (active) {
                        const fallbackMovies = await loadMovies();
                        if (active) setMovies(fallbackMovies);
                    }
                } finally {
                    if (active) setLoading(false);
                }
            };

            loadCatalogue();

            return () => {
                active = false;
            };
        }, [])
    );

    const categories = useMemo(() => {
        const genreSet = new Set();
        movies.forEach((movie) => {
            if (!movie?.category || typeof movie.category !== 'string') return;
            movie.category
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item && item.toLowerCase() !== 'uncategorized')
                .forEach((item) => genreSet.add(item));
        });
        const sortedGenres = [...genreSet].sort((a, b) => a.localeCompare(b));
        return [...SMART_FILTERS, ...sortedGenres.filter((item) => !SMART_FILTERS.includes(item))];
    }, [movies]);

    const filteredMovies = useMemo(() => {
        const normalizedQuery = normalizeToken(searchQuery);
        const queryTokens = normalizedQuery ? normalizedQuery.split(/\s+/) : [];
        const currentYear = new Date().getFullYear();

        return movies.filter((movie) => {
            const apiData = movie?.apiData || {};
            const titleNormalized = normalizeToken(movie?.title);
            const searchableNormalized = normalizeToken([
                movie?.title,
                movie?.synopsis,
                movie?.category,
                apiData.original_language,
                ...(Array.isArray(movie?.cast) ? movie.cast : []),
            ].join(' '));

            const matchesSearch =
                queryTokens.length === 0 ||
                queryTokens.every(
                    (token) => titleNormalized.includes(token) || searchableNormalized.includes(token)
                );

            const rating = Number(
                apiData.vote_average ??
                apiData.voteAverage ??
                movie?.voteAverage ??
                0
            );
            const popularity = Number(
                apiData.popularity ??
                movie?.popularity ??
                0
            );
            const releaseYear = extractReleaseYear(movie?.releaseDate);

            const movieCategories = String(movie?.category ?? '')
                .split(',')
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean);

            const matchesCategory =
                category === 'All' ||
                (category === 'Popular' && popularity >= 20) ||
                (category === 'Top Rated' && rating >= 7) ||
                (category === 'Recent' && releaseYear !== null && releaseYear >= currentYear - 5) ||
                (category !== 'All' &&
                    !SMART_FILTERS.includes(category) &&
                    movieCategories.includes(category.toLowerCase()));

            return matchesSearch && matchesCategory;
        });
    }, [movies, searchQuery, category]);

    const openMovie = async (movie) => {
        const activeUser = await AsyncStorage.getItem('@active_user');

        router.push({
            pathname: activeUser ? '/ViewMovie' : '/LoginScreen',
            params: { movieId: movie?.movieId },
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Movie Catalogue</Text>
            <Text style={styles.subtitle}>Find a movie to watch at the cinema.</Text>

            <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search titles, cast, or descriptions"
                placeholderTextColor="#888"
                style={styles.search}
                clearButtonMode="while-editing"
            />

            <ScrollView
                horizontal
                style={styles.categoryScroll}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
            >
                {categories.map((item) => (
                    <Pressable
                        key={item}
                        style={[styles.category, item === category && styles.categoryActive]}
                        onPress={() => setCategory(item)}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                item === category && styles.categoryTextActive,
                            ]}
                        >
                            {item}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#D62828" />
                    <Text style={styles.emptyText}>Loading movies...</Text>
                </View>
            ) : (
                <FlatList
                    style={styles.movieListContainer}
                    data={filteredMovies}
                    numColumns={2}
                    keyExtractor={(item, index) => `${String(item?.movieId ?? 'movie')}-${index}`}
                    contentContainerStyle={styles.movieList}
                    columnWrapperStyle={styles.column}
                    ListEmptyComponent={(
                        <Text style={styles.emptyText}>No movies match your search.</Text>
                    )}
                    renderItem={({ item }) => (
                        <Pressable style={styles.card} onPress={() => openMovie(item)}>
                            <Image source={resolvePosterSource(item?.poster)} style={styles.poster} />
                            <Text style={styles.movieTitle} numberOfLines={2}>{item?.title}</Text>
                            <Text style={styles.movieMeta} numberOfLines={1}>
                                {item?.releaseDate || 'TBA'} | Rating {item?.apiData?.vote_average ?? item?.rating ?? 'N/A'}
                            </Text>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#101010', paddingTop: 16, paddingHorizontal: 16 },
    title: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 8 },
    subtitle: { color: '#aaa', fontSize: 14, marginTop: 6, marginBottom: 16 },
    search: { backgroundColor: '#fff', borderRadius: 6, color: '#111', padding: 12 },
    categoryScroll: { flexGrow: 0, height: 76 },
    categoryList: { alignItems: 'center', paddingVertical: 16 },
    category: {
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderColor: '#FFFFFF',
        borderRadius: 6,
        borderWidth: 1,
        flexShrink: 0,
        height: 44,
        justifyContent: 'center',
        marginRight: 8,
        minWidth: 96,
        paddingHorizontal: 16,
    },
    categoryActive: {
        backgroundColor: '#D62828',
        borderColor: '#FFFFFF',
    },
    categoryText: {
        color: '#111111',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    categoryTextActive: {
        color: '#FFFFFF',
    },
    movieListContainer: { flex: 1, minHeight: 0 },
    movieList: { gap: 14, paddingBottom: 120 },
    column: { gap: 14 },
    card: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 6, overflow: 'hidden', paddingBottom: 10 },
    poster: { width: '100%', aspectRatio: 2 / 3, backgroundColor: '#292929' },
    movieTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginHorizontal: 10, marginTop: 9 },
    movieMeta: { color: '#aaa', fontSize: 11, marginHorizontal: 10, marginTop: 5 },
    centerContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    emptyText: { color: '#bbb', textAlign: 'center', marginTop: 16 },
});