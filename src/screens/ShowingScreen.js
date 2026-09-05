import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { movies } from '../models/movie';
import { ShowingScreenStyles } from '../Styles';

export default function ShowingScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const center_first_and_last_movies = width * -0.14;

  const [currentUser, setCurrentUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        if (route.params?.user) {
          setCurrentUser(route.params.user);
        } else {
          const activeUserStr = await AsyncStorage.getItem('@active_user');
          if (activeUserStr) {
            setCurrentUser(JSON.parse(activeUserStr));
          } else {
            setCurrentUser(null);
          }
        }
      };
      loadUser();
    }, [route.params?.user])
  );

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
              key={index}
              style={[ShowingScreenStyles.showingScreenContainer, extraStyle]}
            >
              <View style={ShowingScreenStyles.imageTouchableWrapper}>
                <TouchableOpacity
                  style={ShowingScreenStyles.imageTouchable}
			  // TODO dapat ni sya nga if naka login na ang user, adto sa CashierScreen
                  onPress={() => navigation.navigate('LoginScreen')}
                >
                  <Image
                    source={require('../../assets/dummy-img.png')}
                    style={isFirst || isLast ? ShowingScreenStyles.imageEdge : ShowingScreenStyles.imageMiddle}
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
    </View>
  );
}
