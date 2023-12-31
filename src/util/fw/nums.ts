export const Nums = {
  convertToDuration: (num: number) => {
    const roundedNum = Math.round(num);
    const mins = roundedNum / 60;
    const roundedMins = Math.round(mins * 100) / 100;

    return `${roundedMins} mins`;
  },
  beautify: (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
};
