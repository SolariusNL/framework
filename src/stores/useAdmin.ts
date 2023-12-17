import { AdminLayoutGroups, AdminLayoutTab } from "@/layouts/admin-layout";
import create from "zustand";

interface AdminStore {
  activeTab: AdminLayoutTab | null;
  activeGroup: AdminLayoutGroups | null;
  setActiveTab: (tab: AdminLayoutTab) => void;
  setActiveGroup: (group: AdminLayoutGroups) => void;
  sidebarOpened: boolean;
  setSidebarOpened: (opened: boolean) => void;
}

const useAdmin = create<AdminStore>((set) => ({
  activeTab: null,
  activeGroup: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveGroup: (group) => set({ activeGroup: group }),
  sidebarOpened: false,
  setSidebarOpened: (opened) => set({ sidebarOpened: opened }),
}));

export default useAdmin;
