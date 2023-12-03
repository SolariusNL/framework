import { createHmac } from "crypto";
import { getServerConfig } from "./server-config";

export enum LicensePlans {
  BASIC_EDITION = "BASIC_EDITION",
  STANDARD_EDITION = "STANDARD_EDITION",
  ULTIMATE_EDITION = "ULTIMATE_EDITION",
  ENTERPRISE = "ENTERPRISE",
  ON_PREM = "ON_PREM",
}

export interface LicenseKeyData {
  plan: LicensePlans;
  name: string;
  email: string;
  country: string;
}

export class License {
  private static readonly secretKey = getServerConfig().licenseSecretKey;

  private static generateHash(data: string): string {
    const hash = createHmac("sha256", this.secretKey);
    hash.update(data);
    return hash.digest("hex");
  }

  static generateLicenseKey(data: LicenseKeyData): string {
    const serializedData = JSON.stringify(data);
    const hash = this.generateHash(serializedData);
    const encodedData = Buffer.from(serializedData).toString("base64");
    return `${encodedData}.${hash}`;
  }

  static validateLicenseKey(key: string): boolean {
    const [encodedData, receivedHash] = key.split(".");
    const decodedData = Buffer.from(encodedData, "base64").toString("utf-8");
    const calculatedHash = this.generateHash(decodedData);
    return receivedHash === calculatedHash;
  }

  static extractKeyInformation(key: string): LicenseKeyData | null {
    if (this.validateLicenseKey(key)) {
      const [encodedData] = key.split(".");
      const decodedData = Buffer.from(encodedData, "base64").toString("utf-8");
      return JSON.parse(decodedData) as LicenseKeyData;
    }
    return null;
  }
}
