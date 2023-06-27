import searchReducer from "@/reducers/search";
import stdoutReducer from "@/reducers/stdout";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    search: searchReducer,
    stdout: stdoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
