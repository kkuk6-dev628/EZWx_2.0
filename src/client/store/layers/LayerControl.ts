import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface SublayerState {
  name: string;
  checked: boolean;
}

export interface LayerState {
  checked: boolean;
  opacity: number;
  name: string;
  expanded: boolean;
}

export interface MetarLayerState extends LayerState {
  usePersonalMinimums: boolean;
  markerType: string;
}

export interface SigmetsLayerState extends LayerState {
  all: SublayerState;
  convection: SublayerState;
  outlooks: SublayerState;
  turbulence: SublayerState;
  airframeIcing: SublayerState;
  dust: SublayerState;
  ash: SublayerState;
  international: SublayerState;
  other: SublayerState;
}

export interface GairmetLayerState extends LayerState {
  all: SublayerState;
  airframeIcing: SublayerState;
  multiFrzLevels: SublayerState;
  turbulenceHi: SublayerState;
  turbulenceLow: SublayerState;
  ifrConditions: SublayerState;
  mountainObscuration: SublayerState;
  nonconvectiveLlws: SublayerState;
  sfcWinds: SublayerState;
}

export interface PirepLayerState extends LayerState {
  urgentOnly: SublayerState;
  all: SublayerState;
  icing: SublayerState;
  turbulence: SublayerState;
  weatherSky: SublayerState;
  altitude: {
    name: string;
    min: number;
    max: number;
    valueMin: number;
    valueMax: number;
    unit: string;
  };
  time: { name: string; hours: number; max: number };
}

export interface CwaLayerState extends LayerState {
  all: SublayerState;
  airframeIcing: SublayerState;
  turbulence: SublayerState;
  ifrConditions: SublayerState;
  convection: SublayerState;
  other: SublayerState;
}

export interface LayerControlState {
  metarState: MetarLayerState;
  radarState: LayerState;
  sigmetState: SigmetsLayerState;
  gairmetState: GairmetLayerState;
  pirepState: PirepLayerState;
  cwaState: CwaLayerState;
}

const initialState: LayerControlState = {
  metarState: {
    checked: true,
    opacity: 1,
    expanded: false,
    markerType: 'flightCategory',
    usePersonalMinimums: false,
    name: 'Station Markers',
  },
  radarState: {
    expanded: false,
    checked: false,
    opacity: 1,
    name: 'Radar',
  },
  sigmetState: {
    checked: true,
    opacity: 1,
    name: 'SIGMETs',
    expanded: false,
    all: { name: 'All', checked: true },
    convection: { name: 'Convection', checked: true },
    outlooks: { name: 'Outlooks', checked: true },
    turbulence: { name: 'turbulence', checked: true },
    airframeIcing: { name: 'Airframe Icing', checked: true },
    dust: { name: 'Dust & Sandstorms', checked: true },
    ash: { name: 'Volcanic Ash', checked: true },
    international: { name: 'International', checked: true },
    other: { name: 'Other', checked: true },
  },
  gairmetState: {
    checked: true,
    opacity: 1,
    name: 'G-AIRMETs',
    expanded: false,
    all: { name: 'All', checked: true },
    airframeIcing: { name: 'Airframe Icing', checked: true },
    multiFrzLevels: { name: 'Mult Frz Levels', checked: true },
    turbulenceHi: { name: 'Turbulence HI', checked: true },
    turbulenceLow: { name: 'Turbulence LO', checked: true },
    ifrConditions: { name: 'IFR Conditions', checked: true },
    mountainObscuration: { name: 'Mountain Obscuration', checked: true },
    nonconvectiveLlws: { name: 'Nonconvective LLWS', checked: true },
    sfcWinds: { name: 'SFC Winds > 30 knots', checked: true },
  },
  pirepState: {
    checked: true,
    opacity: 1,
    name: 'Pilot Weather Reports',
    expanded: false,
    urgentOnly: { name: 'Urgent Only', checked: true },
    all: { name: 'All', checked: true },
    icing: { name: 'Icing', checked: true },
    turbulence: { name: 'Turbulence', checked: true },
    weatherSky: { name: 'Weather & Sky', checked: true },
    altitude: {
      name: 'Altitude(FL)',
      min: 0,
      max: 600,
      valueMin: 0,
      valueMax: 600,
      unit: 'feet',
    },
    time: { name: 'Time (past hours)', hours: 12, max: 24 },
  },
  cwaState: {
    name: 'Center Weather Reports',
    checked: true,
    opacity: 1,
    expanded: false,
    all: { name: 'All', checked: true },
    airframeIcing: { name: 'Airframe Icing', checked: true },
    turbulence: { name: 'Turbulence', checked: true },
    ifrConditions: { name: 'IFR Conditions', checked: true },
    convection: { name: 'Convection', checked: true },
    other: { name: 'Other', checked: true },
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
    setGairmet: (state, action) => {
      state.gairmetState = action.payload;
    },
    setCwa: (state, action) => {
      state.cwaState = action.payload;
    },
    setLayerControl: (state, action) => {
      state.metarState = action.payload.metarState;
      state.radarState = action.payload.radarState;
      state.sigmetState = action.payload.sigmetState;
      state.gairmetState = action.payload.gairmetState;
      state.pirepState = action.payload.pirepState;
      state.cwaState = action.payload.cwaState;
    },
  },
});

export const {
  setMetar,
  setPirep,
  setRadar,
  setSigmet,
  setGairmet,
  setCwa,
  setLayerControl,
} = LayerControlSlice.actions;

export const selectMetar = (state: AppState) => state.layerControl.metarState;
export const selectRadar = (state: AppState) => state.layerControl.radarState;
export const selectSigmet = (state: AppState) => state.layerControl.sigmetState;
export const selectGairmet = (state: AppState) =>
  state.layerControl.gairmetState;
export const selectPirep = (state: AppState) => state.layerControl.pirepState;
export const selectCwa = (state: AppState) => state.layerControl.cwaState;

export const selectLayerControl = (state: AppState) => state.layerControl;

export default LayerControlSlice;
