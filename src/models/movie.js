export class Movie {
  constructor(title, ticketPrice, screeningSchedule, details = {}) {
    this.title = title;
    this.ticketPrice = ticketPrice;
    this.showSchedule = screeningSchedule;
    this.poster = details.poster || require('../../assets/dummy-img.png');
    this.trailerId = details.trailerId || 'dQw4w9WgXcQ';
    this.runtime = details.runtime || '2h 00m';
    this.releaseDate = details.releaseDate || screeningSchedule.toLocaleDateString('en-US');
    this.category = details.category || 'Drama';
    this.rating = details.rating || 'PG-13';
    this.cast = details.cast || ['Featured Cast'];
    this.synopsis = details.synopsis || 'Movie details will be available soon.';
  }

  getFormattedDate() {
    return this.showSchedule.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }
}

export const movies = [
  new Movie('Movie 0', 100, new Date(2026, 7, 25, 13, 0), {
    runtime: '2h 10m', category: 'Action', rating: 'PG-13',
    cast: ['Alex Rivera', 'Jamie Cruz'],
    synopsis: 'A determined team races against time to protect their city from an unexpected threat.',
  }),
  new Movie('Movie 1', 101, new Date(2026, 7, 26, 13, 0), {
    runtime: '1h 48m', category: 'Comedy', rating: 'PG',
    cast: ['Morgan Lee', 'Taylor Santos'],
    synopsis: 'An ordinary weekend becomes an unforgettable adventure when two friends take one wrong turn.',
  }),
  new Movie('Movie 2', 102, new Date(2026, 7, 27, 13, 0), {
    runtime: '2h 02m', category: 'Thriller', rating: 'R',
    cast: ['Riley Park', 'Casey Tan'],
    synopsis: 'A quiet investigation reveals a secret that someone will do anything to keep hidden.',
  }),
  new Movie('Movie 3', 103, new Date(2026, 7, 28, 13, 0), {
    runtime: '1h 55m', category: 'Fantasy', rating: 'PG',
    cast: ['Jordan Wells', 'Sam Flores'],
    synopsis: 'A young dreamer discovers a doorway to a world that needs one last impossible act of courage.',
  }),
  new Movie('Movie 4', 104, new Date(2026, 7, 29, 13, 0), {
    runtime: '2h 20m', category: 'Science Fiction', rating: 'PG-13',
    cast: ['Avery Kim', 'Drew Morgan'],
    synopsis: 'When the first signal from beyond Earth arrives, a small crew must decide whether to answer.',
  }),
];