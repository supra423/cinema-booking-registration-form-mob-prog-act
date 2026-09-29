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
import { router, useLocalSearchParams } from 'expo-router'; // Direct router import
import { LoginScreenStyles } from '../src/Styles';
import Button from '../src/components/Button'; 

export default function LoginScreen() {
  const params = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  {/*ADMIN USER!!!!!! */}
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "admin123";
  const ADMIN_OBJ = {
    name: ADMIN_USERNAME,
    email: ADMIN_USERNAME,
    age: 21,
    password: ADMIN_PASSWORD,
    confirmPassword: ADMIN_PASSWORD,
    favoriteMovieCategory: 'Comedy',
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    {/** ADMIN USER LOGIN */}
    if (
      email === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD
    ) {
        await AsyncStorage.setItem('@active_user', JSON.stringify(ADMIN_OBJ));
        Alert.alert(
          'Success',
          `Welcome back, ${ADMIN_OBJ.name}!`,
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace({
                  pathname: '/',
                  params: {
                    movieId: params?.movieId ?? '',
                    user: JSON.stringify(ADMIN_OBJ),
                  },
                });
              },
            },
          ]
        );
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
        // 1. Store the active user session first
        await AsyncStorage.setItem('@active_user', JSON.stringify(matchedUser));
        // 2. Put the navigation INSIDE the Alert's onPress callback
        Alert.alert(
          'Success',
          `Welcome back, ${matchedUser.name}!`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigates ONLY after the user taps OK
                router.replace({
                  pathname: '/',
                  params: {
                    movieId: params?.movieId ?? '',
                    user: JSON.stringify(matchedUser),
                  },
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read login data.');
    }
  };

  return (
    <View style={LoginScreenStyles.container}>
      <TouchableOpacity
        style={LoginScreenStyles.backButton}
        onPress={() => router.back()}
      >
        <Text style={LoginScreenStyles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>
      <Text style={LoginScreenStyles.title}>Login</Text>

      <Text style={LoginScreenStyles.label}>Email</Text>
      <TextInput
        style={LoginScreenStyles.field}
        placeholder="Enter your email"
        placeholderTextColor="gray"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={LoginScreenStyles.label}>Password</Text>
      <TextInput
        secureTextEntry={hidePassword}
        textContentType={'password'}
        style={LoginScreenStyles.field}
        placeholder="Enter your password"
        placeholderTextColor="gray"
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
        <Text style={{ color: '#FFFFFF' }}>
          {hidePassword ? 'Show password' : 'Hide password'}
        </Text>
      </TouchableOpacity>

      <View style={LoginScreenStyles.box_distance}>
        {/** Login Button | button props */}
        <Button
          title="Login"
          onPress={handleLogin}
        />

        {/** Register New Account Button | button props */}
        <Button
          title="Register New Account"
          onPress={() => router.push('/RegisterScreen')}
        />
      </View>
    </View>
  );
}
