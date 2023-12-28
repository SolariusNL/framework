export const Dates = {
  format(date: Date, formatString: string) {
    date = new Date(date);

    const months: string[] = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const padZero = (value: number, length: number) => {
      return value.toString().padStart(length, "0");
    };

    const formatTokens: { [key: string]: () => string } = {
      yyyy: () => date.getFullYear().toString(),
      yy: () => date.getFullYear().toString().slice(-2),
      MMMM: () => months[date.getMonth()],
      MM: () => padZero(date.getMonth() + 1, 2),
      dd: () => padZero(date.getDate(), 2),
      hh: () => padZero(date.getHours(), 2),
      mm: () => padZero(date.getMinutes(), 2),
      ss: () => padZero(date.getSeconds(), 2),
    };

    let formattedDate = formatString;
    for (const token in formatTokens) {
      if (Object.prototype.hasOwnProperty.call(formatTokens, token)) {
        formattedDate = formattedDate.replace(token, formatTokens[token]());
      }
    }

    return formattedDate;
  },
  prebuilt: {
    oneDay: 1000 * 60 * 60 * 24,
    oneHour: 1000 * 60 * 60,
    oneMinute: 1000 * 60,
    oneSecond: 1000,
    oneWeek: 1000 * 60 * 60 * 24 * 7,
    oneYear: 1000 * 60 * 60 * 24 * 365,
    oneMonth: 1000 * 60 * 60 * 24 * 30,
  },
};
