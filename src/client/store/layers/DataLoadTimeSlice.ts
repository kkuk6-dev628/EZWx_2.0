import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface DataLoadTimeState {
  dataLoadTimeState: number;
}

const initialState: DataLoadTimeState = {
  dataLoadTimeState: Date.now(),
};

export const DataLoadTimeSlice = createSlice({
  name: 'dataLoadTime',
  initialState,
  reducers: {
    setDataLoadTime: (state, action) => {
      state.dataLoadTimeState = action.payload;
    },
  },
});

export const { setDataLoadTime } = DataLoadTimeSlice.actions;

export const selectDataLoadTime = (state: AppState) => state.dataLoadTime.dataLoadTimeState;

export default DataLoadTimeSlice;
