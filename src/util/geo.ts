import logger from "./logger";

const GEO_API = "https://ipapi.co";

export type Geolocation = {
  ip: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  languages: string;
  asn: string;
  org: string;
  error?: boolean;
};

export const getIPAddressGeolocation = async (
  ip: string
): Promise<Geolocation> => {
  if (ip === "::ffff:127.0.0.1")
    return {
      error: true,
    } as Geolocation;

  const apiKey = process.env.IPAPI_KEY;
  const response = await fetch(
    `${GEO_API}/${ip}/json${apiKey ? `?key=${apiKey}` : ""}`
  );
  const data = await response.json();
  logger().debug(`Geolocation for ${ip}:\n\t${JSON.stringify(data, null, 2)}`);
  return data;
};
