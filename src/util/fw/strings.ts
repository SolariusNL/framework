import { MANTINE_COLORS } from "@mantine/core";
import { HiEmojiHappy } from "react-icons/hi";

export const Strings = {
  pluralize(num: number, word: string) {
    return num === 1 ? word : `${word}s`;
  },
  limitLength(str: string, limit: number) {
    return str.length > limit ? `${str.slice(0, limit - 3)}...` : str;
  },
  initials(name: string) {
    const words = name.split(" ");
    let initials = "";

    for (let i = 0; i < words.length && initials.length < 2; i++) {
      const word = words[i];
      const firstAlphanumericChar = word.match(/[A-Za-z0-9]/);
      if (firstAlphanumericChar) {
        initials += firstAlphanumericChar[0];
      }
    }

    if (initials.length === 0) {
      return HiEmojiHappy({
        className: "text-sky-500",
      });
    }

    return initials.toUpperCase();
  },
  color(str: string) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }

    const index = Math.abs(hash) % MANTINE_COLORS.length;

    return MANTINE_COLORS[index];
  },
  upper(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  pascalToNormal(str: string) {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  },
  randomPhrase(): string {
    const randomWords: string[] = [
      "apple",
      "banana",
      "cherry",
      "date",
      "elderberry",
      "fig",
      "grape",
      "honeydew",
      "kiwi",
      "lemon",
      "mango",
      "nectarine",
      "orange",
      "papaya",
      "quince",
      "raspberry",
      "strawberry",
      "tangerine",
      "watermelon",
      "blueberry",
      "almond",
      "blackberry",
      "cantaloupe",
      "coconut",
      "dragonfruit",
      "grapefruit",
      "guava",
      "kiwifruit",
      "lime",
      "mulberry",
      "passionfruit",
      "peach",
      "pear",
      "pineapple",
      "plum",
      "pomegranate",
      "apricot",
      "avocado",
      "cranberry",
      "gooseberry",
      "lychee",
      "persimmon",
      "rhubarb",
      "starfruit",
      "boysenberry",
    ];

    const randomWord1 =
      randomWords[Math.floor(Math.random() * randomWords.length)];
    const randomWord2 =
      randomWords[Math.floor(Math.random() * randomWords.length)];
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    const phrase = `${randomWord1}-${randomWord2}-${randomNumber}`;

    return phrase;
  },
};
