import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface RouteProfileState {
  routeSegments: GeoJSON.Position[];
}

const initialState: RouteProfileState = {
  routeSegments: null,
};
export const RouteProfileSlice = createSlice({
  name: 'routeProfile',
  initialState,
  reducers: {
    setRouteSegments: (state, action) => {
      state.routeSegments = action.payload;
    },
  },
});

export const { setRouteSegments } = RouteProfileSlice.actions;

export const selectRouteSegments = (state: AppState) => state.routeProfile.routeSegments;

export default RouteProfileSlice;
