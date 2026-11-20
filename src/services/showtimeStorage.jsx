import AsyncStorage from '@react-native-async-storage/async-storage';

const SHOWTIMES_KEY = '@custom_showtimes';

export async function loadShowtimes() {
  try {
    const raw = await AsyncStorage.getItem(SHOWTIMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error loading showtimes:', error);
    return [];
  }
}

export async function saveShowtimes(list) {
  await AsyncStorage.setItem(SHOWTIMES_KEY, JSON.stringify(list));
}

export async function createShowtime({
  movieId,
  cinemaId = '',
  dateStr,
  timeStr,
  ticketPrice,
}) {
  const cleanDate = String(dateStr || '').trim();
  const cleanTime = String(timeStr || '').trim();

  const dateMatch = cleanDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = cleanTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!dateMatch || !timeMatch) {
    throw new Error('Use YYYY-MM-DD for date and HH:MM (24-hour) for time.');
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  const dt = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    Number.isNaN(dt.getTime()) ||
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day ||
    hour > 23 ||
    minute > 59
  ) {
    throw new Error('Invalid screening date or time.');
  }

  const existing = await loadShowtimes();
  const isoSchedule = dt.toISOString();

  const duplicate = existing.some(
    (item) =>
      String(item.movieId) === String(movieId) &&
      String(item.cinemaId || '') === String(cinemaId || '') &&
      item.schedule === isoSchedule
  );
  if (duplicate) {
    throw new Error('That exact screening time already exists for this selection.');
  }

  const entry = {
    showtimeId: `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    movieId: String(movieId),
    cinemaId: cinemaId ? String(cinemaId) : '',
    schedule: isoSchedule,
    ticketPrice:
      ticketPrice !== undefined && ticketPrice !== '' && Number(ticketPrice) > 0
        ? Number(ticketPrice)
        : undefined,
  };

  const updated = [entry, ...existing];
  await saveShowtimes(updated);
  return updated;
}

export async function updateShowtime(showtimeId, patch) {
  const existing = await loadShowtimes();
  const updated = existing.map((item) =>
    item.showtimeId === showtimeId ? { ...item, ...patch } : item
  );
  await saveShowtimes(updated);
  return updated;
}

export async function deleteShowtime(showtimeId) {
  const existing = await loadShowtimes();
  const updated = existing.filter((item) => item.showtimeId !== showtimeId);
  await saveShowtimes(updated);
  return updated;
}