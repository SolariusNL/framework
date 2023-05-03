import create from "zustand";
import { GenericFastFlag } from "../pages/api/flags/[[...params]]";
import IResponseBase from "../types/api/IResponseBase";
import fetchJson from "../util/fetch";

type FastFlagNames =
  | "disabled-settings"
  | "disabled-registration"
  | "maintenance"
  | "disabled-chat"
  | "banner";

type ReturnedFastFlag = Record<
  FastFlagNames,
  string | number | boolean | any[] | Record<string, any> | any
>;

interface FastFlagStore {
  flags: ReturnedFastFlag;
  rawFlags: GenericFastFlag[];
  setFlags: (GenericFastFlag: GenericFastFlag[]) => void;
}

const useFastFlags = create<FastFlagStore>((set) => ({
  flags: {} as ReturnedFastFlag,
  setFlags: (flags) => {
    const returnedFlags: ReturnedFastFlag | any = {} as ReturnedFastFlag;
    for (const flag of flags) {
      switch (flag.valueType) {
        case "STRING":
          returnedFlags[flag.name] = flag.value as string;
          break;
        case "NUMBER":
          returnedFlags[flag.name] = Number(flag.value);
          break;
        case "BOOLEAN":
          returnedFlags[flag.name] = flag.value === "true" ? true : false;
          break;
        case "ARRAY":
          returnedFlags[flag.name] = JSON.parse(flag.value as string);
          break;
        case "OBJECT":
          returnedFlags[flag.name] = JSON.parse(flag.value as string);
          break;
      }
    }

    set({
      flags: returnedFlags,
    });
  },
  rawFlags: [],
}));

function fetchFlags() {
  fetchJson<IResponseBase<{ flags: GenericFastFlag[] }>>("/api/flags", {
    auth: false,
  })
    .then((res) => {
      if (res.success) {
        useFastFlags.getState().setFlags(res.data?.flags || []);
        useFastFlags.getState().rawFlags = res.data?.flags || [];
      }
    })
    .catch(() => {});
}

fetchFlags();
setInterval(fetchFlags, 1000 * 60 * 5);
if (typeof window !== "undefined") {
  window.addEventListener("focus", fetchFlags);
}

export default useFastFlags;
