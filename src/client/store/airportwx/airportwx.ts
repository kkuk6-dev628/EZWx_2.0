import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface AirportwxState {
  currentAirport: string;
  currentAirportPos: { lat: number; lng: number };
  chartWidth: number;
  viewWidth: number;
  viewHeight: number;
}

const initialState: AirportwxState = {
  currentAirport: '',
  currentAirportPos: null,
  chartWidth: 24,
  viewWidth: 1024,
  viewHeight: 768,
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
    setViewWidth: (state, action) => {
      state.viewWidth = action.payload;
    },
    setViewHeight: (state, action) => {
      state.viewHeight = action.payload;
    },
  },
});

export const { setCurrentAirport, setCurrentAirportPos, setChartWidth, setViewWidth, setViewHeight } =
  airportwxSlice.actions;
export const selectCurrentAirport = (state: AppState) => state.airportwxState.currentAirport;
export const selectCurrentAirportPos = (state: AppState) => state.airportwxState.currentAirportPos;
export const selectChartWidth = (state: AppState) => state.airportwxState.chartWidth;
export const selectViewWidth = (state: AppState) => state.airportwxState.viewWidth;
export const selectViewHeight = (state: AppState) => state.airportwxState.viewHeight;

export default airportwxSlice;
