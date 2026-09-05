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
import { LoginScreenStyles } from '../Styles';


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
    <View style={LoginScreenStyles.container}>
      <TouchableOpacity
        style={LoginScreenStyles.backButton}
        onPress={() => navigation.goBack()}
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
        {hidePassword ? <Text>Show password</Text> : <Text>Hide password</Text>}
      </TouchableOpacity>

      <View style={LoginScreenStyles.box_distance}>
        <TouchableOpacity onPress={handleLogin} style={LoginScreenStyles.button_design}>
          <Text style={LoginScreenStyles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={LoginScreenStyles.button_design}
        >
          <Text style={LoginScreenStyles.buttonText}>Register New Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
