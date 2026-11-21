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

function buildFallbackSchedules(fallbackDate, cinemaId) {
  const base = new Date(fallbackDate);
  const referenceTime = Number.isNaN(base.getTime()) ? Date.now() : base.getTime();
  const minFutureTime = Math.max(referenceTime, Date.now()) + 3 * 60 * 60 * 1000;

  const makeSlot = (targetMs, extraHours = 0) => {
    const dt = new Date(targetMs + extraHours * 60 * 60 * 1000);
    if (dt.getMinutes() > 0) {
      dt.setHours(dt.getHours() + 1);
    }
    dt.setMinutes(0, 0, 0);

    // Clamp to realistic mall hours (10:00 AM - 9:00 PM)
    if (dt.getHours() >= 22) {
      dt.setDate(dt.getDate() + 1);
      dt.setHours(13, 0, 0, 0);
    } else if (dt.getHours() < 10) {
      dt.setHours(13, 0, 0, 0);
    }

    if (cinemaId === 'sb-central') {
      dt.setHours(dt.getHours() + 1);
    }

    return dt.toISOString();
  };

  return [makeSlot(minFutureTime, 0), makeSlot(minFutureTime, 3)];
}

export function getShowtime(movieId, cinemaId, fallbackDate = new Date()) {
  const existingSchedule = showtimes.find(
    (item) => item.movieId === String(movieId) && item.cinemaId === String(cinemaId)
  );

  if (existingSchedule) {
    return existingSchedule;
  }

  return {
    movieId: String(movieId),
    cinemaId: String(cinemaId),
    ticketPrice: cinemaId === 'sb-central' ? 280 : 250,
    schedules: buildFallbackSchedules(fallbackDate, cinemaId),
  };
}