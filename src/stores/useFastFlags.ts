import { GenericFastFlag } from "@/pages/api/flags/[[...params]]";
import IResponseBase from "@/types/api/IResponseBase";
import { FastFlagNames } from "@/util/types";
import { FastFlagUnionType, Prisma } from "@prisma/client";
import create from "zustand";
import fetchJson from "../util/fetch";

export type ReturnedFastFlag = Record<
  FastFlagNames,
  string | number | boolean | any[] | Record<string, any> | any
>;

interface FastFlagStore {
  flags: ReturnedFastFlag;
  rawFlags: GenericFastFlag[];
  setFlags: (GenericFastFlag: GenericFastFlag[]) => void;
  setRawFlags: (GenericFastFlag: GenericFastFlag[]) => void;
}

export const FLAGS: Array<
  {
    name: FastFlagNames;
  } & Prisma.FastFlagCreateInput
> = [
  {
    name: "disabled-settings",
    value: "[]",
    valueType: FastFlagUnionType.ARRAY,
    description:
      "Disable certain settings pages in circumstances where it may be necessary, to lock down certain features",
  },
  {
    name: "disabled-registration",
    value: "false",
    valueType: FastFlagUnionType.BOOLEAN,
    description: "Disable registration for the app",
  },
  {
    name: "maintenance",
    value: "false",
    valueType: FastFlagUnionType.BOOLEAN,
    description: "Enable maintenance mode",
  },
  {
    name: "disabled-chat",
    value: "false",
    valueType: FastFlagUnionType.BOOLEAN,
    description: "Disable chat for the app",
  },
  {
    name: "banner",
    value: JSON.stringify({
      enabled: false,
      message: "Welcome to Framework!",
    }),
    valueType: FastFlagUnionType.OBJECT,
    description: "Enable a system-wide banner",
  },
];

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
  setRawFlags: (flags) => {
    set({
      rawFlags: flags,
    });
  },
}));

export function fetchFlags() {
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
