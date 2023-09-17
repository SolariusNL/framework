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
  const response = await fetch(`${GEO_API}/${ip}/json`);
  const data = await response.json();
  return data;
};
