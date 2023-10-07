import { RedisDatabase } from "@prisma/client";
import create from "zustand";

interface RedisStore {
  selectedDatabase: RedisDatabase | null;
  setSelectedDatabase: (database: RedisDatabase) => void;
  clearSelectedDatabase: () => void;
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

const useRedis = create<RedisStore>((set) => ({
  selectedDatabase: null,
  opened: false,
  setSelectedDatabase: (database) =>
    set({ selectedDatabase: database, opened: true }),
  clearSelectedDatabase: () => set({ selectedDatabase: null }),
  setOpened: (opened) => set({ opened }),
}));

export default useRedis;
