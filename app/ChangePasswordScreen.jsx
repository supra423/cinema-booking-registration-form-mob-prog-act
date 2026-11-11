import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Button from '../src/components/Button';
import { LoginScreenStyles } from '../src/Styles';

export default function ChangePasswordScreen() {
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('@active_user').then((storedUser) => {
      setUser(storedUser ? JSON.parse(storedUser) : null);
    });
  }, []);

  const handleChangePassword = async () => {
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please complete all fields.');
      return;
    }

    if (user.password !== currentPassword) {
      Alert.alert('Error', 'Current password is incorrect.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    const updatedUser = { ...user, password: newPassword, confirmPassword: newPassword };
    const storedUsers = await AsyncStorage.getItem('@users_list');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    const updatedUsers = users.map((item) =>
      item.email === user.email ? updatedUser : item
    );

    await AsyncStorage.setItem('@active_user', JSON.stringify(updatedUser));
    await AsyncStorage.setItem('@users_list', JSON.stringify(updatedUsers));

    Alert.alert('Success', 'Password changed successfully.', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/profile') },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: '#101010' }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
    >
      <View style={LoginScreenStyles.container}>
        <Text style={LoginScreenStyles.title}>Change Password</Text>

        <Text style={LoginScreenStyles.label}>Current Password</Text>
        <TextInput
          secureTextEntry
          style={LoginScreenStyles.field}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
        />

        <Text style={LoginScreenStyles.label}>New Password</Text>
        <TextInput
          secureTextEntry
          style={LoginScreenStyles.field}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
        />

        <Text style={LoginScreenStyles.label}>Confirm New Password</Text>
        <TextInput
          secureTextEntry
          style={LoginScreenStyles.field}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
        />

        <Button title="Save Password" onPress={handleChangePassword} />
        <Button title="Cancel" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}
