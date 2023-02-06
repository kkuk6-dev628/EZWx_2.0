import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface ObsIntervalState {
  obsIntervalState: number;
}

const initialState: ObsIntervalState = {
  obsIntervalState: 75,
};

export const ObsIntervalSlice = createSlice({
  name: 'obsInterval',
  initialState,
  reducers: {
    setObsInterval: (state, action) => {
      state.obsIntervalState = action.payload;
    },
  },
});

export const { setObsInterval } = ObsIntervalSlice.actions;

export const selectObsInterval = (state: AppState) => state.obsInterval.obsIntervalState;

export default ObsIntervalSlice;
