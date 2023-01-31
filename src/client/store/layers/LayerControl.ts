import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface LayerState {
  visible: boolean;
  opacity: number;
  name: string;
}

export interface MetarLayerState extends LayerState {
  usePersonalMinimums: boolean;
  markerType: string;
}

export interface SigmetsLayerState extends LayerState {
  all: { name: string; visible: boolean };
  convection: { name: string; visible: boolean };
  outlooks: { name: string; visible: boolean };
  turbulence: { name: string; visible: boolean };
  airframeIcing: { name: string; visible: boolean };
  dust: { name: string; visible: boolean };
  ash: { name: string; visible: boolean };
  international: { name: string; visible: boolean };
  other: { name: string; visible: boolean };
}

export interface LayerControlState {
  metarState: MetarLayerState;
  pirepState: LayerState;
  radarState: LayerState;
  sigmetState: SigmetsLayerState;
}

const initialState: LayerControlState = {
  metarState: {
    visible: true,
    opacity: 1,
    markerType: 'flightCategory',
    usePersonalMinimums: false,
    name: 'Station Markers',
  },
  pirepState: {
    visible: true,
    opacity: 1,
    name: 'Pilot Weather Reports',
  },
  radarState: {
    visible: false,
    opacity: 1,
    name: 'Radar',
  },
  sigmetState: {
    visible: true,
    opacity: 1,
    name: 'SIGMETs',
    all: { name: 'All', visible: true },
    convection: { name: 'Convection', visible: true },
    outlooks: { name: 'Outlooks', visible: true },
    turbulence: { name: 'turbulence', visible: true },
    airframeIcing: { name: 'Airframe Icing', visible: true },
    dust: { name: 'Dust & Sandstorms', visible: true },
    ash: { name: 'Volcanic Ash', visible: true },
    international: { name: 'International', visible: true },
    other: { name: 'Other', visible: true },
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
    setRadar: (state, action) => {
      state.radarState = action.payload;
    },
    setSigmet: (state, action) => {
      state.sigmetState = action.payload;
    },
  },
});

export const { setMetar, setPirep, setRadar, setSigmet } =
  LayerControlSlice.actions;

export const selectMetar = (state: AppState) => state.layerControl.metarState;

export const selectPirep = (state: AppState) => state.layerControl.pirepState;

export const selectLayerControl = (state: AppState) => state.layerControl;

export default LayerControlSlice;
