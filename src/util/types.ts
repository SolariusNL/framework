import { NonUser } from "@/util/prisma-types";
import { MANTINE_COLORS } from "@mantine/core";
import { CatalogItemType, Prisma } from "@prisma/client";

export type Primitive = string | number | bigint | boolean | null | undefined;

export type NestedKeysOf<T> = {
  [K in keyof T]: T[K] extends object
    ? // @ts-ignore - TS doesn't like the recursive type
      `${K}` | `${K}.${NestedKeysOf<T[K]>}`
    : // @ts-ignore - TS doesn't like the recursive type
      `${K}`;
}[keyof T];
export type KeysOf<T> = keyof T | NestedKeysOf<T>;

export type NestedValuesOf<T> = {
  [K in keyof T]: T[K] extends object ? NestedValuesOf<T[K]> : T[K];
};

export type NestedEntriesOf<T> = {
  [K in keyof T]: T[K] extends object ? NestedEntriesOf<T[K]> : [K, T[K]];
}[keyof T];

export type FastFlagNames =
  | "disabled-settings"
  | "disabled-registration"
  | "maintenance"
  | "disabled-chat"
  | "banner";

export type UserPreferences =
  | "@chat/bell"
  | "@chat/enabled"
  | "@chat/my-color"
  | "@dismissible/chat/conversation-tooltip"
  | "@app/secret-gift"
  | "@app/notification-manager"
  | "@user/seen-roblox-convert";
export const userPreferences: UserPreferences[] = [
  "@chat/bell",
  "@chat/enabled",
  "@chat/my-color",
  "@dismissible/chat/conversation-tooltip",
  "@app/secret-gift",
  "@app/notification-manager",
  "@user/seen-roblox-convert",
];
export const defaultUserPreferences: Record<
  UserPreferences,
  string | boolean | number
> = {
  "@chat/bell": true,
  "@chat/enabled": true,
  "@chat/my-color": "blue",
  "@dismissible/chat/conversation-tooltip": false,
  "@app/secret-gift": false,
  "@app/notification-manager": true,
  "@user/seen-roblox-convert": false,
};
export const userPreferenceValidators: Partial<
  Record<UserPreferences, (value: string | boolean | number) => boolean>
> = {
  "@chat/my-color": (value) =>
    typeof value === "string" && MANTINE_COLORS.includes(value),
  "@app/secret-gift": (value) => typeof value === "boolean" && value === true,
  "@user/seen-roblox-convert": (value) =>
    typeof value === "boolean" && value === true,
};

export type PascalToCamel<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? `${Lowercase<First>}${Rest}`
    : Lowercase<S>;

export type AssetFrontend = {
  name: string;
  createdAt: string;
  description: string;
  price: number;
  priceBits: number;
  previewUri: string;
  onSale: boolean;
  limited: boolean;
  rows: Array<{ key: string; value: string }>;
  author: NonUser;
  _count: {
    stargazers: number;
  };
  id: string;
  stock: number;
  quantitySold: number;
  originalStock?: number;
  originalPrice?: number;
  recentAveragePrice?: number;
  rapLastUpdated?: string;
  canAuthorEdit: boolean;
};
export type AssetType =
  | "catalog-item"
  | "limited-catalog-item"
  | "sound"
  | "gamepass";
export type AssetItemType =
  | Lowercase<CatalogItemType>
  | "sound"
  | "gamepass"
  | "limiteds";
export const prismaAssetTypeMap: Record<
  AssetType,
  PascalToCamel<Prisma.ModelName>
> = {
  "catalog-item": "catalogItem",
  "limited-catalog-item": "limitedCatalogItem",
  sound: "sound",
  gamepass: "gamepass",
};
export const prismaAssetItemTypeModelMap: Record<
  AssetItemType,
  PascalToCamel<Prisma.ModelName>
> = {
  gear: "catalogItem",
  hat: "catalogItem",
  pants: "catalogItem",
  shirt: "catalogItem",
  sound: "sound",
  tshirt: "catalogItem",
  limiteds: "limitedCatalogItem",
  gamepass: "gamepass",
};
export const prismaAssetItemTypeViewMap: Record<AssetItemType, AssetType> = {
  gear: "catalog-item",
  hat: "catalog-item",
  pants: "catalog-item",
  shirt: "catalog-item",
  sound: "sound",
  tshirt: "catalog-item",
  limiteds: "limited-catalog-item",
  gamepass: "gamepass",
};
export const assetItemTypeWithTypeProp: AssetItemType[] = [
  "gear",
  "hat",
  "pants",
  "shirt",
  "tshirt",
  "limiteds",
];
export const prismaInventoryMapping: Record<
  AssetType,
  KeysOf<
    Prisma.InventoryUpdateArgs["data"] | Prisma.InventoryCreateArgs["data"]
  >
> = {
  "catalog-item": "items",
  "limited-catalog-item": "limited",
  sound: "sounds",
  gamepass: "gamepasses",
};
