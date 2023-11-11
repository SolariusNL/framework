export interface StorageConversions {
  bytesToKilobytes: (bytes: number) => number;
  bytesToMegabytes: (bytes: number) => number;
  bytesToGigabytes: (bytes: number) => number;
  bytesToTerabytes: (bytes: number) => number;
}

export const createStorageConversions = (unitSize: number) => ({
  bytesToKilobytes: (bytes: number) => bytes / unitSize,
  bytesToMegabytes: (bytes: number) => bytes / unitSize / unitSize,
  bytesToGigabytes: (bytes: number) => bytes / unitSize / unitSize / unitSize,
  bytesToTerabytes: (bytes: number) =>
    bytes / unitSize / unitSize / unitSize / unitSize,
});

export const Conversions = {
  storage: createStorageConversions(1024),
};
