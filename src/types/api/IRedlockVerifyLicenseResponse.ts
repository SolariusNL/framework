enum StudioKeyType {
  Unknown,
  Trial,
  Standard,
  Professional,
  Ultimate,
  Enterprise,
  Free,
}

interface IRedlockVerifyLicenseResponse {
  keyType: StudioKeyType;
  title?: string;
  traceId?: string;
  errors?: {
    [key: string]: [string];
  }[];
  message?: string;
}

export type { IRedlockVerifyLicenseResponse };
export { StudioKeyType };
