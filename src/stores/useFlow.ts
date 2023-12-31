import dynamic from "next/dynamic";
import React from "react";
import create from "zustand";

const LoginFlow = dynamic(() => import("@/components/flows/logins"), {
  ssr: false,
});
const SecretGift = dynamic(() => import("@/components/flows/gift"), {
  ssr: false,
});
const RobloxAuth = dynamic(() => import("@/components/flows/roblox"), {
  ssr: false,
});
const ViewReport = dynamic(() => import("@/components/flows/view-report"), {
  ssr: false,
});

export enum Flow {
  Logins = "logins",
  SecretGift = "secret-gift",
  RobloxAuth = "roblox-auth",
  ViewReport = "view-report",
}

export const Flows: {
  [key in Flow]: FlowType;
} = {
  [Flow.Logins]: {
    component: React.createElement(LoginFlow),
    title: "Login management",
  },
  [Flow.SecretGift]: {
    component: React.createElement(SecretGift),
    title: "Surprise",
  },
  [Flow.RobloxAuth]: {
    component: React.createElement(RobloxAuth),
    title: "Roblox authentication",
  },
  [Flow.ViewReport]: {
    component: React.createElement(ViewReport),
    title: "View report",
  },
};

type FlowType = {
  component: React.ReactElement;
  title: string;
};

type FlowStore = {
  toggleFlow: (flow: FlowType) => void;
  activeFlow: FlowType | null;
};

const useFlow = create<FlowStore>((set, get) => ({
  activeFlow: null,
  toggleFlow: (flow) => {
    const { activeFlow } = get();
    if (activeFlow === flow) {
      set({ activeFlow: null });
    } else {
      set({ activeFlow: flow });
    }
  },
}));

export default useFlow;
