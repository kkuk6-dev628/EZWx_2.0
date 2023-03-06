import { createSlice } from '@reduxjs/toolkit';
import { Route } from '../../interfaces/routeInterfaces';
import { AppState } from '../store';

export interface RouteState {
  activeRoute: Route;
}

const initialState: RouteState = {
  activeRoute: null,
};
export const RoutesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setActiveRoute: (state, action) => {
      state.activeRoute = action.payload;
    },
  },
});

export const { setActiveRoute } = RoutesSlice.actions;

export const selectActiveRoute = (state: AppState) => state.routes.activeRoute;

export default RoutesSlice;
