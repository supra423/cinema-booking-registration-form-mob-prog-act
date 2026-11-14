import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, movies as defaultMovies } from '../models/movie';

const MOVIES_KEY = '@movies_list';
export const MOVIES_API_URL = 'https://jsonfakery.com/movies/paginated?page=1';

export function normalizeMovie(item) {
  const showSchedule = new Date(
    item.showSchedule || Date.now()
  );

  const cast = item.cast ?? item.casts?.map((actor) => actor.name);
  const category = Array.isArray(item.genres)
    ? item.genres.map((genre) => genre.name ?? genre).join(', ')
    : item.category ?? item.genre ?? 'Uncategorized';
  const poster =
    item.poster && typeof item.poster === 'object'
      ? item.poster
      : item.poster || item.poster_url || item.poster_path
        ? { uri: item.poster || item.poster_url || item.poster_path }
        : undefined;

  return new Movie(
    String(item.movieId ?? item.movie_id ?? item.id),
    item.title ?? item.original_title ?? item.name ?? 'Untitled Movie',
    Number(item.ticketPrice ?? 250),
    showSchedule,
    {
      poster,
      trailerId: item.trailerId,
      runtime: item.runtime,
      releaseDate: item.releaseDate ?? item.release_date,
      category,
      rating: item.rating,
      cast,
      synopsis: item.synopsis ?? item.overview,
      apiData: item.apiData ?? item,
    }
  );
}

export async function saveMovies(movieList) {
  const serialized = movieList.map((movie) => ({
    movieId: movie.movieId,
    title: movie.title,
    ticketPrice: movie.ticketPrice,
    showSchedule: movie.showSchedule ? new Date(movie.showSchedule).toISOString() : null,
    poster: movie.poster,
    trailerId: movie.trailerId,
    runtime: movie.runtime,
    releaseDate: movie.releaseDate,
    category: movie.category,
    rating: movie.rating,
    cast: movie.cast,
    synopsis: movie.synopsis,
    apiData: movie.apiData,
  }));

  await AsyncStorage.setItem(MOVIES_KEY, JSON.stringify(serialized));
}

export async function loadMovies() {
  const stored = await AsyncStorage.getItem(MOVIES_KEY);

  if (!stored) {
    return defaultMovies;
  }

  return JSON.parse(stored).map(normalizeMovie);
}

export async function fetchMoviesFromApi() {
  const response = await fetch(MOVIES_API_URL);

  if (!response.ok) {
    throw new Error(`Movie API request failed: ${response.status}`);
  }

  const payload = await response.json();
  const apiMovies = Array.isArray(payload.data) ? payload.data : [];

  return apiMovies.filter((item) => !item.adult).map(normalizeMovie);
}