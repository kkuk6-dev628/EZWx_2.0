import { createSlice } from '@reduxjs/toolkit';
import { AppState } from './store';

export interface ObsTimeState {
  obsTimeState: string;
}

const initialState: ObsTimeState = {
  obsTimeState: new Date().toISOString(),
};

export const ObsTimeSlice = createSlice({
  name: 'obsTime',
  initialState,
  reducers: {
    setObsTime: (state, action) => {
      state.obsTimeState = action.payload;
    },
  },
});

export const { setObsTime } = ObsTimeSlice.actions;

export const selectObsTime = (state: AppState) => state.obsTime.obsTimeState;

export default ObsTimeSlice;
