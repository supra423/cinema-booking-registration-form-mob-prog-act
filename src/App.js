import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


class Movie {
  constructor(title, ticketPrice, screeningSchedule) {
    this.title = title;
    this.ticketPrice = ticketPrice;
    this.showSchedule = screeningSchedule;
  }

  getFormattedDate() {
    return this.showSchedule.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }
};

const movies = [
  new Movie('Movie 0', 100, new Date(2026, 7, 25, 13, 0)),
  new Movie('Movie 1', 101, new Date(2026, 7, 26, 13, 0)),
  new Movie('Movie 2', 102, new Date(2026, 7, 27, 13, 0)),
  new Movie('Movie 3', 103, new Date(2026, 7, 28, 13, 0)),
  new Movie('Movie 4', 104, new Date(2026, 7, 29, 13, 0)),
];

const Stack = createNativeStackNavigator();

function ShowingScreen({ navigation }) {
  const {width, height} = useWindowDimensions();
  const center_first_and_last_movies = width * -0.14; // to center first and last movies
  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollView}
    >
      { 
        movies.map((movie, index) => (
          index == 0 || index == movies.length - 1 ? // condition
            index == 0 ?
              <View style={[styles.container, {marginLeft: center_first_and_last_movies}]} key={index}>
                <View style={styles.imageTouchableWrapper}>

                  <TouchableOpacity style={styles.imageTouchable}>
                    <Image
                      source={require('../assets/dummy-img.png')}
                      style={styles.imageEdge}
                    />
                  </TouchableOpacity>
                </View>
                <Text>Title: {movie.title}</Text>
                <Text>Price per ticket: {movie.ticketPrice}</Text>
                <Text>Showing: {movie.getFormattedDate()}</Text>
              </View>
              :
              <View style={[styles.container, {marginRight: center_first_and_last_movies}]} key={index}>
                <View style={styles.imageTouchableWrapper}>
                  <TouchableOpacity style={styles.imageTouchable}>
                    <Image
                      source={require('../assets/dummy-img.png')}
                      style={styles.imageEdge}
                    />
                  </TouchableOpacity>
                </View>
                <Text>Title: {movie.title}</Text>
                <Text>Price per ticket: {movie.ticketPrice}</Text>
                <Text>Showing: {movie.getFormattedDate()}</Text>
              </View>
            : // else
            <View style={styles.container} key={index}>
              <View style={styles.imageTouchableWrapper}>
                <TouchableOpacity style={styles.imageTouchable}>
                  <Image
                    source={require('../assets/dummy-img.png')}
                    style={styles.imageMiddle}
                  />
                </TouchableOpacity>
              </View>
              <Text>Title: {movie.title}</Text>
              <Text>Price per ticket: {movie.ticketPrice}</Text>
              <Text>Showing: {movie.getFormattedDate()}</Text>
            </View>
        ))}
    </ScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ShowingScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ShowingScreen" component={ShowingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    // flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 100,
  },
  imageMiddle: {
    width: '300',
    height: '450',
    justifyContent: 'center',
    resizeMode: 'contain', // 'cover', 'stretch', 'center', 'repeat'
  },
  imageEdge: {
    width: '300',
    height: '450',
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'contain', // 'cover', 'stretch', 'center', 'repeat'
  },
  imageTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTouchableWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
