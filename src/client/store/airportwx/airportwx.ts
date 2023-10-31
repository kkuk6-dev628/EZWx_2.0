import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface AirportwxState {
  currentAirport: string;
  currentAirportPos: { lat: number; lng: number };
  chartWidth: number;
}

const initialState: AirportwxState = {
  currentAirport: '',
  currentAirportPos: null,
  chartWidth: 24,
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
    setChartWidth: (state, action) => {
      state.chartWidth = action.payload;
    },
  },
});

export const { setCurrentAirport, setCurrentAirportPos, setChartWidth } = airportwxSlice.actions;
export const selectCurrentAirport = (state: AppState) => state.airportwxState.currentAirport;
export const selectCurrentAirportPos = (state: AppState) => state.airportwxState.currentAirportPos;
export const selectChartWidth = (state: AppState) => state.airportwxState.chartWidth;

export default airportwxSlice;
