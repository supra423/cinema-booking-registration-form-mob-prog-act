import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from "expo-router";
import ShowingContent from '../../src/components/showingContents';

export default function HomeTab() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@active_user').then(user => {
        setCurrentUser(user ? JSON.parse(user) : null);
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
      currentUser={currentUser} 
      onMoviePress={handleMoviePress} 
    />
  );
}
//CAMANNONG WAS HERE