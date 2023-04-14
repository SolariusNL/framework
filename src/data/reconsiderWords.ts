import FuzzySet from "fuzzyset.js";

/**
 * These words do not express my personal views and are solely
 * used for moderation purposes.
 *
 * I do not condone the use of these words.
 */
const reconsiderWords = [
  "nigga",
  "nigger",
  "faggot",
  "faggit",
  "fagg0t",
  "niqqer",
  "n1gg3r",
  "whore",
  "n1gga",
  "tranny",
  "niggers",
  "faggots",
  "trannies",
  "whores",
];

interface RestrictionCheckResult {
  hasMatch: boolean;
  matchedWords: { word: string; matched: string; score: number }[];
}

function isRestricted(input: string): RestrictionCheckResult {
  const normalizedInput = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const words = normalizedInput.split(/\s+/);
  const matchedWords: RestrictionCheckResult["matchedWords"] = [];
  let hasMatch = false;
  words.forEach((word) => {
    const fuzzySet = FuzzySet(reconsiderWords);
    const fuzzyMatches = fuzzySet.get(word, null, 0.65);
    if (fuzzyMatches !== null) {
      hasMatch = true;
      fuzzyMatches.forEach((match) => {
        matchedWords.push({ word: word, matched: match[1], score: match[0] });
      });
    }
  });
  return { hasMatch, matchedWords };
}

export { isRestricted, reconsiderWords };
