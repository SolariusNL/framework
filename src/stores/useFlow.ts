import dynamic from "next/dynamic";
import React from "react";
import create from "zustand";

const LoginFlow = dynamic(() => import("../components/Flows/Logins"), {
  ssr: false,
});
const SecretGift = dynamic(() => import("../components/Flows/Gift"), {
  ssr: false,
});

export enum Flow {
  Logins = "logins",
  SecretGift = "secret-gift",
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
