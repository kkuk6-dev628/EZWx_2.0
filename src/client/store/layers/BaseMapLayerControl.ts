import { createSlice } from '@reduxjs/toolkit';
import { BaseMapLayerControlState } from '../../interfaces/layerControl';
import { AppState } from '../store';

export const initialBaseLayerControlState: BaseMapLayerControlState = {
  show: false,
  bounds: [
    [55.0, -130.0],
    [20.0, -60.0],
  ],
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
  initialState: initialBaseLayerControlState,
  reducers: {
    setBaseMapLayerControl: (state, action) => action.payload,
  },
});

export const { setBaseMapLayerControl } = BaseMapLayerControlSlice.actions;

export const selectBaseMapLayerControl = (state: AppState) => state.baseMapLayerControl;

export default BaseMapLayerControlSlice;
