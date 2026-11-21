function ensureDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export class Movie {
  constructor(movieId, title, ticketPrice, showSchedule, details = {}) {
    const scheduleDate = ensureDate(showSchedule);

    this.movieId = movieId;
    this.title = title;
    this.ticketPrice = ticketPrice;
    this.showSchedule = scheduleDate;
    this.poster = details.poster || require('../../assets/dummy-img.png');
    this.trailerId = details.trailerId || 'dQw4w9WgXcQ';
    this.runtime = details.runtime || '2h 00m';
    this.releaseDate =
      details.releaseDate || scheduleDate.toLocaleDateString('en-US');
    this.category = details.category || 'Uncategorized';
    this.rating = details.rating || 'PG-13';
    this.cast = details.cast || ['Featured Cast'];
    this.synopsis = details.synopsis || 'Movie details will be available soon.';
    this.apiData = details.apiData || null;
    this.popularity = details.popularity ?? null;
    this.voteAverage = details.voteAverage ?? null;
  }

  getFormattedDate() {
    return ensureDate(this.showSchedule).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }
}

export const movies = [];