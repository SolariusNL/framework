import { RedisDatabase } from "@prisma/client";
import create from "zustand";

interface RedisStore {
  selectedDatabase: RedisDatabase | null;
  setSelectedDatabase: (database: RedisDatabase) => void;
  clearSelectedDatabase: () => void;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  refetch: () => void;
  setRefetch: (refetch: () => void) => void;
}

const useRedis = create<RedisStore>((set) => ({
  selectedDatabase: null,
  opened: false,
  setSelectedDatabase: (database) =>
    set({ selectedDatabase: database, opened: true }),
  clearSelectedDatabase: () => set({ selectedDatabase: null }),
  setOpened: (opened) => set({ opened }),
  refetch: () => undefined,
  setRefetch: (refetch) => set({ refetch }),
}));

export default useRedis;
