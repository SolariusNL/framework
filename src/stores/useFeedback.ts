import create from "zustand";

interface FeedbackStore {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

const useFeedback = create<FeedbackStore>((set) => ({
  opened: false,
  setOpened: (opened) => set({ opened }),
}));

export default useFeedback;
