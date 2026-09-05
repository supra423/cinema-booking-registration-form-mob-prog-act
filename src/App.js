import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Header from './components/Header';
import ShowingScreen from './screens/ShowingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { ShowingScreenStyles } from './Styles';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
	<NavigationContainer>
	  <Stack.Navigator
		initialRouteName="ShowingScreen"
		screenOptions={{
		  headerShown: true,
		  header: () => <Header />,
		}}
	  >
	  {/*TODO dapat naa nay CashierScreen for the payment smth2
		  it should pop-up when user that has already logged/registered in
		  presses on a movie*/}
		<Stack.Screen name="ShowingScreen" component={ShowingScreen} />
		<Stack.Screen name="LoginScreen" component={LoginScreen} />
		<Stack.Screen name="Register" component={RegisterScreen} />
	  </Stack.Navigator>
	</NavigationContainer>
  );
}
