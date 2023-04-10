import create from "zustand";
import { combine } from "zustand/middleware";

/**
 * @todo
 * Work on integrating DismissibleContent
 */

export const MIC_KEY = "micId";

const getInitialState = () => {
  try {
    return localStorage.getItem(MIC_KEY) || "";
  } catch {
    return "";
  }
};

const useMicIdStore = create(
  combine(
    {
      micId: getInitialState(),
    },
    (set) => ({
      setMicId: (micId: string) => {
        set({ micId });
        try {
          localStorage.setItem(MIC_KEY, micId);
        } catch {}
      }
    })
  )
);

export default useMicIdStore;