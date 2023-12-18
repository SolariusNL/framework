import fs, { copyFileSync, existsSync } from "fs";
import { join } from "path";
import { z } from "zod";
import cast from "./cast";

const componentBaseSchema = z.object({
  enabled: z.boolean(),
});
export const serverCfgSchema = z.object({
  port: z.number().int().positive(), // the port to run the server on
});

const configPath = join(process.cwd(), "server.json");
let cachedServerConfig: z.infer<typeof serverCfgSchema>;

const getServerConfig = () => {
  if (typeof window === "undefined") {
    if (cachedServerConfig && process.env.NODE_ENV !== "development") {
      return cachedServerConfig;
    }

    try {
      if (!existsSync(configPath)) {
        copyFileSync(join(process.cwd(), "server.example.json"), configPath);
      }
      const serverConfigJson = fs.readFileSync(configPath, "utf-8");
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
