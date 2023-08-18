import { deleteCookie, setCookie } from "cookies-next";
import create from "zustand";
import { combine } from "zustand/middleware";

export const EXPERIMENTS_KEY = "experiments";
export enum ExperimentId {
  AmoledDarkMode = "amoled-dark-mode",
  FrameworkAI = "framework-ai",
  LoginManager = "login-manager",
  RobloxAuth = "roblox-auth",
}
export enum ExperimentStage {
  Alpha = "alpha",
  Beta = "beta",
  Candidate = "candidate",
}
export const EXPERIMENTS = [
  {
    name: "AMOLED Theme",
    description: "An experimental pitch-black theme for the app",
    stage: ExperimentStage.Alpha,
    id: ExperimentId.AmoledDarkMode,
    refreshNecessary: true,
    additionalSetup: (value: boolean) => {
      if (value) deleteCookie("mantine-amoled");
      else {
        setCookie("mantine-amoled", "true");
        setCookie("mantine-color-scheme", "dark", {
          maxAge: 60 * 60 * 24 * 30,
        });
      }
    },
  },
  {
    name: "Framework AI",
    description: "An experimental AI chatbot to empower your experience",
    stage: ExperimentStage.Alpha,
    id: ExperimentId.FrameworkAI,
    refreshNecessary: false,
  },
  {
    name: "Login Manager",
    description: "An experimental login manager to monitor recent logins",
    stage: ExperimentStage.Alpha,
    id: ExperimentId.LoginManager,
    refreshNecessary: false,
  },
  {
    name: "Roblox Authentication",
    description:
      "An experimental Roblox authentication flow to convert Robux to Tickets",
    stage: ExperimentStage.Alpha,
    id: ExperimentId.RobloxAuth,
    refreshNecessary: false,
  },
];

interface ExperimentsStore {
  experiments: ExperimentId[];
  addExperiment: (experiment: ExperimentId) => void;
  removeExperiment: (experiment: ExperimentId) => void;
}

const getInitialState = () => {
  try {
    return JSON.parse(localStorage.getItem(EXPERIMENTS_KEY) || "[]");
  } catch {
    return "";
  }
};

const useExperimentsStore = create<ExperimentsStore>(
  combine(
    {
      experiments: getInitialState() as ExperimentId[],
    },
    (set) => ({
      addExperiment: (experiment) => {
        set((state) => ({
          experiments: [...state.experiments, experiment],
        }));
        try {
          localStorage.setItem(
            EXPERIMENTS_KEY,
            JSON.stringify([...getInitialState(), experiment])
          );
        } catch {}
      },
      removeExperiment: (experiment) => {
        set((state) => ({
          experiments: state.experiments.filter((e) => e !== experiment),
        }));
        try {
          localStorage.setItem(
            EXPERIMENTS_KEY,
            JSON.stringify(
              getInitialState().filter((e: ExperimentId) => e !== experiment)
            )
          );
        } catch {}
      },
    })
  )
);

export default useExperimentsStore;
