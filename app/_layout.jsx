import React from 'react';
import { Stack } from 'expo-router';
import Header from '../src/components/Header';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        // Correct signature for custom native-stack headers
        header: (props) => <Header {...props} />, 
      }}
    >
      {/* Root / Initial Screen (ShowingScreen) */}
      <Stack.Screen 
        name="index" 
        options={{ title: 'Now Showing' }} 
      />

      {/* Screen Routes */}
      <Stack.Screen 
        name="LoginScreen" 
        options={{ title: 'Login' }} 
      />
      <Stack.Screen 
        name="RegisterScreen" 
        options={{ title: 'Register' }} 
      />
      <Stack.Screen 
        name="ViewMovie" 
        options={{ title: 'Movie Details' }} 
      />
      <Stack.Screen 
        name="ScheduleScreen" 
        options={{ title: 'Showtimes' }} 
      />
      <Stack.Screen 
        name="TicketSelectionScreen" 
        options={{ title: 'Select Tickets' }} 
      />

      {/* Cashier / Payment Screen (Pop-up Modal) */}
      {/* <Stack.Screen 
        name="CashierScreen" 
        options={{ 
          presentation: 'modal', 
          title: 'Payment & Checkout' 
        }} 
      /> */}
    </Stack>
  );
}