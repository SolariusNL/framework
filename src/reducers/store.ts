import { configureStore } from "@reduxjs/toolkit";
import searchReducer from "./search";
import stdoutReducer from "./stdout";

export const store = configureStore({
  reducer: {
    search: searchReducer,
    stdout: stdoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
