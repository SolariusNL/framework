import { MANTINE_COLORS } from "@mantine/core";

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
  | "@app/notification-manager";
export const userPreferences: UserPreferences[] = [
  "@chat/bell",
  "@chat/enabled",
  "@chat/my-color",
  "@dismissible/chat/conversation-tooltip",
  "@app/secret-gift",
  "@app/notification-manager",
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
};
export const userPreferenceValidators: Partial<
  Record<UserPreferences, (value: string | boolean | number) => boolean>
> = {
  "@chat/my-color": (value) =>
    typeof value === "string" && MANTINE_COLORS.includes(value),
  "@app/secret-gift": (value) => typeof value === "boolean" && value === true,
};
