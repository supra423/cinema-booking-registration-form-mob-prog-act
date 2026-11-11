import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Linking,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cinemas } from '../../src/models/cinema';

export default function Cinemas() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCinemaId, setSelectedCinemaId] = useState(null);

    useEffect(() => {
        AsyncStorage.getItem('@selected_cinema').then((storedCinema) => {
            if (storedCinema) {
                setSelectedCinemaId(JSON.parse(storedCinema).cinemaId);
            }
        });
    }, []);

    const filteredCinemas = cinemas.filter((cinema) =>
        `${cinema.name} ${cinema.address}`
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase())
    );

    const selectCinema = async (cinema) => {
        await AsyncStorage.setItem('@selected_cinema', JSON.stringify(cinema));
        setSelectedCinemaId(cinema.cinemaId);
        Alert.alert('Cinema selected', `${cinema.name} is now selected.`);
    };

    const openDirections = async (cinema) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${cinema.latitude},${cinema.longitude}`;
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            Linking.openURL(url);
        } else {
            Alert.alert('Directions unavailable', 'This device cannot open map links.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Cinemas</Text>
            <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search cinemas"
                placeholderTextColor="#888"
                style={styles.search}
            />
            <FlatList
                data={filteredCinemas}
                keyExtractor={(item) => item.cinemaId}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No cinemas found.</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.detail}>{item.address}</Text>
                        <Text style={styles.detail}>Open: {item.hours}</Text>
                        <Pressable style={styles.button} onPress={() => selectCinema(item)}>
                            <Text style={styles.buttonText}>
                                {selectedCinemaId === item.cinemaId ? 'Selected' : 'Select Cinema'}
                            </Text>
                        </Pressable>
                        <Pressable style={styles.secondaryButton} onPress={() => openDirections(item)}>
                            <Text style={styles.buttonText}>Directions</Text>
                        </Pressable>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = {
    container: { flex: 1, backgroundColor: '#101010', padding: 20 },
    title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
    search: { backgroundColor: '#fff', color: '#111', padding: 12, borderRadius: 6, marginBottom: 16 },
    list: { gap: 16, paddingBottom: 120 },
    card: { backgroundColor: '#1a1a1a', padding: 18, borderRadius: 8 },
    name: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    detail: { color: '#ccc', marginTop: 8 },
    empty: { color: '#ccc', textAlign: 'center', marginTop: 30 },
    button: { backgroundColor: '#d62828', padding: 13, alignItems: 'center', marginTop: 16 },
    secondaryButton: { backgroundColor: '#444', padding: 13, alignItems: 'center', marginTop: 8 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
};