import React, { useCallback, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
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
    <SafeAreaView style={HeaderStyles.headerBar}>
      <View style={HeaderStyles.headerContent}>
        <Text style={HeaderStyles.headerTitle}>SB Cinema</Text>

        {isLoggedIn && (
          <TouchableOpacity onPress={handleLogout}>
            <Text style={{ color: 'white' }}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}