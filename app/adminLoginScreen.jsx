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
import { MoveLeft, Eye, EyeOff } from 'lucide-react-native';

const ADMIN_ACCOUNT_KEY = '@admin_account';

const DEFAULT_ADMIN_ACCOUNT = {
  name: 'admin',
  username: 'admin',
  email: 'admin',
  age: 21,
  password: 'admin123',
  confirmPassword: 'admin123',
  favoriteMovieCategory: 'Comedy',
  role: 'admin',
};

function parseStoredJson(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

async function getOrSeedAdminAccount() {
  try {
    const raw = await AsyncStorage.getItem(ADMIN_ACCOUNT_KEY);
    const parsed = parseStoredJson(raw);
    if (parsed && parsed.password) {
      return {
        ...DEFAULT_ADMIN_ACCOUNT,
        ...parsed,
        username: parsed.username || parsed.name || DEFAULT_ADMIN_ACCOUNT.username,
        name: parsed.name || parsed.username || DEFAULT_ADMIN_ACCOUNT.name,
        role: 'admin',
      };
    }
    await AsyncStorage.setItem(ADMIN_ACCOUNT_KEY, JSON.stringify(DEFAULT_ADMIN_ACCOUNT));
    return DEFAULT_ADMIN_ACCOUNT;
  } catch {
    return DEFAULT_ADMIN_ACCOUNT;
  }
}

export default function AdminLoginScreen() {
  const params = useLocalSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const handleAdminLogin = async () => {
    const trimmedInput = username.trim();

    if (!trimmedInput || !password) {
      Alert.alert('Error', 'Please fill in both admin username and password.');
      return;
    }

    const targetPath = params?.movieId ? '/ViewMovie' : '/(admin)';
    const adminAccount = await getOrSeedAdminAccount();
    const normalizedInput = trimmedInput.toLowerCase();

    const storedUsername = String(adminAccount.username ?? adminAccount.name ?? '')
      .trim()
      .toLowerCase();
    const storedName = String(adminAccount.name ?? '').trim().toLowerCase();
    const storedEmail = String(adminAccount.email ?? '').trim().toLowerCase();

    const matchesIdentifier =
      normalizedInput === storedUsername ||
      normalizedInput === storedName ||
      (storedEmail && normalizedInput === storedEmail);

    if (matchesIdentifier && password === adminAccount.password) {
      const activeAdminSession = {
        ...adminAccount,
        role: 'admin',
      };

      try {
        await AsyncStorage.setItem(ADMIN_ACCOUNT_KEY, JSON.stringify(activeAdminSession));
        await AsyncStorage.setItem('@active_user', JSON.stringify(activeAdminSession));
        Alert.alert('Success', `Welcome back, ${activeAdminSession.name}!`, [
          {
            text: 'OK',
            onPress: () => {
              router.replace({
                pathname: targetPath,
                params: {
                  movieId: params?.movieId ?? '',
                  user: JSON.stringify(activeAdminSession),
                },
              });
            },
          },
        ]);
      } catch (error) {
        Alert.alert('Error', 'Failed to save admin login data.');
      }
    } else {
      Alert.alert('Login Failed', 'Invalid admin credentials.');
    }
  };

  const handleAdminForgotPassword = () => {
    Alert.alert(
      'Admin Password Recovery',
      'Admin credentials are stored dynamically in local app storage and can be updated from the Admin Profile settings.'
    );
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
      <View
        style={{
          width: '90%',
          maxWidth: 360,
          alignSelf: 'center',
          justifyContent: 'center',
          marginTop: 6,
        }}
      >
        <TextInput
          secureTextEntry={hidePassword}
          textContentType="password"
          style={[
            LoginScreenStyles.field,
            { width: '100%', maxWidth: '100%', marginTop: 0, paddingRight: 44 },
          ]}
          placeholder="Enter admin password"
          placeholderTextColor="gray"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setHidePassword(!hidePassword)}
          accessibilityLabel={hidePassword ? 'Show password' : 'Hide password'}
          style={{
            position: 'absolute',
            right: 10,
            padding: 6,
          }}
        >
          {hidePassword ? (
            <Eye size={22} color="#111111" />
          ) : (
            <EyeOff size={22} color="#111111" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleAdminForgotPassword}
        style={{
          width: '90%',
          maxWidth: 360,
          alignSelf: 'center',
          alignItems: 'flex-start',
          marginTop: 8,
        }}
      >
        <Text style={{ color: '#CCCCCC', textDecorationLine: 'underline' }}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleAdminLogin}
        style={LoginScreenStyles.button_design}
        activeOpacity={0.8}
      >
        <Text style={LoginScreenStyles.buttonText}>Login as Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/LoginScreen')}
        style={[
          AdminScreenStyles.secondaryButton,
          { marginTop: 12, width: '90%', maxWidth: 360, minHeight: 48 },
        ]}
        activeOpacity={0.8}
      >
        <Text style={LoginScreenStyles.buttonText}>Back to User Login</Text>
      </TouchableOpacity>
    </View>
  );
}