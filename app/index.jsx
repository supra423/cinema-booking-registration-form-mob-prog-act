import { Redirect } from 'expo-router';

export default function Index() {
  // This tells Expo Router to immediately open your tabs layout on startup
  return <Redirect href="/(tabs)" />;
}