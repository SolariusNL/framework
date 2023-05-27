export const Dates = {
  format(date: Date, formatString: string) {
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
};
