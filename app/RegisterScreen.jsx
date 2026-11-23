import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { RegisterScreenStyles } from '../src/Styles';
import Button from '../src/components/Button';
import { MoveLeft, Eye, EyeOff } from 'lucide-react-native';

const MOVIE_CATEGORIES = [
  'Action',
  'Adventure',
  'Animation',
  'Anime',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Superhero',
  'Thriller',
  'Western',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RegisterScreen() {
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
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollViewRef = useRef(null);
  const dropdownSectionRef = useRef(null);
  const redirectTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const filteredCategories = MOVIE_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleChange = (field) => (value) => {
    if (field === 'age') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setForm((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCategorySearch = (text) => {
    setSearchQuery(text);
    setForm((prev) => ({ ...prev, favoriteMovieCategory: text }));
    if (!isDropdownOpen) setIsDropdownOpen(true);
  };

  const handleSelectCategory = (category) => {
    setForm((prev) => ({ ...prev, favoriteMovieCategory: category }));
    setSearchQuery(category);
    setIsDropdownOpen(false);
  };

  const scrollToDropdown = () => {
    if (!dropdownSectionRef.current || !scrollViewRef.current) return;

    dropdownSectionRef.current.measureLayout(
      scrollViewRef.current,
      (x, y) => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, y - 20),
          animated: true,
        });
      },
      () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    );
  };

  const handleAddUser = async () => {
    if (isSubmitting) return;

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedCategory = form.favoriteMovieCategory.trim();
    const parsedAge = Number(form.age);

    if (
      !trimmedName ||
      !trimmedEmail ||
      !form.password ||
      !form.confirmPassword ||
      !form.age ||
      !trimmedCategory
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address (e.g., name@example.com).'
      );
      return;
    }

    if (form.password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters long.'
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 120.');
      return;
    }

    setIsSubmitting(true);

    try {
      const existingData = await AsyncStorage.getItem('@users_list');
      const parsedUsers = existingData ? JSON.parse(existingData) : [];
      const usersList = Array.isArray(parsedUsers) ? parsedUsers : [];

      const emailExists = usersList.some(
        (existingUser) =>
          String(existingUser?.email || '')
            .trim()
            .toLowerCase() === trimmedEmail
      );

      if (emailExists) {
        setIsSubmitting(false);
        Alert.alert('Error', 'An account with this email already exists.');
        return;
      }

      const createdUser = {
        name: trimmedName,
        email: trimmedEmail,
        age: String(parsedAge),
        password: form.password,
        favoriteMovieCategory: trimmedCategory,
        role: 'user',
        userId: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };

      const updatedList = [...usersList, createdUser];
      await AsyncStorage.setItem('@users_list', JSON.stringify(updatedList));
      await AsyncStorage.setItem('@active_user', JSON.stringify(createdUser));

      setRegisteredUser(createdUser);

      scrollTimeoutRef.current = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      redirectTimeoutRef.current = setTimeout(() => {
        setForm({
          name: '',
          email: '',
          age: '',
          password: '',
          confirmPassword: '',
          favoriteMovieCategory: '',
        });
        setSearchQuery('');
        setRegisteredUser(null);
        setIsSubmitting(false);

        router.replace({
          pathname: '/(tabs)',
          params: { user: JSON.stringify(createdUser) },
        });
      }, 5000);
    } catch (error) {
      console.log('AsyncStorage Error:', error);
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save registration data.');
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: '#101010' }}
      ref={scrollViewRef}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={() => {
        if (registeredUser) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
      >
        <View style={RegisterScreenStyles.container}>
          <TouchableOpacity
            style={RegisterScreenStyles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/LoginScreen');
              }
            }}
          >
            <MoveLeft size={32} color="#ffffff" />
          </TouchableOpacity>
          <Text style={RegisterScreenStyles.title}>Register</Text>

          <Text style={RegisterScreenStyles.label}>Name:</Text>
          <TextInput
            style={RegisterScreenStyles.field}
            placeholder="Enter Name"
            placeholderTextColor="gray"
            value={form.name}
            onChangeText={handleChange('name')}
          />

          <Text style={RegisterScreenStyles.label}>Email:</Text>
          <TextInput
            style={RegisterScreenStyles.field}
            placeholder="Enter Email (e.g. name@example.com)"
            placeholderTextColor="gray"
            value={form.email}
            onChangeText={handleChange('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={RegisterScreenStyles.label}>Password:</Text>
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
              style={[
                RegisterScreenStyles.field,
                { width: '100%', maxWidth: '100%', marginTop: 0, paddingRight: 44 },
              ]}
              placeholder="Enter Password (min. 6 chars)"
              placeholderTextColor="gray"
              value={form.password}
              onChangeText={handleChange('password')}
              secureTextEntry={hidePassword}
              autoCapitalize="none"
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

          <Text style={RegisterScreenStyles.label}>Confirm Password:</Text>
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
              style={[
                RegisterScreenStyles.field,
                { width: '100%', maxWidth: '100%', marginTop: 0, paddingRight: 44 },
              ]}
              placeholder="Re-enter Password"
              placeholderTextColor="gray"
              value={form.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              secureTextEntry={hideConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
              accessibilityLabel={
                hideConfirmPassword
                  ? 'Show confirm password'
                  : 'Hide confirm password'
              }
              style={{
                position: 'absolute',
                right: 10,
                padding: 6,
              }}
            >
              {hideConfirmPassword ? (
                <Eye size={22} color="#111111" />
              ) : (
                <EyeOff size={22} color="#111111" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={RegisterScreenStyles.label}>Age:</Text>
          <TextInput
            style={RegisterScreenStyles.field}
            placeholder="Enter Age"
            placeholderTextColor="gray"
            value={form.age}
            onChangeText={handleChange('age')}
            keyboardType="numeric"
            maxLength={3}
          />

          <Text style={RegisterScreenStyles.label}>Favorite Movie Category:</Text>
          <View
            ref={dropdownSectionRef}
            collapsable={false}
            style={{
              width: '90%',
              maxWidth: 360,
              alignSelf: 'center',
              zIndex: 1000,
            }}
          >
            <TextInput
              style={[RegisterScreenStyles.field, { width: '100%', maxWidth: '100%' }]}
              placeholder="Type or select a category"
              placeholderTextColor="gray"
              value={searchQuery}
              onChangeText={handleCategorySearch}
              onFocus={() => {
                setIsDropdownOpen(true);
                setTimeout(scrollToDropdown, 150);
              }}
            />

            {isDropdownOpen && (
              <View style={RegisterScreenStyles.dropdownContainer}>
                <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 150 }}>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={RegisterScreenStyles.dropdownItem}
                        onPress={() => handleSelectCategory(item)}
                      >
                        <Text style={RegisterScreenStyles.itemText}>{item}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <TouchableOpacity
                      style={RegisterScreenStyles.dropdownItem}
                      onPress={() =>
                        handleSelectCategory(`Others (${searchQuery.trim()})`)
                      }
                    >
                      <Text style={RegisterScreenStyles.othersText}>
                        Others (Use: &quot;{searchQuery.trim()}&quot;)
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={RegisterScreenStyles.box_distance}>
            <Button
              title={isSubmitting ? 'Creating Account...' : 'Create Account'}
              onPress={handleAddUser}
              disabled={isSubmitting}
            />
          </View>

          {registeredUser && (
            <View style={RegisterScreenStyles.successCard}>
              <Text style={RegisterScreenStyles.successTitle}>
                Registration Successful!
              </Text>
              <Text style={RegisterScreenStyles.label}>
                Name: {registeredUser.name}
              </Text>
              <Text style={RegisterScreenStyles.label}>
                Email: {registeredUser.email}
              </Text>
              <Text style={RegisterScreenStyles.label}>
                Age: {registeredUser.age}
              </Text>
              <Text style={RegisterScreenStyles.label}>
                Fav Category: {registeredUser.favoriteMovieCategory}
              </Text>

              <Text style={RegisterScreenStyles.redirectText}>
                Redirecting to Main Screen...
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}