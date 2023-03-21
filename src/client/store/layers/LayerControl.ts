import { createSlice } from '@reduxjs/toolkit';
import { LayerControlSlidersState, LayerControlState } from '../../interfaces/layerControl';
import { AppState } from '../store';

export const initialLayerControlState: LayerControlState = {
  show: false,
  stationMarkersState: {
    checked: true,
    opacity: 100,
    expanded: false,
    markerType: 'flight_category',
    usePersonalMinimums: {
      routePointType: 'departure',
      evaluationType: 'flight_category',
    },
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

const layerControlSliderInitState: LayerControlSlidersState = {
  radarOpacity: 100,
  pirepAltitudeMin: 0,
  pirepAltitudeMax: 600,
};

export const LayerControlSlidersSlice = createSlice({
  name: 'layerControlSliders',
  initialState: layerControlSliderInitState,
  reducers: {
    setRadarOpacity: (state, action) => {
      state.radarOpacity = action.payload;
    },
    setPirepAltitudeMin: (state, action) => {
      state.pirepAltitudeMin = action.payload;
    },
    setPirepAltitudeMax: (state, action) => {
      state.pirepAltitudeMax = action.payload;
    },
  },
});

export const { setRadarOpacity, setPirepAltitudeMin, setPirepAltitudeMax } = LayerControlSlidersSlice.actions;

export const selectRadarLayerOpacity = (state: AppState) => state.layerControlSliders.radarOpacity;
export const selectPirepAltitudeMin = (state: AppState) => state.layerControlSliders.pirepAltitudeMin;
export const selectPirepAltitudeMax = (state: AppState) => state.layerControlSliders.pirepAltitudeMax;

export default LayerControlSlidersSlice;
