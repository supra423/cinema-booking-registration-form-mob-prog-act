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
      AsyncStorage.getItem('@active_user').then(user => {
        setCurrentUser(user ? JSON.parse(user) : null);
      });

      fetchMoviesFromApi()
        .then((apiMovies) => {
          setMovies(apiMovies);
          return saveMovies(apiMovies);
        })
        .catch(() => loadMovies().then(setMovies));
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
//CAMANNONG WAS HERE