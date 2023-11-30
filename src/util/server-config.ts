import fs from "fs";
import { z } from "zod";
import cast from "./cast";

const serverCfgSchema = z.object({
  components: z.object({
    "abuse-reports": z.object({
      runHostnameCheck: z.boolean(),
      enabled: z.boolean(),
    }),
  }),
});

let cachedServerConfig: z.infer<typeof serverCfgSchema>;

const getServerConfig = () => {
  if (typeof window === "undefined") {
    if (cachedServerConfig && process.env.NODE_ENV !== "development") {
      return cachedServerConfig;
    }

    try {
      const serverConfigJson = fs.readFileSync("server.json", "utf-8");
      cachedServerConfig = serverCfgSchema.parse(JSON.parse(serverConfigJson));
      return cachedServerConfig;
    } catch (error) {
      console.error(
        "Error reading or validating server.json:",
        cast<Error>(error).message
      );
      throw error;
    }
  } else {
    console.error("Attempted to load server configuration on client");
    throw Error("Attempted to load server config on client");
  }
};

export { getServerConfig };
