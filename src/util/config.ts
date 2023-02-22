// @ts-ignore
import data from "../../framework.yml";
import Configuration from "../types/Configuration";

export default function useConfig(): Configuration {
  if (!data) {
    throw new Error("Invalid configuration");
  }

  return data;
}
