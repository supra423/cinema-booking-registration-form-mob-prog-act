import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, useWindowDimensions, TextInput, Platform, StatusBar, Alert } from 'react-native';
import { useState } from 'react';
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

function Header() {
  return (
    <View style={styles.headerBar}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/SILVER-BEAVERS-LOGO.png')}
            style={styles.headerLogo}
          />
        </View>
        <Text style={styles.headerTitle}>TICKETMASTER</Text>
      </View>
    </View>
  );
}

function ShowingScreen({ navigation }) {
  const {width, height} = useWindowDimensions();
  const center_first_and_last_movies = width * -0.14; // to center first and last movies
  return (

    <View style={styles.mainContainer}>
    
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollView}
    >
      { 
        movies.map((movie, index) => (
          index == 0 || index == movies.length - 1 ? // condition
            index == 0 ? // inner condition
              <View style={[styles.showingScreenContainer, {marginLeft: center_first_and_last_movies}]} key={index}>
                <View style={styles.imageTouchableWrapper}>
                  <TouchableOpacity style={styles.imageTouchable} onPress={() => navigation.navigate(LoginScreen)}>
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
              : // inner else
              <View style={[styles.showingScreenContainer, {marginRight: center_first_and_last_movies}]} key={index}>
                <View style={styles.imageTouchableWrapper}>
                  <TouchableOpacity style={styles.imageTouchable} onPress={() => navigation.navigate(LoginScreen)}>
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
            <View style={styles.showingScreenContainer} key={index}>
              <View style={styles.imageTouchableWrapper}>
                <TouchableOpacity style={styles.imageTouchable} onPress={() => navigation.navigate(LoginScreen)}>
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
    </View>
  );
}

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    try {
      // 1. Fetch saved user array from phone storage
      const storedUsers = await AsyncStorage.getItem('@users_list');
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];

      // 2. Validate input against stored user records
      const matchedUser = usersList.find(
        (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password
      );

      if (matchedUser) {
        Alert.alert('Success', `Welcome back, ${matchedUser.name}!`);
        navigation.navigate('MainHome');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read login data.');
    }
  };

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.field}
        placeholder="Enter your email"
        placeholderTextColor="gray"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        secureTextEntry={hidePassword}
		textContentType={'password'}
        style={styles.field}
        placeholder="Enter your password"
        placeholderTextColor="gray"
        value={password}
        onChangeText={setPassword}
      />
	  <TouchableOpacity
		onPress={() => setHidePassword(!hidePassword)}
	  >
	  	{hidePassword ? <Text>Show password</Text> : <Text>Hide password</Text> }
	  </TouchableOpacity>

      <View style={styles.box_distance}>
        <TouchableOpacity onPress={handleLogin} style={styles.button_design}
	  >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.button_design}>
          <Text style={styles.buttonText}>Register New Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    password: '',
    confirmPassword: '',
    favoriteMovieCategory: '',
  });

  const [registeredUser, setRegisteredUser] = useState(null);
  const [hidePassword, setHidePassword] = useState(true);

  const handleChange = (field) => (value) => {
    if (field === 'age') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setForm({ ...form, [field]: numericValue });
    } else {
    setForm({ ...form, [field]: value });
  }
  };

  const handleAddUser = async () => {
    if (!form.email || !form.password || !form.confirmPassword || !form.name || !form.age || !form.favoriteMovieCategory) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      // 1. Fetch existing users array from storage
      const existingData = await AsyncStorage.getItem('@users_list');
      const usersList = existingData ? JSON.parse(existingData) : [];

      const updatedList = [...usersList, form];
      await AsyncStorage.setItem('@users_list', JSON.stringify(updatedList));

      // 3. Render saved details on-screen immediately
      setRegisteredUser(form);

      // 4. Reset form
      setForm({ 
        name: '', 
        email: '', 
        age: '', 
        password: '', 
        confirmPassword: '', 
        favoriteMovieCategory: '',
      });

      // 5. Wait 10 seconds (10000 ms) before switching screens
      setTimeout(() => {
        setRegisteredUser(null);
        navigation.navigate('MainHome');
      }, 10000);
    } catch (error) {
      Alert.alert('Error', 'Failed to save registration data.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.label}>Name:</Text>
      <TextInput style={styles.field} placeholder="Enter Name" value={form.name} onChangeText={handleChange('name')} />

      <Text style={styles.label}>Email:</Text>
      <TextInput style={styles.field} placeholder="Enter Email" value={form.email} onChangeText={handleChange('email')} autoCapitalize="none" />

      <Text style={styles.label}>Password:</Text>
      <TextInput style={styles.field} placeholder="Enter Password" value={form.password} onChangeText={handleChange('password')} secureTextEntry={hidePassword} />

      <Text style={styles.label}>Confirm Password:</Text>
      <TextInput
        style={styles.field}
        placeholder="Re-enter Password"
        value={form.confirmPassword}
        onChangeText={handleChange('confirmPassword')}
        secureTextEntry={hidePassword}
      />
	  <TouchableOpacity
		  onPress={() => setHidePassword(!hidePassword)}
	  >
	  	{hidePassword ? <Text>Show password</Text> : <Text>Hide password</Text> }
	  </TouchableOpacity>

      <Text style={styles.label}>Age:</Text>
      <TextInput style={styles.field} placeholder="Enter Age" value={form.age} onChangeText={handleChange('age')} keyboardType="numeric" />

      <Text style={styles.label}>Favorite Movie Category:</Text>
      <TextInput style={styles.field} placeholder="Enter Favorite Movie Category" value={form.favoriteMovieCategory} onChangeText={handleChange('favoriteMovieCategory')} />

      <View style={styles.box_distance}>
        <TouchableOpacity onPress={handleAddUser} style={styles.button_design}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.button_design}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Brief On-Screen Visual Feedback */}
      {registeredUser && (
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Registration Successful!</Text>
          <Text>Name: {registeredUser.name}</Text>
          <Text>Email: {registeredUser.email}</Text>
          <Text>Age: {registeredUser.age}</Text>
          <Text>Password: {registeredUser.password}</Text>
          <Text>Fav Category: {registeredUser.favoriteMovieCategory}</Text>
          <Text style={styles.redirectText}>Redirecting to Main Screen...</Text>
        </View>
      )}
    </View>
  );
}

function CashierScreen({ navigation }) {

}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ShowingScreen"
        screenOptions={{
          headerShown: true,
          header: () => <Header />,
        }}
      >
        <Stack.Screen name="ShowingScreen" component={ShowingScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Cashier" component={CashierScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  showingScreenContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 100,
    marginTop: 20,
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

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 8,
  },
  field: {
    width: 300,
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    paddingHorizontal: 10,
    marginTop: 4,
    fontSize: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  box_distance: {
    marginTop: 40,
  },
  button_design: {
    display: 'flex',
    marginTop: 10,
    borderColor: '#000',
    borderWidth: 1,
    padding: 5,
    width: 280,            
    height: 48,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',

  },
  successCard: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'green',
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
    width: 300,
  },
  successTitle: {
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 5,
  },
  redirectText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#555',
  },


 mainContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerBar: {
    width: '100%',
    height: 110,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 70,
    height: 35,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 140,
    height: 70,
    resizeMode: 'contain',
    margin: -15,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
});
