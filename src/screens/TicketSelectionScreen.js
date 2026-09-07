import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { movies } from '../models/movie';

export default function TicketSelectionScreen({ route }) {
  // const { movie, schedule } = route.params;
  const movie = movies.find(
	  ({movieId}) => movieId === route.params?.movieId
  );

  const schedule = movie.showSchedule;
  const [quantity, setQuantity] = useState(1);
  const total = quantity * movie.ticketPrice;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Tickets</Text>
      <Text style={styles.movie}>{movie.title}</Text>
      <Text style={styles.schedule}>{schedule.toLocaleString()}</Text>
      <Text style={styles.label}>Number of tickets</Text>
      <View style={styles.counter}>
        <TouchableOpacity style={styles.control} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
          <Text style={styles.controlText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity style={styles.control} onPress={() => setQuantity(quantity + 1)}>
          <Text style={styles.controlText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.price}>Price per ticket: {movie.ticketPrice}</Text>
      <Text style={styles.total}>Total: {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  movie: { color: '#fff', fontSize: 21, marginTop: 24 },
  schedule: { color: '#aaa', marginTop: 6 },
  label: { color: '#ddd', fontSize: 16, marginTop: 40 },
  counter: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  control: { width: 48, height: 48, backgroundColor: '#d62828', alignItems: 'center', justifyContent: 'center' },
  controlText: { color: '#fff', fontSize: 28 },
  quantity: { color: '#fff', fontSize: 24, width: 64, textAlign: 'center' },
  price: { color: '#bbb', fontSize: 16, marginTop: 30 },
  total: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 10 },
});
