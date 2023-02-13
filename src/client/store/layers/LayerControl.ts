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
  flightCategory: {
    all: SublayerState;
    vfr: SublayerState;
    mvfr: SublayerState;
    ifr: SublayerState;
    lifr: SublayerState;
  };
}

export interface RadarLayerState extends LayerState {
  baseReflectivity: SublayerState;
  compositeReflectivity: SublayerState;
  echoTopHeight: SublayerState;
  forecastRadar: SublayerState;
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
    all: boolean;
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
  show: boolean;
  metarState: MetarLayerState;
  radarState: RadarLayerState;
  sigmetState: SigmetsLayerState;
  gairmetState: GairmetLayerState;
  pirepState: PirepLayerState;
  cwaState: CwaLayerState;
}

const initialState: LayerControlState = {
  show: false,
  metarState: {
    checked: true,
    opacity: 100,
    expanded: false,
    markerType: 'flightCategory',
    usePersonalMinimums: false,
    name: 'Station Markers',
    flightCategory: {
      all: { name: 'All', checked: true },
      vfr: { name: 'VFR', checked: true },
      mvfr: { name: 'MVFR', checked: true },
      ifr: { name: 'IFR', checked: true },
      lifr: { name: 'LIFR', checked: true },
    },
  },
  radarState: {
    expanded: false,
    checked: false,
    opacity: 100,
    name: 'Radar',
    baseReflectivity: {
      checked: true,
      name: '0.5\u00B0 base reflectivity',
    },
    compositeReflectivity: {
      checked: false,
      name: 'Composite reflectivity',
    },
    echoTopHeight: {
      checked: false,
      name: 'Echo top height',
    },
    forecastRadar: {
      checked: true,
      name: 'Forecast radar',
    },
  },
  sigmetState: {
    checked: true,
    opacity: 100,
    name: 'SIGMETs',
    expanded: false,
    all: { name: 'All', checked: true },
    convection: { name: 'Convection', checked: true },
    outlooks: { name: 'Convective Outlooks', checked: true },
    turbulence: { name: 'Turbulence', checked: true },
    airframeIcing: { name: 'Airframe Icing', checked: true },
    dust: { name: 'Dust & Sandstorms', checked: true },
    ash: { name: 'Volcanic Ash', checked: true },
    international: { name: 'International', checked: true },
    other: { name: 'Other', checked: true },
  },
  gairmetState: {
    checked: true,
    opacity: 100,
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
    opacity: 100,
    name: 'Pilot Weather Reports',
    expanded: false,
    urgentOnly: { name: 'Urgent Only', checked: false },
    all: { name: 'All', checked: true },
    icing: { name: 'Icing', checked: true },
    turbulence: { name: 'Turbulence', checked: true },
    weatherSky: { name: 'Weather & Sky', checked: true },
    altitude: {
      name: 'Altitude (FL)',
      all: true,
      min: 0,
      max: 600,
      valueMin: 0,
      valueMax: 600,
      unit: 'feet',
    },
    time: { name: 'Time (past hours)', hours: 12, max: 24 },
  },
  cwaState: {
    name: 'Center Weather Advisories',
    checked: true,
    opacity: 100,
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
    setLayerControlShow: (state, action) => {
      state.show = action.payload;
    },
  },
});

export const { setMetar, setPirep, setRadar, setSigmet, setGairmet, setCwa, setLayerControl, setLayerControlShow } =
  LayerControlSlice.actions;

export const selectMetar = (state: AppState) => state.layerControl.metarState;
export const selectRadar = (state: AppState) => state.layerControl.radarState;
export const selectSigmet = (state: AppState) => state.layerControl.sigmetState;
export const selectGairmet = (state: AppState) => state.layerControl.gairmetState;
export const selectPirep = (state: AppState) => state.layerControl.pirepState;
export const selectCwa = (state: AppState) => state.layerControl.cwaState;
export const selectIntlSigmet = (state: AppState) => state.layerControl.sigmetState.international;
export const selectOutlooks = (state: AppState) => state.layerControl.sigmetState.outlooks;

export const selectLayerControl = (state: AppState) => state.layerControl;
export const selectLayerControlShow = (state: AppState) => state.layerControl.show;

export default LayerControlSlice;
