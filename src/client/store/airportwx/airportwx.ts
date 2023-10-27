import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface AirportwxState {
  currentAirport: string;
  currentAirportPos: { lat: number; lng: number };
}

const initialState: AirportwxState = {
  currentAirport: '',
  currentAirportPos: null,
};

export const airportwxSlice = createSlice({
  name: 'airportwxState',
  initialState,
  reducers: {
    setCurrentAirport: (state, action) => {
      state.currentAirport = action.payload;
    },
    setCurrentAirportPos: (state, action) => {
      state.currentAirportPos = action.payload;
    },
  },
});

export const { setCurrentAirport, setCurrentAirportPos } = airportwxSlice.actions;
export const selectCurrentAirport = (state: AppState) => state.airportwxState.currentAirport;
export const selectCurrentAirportPos = (state: AppState) => state.airportwxState.currentAirportPos;

export default airportwxSlice;
