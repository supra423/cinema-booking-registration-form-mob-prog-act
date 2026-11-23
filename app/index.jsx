import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

function parseStoredUser(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export default function Index() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem('@active_user')
      .then((raw) => {
        if (!active) return;
        const user = parseStoredUser(raw);
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