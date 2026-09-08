import React, { useCallback, useState } from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderStyles } from '../Styles';

export default function Header({ navigation }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@active_user').then((user) => {
        setIsLoggedIn(Boolean(user));
      });
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@active_user');
    setIsLoggedIn(false);

    navigation.reset({
      index: 0,
      routes: [{ name: 'ShowingScreen' }],
    });
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