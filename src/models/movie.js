export class Movie {
  constructor(title, ticketPrice, screeningSchedule) {
    this.title = title;
    this.ticketPrice = ticketPrice;
    this.showSchedule = screeningSchedule;
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
  new Movie('Movie 0', 100, new Date(2026, 7, 25, 13, 0)),
  new Movie('Movie 1', 101, new Date(2026, 7, 26, 13, 0)),
  new Movie('Movie 2', 102, new Date(2026, 7, 27, 13, 0)),
  new Movie('Movie 3', 103, new Date(2026, 7, 28, 13, 0)),
  new Movie('Movie 4', 104, new Date(2026, 7, 29, 13, 0)),
];