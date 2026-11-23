import React, { useState } from 'react';
import { Link } from 'expo-router';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { LoginScreenStyles } from '../src/Styles';
import { MoveLeft, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const params = useLocalSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Forgot Password state
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [hideNewPassword, setHideNewPassword] = useState(true);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier || !password) {
      Alert.alert('Error', 'Please fill in both email/username and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const storedUsers = await AsyncStorage.getItem('@users_list');
      const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const usersList = Array.isArray(parsedUsers) ? parsedUsers : [];
      const normalized = trimmedIdentifier.toLowerCase();

      // Prefer exact email match first so an email never collides with another user's name
      const emailMatches = usersList.filter(
        (user) => String(user?.email || '').trim().toLowerCase() === normalized
      );

      const candidateUsers =
        emailMatches.length > 0
          ? emailMatches
          : usersList.filter(
              (user) =>
                String(user?.username || '').trim().toLowerCase() === normalized ||
                String(user?.name || '').trim().toLowerCase() === normalized
            );

      const matchedUser = candidateUsers.find((user) => user?.password === password);

      if (matchedUser) {
        const activeUser = {
          ...matchedUser,
          role: 'user',
        };

        await AsyncStorage.setItem('@active_user', JSON.stringify(activeUser));

        const targetPath = params?.movieId
          ? params?.cinemaId && params?.schedule
            ? '/TicketSelectionScreen'
            : '/ViewMovie'
          : '/(tabs)';

        Alert.alert('Success', `Welcome back, ${activeUser.name}!`, [
          {
            text: 'OK',
            onPress: () => {
              setIsLoggingIn(false);
              router.replace({
                pathname: targetPath,
                params: {
                  movieId: params?.movieId ?? '',
                  cinemaId: params?.cinemaId ?? '',
                  schedule: params?.schedule ?? '',
                  ticketPrice: params?.ticketPrice ?? '',
                  quantity: params?.quantity ?? '',
                  selectedSeats: params?.selectedSeats ?? '',
                  user: JSON.stringify(activeUser),
                },
              });
            },
          },
        ]);
      } else {
        setIsLoggingIn(false);
        Alert.alert('Login Failed', 'Invalid email/username or password.');
      }
    } catch (error) {
      setIsLoggingIn(false);
      Alert.alert('Error', 'Failed to read login data.');
    }
  };

  const openForgotModal = () => {
    setResetIdentifier(identifier.trim());
    setNewPassword('');
    setConfirmNewPassword('');
    setHideNewPassword(true);
    setForgotModalVisible(true);
  };

  const handleResetPassword = async () => {
    const normalized = resetIdentifier.trim().toLowerCase();

    if (!normalized || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please complete all password reset fields.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    try {
      const storedUsers = await AsyncStorage.getItem('@users_list');
      const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const usersList = Array.isArray(parsedUsers) ? parsedUsers : [];

      const matchingIndices = usersList
        .map((user, idx) => ({ user, idx }))
        .filter(({ user }) => {
          const emailMatch = String(user?.email || '').trim().toLowerCase() === normalized;
          const usernameMatch = String(user?.username || '').trim().toLowerCase() === normalized;
          const nameMatch = String(user?.name || '').trim().toLowerCase() === normalized;
          return emailMatch || usernameMatch || nameMatch;
        })
        .map(({ idx }) => idx);

      if (matchingIndices.length === 0) {
        Alert.alert(
          'Not Found',
          'No registered account found with that email or username.'
        );
        return;
      }

      const updatedUsers = usersList.map((user, idx) =>
        matchingIndices.includes(idx)
          ? {
              ...user,
              password: newPassword,
            }
          : user
      );

      await AsyncStorage.setItem('@users_list', JSON.stringify(updatedUsers));

      if (identifier.trim().toLowerCase() === normalized) {
        setPassword('');
      }

      setForgotModalVisible(false);
      Alert.alert(
        'Password Updated',
        'Your password has been reset. You can now log in.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password.');
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

      <Text style={LoginScreenStyles.label}>Email or Username</Text>
      <TextInput
        style={LoginScreenStyles.field}
        placeholder="Enter your email or username"
        placeholderTextColor="gray"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        autoCorrect={false}
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
          placeholder="Enter your password"
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
        onPress={openForgotModal}
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

      <Link href="/RegisterScreen" style={{ marginTop: 20, color: 'white' }}>
        <Text style={{ textDecorationLine: 'underline' }}>
          Don't have an account? Register here
        </Text>
      </Link>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoggingIn}
        style={LoginScreenStyles.button_design}
      >
        <Text style={LoginScreenStyles.buttonText}>
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/adminLoginScreen')}
        style={LoginScreenStyles.button_design}
      >
        <Text style={LoginScreenStyles.buttonText}>Login as Admin</Text>
      </TouchableOpacity>

      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.75)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 380,
              backgroundColor: '#1E1E1E',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <Text
              style={[LoginScreenStyles.title, { fontSize: 22, marginBottom: 12 }]}
            >
              Reset Password
            </Text>

            <Text style={LoginScreenStyles.label}>Registered Email or Username</Text>
            <TextInput
              style={[LoginScreenStyles.field, { width: '100%', maxWidth: '100%' }]}
              placeholder="Enter email or username"
              placeholderTextColor="gray"
              value={resetIdentifier}
              onChangeText={setResetIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={LoginScreenStyles.label}>New Password</Text>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: 6,
              }}
            >
              <TextInput
                secureTextEntry={hideNewPassword}
                style={[
                  LoginScreenStyles.field,
                  { width: '100%', maxWidth: '100%', marginTop: 0, paddingRight: 44 },
                ]}
                placeholder="Enter new password"
                placeholderTextColor="gray"
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                onPress={() => setHideNewPassword(!hideNewPassword)}
                accessibilityLabel={
                  hideNewPassword ? 'Show new password' : 'Hide new password'
                }
                style={{ position: 'absolute', right: 10, padding: 6 }}
              >
                {hideNewPassword ? (
                  <Eye size={22} color="#111111" />
                ) : (
                  <EyeOff size={22} color="#111111" />
                )}
              </TouchableOpacity>
            </View>

            <Text style={LoginScreenStyles.label}>Confirm New Password</Text>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: 6,
              }}
            >
              <TextInput
                secureTextEntry={hideNewPassword}
                style={[
                  LoginScreenStyles.field,
                  { width: '100%', maxWidth: '100%', marginTop: 0, paddingRight: 44 },
                ]}
                placeholder="Confirm new password"
                placeholderTextColor="gray"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
              <TouchableOpacity
                onPress={() => setHideNewPassword(!hideNewPassword)}
                accessibilityLabel={
                  hideNewPassword
                    ? 'Show confirm new password'
                    : 'Hide confirm new password'
                }
                style={{ position: 'absolute', right: 10, padding: 6 }}
              >
                {hideNewPassword ? (
                  <Eye size={22} color="#111111" />
                ) : (
                  <EyeOff size={22} color="#111111" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleResetPassword}
              style={[
                LoginScreenStyles.button_design,
                { width: '100%', maxWidth: '100%', marginTop: 16 },
              ]}
            >
              <Text style={LoginScreenStyles.buttonText}>Save New Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setForgotModalVisible(false)}
              style={{ marginTop: 12, alignItems: 'center', padding: 8 }}
            >
              <Text style={{ color: '#CCCCCC' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}