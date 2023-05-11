import usePreferences from "../stores/usePreferences";
import IResponseBase from "../types/api/IResponseBase";
import fetchJson from "./fetch";
import { UserPreferences } from "./types";

namespace Preferences {
  export async function getPreferences() {
    try {
      return await fetchJson<
        IResponseBase<{
          preferences: Record<UserPreferences, string | boolean | number>;
        }>
      >("/api/users/@me/preferences", {
        auth: true,
      });
    } catch {}
  }

  export async function setPreferences(
    pairs: Partial<Record<UserPreferences, string | boolean | number>>
  ) {
    try {
      for (const [key, value] of Object.entries(pairs)) {
        usePreferences
          .getState()
          .setPreference(
            key as UserPreferences,
            value as string | boolean | number
          );
      }

      return await fetchJson<IResponseBase<{}>>("/api/users/@me/preferences", {
        auth: true,
        method: "PATCH",
        body: pairs,
      });
    } catch {}
  }
}

export { Preferences };
