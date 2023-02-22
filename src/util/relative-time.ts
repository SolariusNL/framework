const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const generateTimeString = (value: number, unit: string) => {
    return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
  };

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return generateTimeString(minutes, "minute");
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return generateTimeString(hours, "hour");
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return generateTimeString(days, "day");
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return generateTimeString(months, "month");
  }

  const years = Math.floor(months / 12);
  return generateTimeString(years, "year");
};

export { getRelativeTime };
