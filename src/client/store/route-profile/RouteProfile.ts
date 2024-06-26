import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';
import { RouteSegment } from '../../interfaces/route-profile';

export interface RouteProfileState {
  routeSegments: RouteSegment[];
  routeElevationPoints: GeoJSON.Position[];
  fetchedDate: number;
}

const initialState: RouteProfileState = {
  routeSegments: [],
  routeElevationPoints: [],
  fetchedDate: Date.now(),
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
    setFetchedDate: (state, action) => {
      state.fetchedDate = action.payload;
    },
  },
});

export const { setRouteSegments, setRouteElevationPoints, setFetchedDate } = RouteProfileSlice.actions;

export const selectRouteSegments = (state: AppState) => state.routeProfile.routeSegments;
export const selectRouteElevationPoints = (state: AppState) => state.routeProfile.routeElevationPoints;
export const selectFetchedDate = (state: AppState) => state.routeProfile.fetchedDate;

export default RouteProfileSlice;
