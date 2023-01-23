import { ViewService } from './../../../server/view/view.service';
import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface LayerState {
  visible: boolean;
  opacity: number;
}

export interface MetarLayerState extends LayerState {
  usePersonalMinimums: boolean;
  markerType: string;
}
export interface LayerControlState {
  metarState: MetarLayerState;
  pirepState: LayerState;
}

const initialState: LayerControlState = {
  metarState: {
    visible: true,
    opacity: 1,
    markerType: 'flightCategory',
    usePersonalMinimums: false,
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
