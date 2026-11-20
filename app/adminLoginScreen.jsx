import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { AdminScreenStyles, LoginScreenStyles } from '../src/Styles';
import { MoveLeft } from 'lucide-react-native';


const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export default function AdminLoginScreen() {
  const params = useLocalSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const ADMIN_OBJ = {
    name: ADMIN_USERNAME,
    email: ADMIN_USERNAME,
    age: 21,
    password: ADMIN_PASSWORD,
    confirmPassword: ADMIN_PASSWORD,
    favoriteMovieCategory: 'Comedy',
    role: 'admin',
  };


  const handleAdminLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in both admin username and password.');
      return;
    }

    const targetPath = params?.movieId ? '/ViewMovie' : '/(admin)';

    if (
      username.trim().toLowerCase() === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD
    ) {
      try {
        await AsyncStorage.setItem('@active_user', JSON.stringify(ADMIN_OBJ));
        Alert.alert(
          'Success',
          `Welcome back, ${ADMIN_OBJ.name}!`,
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace({
                  pathname: targetPath,
                  params: {
                    movieId: params?.movieId ?? '',
                    user: JSON.stringify(ADMIN_OBJ),
                  },
                });
              },
            },
          ]
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to save admin login data.');
      }
    } else {
      Alert.alert('Login Failed', 'Invalid admin credentials.');
    }
  };

  return (
    <View style={LoginScreenStyles.container}>
      <TouchableOpacity
        style={LoginScreenStyles.backButton}
        onPress={() => router.replace('/LoginScreen')}
      >
        <MoveLeft size={32} color="#ffffff" />
      </TouchableOpacity>

      <View style={AdminScreenStyles.badge}>
        <Text style={AdminScreenStyles.badgeText}>ADMIN PORTAL</Text>
      </View>

      <Text style={LoginScreenStyles.title}>Admin Login</Text>

      <Text style={LoginScreenStyles.label}>Admin Username</Text>
      <TextInput
        style={LoginScreenStyles.field}
        placeholder="Enter admin username"
        placeholderTextColor="gray"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text style={LoginScreenStyles.label}>Password</Text>
      <TextInput
        secureTextEntry={hidePassword}
        textContentType="password"
        style={LoginScreenStyles.field}
        placeholder="Enter admin password"
        placeholderTextColor="gray"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        onPress={() => setHidePassword(!hidePassword)}
        style={{ marginTop: 10 }}
      >
        <Text style={{ color: '#FFFFFF' }}>
          {hidePassword ? 'Show password' : 'Hide password'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleAdminLogin}
        style={LoginScreenStyles.button_design}
        activeOpacity={0.8}
      >
        <Text style={LoginScreenStyles.buttonText}>
          Login as Admin
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/LoginScreen')}
        style={[AdminScreenStyles.secondaryButton, { marginTop: 12, width: '90%', maxWidth: 360, minHeight: 48 }]}
        activeOpacity={0.8}
      >
        <Text style={LoginScreenStyles.buttonText}>
          Back to User Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}