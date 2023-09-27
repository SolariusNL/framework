export const cron = {
  minutes: {
    everyMinute: "* * * * *",
    everyFiveMinutes: "*/5 * * * *",
    everyTenMinutes: "*/10 * * * *",
    everyFifteenMinutes: "*/15 * * * *",
  },
  hours: {
    everyHour: "0 * * * *",
    everySixHours: "0 */6 * * *",
    everyTwelveHours: "0 */12 * * *",
    midnight: "0 0 * * *",
  },
  daysOfWeek: {
    weeklyOnSunday: "0 0 * * 0",
    weeklyOnMonday: "0 0 * * 1",
    weeklyOnTuesday: "0 0 * * 2",
    weeklyOnWednesday: "0 0 * * 3",
    weeklyOnThursday: "0 0 * * 4",
    weeklyOnFriday: "0 0 * * 5",
    weeklyOnSaturday: "0 0 * * 6",
  },
  daysOfMonth: {
    monthlyOn1st: "0 0 1 * *",
    monthlyOn15th: "0 0 15 * *",
    daily: "0 0 * * *",
  },
  months: {
    quarterly: "0 0 1 */3 *",
    biannual: "0 0 1 1,7 *",
  },
};