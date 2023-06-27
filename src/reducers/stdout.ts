import { createSlice } from "@reduxjs/toolkit";
import { LogLevel } from "@/util/logger";

export interface StdoutState {
  page: number;
  lines: string[];
  searchQuery?: string;
  canLoadMore: boolean;
  filter: Filter;
}

export const DEFAULT_FILTER: Filter = {
  category: "all",
};
type Filter = {
  category: LogLevel | "all";
};
export const DATE_REGEX = /\[(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/;
export const CATEGORY_REGEX = /\[framework->(\w+)\]/;
export const TIME_REGEX = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z/;

const initialState: StdoutState = {
  page: 1,
  lines: [],
  searchQuery: undefined,
  canLoadMore: true,
  filter: DEFAULT_FILTER,
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
    setFilterParam: (state, action: { payload: { category: LogLevel } }) => {
      const { category } = action.payload;
      state.filter.category = category;
      state.page = 1;
    },
    resetFilter: (state) => {
      state.filter = DEFAULT_FILTER;
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
  setFilterParam,
  resetFilter,
} = stdoutSlice.actions;
export default stdoutSlice.reducer;
