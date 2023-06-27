import create from "zustand";
import { NonUser } from "@/util/prisma-types";

interface CacheStore {
  cachedUsers: Record<number, { user: NonUser; timestamp: number }>;
  setCachedUser: (id: number, user: NonUser) => void;
  getCachedUser: (id: number) => {
    valid: (callback: (user: NonUser) => void) => void;
    expired: (callback: () => void) => void;
  };
}

const useCacheStore = create<CacheStore>((set) => ({
  cachedUsers: {},
  setCachedUser: (id, user) =>
    set((state) => ({
      cachedUsers: {
        ...state.cachedUsers,
        [id]: {
          user,
          timestamp: Date.now(),
        },
      },
    })),
  getCachedUser: (id) => ({
    valid: (callback) => {
      const cachedUser = useCacheStore.getState().cachedUsers[id];
      if (
        cachedUser &&
        cachedUser.timestamp + 1000 * 60 * 60 * 24 * 7 > Date.now()
      ) {
        callback(cachedUser.user);
      }
    },
    expired: (callback) => {
      const cachedUser = useCacheStore.getState().cachedUsers[id];
      if (
        !cachedUser ||
        cachedUser.timestamp + 1000 * 60 * 60 * 24 * 7 < Date.now()
      ) {
        callback();
      }
    },
  }),
}));

export default useCacheStore;
