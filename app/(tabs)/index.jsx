import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from "expo-router";
import ShowingContent from '../../src/components/showingContents';
import { fetchMoviesFromApi, loadMovies, saveMovies } from '../../src/services/movieStorage';

function parseStoredUser(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export default function HomeTab() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [movies, setMovies] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      AsyncStorage.getItem('@active_user')
        .then((raw) => {
          if (!active) return;
          setCurrentUser(parseStoredUser(raw));
        })
        .catch((err) => {
          console.error('Failed to load active user:', err);
          if (active) setCurrentUser(null);
        });

      loadMovies()
        .then((localMovies) => {
          if (!active) return;
          if (Array.isArray(localMovies) && localMovies.length > 0) {
            setMovies(localMovies);
            return null;
          }

          return fetchMoviesFromApi().then((apiMovies) => {
            if (!active) return null;
            const safeMovies = Array.isArray(apiMovies) ? apiMovies : [];
            setMovies(safeMovies);
            if (safeMovies.length > 0) {
              saveMovies(safeMovies).catch(() => {});
            }
            return safeMovies;
          });
        })
        .catch((err) => {
          if (err?.name !== 'AbortError') {
            console.warn('Failed to load movies:', err);
          }
        });

      return () => {
        active = false;
      };
    }, [])
  );

  const handleMoviePress = (movie) => {
    router.push({
      pathname: currentUser ? '/ViewMovie' : '/LoginScreen',
      params: { movieId: movie?.movieId },
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