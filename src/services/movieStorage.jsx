import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, movies as defaultMovies } from '../models/movie';

const MOVIES_KEY = '@movies_list';
export const MOVIES_API_URL = 'https://jsonfakery.com/movies/paginated?page=1';

function toIsoSchedule(value) {
  if (!value) return new Date().toISOString();
  if (typeof value.toISOString === 'function') return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
}

function sanitizePoster(rawPoster) {
  if (typeof rawPoster === 'number') {
    return rawPoster;
  }

  if (rawPoster && typeof rawPoster === 'object' && typeof rawPoster.uri === 'string') {
    const uri = rawPoster.uri.trim();
    // Skip huge inline data URIs that can bloat SQLite rows
    if (!uri || uri.startsWith('data:image')) return undefined;
    return { uri };
  }

  if (typeof rawPoster === 'string') {
    const trimmed = rawPoster.trim();
    if (!trimmed || trimmed.startsWith('data:image')) return undefined;
    return { uri: trimmed };
  }

  return undefined;
}

export function normalizeMovie(item) {
  if (!item || typeof item !== 'object') {
    return new Movie(String(Date.now()), 'Untitled Movie', 250, new Date());
  }

  const showSchedule = new Date(item.showSchedule || Date.now());
  const cast = Array.isArray(item.cast)
    ? item.cast
    : Array.isArray(item.casts)
      ? item.casts.map((actor) => actor?.name ?? actor).filter(Boolean)
      : [];

  const category = Array.isArray(item.genres)
    ? item.genres.map((genre) => genre?.name ?? genre).filter(Boolean).join(', ')
    : item.category ?? item.genre ?? 'Uncategorized';

  const poster = sanitizePoster(
    item.poster ?? item.posterUrl ?? item.poster_url ?? item.poster_path
  );

  const parsedPrice = Number(item.ticketPrice ?? 250);
  const ticketPrice =
    Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : 250;
  const apiData = item.apiData ?? {
    popularity: item.popularity,
    vote_average: item.vote_average,
    original_language: item.original_language,
  };

  return new Movie(
    String(item.movieId ?? item.movie_id ?? item.id ?? Date.now()),
    item.title ?? item.original_title ?? item.name ?? 'Untitled Movie',
    ticketPrice,
    showSchedule,
    {
      poster,
      trailerId: item.trailerId ?? '',
      runtime: item.runtime ?? '2h 00m',
      releaseDate:
        item.releaseDate ??
        item.release_date ??
        showSchedule.toISOString().slice(0, 10),
      category,
      rating: item.rating ?? 'PG',
      cast,
      synopsis: typeof item.synopsis === 'string'
        ? item.synopsis
        : typeof item.overview === 'string'
          ? item.overview
          : '',
      apiData,
      popularity: item.popularity,
      voteAverage: item.vote_average,
    }
  );
}

export async function saveMovies(movieList) {
  const list = Array.isArray(movieList) ? movieList : [];
  const serialized = list.map((movie) => ({
    movieId: String(movie.movieId),
    title: movie.title,
    ticketPrice: Number(movie.ticketPrice) > 0 ? Number(movie.ticketPrice) : 250,
    showSchedule: toIsoSchedule(movie.showSchedule),
    poster: sanitizePoster(movie.poster),
    trailerId: movie.trailerId ?? '',
    runtime: movie.runtime ?? '2h 00m',
    releaseDate: movie.releaseDate,
    category: movie.category,
    rating: movie.rating,
    cast: Array.isArray(movie.cast) ? movie.cast : [],
    synopsis: movie.synopsis ?? '',
    apiData: movie.apiData ?? null,
    popularity: movie.popularity ?? movie.apiData?.popularity ?? null,
    voteAverage: movie.voteAverage ?? movie.apiData?.vote_average ?? null,
  }));

  await AsyncStorage.setItem(MOVIES_KEY, JSON.stringify(serialized));
}

export async function loadMovies() {
  try {
    const stored = await AsyncStorage.getItem(MOVIES_KEY);
    if (!stored) {
      return defaultMovies;
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizeMovie) : defaultMovies;
  } catch (error) {
    console.warn('Failed to load @movies_list, resetting corrupted/oversized entry:', error);
    try {
      await AsyncStorage.removeItem(MOVIES_KEY);
    } catch (_) {
      // ignore cleanup error
    }
    return defaultMovies;
  }
}

export async function fetchMoviesFromApi() {
  const response = await fetch(MOVIES_API_URL);

  if (!response.ok) {
    throw new Error(`Movie API request failed: ${response.status}`);
  }

  const payload = await response.json();
  const apiMovies = Array.isArray(payload?.data) ? payload.data : [];

  return apiMovies.filter((item) => !item.adult).map(normalizeMovie);
}