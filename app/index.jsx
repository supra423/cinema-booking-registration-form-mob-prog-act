import React, { useState, useCallback } from 'react';
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
// Adjust relative paths depending on file placement inside app/ or app/(app)/
import { fetchMoviesFromApi, loadMovies, saveMovies } from '../src/services/movieStorage';
import { ShowingScreenStyles } from '../src/Styles';
import { supabase } from '../lib/supabase';

export default function ShowingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const center_first_and_last_movies = width * -0.14;

  const [currentUser, setCurrentUser] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [movies, setMovies] = useState([]);

  // 1. Session check: Loads user if authenticated, defaults to null (Guest)
// Sync user state every time screen comes into focus
 useFocusEffect(
    useCallback(() => {
      const loadUserDataAndMovies = async () => {
        try {
          // 1. Load active user session from AsyncStorage
          const storedUser = await AsyncStorage.getItem('@active_user');
          setCurrentUser(storedUser ? JSON.parse(storedUser) : null);

          // 2. Fetch movies live from Supabase
          const { data, error } = await supabase
            .from('movies')
            .select('*');

          if (error) {
            console.error('Error fetching movies from Supabase:', error);
            // Fallback to local storage cache if network fails
            const cachedMovies = await loadMovies();
            setMovies(cachedMovies);
          } else {
            // Map Supabase columns to match your existing UI property names if needed
            const formattedMovies = data.map((item) => ({
              movieId: item.id, // maps Supabase UUID/ID to your movieId prop
              title: item.title,
              genre: item.genre,
              duration_mins: item.duration_mins,
              poster_url: item.poster_url,
              ticketPrice: item.ticket_price || item.ticketPrice || 150, // adjust column name as per your schema
              // If your schema has a date string or timestamp, handle it here:
              getFormattedDate: () => item.showing_date ? new Date(item.showing_date).toDateString() : 'Today',
            }));

            setMovies(formattedMovies);
            // Save a local cache backup
            await saveMovies(formattedMovies);
          }
        } catch (e) {
          console.error('Failed to load screen data', e);
        }
      };

      loadUserDataAndMovies();
    }, [])
  );

  // 2. Logout handler: Clears session and stays/resets on ShowingScreen as Guest
  const handleLogout = async () => {
    try {
      // Clear local storage
      await AsyncStorage.removeItem('@active_user');

      // Clear local component state so UI updates immediately to "Guest"
      setCurrentUser(null);

      // Clear route params using Expo Router
     router.replace('/');

      Alert.alert('Logged Out', 'You are now viewing as a Guest.',);
    } catch (error) {
      Alert.alert('Logout Error', 'Could not complete logout.');
    }
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  return (
    <View style={ShowingScreenStyles.mainContainer}>
      <Text style={ShowingScreenStyles.welcomeMessage}>
        {currentUser
          ? `Welcome to SB Cinema ${currentUser.name}!`
          : 'Welcome to SB Cinema, Guest!'}
      </Text>

      <ScrollView
        horizontal={true}
        pagingEnabled={true} //added feature 11/11/26
        decelerationRate="fast" //added feature 11/11/26
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={ShowingScreenStyles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {movies.map((movie, index) => {
          const isFirst = index === 0;
          const isLast = index === movies.length - 1;

          let extraStyle = {};
          if (isFirst) extraStyle = { marginLeft: center_first_and_last_movies };
          if (isLast) extraStyle = { marginRight: center_first_and_last_movies };

          return (
            <View
              key={movie.movieId || index}
              style={[ShowingScreenStyles.showingScreenContainer, { width }]}
            >
              <View style={ShowingScreenStyles.imageTouchableWrapper}>
                <TouchableOpacity
                  style={ShowingScreenStyles.imageTouchable}
                  onPress={() =>
                    router.push({
                      pathname: currentUser ? '/ViewMovie' : '/LoginScreen',
                      params: { movieId: movie.movieId },
                    })
                  }
                >
                 <Image
                    // Uses Supabase remote URI if poster_url exists, otherwise uses local dummy asset
                    source={
                      movie.poster_url && movie.poster_url.trim().length > 0
                        ? { uri: movie.poster_url.trim() }
                        : require('../assets/dummy-img.png')
                    }
                    style={[
                      // Choose style based on position AND whether it's a Supabase URL or dummy image
                      isFirst || isLast
                        ? ShowingScreenStyles.imageEdge
                        : (movie.poster_url ? ShowingScreenStyles.imageUrl : ShowingScreenStyles.imageMiddle),
                      { width: width }
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ paddingTop: 20, alignItems: 'center' }}>
                <Text style={{color: "#fff"}}>Title: {movie.title}</Text>
                <Text style={{color: "#fff"}}>Starting price: ₱{movie.ticketPrice}</Text>
                <Text style={{color: "#fff"}}>Showing: {movie.getFormattedDate()}</Text>
              </View>
              </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
