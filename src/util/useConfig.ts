// @ts-ignore
import data from "../../framework.yml";

interface Configuration {
  features: {
    additional: {
      ukraine: {
        enabled: boolean;
        supportText: string;
        supportUrl: string;
      };
    };
  };
}

export default function useConfig(): Configuration {
  if (!data) {
    throw new Error("Invalid configuration");
  }

  return data;
}
