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
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.field}
        placeholder="Enter Name"
        value={form.name}
        onChangeText={handleChange('name')}
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.field}
        placeholder="Enter Email"
        value={form.email}
        onChangeText={handleChange('email')}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.field}
        placeholder="Enter Password"
        value={form.password}
        onChangeText={handleChange('password')}
        secureTextEntry={hidePassword}
      />

      <Text style={styles.label}>Confirm Password:</Text>
      <TextInput
        style={styles.field}
        placeholder="Re-enter Password"
        value={form.confirmPassword}
        onChangeText={handleChange('confirmPassword')}
        secureTextEntry={hidePassword}
      />
      <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
        {hidePassword ? <Text>Show password</Text> : <Text>Hide password</Text>}
      </TouchableOpacity>

      <Text style={styles.label}>Age:</Text>
      <TextInput
        style={styles.field}
        placeholder="Enter Age"
        value={form.age}
        onChangeText={handleChange('age')}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Favorite Movie Category:</Text>
      <TextInput
        style={styles.field}
        placeholder="Enter Favorite Movie Category"
        value={form.favoriteMovieCategory}
        onChangeText={handleChange('favoriteMovieCategory')}
      />

      <View style={styles.box_distance}>
        <TouchableOpacity onPress={handleAddUser} style={styles.button_design}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('LoginScreen')}
          style={styles.button_design}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 8,
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
});