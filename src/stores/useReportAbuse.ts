import { NonUser } from "@/util/prisma-types";
import { Reportable } from "@/util/types";
import create from "zustand";

export type ReportAbuseProps = {
  user: NonUser;
};

type ReportAbuseStore = {
  opened: boolean;
  setOpened: (opened: boolean, user?: NonUser) => void;
  open: (props: ReportAbuseProps) => void;
  props: ReportAbuseProps | undefined;
};

const useReportAbuse = create<ReportAbuseStore>((set) => ({
  opened: false,
  setOpened: (opened) => set({ opened }),
  open: (props) => {
    set({ opened: true });
    set({ props });
  },
  props: {
    user: {
      id: 0,
      username: "",
      alias: "",
    } as NonUser
  },
}));

export default useReportAbuse;
