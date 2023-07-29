import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface SetupState {
  active: number;
}

const initialState: SetupState = {
  active: 0,
};

export const fetchStep = createAsyncThunk("setup/fetchStep", async () => {
  return await fetchJson<IResponseBase<{ step: number }>>("/api/setup/step", {
    method: "GET",
  }).then((res) => {
    if (res.success && res.data) {
      return res.data.step;
    }
  });
});

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
  extraReducers: (builder) => {
    builder.addCase(fetchStep.fulfilled, (state, action) => {
      console.log(action);
      if (action.payload!) {
        state.active = action.payload;
      }
    });
  },
});

export const { next, prev, setStep } = setupSlice.actions;
export default setupSlice.reducer;
