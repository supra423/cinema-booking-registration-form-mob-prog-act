import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';

const PAYMENT_METHODS = [
  {
    id: 'in_person',
    title: 'Pay in Person',
    description: 'Pay at the cinema counter before your screening.',
  },
  {
    id: 'cashless',
    title: 'Cashless Payment',
    description: 'Choose this if you plan to pay digitally. No payment is processed in this demo.',
  },
];

export default function PaymentScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const [booking, setBooking] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const storedBookings = await AsyncStorage.getItem('@bookings');
        const bookings = storedBookings ? JSON.parse(storedBookings) : [];
        const foundBooking = bookings.find(
          (item) => String(item.bookingId) === String(bookingId)
        );
        setBooking(foundBooking || null);
      } catch (error) {
        Alert.alert('Error', 'Could not load your booking details.');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const confirmPaymentMethod = async () => {
    if (!selectedMethod || !booking) return;

    setSaving(true);
    try {
      const storedBookings = await AsyncStorage.getItem('@bookings');
      const bookings = storedBookings ? JSON.parse(storedBookings) : [];
      const bookingIndex = bookings.findIndex(
        (item) => String(item.bookingId) === String(booking.bookingId)
      );

      if (bookingIndex === -1) {
        Alert.alert('Booking not found', 'Your booking could not be updated.');
        return;
      }

      const updatedBooking = {
        ...bookings[bookingIndex],
        paymentMethod: selectedMethod,
        paymentStatus: 'pending',
        paymentUpdatedAt: new Date().toISOString(),
      };
      bookings[bookingIndex] = updatedBooking;
      await AsyncStorage.setItem('@bookings', JSON.stringify(bookings));
      setBooking(updatedBooking);

      const methodTitle = PAYMENT_METHODS.find(
        (method) => method.id === selectedMethod
      )?.title;
      Alert.alert(
        'Payment option saved',
        `${methodTitle} was selected. Payment is still pending.`,
        [{ text: 'Done', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Could not save your payment option. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#D62828" size="large" />
        <Text style={styles.mutedText}>Loading booking...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Booking Not Found</Text>
        <Text style={styles.mutedText}>Return to ticket selection and try again.</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>CINEMA CHECKOUT</Text>
      <Text style={styles.title}>Choose how to pay</Text>
      <Text style={styles.subtitle}>
        Your seats are reserved. Select a payment option to continue.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.movieTitle}>{booking.movieTitle}</Text>
        <Text style={styles.summaryText}>
          {booking.quantity} ticket{booking.quantity === 1 ? '' : 's'}
          {booking.seats?.length ? ` · Seats ${booking.seats.join(', ')}` : ''}
        </Text>
        <Text style={styles.total}>Total: ₱{booking.total}</Text>
      </View>

      <Text style={styles.sectionTitle}>Payment method</Text>
      {PAYMENT_METHODS.map((method) => {
        const selected = selectedMethod === method.id;
        return (
          <TouchableOpacity
            key={method.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => setSelectedMethod(method.id)}
            style={[styles.methodCard, selected && styles.methodCardSelected]}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.radioDot} /> : null}
            </View>
            <View style={styles.methodCopy}>
              <Text style={styles.methodTitle}>{method.title}</Text>
              <Text style={styles.methodDescription}>{method.description}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        disabled={!selectedMethod || saving}
        style={[
          styles.primaryButton,
          (!selectedMethod || saving) && styles.disabledButton,
        ]}
        onPress={confirmPaymentMethod}
      >
        <Text style={styles.primaryButtonText}>
          {saving ? 'Saving...' : 'Confirm Payment Option'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  content: { padding: 20, paddingBottom: 48 },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  eyebrow: {
    color: '#D62828',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#BBBBBB', fontSize: 15, lineHeight: 22, marginTop: 8 },
  summaryCard: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 10,
    padding: 18,
    marginTop: 24,
  },
  movieTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '700' },
  summaryText: { color: '#BBBBBB', marginTop: 8, lineHeight: 20 },
  total: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginTop: 14 },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  methodCardSelected: { borderColor: '#D62828', backgroundColor: '#241516' },
  radio: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#888888',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  radioSelected: { borderColor: '#D62828' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D62828' },
  methodCopy: { flex: 1 },
  methodTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  methodDescription: { color: '#AAAAAA', fontSize: 13, lineHeight: 19, marginTop: 5 },
  primaryButton: {
    backgroundColor: '#D62828',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  disabledButton: { opacity: 0.5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  mutedText: { color: '#BBBBBB', textAlign: 'center', marginTop: 12 },
});
