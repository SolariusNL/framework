import create from "zustand";
import { combine } from "zustand/middleware";

export const EXPERIMENTS_KEY = "experiments";
export enum ExperimentId {
  LiveChat = "live-chat",
}
export enum ExperimentStage {
  Alpha = "alpha",
  Beta = "beta",
  Candidate = "candidate",
}
export const EXPERIMENTS = [
  {
    name: "Live Chat",
    description: "A live chat based on websockets",
    stage: ExperimentStage.Alpha,
    id: ExperimentId.LiveChat,
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
