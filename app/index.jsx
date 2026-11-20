import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  // This tells Expo Router to immediately open your tabs layout on startup
  return <Redirect href="/(tabs)" />;
// TODO implement admin page, implement seat selection
  const [target, setTarget] = useState(null);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem('@active_user')
      .then((raw) => {
        if (!active) return;
        const user = raw ? JSON.parse(raw) : null;
        setTarget(user?.role === 'admin' ? '/(admin)' : '/(tabs)');
      })
      .catch(() => {
        if (active) setTarget('/(tabs)');
      });

    return () => {
      active = false;
    };
  }, []);

  if (!target) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#101010',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#D62828" />
      </View>
    );
  }

  return <Redirect href={target} />;
}
