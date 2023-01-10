import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface LayerControlState {
  metarState: any;
  pirepState: any;
}

const initialState: LayerControlState = {
  metarState: {
    visible: true,
    opacity: 1,
    markerType: 'flightCategory',
  },
  pirepState: {
    visible: true,
    opacity: 1,
  },
};

export const LayerControlSlice = createSlice({
  name: 'layerControl',
  initialState,
  reducers: {
    setMetar: (state, action) => {
      state.metarState = action.payload;
    },
    setPirep: (state, action) => {
      state.pirepState = action.payload;
    },
  },
});

export const { setMetar, setPirep } = LayerControlSlice.actions;

export const selectMetar = (state: AppState) => state.layerControl.metarState;

export const selectPirep = (state: AppState) => state.layerControl.pirepState;

export default LayerControlSlice;
