export const Strings = {
  pluralize(num: number, word: string) {
    return num === 1 ? word : `${word}s`;
  },
};
