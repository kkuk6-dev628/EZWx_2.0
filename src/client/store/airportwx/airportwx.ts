import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface AirportwxState {
  currentAirport: string;
}

const initialState: AirportwxState = {
  currentAirport: '',
};

export const airportwxSlice = createSlice({
  name: 'airportwxState',
  initialState,
  reducers: {
    setCurrentAirport: (state, action) => {
      state.currentAirport = action.payload;
    },
  },
});

export const { setCurrentAirport } = airportwxSlice.actions;
export const selectCurrentAirport = (state: AppState) => state.airportwxState.currentAirport;

export default airportwxSlice;
