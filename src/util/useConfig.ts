// @ts-ignore
import data from "../../framework.yml";

interface SocialLink {
  show: boolean;
  url: string;
}

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

  footer: {
    links: Array<{
      sectionName: string;
      links: Array<{
        label: string;
        url: string;
      }>;
    }>;

    socials: {
      twitter: SocialLink;
      youtube: SocialLink;
      instagram: SocialLink;
    };
  };
}

export default function useConfig(): Configuration {
  if (!data) {
    throw new Error("Invalid configuration");
  }

  return data;
}
