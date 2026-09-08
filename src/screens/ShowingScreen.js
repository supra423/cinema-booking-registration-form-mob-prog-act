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
import { useFocusEffect } from '@react-navigation/native';
import { movies } from '../models/movie';
import { ShowingScreenStyles } from '../Styles';

export default function ShowingScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const center_first_and_last_movies = width * -0.14;

  const [currentUser, setCurrentUser] = useState(null);

  // 1. Session check: Loads user if authenticated, defaults to null (Guest)
  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          if (route.params?.user) {
            setCurrentUser(route.params.user);
          } else {
            const activeUserStr = await AsyncStorage.getItem('@active_user');
            if (activeUserStr) {
              setCurrentUser(JSON.parse(activeUserStr));
            } else {
              setCurrentUser(null); // Guest state
            }
          }
        } catch (error) {
          setCurrentUser(null);
        }
      };
      loadUser();
    }, [route.params?.user])
  );

  // 2. Logout handler: Clears session and stays/resets on ShowingScreen as Guest
  const handleLogout = async () => {
    try {
      // Clear local storage
      await AsyncStorage.removeItem('@active_user');

      // Clear local component state so UI updates immediately to "Guest"
      setCurrentUser(null);

      // Clear navigation params to prevent stale route parameters
      navigation.setParams({ user: undefined });

      Alert.alert('Logged Out', 'You are now viewing as a Guest.');
    } catch (error) {
      Alert.alert('Logout Error', 'Could not complete logout.');
    }
  };

  return (
    <View style={ShowingScreenStyles.mainContainer}>
      <Text style={ShowingScreenStyles.welcomeMessage}>
        {currentUser
          ? `Welcome to TicketMeister, ${currentUser.name}!`
          : 'Welcome to TicketMeister, Guest!'}
      </Text>

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={ShowingScreenStyles.scrollView}
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
              style={[ShowingScreenStyles.showingScreenContainer, extraStyle]}
            >
              <View style={ShowingScreenStyles.imageTouchableWrapper}>
                <TouchableOpacity
                  style={ShowingScreenStyles.imageTouchable}
                  onPress={() =>
                    navigation.navigate(currentUser ? 'ViewMovie' : 'LoginScreen', {
                      movieId: movie.movieId,
                    })
                  }
                >
                  <Image
                    source={require('../../assets/dummy-img.png')}
                    style={
                      isFirst || isLast
                        ? ShowingScreenStyles.imageEdge
                        : ShowingScreenStyles.imageMiddle
                    }
                  />
                </TouchableOpacity>
              </View>
              <Text>Title: {movie.title}</Text>
              <Text>Price per ticket: {movie.ticketPrice}</Text>
              <Text>Showing: {movie.getFormattedDate()}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Conditionally render Logout vs Login button based on auth state */}
      {currentUser ? (
        <TouchableOpacity style={ShowingScreenStyles.button_design} onPress={handleLogout}>
          <Text style={ShowingScreenStyles.buttonText}>Logout</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={ShowingScreenStyles.button_design}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={ShowingScreenStyles.buttonText}>Login / Register</Text>
        </TouchableOpacity>
        
      )}
    </View>
  );
}