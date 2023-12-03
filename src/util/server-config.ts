import fs from "fs";
import { z } from "zod";
import cast from "./cast";

const serverCfgSchema = z.object({
  components: z.object({
    "abuse-reports": z.object({
      runHostnameCheck: z.boolean().default(true), // check if the link belongs to the instance
      enabled: z.boolean().default(true), // enable or disable the component
      limit: z.object({
        count: z.number().default(5), // a user can report someone 5 times
        frequency: z.number().default(3200000), // for every {frequency}
      }),
    }),
  }),
  licenseSecretKey: z.string(), // the secret key used to generate license keys
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
