import { createSlice } from "@reduxjs/toolkit";

export interface SearchState {
  opened: boolean;
}

const initialState: SearchState = {
  opened: false,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    toggleSearch: (state) => {
      state.opened = !state.opened;
    },
    setSearch: (state, action) => {
      state.opened = action.payload;
    },
  },
});

export const { toggleSearch, setSearch } = searchSlice.actions;
export default searchSlice.reducer;
