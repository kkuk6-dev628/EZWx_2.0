import { createSlice } from '@reduxjs/toolkit';
import { Route } from '../../interfaces/route';
import { AppState } from '../store';
import { isSameRoutes } from '../../components/map/common/AreoFunctions';

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
      if (!isSameRoutes(state.activeRoute, action.payload)) {
        state.activeRoute = action.payload;
      }
      if (state.activeRoute && !state.activeRoute.id && action.payload?.id) {
        state.activeRoute.id = action.payload.id;
      }
    },
  },
});

export const { setActiveRoute } = RoutesSlice.actions;

export const selectActiveRoute = (state: AppState) => state.routes.activeRoute;

export default RoutesSlice;
