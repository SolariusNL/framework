import create from "zustand";

interface UpdateDrawerStore {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

const useUpdateDrawer = create<UpdateDrawerStore>((set) => ({
  opened: false,
  setOpened: (opened) => set({ opened }),
}));

export default useUpdateDrawer;
