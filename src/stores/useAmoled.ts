import create from "zustand";

interface AmoledStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const useAmoled = create<AmoledStore>((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
}));

export default useAmoled;
