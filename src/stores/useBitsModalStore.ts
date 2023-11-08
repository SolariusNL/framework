import create from "zustand";
import { combine } from "zustand/middleware";

export const BITS_KEY = "bits-modal";

interface BitsModalStore {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

const getInitialState = () => {
  try {
    return JSON.parse(localStorage.getItem(BITS_KEY) || "{}");
  } catch {
    return "";
  }
};

const useBitsModalStore = create<BitsModalStore>(
  combine(
    {
      opened: getInitialState().opened || false,
    },
    (set) => ({
      setOpened: (opened) => {
        set({ opened });
        try {
          localStorage.setItem(
            BITS_KEY,
            JSON.stringify({
              ...getInitialState(),
              opened,
            })
          );
        } catch {}
      },
    })
  )
);

export default useBitsModalStore;
