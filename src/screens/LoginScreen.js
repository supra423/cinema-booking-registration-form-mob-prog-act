import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    try {
      const storedUsers = await AsyncStorage.getItem('@users_list');
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];

      const matchedUser = usersList.find(
        (user) =>
          user.email.toLowerCase() === email.trim().toLowerCase() &&
          user.password === password
      );

      if (matchedUser) {
        await AsyncStorage.setItem('@active_user', JSON.stringify(matchedUser));
        Alert.alert('Success', `Welcome back, ${matchedUser.name}!`);
        navigation.navigate('ShowingScreen', { user: matchedUser });
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read login data.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>
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
      <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
        {hidePassword ? <Text>Show password</Text> : <Text>Hide password</Text>}
      </TouchableOpacity>

      <View style={styles.box_distance}>
        <TouchableOpacity onPress={handleLogin} style={styles.button_design}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.button_design}
        >
          <Text style={styles.buttonText}>Register New Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 8,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    padding: 8,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
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
  field: {
    width: 300,
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    paddingHorizontal: 10,
    marginTop: 4,
    fontSize: 20,
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
});