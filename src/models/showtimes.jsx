const dates = {
  '0000': ['2026-08-25T13:00:00.000Z', '2026-08-25T16:00:00.000Z'],
  '0001': ['2026-08-26T13:00:00.000Z', '2026-08-26T16:00:00.000Z'],
  '0002': ['2026-08-27T13:00:00.000Z', '2026-08-27T16:00:00.000Z'],
  '0003': ['2026-08-28T13:00:00.000Z', '2026-08-28T16:00:00.000Z'],
  '0004': ['2026-08-29T13:00:00.000Z', '2026-08-29T16:00:00.000Z'],
  '0005': ['2026-08-30T13:00:00.000Z', '2026-08-30T16:00:00.000Z'],
};

export const showtimes = Object.entries(dates).flatMap(([movieId, schedules]) => [
  {
    cinemaId: 'sb-mall',
    movieId,
    ticketPrice: 250,
    schedules,
  },
  {
    cinemaId: 'sb-central',
    movieId,
    ticketPrice: 280,
    schedules: schedules.map((schedule) =>
      new Date(new Date(schedule).getTime() + 60 * 60 * 1000).toISOString()
    ),
  },
]);
