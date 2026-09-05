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
import { RegisterScreenStyles } from '../Styles';

export default function RegisterScreen({ navigation }) {
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
    if (
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.name ||
      !form.age ||
      !form.favoriteMovieCategory
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const existingData = await AsyncStorage.getItem('@users_list');
      const usersList = existingData ? JSON.parse(existingData) : [];

      const updatedList = [...usersList, form];
      await AsyncStorage.setItem('@users_list', JSON.stringify(updatedList));

      setRegisteredUser(form);

      setTimeout(() => {
        const newUser = { ...form };
        setForm({
          name: '',
          email: '',
          age: '',
          password: '',
          confirmPassword: '',
          favoriteMovieCategory: '',
        });
        setRegisteredUser(null);

        navigation.navigate('ShowingScreen', { user: newUser });
      }, 10000);
    } catch (error) {
      console.log('AsyncStorage Error:', error);
      Alert.alert('Error', 'Failed to save registration data.');
    }
  };

  return (
    <View style={RegisterScreenStyles.container}>
      <Text style={RegisterScreenStyles.title}>Register</Text>
      <Text style={RegisterScreenStyles.label}>Name:</Text>
      <TextInput
        style={RegisterScreenStyles.field}
        placeholder="Enter Name"
        value={form.name}
        onChangeText={handleChange('name')}
      />

      <Text style={RegisterScreenStyles.label}>Email:</Text>
      <TextInput
        style={RegisterScreenStyles.field}
        placeholder="Enter Email"
        value={form.email}
        onChangeText={handleChange('email')}
        autoCapitalize="none"
      />

      <Text style={RegisterScreenStyles.label}>Password:</Text>
      <TextInput
        style={RegisterScreenStyles.field}
        placeholder="Enter Password"
        value={form.password}
        onChangeText={handleChange('password')}
        secureTextEntry={hidePassword}
      />

      <Text style={RegisterScreenStyles.label}>Confirm Password:</Text>
      <TextInput
        style={RegisterScreenStyles.field}
        placeholder="Re-enter Password"
        value={form.confirmPassword}
        onChangeText={handleChange('confirmPassword')}
        secureTextEntry={hidePassword}
      />
      <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
        {hidePassword ? <Text>Show password</Text> : <Text>Hide password</Text>}
      </TouchableOpacity>

      <Text style={RegisterScreenStyles.label}>Age:</Text>
      <TextInput
        style={RegisterScreenStyles.field}
        placeholder="Enter Age"
        value={form.age}
        onChangeText={handleChange('age')}
        keyboardType="numeric"
      />

      <Text style={RegisterScreenStyles.label}>Favorite Movie Category:</Text>
      <TextInput
        style={RegisterScreenStyles.field}
        placeholder="Enter Favorite Movie Category"
        value={form.favoriteMovieCategory}
        onChangeText={handleChange('favoriteMovieCategory')}
      />

      <View style={RegisterScreenStyles.box_distance}>
        <TouchableOpacity onPress={handleAddUser} style={RegisterScreenStyles.button_design}>
          <Text style={RegisterScreenStyles.buttonText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('LoginScreen')}
          style={RegisterScreenStyles.button_design}
        >
          <Text style={RegisterScreenStyles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {registeredUser && (
        <View style={RegisterScreenStyles.successCard}>
          <Text style={RegisterScreenStyles.successTitle}>Registration Successful!</Text>
          <Text>Name: {registeredUser.name}</Text>
          <Text>Email: {registeredUser.email}</Text>
          <Text>Age: {registeredUser.age}</Text>
          <Text>Password: {registeredUser.password}</Text>
          <Text>Fav Category: {registeredUser.favoriteMovieCategory}</Text>

          <Text style={RegisterScreenStyles.redirectText}>Redirecting to Main Screen...</Text>
        </View>
      )}
    </View>
  );
}
