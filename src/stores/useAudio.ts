import create from "zustand";

export const AUDIO_KEY = "@fw/audio";

type AudioStore = {
  chatNotification: boolean;
  setChatNotification: (chatNotification: boolean) => void;
};

const getInitialAudioState = (): AudioStore => {
  try {
    const audio = localStorage.getItem(AUDIO_KEY);
    if (audio) {
      return JSON.parse(audio);
    }
    return {
      chatNotification: true,
      setChatNotification: () => {},
    };
  } catch {}

  return {
    chatNotification: true,
    setChatNotification: () => {},
  };
};

const useAudio = create<AudioStore>((set) => ({
  ...getInitialAudioState(),
  setChatNotification: (chatNotification) => {
    set({ chatNotification });
    try {
      localStorage.setItem(
        AUDIO_KEY,
        JSON.stringify({
          ...getInitialAudioState(),
          chatNotification,
        })
      );
    } catch {}
  },
}));

export default useAudio;
