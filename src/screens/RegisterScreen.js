import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  Platform,
  UIManager,
  findNodeHandle,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisterScreenStyles } from '../Styles';

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

  // Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollViewRef = useRef(null);

  // Ref to track the position of the dropdown container
  const dropdownSectionRef = useRef(null);

  // Filter categories based on search query
  const filteredCategories = MOVIE_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleChange = (field) => (value) => {
    if (field === 'age') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setForm({ ...form, [field]: numericValue });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleCategorySearch = (text) => {
    setSearchQuery(text);
    setForm({ ...form, favoriteMovieCategory: text });
    if (!isDropdownOpen) setIsDropdownOpen(true);
  };

  const handleSelectCategory = (category) => {
    setForm({ ...form, favoriteMovieCategory: category });
    setSearchQuery(category);
    setIsDropdownOpen(false);
  };

  // Scroll to make sure the dropdown input and full list are above the keyboard
  const scrollToDropdown = () => {
  if (!dropdownSectionRef.current || !scrollViewRef.current) return;

  const dropdownNode = findNodeHandle(dropdownSectionRef.current);
  const scrollNode = findNodeHandle(scrollViewRef.current);

  if (dropdownNode && scrollNode) {
    // Direct call via UIManager avoids the ref warning completely
    UIManager.measureLayout(
      dropdownNode,
      scrollNode,
      () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      },
      (x, y) => {
        scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
      }
    );
  } else {
    scrollViewRef.current?.scrollToEnd({ animated: true });
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

      // 3. Scroll to bottom when success card appears
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

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
      <ScrollView
        ref={scrollViewRef} // 4. Attach reference here
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
            if (registeredUser) {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }}
      >
		<KeyboardAvoidingView
		behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		style={{ flex: 1 }}
		>
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
			<View
			  ref={dropdownSectionRef}
			  collapsable={false} // Prevents Android from flattening the view layout node
			  style={{ zIndex: 1000 }}
			>
			  <TextInput
				style={RegisterScreenStyles.field}
				placeholder="Type or select a category"
				value={searchQuery}
				onChangeText={handleCategorySearch}
				onFocus={() => {
					setIsDropdownOpen(true);
					setTimeout(scrollToDropdown, 150); // Small delay to wait for keyboard display
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
						onPress={() => handleSelectCategory(`Others (${searchQuery})`)}
					  >
						<Text style={RegisterScreenStyles.othersText}>
						  Others (Use: "{searchQuery}")
						</Text>
					  </TouchableOpacity>
					)}
				  </ScrollView>
				</View>
			  )}
			</View>

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
		</KeyboardAvoidingView>
    </ScrollView>
  );
}
