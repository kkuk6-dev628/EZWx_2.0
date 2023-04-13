import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface RouteProfileState {
  routeSegments: GeoJSON.Position[];
  routeElevationPoints: GeoJSON.Position[];
}

const initialState: RouteProfileState = {
  routeSegments: null,
  routeElevationPoints: null,
};
export const RouteProfileSlice = createSlice({
  name: 'routeProfile',
  initialState,
  reducers: {
    setRouteSegments: (state, action) => {
      state.routeSegments = action.payload;
    },
    setRouteElevationPoints: (state, action) => {
      state.routeElevationPoints = action.payload;
    },
  },
});

export const { setRouteSegments, setRouteElevationPoints } = RouteProfileSlice.actions;

export const selectRouteSegments = (state: AppState) => state.routeProfile.routeSegments;
export const selectRouteElevationPoints = (state: AppState) => state.routeProfile.routeElevationPoints;

export default RouteProfileSlice;
