import React, { useCallback, useState } from 'react';
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

const SMART_FILTERS = ['All', 'Favorites', 'Popular', 'Top Rated', 'Recent'];

export default function History() {
    const router = useRouter();
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            const loadCatalogue = async () => {
                setLoading(true);

                try {
                    const apiMovies = await fetchMoviesFromApi();
                    if (active) setMovies(apiMovies);
                    await saveMovies(apiMovies);
                } catch (error) {
                    const cachedMovies = await loadMovies();
                    if (active) setMovies(cachedMovies);
                } finally {
                    const storedFavorites = await AsyncStorage.getItem('@favorite_movies');
                    if (active) setFavoriteIds(storedFavorites ? JSON.parse(storedFavorites) : []);
                    if (active) setLoading(false);
                }
            };

            loadCatalogue();

            return () => {
                active = false;
            };
        }, [])
    );

    const genreCategories = [...new Set(
        movies
            .map((movie) => movie.category)
            .filter(Boolean)
            .flatMap((value) => value.split(',').map((item) => item.trim()))
    )].sort();
    const categories = [...SMART_FILTERS, ...genreCategories.filter((item) => !SMART_FILTERS.includes(item))];

    const filteredMovies = movies.filter((movie) => {
        const apiData = movie.apiData || {};
        const searchText = [
            movie.title,
            movie.synopsis,
            movie.category,
            apiData.original_language,
            ...(movie.cast || []),
        ].join(' ').toLowerCase();
        const matchesSearch = searchText.includes(searchQuery.trim().toLowerCase());
        const rating = Number(apiData.vote_average ?? movie.rating ?? 0);
        const popularity = Number(apiData.popularity ?? 0);
        const releaseYear = new Date(movie.releaseDate).getFullYear();
        const currentYear = new Date().getFullYear();

        const matchesCategory =
            category === 'All' ||
            (category === 'Favorites' && favoriteIds.includes(String(movie.movieId))) ||
            (category === 'Popular' && popularity >= 20) ||
            (category === 'Top Rated' && rating >= 7) ||
            (category === 'Recent' && releaseYear >= currentYear - 5) ||
            (category !== 'All' && !SMART_FILTERS.includes(category) &&
                movie.category?.split(',').map((item) => item.trim()).includes(category));

        return matchesSearch && matchesCategory;
    });

    const toggleFavorite = async (movieId) => {
        const id = String(movieId);
        const updatedIds = favoriteIds.includes(id)
            ? favoriteIds.filter((favoriteId) => favoriteId !== id)
            : [...favoriteIds, id];

        setFavoriteIds(updatedIds);
        await AsyncStorage.setItem('@favorite_movies', JSON.stringify(updatedIds));
    };

    const openMovie = async (movie) => {
        const activeUser = await AsyncStorage.getItem('@active_user');

        router.push({
            pathname: activeUser ? '/ViewMovie' : '/LoginScreen',
            params: { movieId: movie.movieId },
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Movie Catalogue</Text>
            <Text style={styles.subtitle}>Find a movie to watch at the cinema.</Text>

            <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search titles or descriptions"
                placeholderTextColor="#888"
                style={styles.search}
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
                    keyExtractor={(item) => String(item.movieId)}
                    contentContainerStyle={styles.movieList}
                    columnWrapperStyle={styles.column}
                    ListEmptyComponent={(
                        <Text style={styles.emptyText}>No movies match your search.</Text>
                    )}
                    renderItem={({ item }) => (
                        <Pressable style={styles.card} onPress={() => openMovie(item)}>
                            <Image source={item.poster} style={styles.poster} />
                            <Pressable
                                style={styles.favoriteButton}
                                onPress={() => toggleFavorite(item.movieId)}
                            >
                                <Text style={styles.favoriteText}>
                                    {favoriteIds.includes(String(item.movieId)) ? '★' : '☆'}
                                </Text>
                            </Pressable>
                            <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.movieMeta} numberOfLines={1}>
                                {item.releaseDate} | Rating {item.apiData?.vote_average ?? item.rating}
                            </Text>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#101010', padding: 16, paddingBottom: 140 },
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
    movieList: { gap: 14, paddingBottom: 180 },
    column: { gap: 14 },
    card: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 6, overflow: 'hidden', paddingBottom: 10 },
    poster: { width: '100%', aspectRatio: 2 / 3, backgroundColor: '#292929' },
    favoriteButton: { position: 'absolute', right: 8, top: 8, backgroundColor: '#101010', borderRadius: 18, paddingHorizontal: 8, paddingVertical: 4 },
    favoriteText: { color: '#FFD166', fontSize: 24, lineHeight: 26 },
    movieTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginHorizontal: 10, marginTop: 9 },
    movieMeta: { color: '#aaa', fontSize: 11, marginHorizontal: 10, marginTop: 5 },
    centerContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    emptyText: { color: '#bbb', textAlign: 'center', marginTop: 16 },
});