import { UserPreferenceUnionType } from "@prisma/client";
import prisma from "../prisma";
import { NonUser } from "../prisma-types";
import { defaultUserPreferences } from "../types";

export const Preferences = {
  getPreferences: async (user: NonUser | number) => {
    const prefs = await prisma.userPreference.findMany({
      where: {
        userId: typeof user === "number" ? user : user.id,
      },
    });

    const convertedPrefs = prefs.map((pref) => {
      const prefValue = pref.value;
      switch (pref.valueType) {
        case UserPreferenceUnionType.BOOLEAN:
          return {
            ...pref,
            value: prefValue === "true",
          };
        case UserPreferenceUnionType.NUMBER:
          return {
            ...pref,
            value: Number(prefValue),
          };
        default:
          return {
            ...pref,
            value: prefValue,
          };
      }
    });

    const userPreferences = Object.fromEntries(
      convertedPrefs.map((pref) => [pref.key, pref.value])
    );

    const mergedPreferences = {
      ...defaultUserPreferences,
      ...userPreferences,
    };

    return mergedPreferences;
  },
};
