function abbreviateNumber(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1000000000) {
    return (value / 1000000000).toFixed(1).replace(/\.0$/, "") + "G";
  }
  if (abs >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (abs >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return value;
}

export default abbreviateNumber;
