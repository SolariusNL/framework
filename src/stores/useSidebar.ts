import create from "zustand";

interface SidebarStore {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

const useSidebar = create<SidebarStore>((set) => ({
  opened: false,
  setOpened: (opened) => set({ opened }),
}));

export default useSidebar;
