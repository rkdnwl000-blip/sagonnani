import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RequestBadgeState {
  count: number;
}

const initialState: RequestBadgeState = { count: 0 };

const requestBadgeSlice = createSlice({
  name: 'requestBadge',
  initialState,
  reducers: {
    setRequestCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
  },
});

export const { setRequestCount } = requestBadgeSlice.actions;
export default requestBadgeSlice.reducer;
