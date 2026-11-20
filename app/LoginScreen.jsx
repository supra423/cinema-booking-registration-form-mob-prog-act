import React, { useState } from 'react';
import { Link } from 'expo-router';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { LoginScreenStyles } from '../src/Styles';
import { MoveLeft } from 'lucide-react-native';

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
    role: 'admin',
    age: 21,
    password: ADMIN_PASSWORD,
    confirmPassword: ADMIN_PASSWORD,
    favoriteMovieCategory: 'Comedy',
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    try {
      const storedUsers = await AsyncStorage.getItem('@users_list');
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];

      const matchedUser = usersList.find(
        (user) =>
          user.email?.toLowerCase() === email.trim().toLowerCase() &&
          user.password === password
      );

      if (matchedUser) {
        const activeUser = {
          ...matchedUser,
          role: 'user',
        };

        await AsyncStorage.setItem('@active_user', JSON.stringify(activeUser));

        const targetPath = params?.movieId ? '/ViewMovie' : '/(tabs)';

        Alert.alert(
          'Success',
          `Welcome back, ${activeUser.name}!`,
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace({
                  pathname: targetPath,
                  params: {
                    movieId: params?.movieId ?? '',
                    user: JSON.stringify(activeUser),
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
        onPress={() => router.replace('/(tabs)')}
      >
        <MoveLeft size={32} color="#ffffff" />
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
        textContentType="password"
        style={LoginScreenStyles.field}
        placeholder="Enter your password"
        placeholderTextColor="gray"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
        <Text style={{ color: '#FFFFFF', marginTop: 10 }}>
          {hidePassword ? 'Show password' : 'Hide password'}
        </Text>
      </TouchableOpacity>

      <Link href="/RegisterScreen" style={{ marginTop: 20, color: 'white' }}>
        <Text style={{ textDecorationLine: 'underline' }}>
          Don't have an account? Register here
        </Text>
      </Link>

      <TouchableOpacity
        onPress={handleLogin}
        style={LoginScreenStyles.button_design}
      >
        <Text style={LoginScreenStyles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
          onPress={() => router.push('/adminLoginScreen')}
          style={LoginScreenStyles.button_design}
      >
          <Text style={{ color: '#FFFFFF' }}>
            Login as Admin
          </Text>
      </TouchableOpacity>
    </View>
  );
}
