import { UserSignal as UserSignalBase, UserSignalDataRow } from "@prisma/client";

type UserSignal<T = UserSignalDataRow[]> = UserSignalBase & {
  data: T;
};

export type ClearLocalStorageSignal = UserSignal<{ reason: string }>;
export type ModalAlertSignal = UserSignal<{ title: string; body: string }>;