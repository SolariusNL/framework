import Configuration from "@/types/Configuration";
// @ts-ignore
import data from "framework.yml";

export default function getConfig(): Configuration {
  if (!data) {
    throw new Error("Invalid configuration");
  }

  return data;
}
