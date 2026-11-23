import React, { useCallback, useState } from 'react';
import { Redirect, Tabs, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clapperboard,
  PlusCircle,
  CalendarClock,
  Ticket,
  User,
} from 'lucide-react-native';

function parseStoredUser(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
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
          const parsed = parseStoredUser(raw);
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
          paddingHorizontal: 6,
          elevation: 8,
          backgroundColor: '#1E293B',
          borderRadius: 28,
          height: 64,
          borderTopWidth: 0,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          flex: 1,
          minWidth: 0,
          height: 64,
          paddingHorizontal: 2,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
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
          title: 'Movies',
          tabBarIcon: ({ focused }) => (
            <Clapperboard
              size={21}
              color="red"
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-movie"
        options={{
          title: 'Add Movie',
          tabBarIcon: ({ focused }) => (
            <PlusCircle
              size={21}
              color="red"
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="showtimes"
        options={{
          title: 'Showtimes',
          tabBarIcon: ({ focused }) => (
            <CalendarClock
              size={21}
              color="red"
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ focused }) => (
            <Ticket
              size={21}
              color="red"
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="adminProfile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <User
              size={21}
              color="red"
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}