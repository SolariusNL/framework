import { createSlice } from "@reduxjs/toolkit";

export interface StdoutState {
  page: number;
  lines: string[];
  searchQuery?: string;
  canLoadMore: boolean;
}

const initialState: StdoutState = {
  page: 1,
  lines: [],
  searchQuery: undefined,
  canLoadMore: true,
};

const stdoutSlice = createSlice({
  name: "stdout",
  initialState,
  reducers: {
    setStdout: (state, action) => {
      state.lines = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    incrementPage: (state) => {
      state.page += 1;
    },
    setCanLoadMore: (state, action) => {
      state.canLoadMore = action.payload;
    },
    appendLines: (state, action) => {
      state.lines = [...state.lines, ...action.payload];
    },
  },
});

export const {
  setStdout,
  setPage,
  setSearchQuery,
  incrementPage,
  setCanLoadMore,
  appendLines,
} = stdoutSlice.actions;
export default stdoutSlice.reducer;
