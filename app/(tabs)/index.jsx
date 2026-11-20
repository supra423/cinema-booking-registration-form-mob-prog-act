import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from "expo-router";
import ShowingContent from '../../src/components/showingContents';
import { fetchMoviesFromApi, loadMovies, saveMovies } from '../../src/services/movieStorage';

export default function HomeTab() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [movies, setMovies] = useState([]);

  useFocusEffect(
    useCallback(() => {
      // 1. Always sync active user session
      AsyncStorage.getItem('@active_user').then(user => {
        setCurrentUser(user ? JSON.parse(user) : null);
      });

      // 2. Load from local storage FIRST so the list stays stable and instant
      loadMovies().then((localMovies) => {
        if (localMovies && localMovies.length > 0) {
          setMovies(localMovies);
        } else {
          // Fallback to API only if local storage is completely empty
          fetchMoviesFromApi()
            .then((apiMovies) => {
              setMovies(apiMovies);
              saveMovies(apiMovies);
            })
            .catch((err) => console.error('Failed to load API movies:', err));
        }
      });
    }, [])
  );

  const handleMoviePress = (movie) => {
    router.push({
      pathname: currentUser ? '/ViewMovie' : '/LoginScreen',
      params: { movieId: movie.movieId },
    });
  };

  return (
    <ShowingContent
      movies={movies}
      currentUser={currentUser}
      onMoviePress={handleMoviePress}
    />
  );
}