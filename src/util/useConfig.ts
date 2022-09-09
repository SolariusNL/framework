// @ts-ignore
import data from "../../framework.yml";

interface Configuration {
  features: {
    design: {
      test: boolean;
    };
  };
}

export default function useConfig(): Configuration {
  if (!data) {
    throw new Error("Invalid configuration");
  }

  return data;
}
