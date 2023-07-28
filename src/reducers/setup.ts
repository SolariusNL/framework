import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import { createSlice } from "@reduxjs/toolkit";

export interface SetupState {
  active: number;
}

const initialState: SetupState = {
  active: 0,
};

const setupSlice = createSlice({
  name: "setup",
  initialState,
  reducers: {
    next: (state) => {
      state.active++;
      fetchJson<IResponseBase>("/api/setup/increment", {
        method: "PATCH",
      });
    },
    prev: (state) => {
      state.active--;
      fetchJson<IResponseBase>("/api/setup/decrement", {
        method: "PATCH",
      });
    },
    setStep: (state, action) => {
      state.active = action.payload;
    },
  },
});

export const { next, prev, setStep } = setupSlice.actions;
export default setupSlice.reducer;
