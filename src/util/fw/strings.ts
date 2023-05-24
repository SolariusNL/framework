export const Strings = {
  pluralize(num: number, word: string) {
    return num === 1 ? word : `${word}s`;
  },
  limitLength(str: string, limit: number) {
    return str.length > limit ? `${str.slice(0, limit)}...` : str;
  },
};
