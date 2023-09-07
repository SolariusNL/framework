import { NonUser } from "@/util/prisma-types";
import { Reportable } from "@/util/types";
import create from "zustand";

export type ReportAbuseProps = {
  contentType: Reportable;
  author: NonUser;
  contentId: string;
};

type ReportAbuseStore = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
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
    contentType: "catalog-item",
    contentId: "",
    author: {
      id: 0,
      username: "",
      alias: "",
      avatarUri: "",
    } as NonUser,
  },
}));

export default useReportAbuse;
