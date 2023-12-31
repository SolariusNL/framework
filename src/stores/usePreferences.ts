import { Preferences } from "@/util/preferences";
import { UserPreferences, defaultUserPreferences } from "@/util/types";
import create from "zustand";

export type PreferencesStore = {
  preferences: Record<UserPreferences, string | boolean | number>;
  setPreferences: (
    preferences: Record<UserPreferences, string | boolean | number>
  ) => void;
  setPreference: (
    key: UserPreferences,
    value: string | boolean | number
  ) => void;
};

const usePreferences = create<PreferencesStore>((set) => ({
  preferences: {} as Record<UserPreferences, string | boolean | number>,
  setPreferences: (preferences) => set({ preferences }),
  setPreference: (key, value) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        [key]: value,
      },
    })),
}));

function fetchPreferences() {
  Preferences.getPreferences().then((res) => {
    if (res?.success) {
      usePreferences.getState().setPreferences(res?.data!.preferences);
      // for (const key of Object.keys(defaultUserPreferences)) {
      //   if (
      //     !Object.keys(res?.data!.preferences).includes(key as UserPreferences)
      //   ) {
      //     usePreferences
      //       .getState()
      //       .setPreference(
      //         key as UserPreferences,
      //         defaultUserPreferences[key as UserPreferences]
      //       );
      //   }
      // }
    }
  });
}

fetchPreferences();

export default usePreferences;
