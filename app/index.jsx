import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
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