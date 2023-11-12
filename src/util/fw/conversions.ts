export interface StorageConversions {
  bytesToKilobytes: (bytes: number) => number;
  bytesToMegabytes: (bytes: number) => number;
  bytesToGigabytes: (bytes: number) => number;
  bytesToTerabytes: (bytes: number) => number;
  kilobytesToBytes: (kilobytes: number) => number;
  megabytesToBytes: (megabytes: number) => number;
  gigabytesToBytes: (gigabytes: number) => number;
  terabytesToBytes: (terabytes: number) => number;
}

export const createStorageConversions = (unitSize: number) => ({
  bytesToKilobytes: (bytes: number) => bytes / unitSize,
  bytesToMegabytes: (bytes: number) => bytes / unitSize / unitSize,
  bytesToGigabytes: (bytes: number) => bytes / unitSize / unitSize / unitSize,
  bytesToTerabytes: (bytes: number) =>
    bytes / unitSize / unitSize / unitSize / unitSize,
  kilobytesToBytes: (kilobytes: number) => kilobytes * unitSize,
  megabytesToBytes: (megabytes: number) => megabytes * unitSize * unitSize,
  gigabytesToBytes: (gigabytes: number) =>
    gigabytes * unitSize * unitSize * unitSize,
  terabytesToBytes: (terabytes: number) =>
    terabytes * unitSize * unitSize * unitSize * unitSize,
});

export const Conversions = {
  storage: createStorageConversions(1024),
};
