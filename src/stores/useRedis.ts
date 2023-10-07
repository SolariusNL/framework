import { RedisDatabase } from "@prisma/client";
import create from "zustand";

interface RedisStore {
  selectedDatabase: RedisDatabase | null;
  setSelectedDatabase: (database: RedisDatabase) => void;
  clearSelectedDatabase: () => void;
}

const useRedis = create<RedisStore>((set) => ({
  selectedDatabase: null,
  setSelectedDatabase: (database) => set({ selectedDatabase: database }),
  clearSelectedDatabase: () => set({ selectedDatabase: null }),
}));

export default useRedis;
