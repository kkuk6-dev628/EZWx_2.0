import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';
import { LayerState } from './LayerControl';

export interface BaseMapLayerControlState {
  show: boolean;
  usProvincesState: LayerState;
  canadianProvincesState: LayerState;
  countryWarningAreaState: LayerState;
  streetState: LayerState;
  topoState: LayerState;
  terrainState: LayerState;
  darkState: LayerState;
  satelliteState: LayerState;
}

const initialState: BaseMapLayerControlState = {
  show: false,
  usProvincesState: {
    checked: true,
    name: 'U.S. States',
    opacity: 1,
    expanded: false,
  },
  canadianProvincesState: {
    checked: true,
    name: 'Canadian Provinces',
    opacity: 1,
    expanded: false,
  },
  countryWarningAreaState: {
    checked: false,
    name: 'County Warning Areas',
    opacity: 1,
    expanded: false,
  },
  streetState: {
    checked: true,
    name: 'Street',
    opacity: 1,
    expanded: false,
  },
  topoState: {
    checked: false,
    name: 'Topo',
    opacity: 1,
    expanded: false,
  },
  terrainState: {
    checked: false,
    name: 'Terrain',
    opacity: 1,
    expanded: false,
  },
  darkState: {
    checked: false,
    name: 'Dark',
    opacity: 1,
    expanded: false,
  },
  satelliteState: {
    checked: false,
    name: 'Satellite',
    opacity: 1,
    expanded: false,
  },
};

const BaseMapLayerControlSlice = createSlice({
  name: 'baseMapLayerControl',
  initialState,
  reducers: {
    setBaseMapLayerControl: (state, action) => {
      state.show = action.payload.show;
      state.usProvincesState = action.payload.usProvincesState;
      state.canadianProvincesState = action.payload.canadianProvincesState;
      state.countryWarningAreaState = action.payload.countryWarningAreaState;
      state.streetState = action.payload.streetState;
      state.topoState = action.payload.topoState;
      state.terrainState = action.payload.terrainState;
      state.darkState = action.payload.darkState;
      state.satelliteState = action.payload.satelliteState;
    },
    setBaseMapLayerControlShow: (state, action) => {
      state.show = action.payload;
    },
  },
});

export const { setBaseMapLayerControl, setBaseMapLayerControlShow } = BaseMapLayerControlSlice.actions;

export const selectBaseMapLayerControl = (state: AppState) => state.baseMapLayerControl;
export const selectBaseMapLayerControlShow = (state: AppState) => state.baseMapLayerControl.show;

export default BaseMapLayerControlSlice;
