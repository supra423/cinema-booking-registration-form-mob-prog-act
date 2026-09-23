import React, { useCallback, useState } from 'react';
import { TouchableOpacity, View, Text, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderStyles } from '../Styles';

export default function Header({ navigation }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@active_user').then((user) => {
        setIsLoggedIn(Boolean(user));
      });
    }, [])
  );

  const handleLogout = async () => {
    try {
      // 1. Remove user session from storage
      await AsyncStorage.removeItem('@active_user');

      // 2. Show the popup alert FIRST
      Alert.alert(
        'Logged Out',
        'You are now viewing as a Guest.',
        [
          {
            text: 'OK',
            onPress: () => {
              // 3. Reset local header state
              setIsLoggedIn(false);

              // 4. Navigate/Reload index.jsx in Guest mode
              router.replace('/');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('Logout Error', 'Could not complete logout.');
    }
  };

  return (
    //Kyla added logout button style and changed the header bar style to flex-end
    <SafeAreaView style={HeaderStyles.headerBar}>
      <View style={HeaderStyles.headerContent}>
        <Image
          source={require('../../assets/SILVER-BEAVERS-LOGO.png')}
          style={HeaderStyles.headerLogo}
        />
        <Text style={HeaderStyles.headerTitle}>SB Cinema</Text>

        {isLoggedIn && (
          <TouchableOpacity
            style={HeaderStyles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={HeaderStyles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}