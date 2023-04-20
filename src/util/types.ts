export type Primitive = string | number | bigint | boolean | null | undefined;

export type NestedKeysOf<T> = {
  [K in keyof T]: T[K] extends object
    ? // @ts-ignore - TS doesn't like the recursive type
      `${K}` | `${K}.${NestedKeysOf<T[K]>}`
    : // @ts-ignore - TS doesn't like the recursive type
      `${K}`;
}[keyof T];

export type NestedValuesOf<T> = {
  [K in keyof T]: T[K] extends object ? NestedValuesOf<T[K]> : T[K];
};

export type NestedEntriesOf<T> = {
  [K in keyof T]: T[K] extends object ? NestedEntriesOf<T[K]> : [K, T[K]];
}[keyof T];
