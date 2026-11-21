import React, { useCallback, useState } from 'react';
import { Redirect, Tabs, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function AdminTabIcon({ label }) {
  return (
    <Text style={{ color: '#F87171', fontSize: 18, fontWeight: '800' }}>
      {label}
    </Text>
  );
}

export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState('loading'); // 'loading' | 'admin' | 'denied'

  useFocusEffect(
    useCallback(() => {
      let active = true;

      AsyncStorage.getItem('@active_user')
        .then((raw) => {
          if (!active) return;
          const parsed = raw ? JSON.parse(raw) : null;
          setStatus(parsed?.role === 'admin' ? 'admin' : 'denied');
        })
        .catch(() => {
          if (active) setStatus('denied');
        });

      return () => {
        active = false;
      };
    }, [])
  );

  if (status === 'loading') return null;
  if (status === 'denied') return <Redirect href="/LoginScreen" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 12),
          left: 20,
          right: 20,
          elevation: 8,
          backgroundColor: '#1E293B',
          borderRadius: 28,
          height: 64,
          borderTopWidth: 0,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          height: 64,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 6,
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Admin Movies',
          tabBarIcon: () => <AdminTabIcon label="A" />,
        }}
      />
      <Tabs.Screen
        name="add-movie"
        options={{
          title: 'Add Movie',
          tabBarIcon: () => <AdminTabIcon label="+" />,
        }}
      />
      <Tabs.Screen
        name="showtimes"
        options={{
          title: 'Showtimes',
          tabBarIcon: () => <AdminTabIcon label="S" />,
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Bookings',
          tabBarIcon: () => <AdminTabIcon label="B" />,
        }}
      />
      <Tabs.Screen
        name="adminProfile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <AdminTabIcon label="P" />,
        }}
      />
    </Tabs>
  );
}