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
    <View style={styles.mainContainer}>
      <Text style={styles.welcome_message}>
        {currentUser
          ? `Welcome to TicketMaster, ${currentUser.name}!`
          : 'Welcome to TicketMaster, Guest!'}
      </Text>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
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
              style={[styles.showingScreenContainer, extraStyle]}
            >
              <View style={styles.imageTouchableWrapper}>
                <TouchableOpacity
                  style={styles.imageTouchable}
                  onPress={() => navigation.navigate('LoginScreen')}
                >
                  <Image
                    source={require('../../assets/dummy-img.png')}
                    style={isFirst || isLast ? styles.imageEdge : styles.imageMiddle}
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

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  welcome_message: {
    color: '#000000',
    backgroundColor: '#ffffff',
    fontSize: 25,
    paddingTop: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  showingScreenContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 100,
    marginTop: 20,
  },
  imageMiddle: {
    width: 300,
    height: 450,
    resizeMode: 'contain',
  },
  imageEdge: {
    width: 300,
    height: 450,
    resizeMode: 'contain',
  },
  imageTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTouchableWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {},
});