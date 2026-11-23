import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Home, Film, Search, User } from "lucide-react-native";

function parseStoredUser(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const [activeRole, setActiveRole] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem("@active_user")
      .then((raw) => {
        if (!active) return;
        const user = parseStoredUser(raw);
        setActiveRole(user?.role || null);
        setSessionChecked(true);
      })
      .catch(() => {
        if (active) setSessionChecked(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!sessionChecked) return null;
  if (activeRole === "admin") return <Redirect href="/(admin)" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Transform the standard bar into an absolute floating pill
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 12),
          left: 20,
          right: 20,
          elevation: 8, // Android shadow
          backgroundColor: '#1E293B', // Slate dark card background
          borderRadius: 28,
          height: 64,
          borderTopWidth: 0, // Removes default iOS top border line
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          height: 64,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          color: '#94A3B8',
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 6,
        },
        tabBarActiveTintColor: '#94A3B8',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Home
              size={22}
              color="red"
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cinemas"
        options={{
          title: "Cinemas",
          tabBarIcon: ({ focused }) => (
            <Film
              size={22}
              color="red"
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="movieCatalogue"
        options={{
          title: "Search Movies",
          tabBarIcon: ({ focused }) => (
            <Search
              size={22}
              color="red"
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
      {/* Added the Profile tab- kyla */}

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <User
              size={22}
              color="red"
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}