import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { loadMovies } from '../../src/services/movieStorage';
import { cinemas, loadCinemas } from '../../src/models/cinema';
import {
  createShowtime,
  deleteShowtime,
  loadShowtimes,
  updateShowtime,
} from '../../src/services/showtimeStorage';

function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatSlot(isoString) {
  const dt = new Date(isoString);
  if (Number.isNaN(dt.getTime())) return isoString;
  return dt.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function AdminShowtimesScreen() {
  const [movies, setMovies] = useState([]);
  const [cinemaList, setCinemaList] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState(''); // '' = All cinemas
  const [dateStr, setDateStr] = useState(getTodayDateString);
  const [timeStr, setTimeStr] = useState('14:00');
  const [editingId, setEditingId] = useState(null);

  const refreshData = useCallback(async () => {
    const [storedMovies, storedCinemas, storedShowtimes] = await Promise.all([
      loadMovies(),
      loadCinemas(),
      loadShowtimes(),
    ]);
    const validMovies = storedMovies || [];
    const validCinemas = storedCinemas?.length ? storedCinemas : cinemas;

    setMovies(validMovies);
    setCinemaList(validCinemas);
    setShowtimes(storedShowtimes || []);

    if (!selectedMovieId && validMovies.length > 0) {
      setSelectedMovieId(String(validMovies[0].movieId));
    }
  }, [selectedMovieId]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const resetForm = () => {
    setEditingId(null);
    setDateStr(getTodayDateString());
    setTimeStr('14:00');
  };

  const handleSaveShowtime = async () => {
    if (!selectedMovieId) {
      Alert.alert('Failed to Save Showtime', 'Add a movie first before creating a showtime.');
      return;
    }

    try {
      if (editingId) {
        const cleanDate = dateStr.trim();
        const cleanTime = timeStr.trim();
        const [y, m, d] = cleanDate.split('-').map(Number);
        const [hr, min] = cleanTime.split(':').map(Number);
        const dt = new Date(y, (m || 1) - 1, d || 1, hr, min, 0, 0);

        if (
          !Number.isFinite(y) ||
          !Number.isFinite(m) ||
          !Number.isFinite(d) ||
          !Number.isFinite(hr) ||
          !Number.isFinite(min) ||
          Number.isNaN(dt.getTime()) ||
          hr > 23 ||
          min > 59
        ) {
          throw new Error('Use YYYY-MM-DD for date and HH:MM (24-hour) for time.');
        }

        const updated = await updateShowtime(editingId, {
          movieId: String(selectedMovieId),
          cinemaId: selectedCinemaId ? String(selectedCinemaId) : '',
          schedule: dt.toISOString(),
        });
        setShowtimes(updated);
        resetForm();
        Alert.alert('Showtime Updated', 'Screening schedule was updated.');
      } else {
        const updated = await createShowtime({
          movieId: selectedMovieId,
          cinemaId: selectedCinemaId,
          dateStr,
          timeStr,
        });
        setShowtimes(updated);
        resetForm();
        Alert.alert(
          'Showtime Created',
          'New screening schedule is now available for guests and members.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Failed to Save Showtime',
        error?.message || 'Could not save showtime.'
      );
    }
  };

  const handleStartEdit = (item) => {
    const dt = new Date(item.schedule);
    setEditingId(item.showtimeId);
    setSelectedMovieId(String(item.movieId));
    setSelectedCinemaId(item.cinemaId ? String(item.cinemaId) : '');
    if (!Number.isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      const hr = String(dt.getHours()).padStart(2, '0');
      const min = String(dt.getMinutes()).padStart(2, '0');
      setDateStr(`${y}-${m}-${d}`);
      setTimeStr(`${hr}:${min}`);
    }
  };

  const handleDelete = (showtimeId) => {
    Alert.alert('Delete Showtime', 'Remove this screening schedule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = await deleteShowtime(showtimeId);
            setShowtimes(updated);
            if (editingId === showtimeId) resetForm();
            Alert.alert('Showtime Deleted', 'Screening schedule removed.');
          } catch (error) {
            Alert.alert('Delete Failed', error?.message || 'Could not delete showtime.');
          }
        },
      },
    ]);
  };

  const filteredShowtimes = showtimes.filter(
    (s) => !selectedMovieId || String(s.movieId) === String(selectedMovieId)
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Showtime Tickets</Text>
        <Text style={styles.subtitle}>
          Create & manage screening schedules per movie
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>1. Select Movie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {movies.map((m) => {
              const active = String(m.movieId) === String(selectedMovieId);
              return (
                <TouchableOpacity
                  key={String(m.movieId)}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedMovieId(String(m.movieId))}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {m.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>2. Cinema Scope (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, selectedCinemaId === '' && styles.chipActive]}
              onPress={() => setSelectedCinemaId('')}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCinemaId === '' && styles.chipTextActive,
                ]}
              >
                All Cinemas
              </Text>
            </TouchableOpacity>
            {cinemaList.map((c) => {
              const active = String(c.cinemaId) === String(selectedCinemaId);
              return (
                <TouchableOpacity
                  key={String(c.cinemaId)}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedCinemaId(String(c.cinemaId))}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>3. Date (YYYY-MM-DD) & Time (HH:MM)</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="2026-11-21"
              placeholderTextColor="#888"
              value={dateStr}
              onChangeText={setDateStr}
            />
            <TextInput
              style={[styles.input, { width: 100 }]}
              placeholder="14:00"
              placeholderTextColor="#888"
              value={timeStr}
              onChangeText={setTimeStr}
            />
          </View>

          <View style={styles.row}>
            <Pressable style={styles.primaryBtn} onPress={handleSaveShowtime}>
              <Text style={styles.btnText}>
                {editingId ? 'Update Showtime' : '+ Create Showtime Ticket'}
              </Text>
            </Pressable>
            {editingId && (
              <Pressable style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Scheduled Showtimes ({filteredShowtimes.length})
        </Text>

        {filteredShowtimes.map((item) => {
          const movieObj = movies.find((m) => String(m.movieId) === String(item.movieId));
          const cinemaObj = cinemaList.find(
            (c) => String(c.cinemaId) === String(item.cinemaId)
          );

          return (
            <View key={item.showtimeId} style={styles.ticketItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ticketTitle}>
                  {movieObj?.title || `Movie #${item.movieId}`}
                </Text>
                <Text style={styles.ticketMeta}>
                  {formatSlot(item.schedule)} •{' '}
                  {cinemaObj ? cinemaObj.name : 'All Cinemas'}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBadge}
                  onPress={() => handleStartEdit(item)}
                >
                  <Text style={styles.badgeText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.delBadge}
                  onPress={() => handleDelete(item.showtimeId)}
                >
                  <Text style={styles.badgeText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  content: { padding: 16, paddingBottom: 120, gap: 10 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#aaa', fontSize: 14, marginBottom: 4 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 8 },
  card: {
    backgroundColor: '#1A1A1A',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  label: { color: '#ddd', fontSize: 13, fontWeight: '600', marginTop: 4 },
  chipRow: { flexDirection: 'row', marginVertical: 2 },
  chip: {
    backgroundColor: '#262626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#D62828' },
  chipText: { color: '#ccc', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 },
  input: {
    backgroundColor: '#fff',
    color: '#111',
    padding: 10,
    borderRadius: 6,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#D62828',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#475569',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 6,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  ticketItem: {
    backgroundColor: '#1A1A1A',
    borderLeftWidth: 4,
    borderLeftColor: '#D62828',
    padding: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ticketTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  ticketMeta: { color: '#bbb', fontSize: 12, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 6 },
  editBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  delBadge: {
    backgroundColor: '#991B1B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});