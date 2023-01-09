import create from "zustand";
import { User } from "../util/prisma-types";

interface AuthorizedUserStore {
  user: User | null;
  setUser: (user: User) => void;
  setProperty(property: keyof User, value: User[keyof User]): void;
}

const useAuthorizedUserStore = create<AuthorizedUserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  setProperty: (property, value) =>
    set((state) => ({
      user: {
        ...state.user!,
        [property]: value,
      },
    })),
}));

export default useAuthorizedUserStore;
