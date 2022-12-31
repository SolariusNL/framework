import create from "zustand";
import { combine } from "zustand/middleware";

export const CHAT_KEY = "chat-settings";

interface ChatStore {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  currentConversation: number;
  setCurrentConversation: (id: number) => void;
}

const getInitialState = () => {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || "{}");
  } catch {
    return "";
  }
};

const useChatStore = create<ChatStore>(
  combine(
    {
      opened: getInitialState().opened || false,
      currentConversation: getInitialState().currentConversation || 0,
    },
    (set) => ({
      setOpened: (opened) => {
        set({ opened });
        try {
          localStorage.setItem(
            CHAT_KEY,
            JSON.stringify({
              ...getInitialState(),
              opened,
            })
          );
        } catch {}
      },
      setCurrentConversation: (id) => {
        set({ currentConversation: id });
        try {
          localStorage.setItem(
            CHAT_KEY,
            JSON.stringify({
              ...getInitialState(),
              currentConversation: id,
            })
          );
        } catch {}
      },
    })
  )
);

export default useChatStore;
