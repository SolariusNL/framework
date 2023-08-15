export const Nums = {
  convertToDuration: (num: number) => {
    const roundedNum = Math.round(num);
    const mins = roundedNum / 60;
    const roundedMins = Math.round(mins * 100) / 100;

    return `${roundedMins} mins`;
  },
};
