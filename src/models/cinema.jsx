import AsyncStorage from '@react-native-async-storage/async-storage';

const CINEMAS_STORAGE_KEY = '@sb_cinemas';

export const cinemas = [
  {
    cinemaId: 'sb-downtown',
    name: 'SB Cinema Downtown Premier',
    address: 'C.M. Recto Ave., Cagayan de Oro City',
    hours: '10:00 AM - 10:00 PM',
    latitude: 8.4856,
    longitude: 124.6562,
  },
  {
    cinemaId: 'sb-uptown',
    name: 'SB Cinema Uptown Branch',
    address: 'Mastersons Ave., Upper Carmen, Cagayan de Oro City',
    hours: '10:00 AM - 10:00 PM',
    latitude: 8.4423,
    longitude: 124.6238,
  },
  {
    cinemaId: 'sb-centrio',
    name: 'SB Cinema Centrio Branch',
    address: 'C.M. Recto Ave. cor. Corrales St., Cagayan de Oro City',
    hours: '10:00 AM - 10:00 PM',
    latitude: 8.4847,
    longitude: 124.6514,
  },
  {
    cinemaId: 'sb-bulua',
    name: 'SB Cinema Bulua Branch',
    address: 'National Highway, Bulua, Cagayan de Oro City',
    hours: '10:00 AM - 9:00 PM',
    latitude: 8.5042,
    longitude: 124.6147,
  },
];

export async function loadCinemas() {
  try {
    const raw = await AsyncStorage.getItem(CINEMAS_STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(CINEMAS_STORAGE_KEY, JSON.stringify(cinemas));
      return cinemas;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : cinemas;
  } catch (error) {
    console.log('Error loading cinemas:', error);
    return cinemas;
  }
}

export async function addCinema({
  name,
  address,
  openingTime,
  closingTime,
  latitude = 8.4772,
  longitude = 124.6459,
}) {
  const current = await loadCinemas();
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const newCinema = {
    cinemaId: slug ? `${slug}-${Date.now().toString().slice(-4)}` : `sb-${Date.now()}`,
    name: name.trim(),
    address: address.trim() || 'Cagayan de Oro City',
    hours: `${openingTime.trim() || '10:00 AM'} - ${closingTime.trim() || '10:00 PM'}`,
    latitude: Number(latitude) || 8.4772,
    longitude: Number(longitude) || 124.6459,
  };

  const updated = [...current, newCinema];
  await AsyncStorage.setItem(CINEMAS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}