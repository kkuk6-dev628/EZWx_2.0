import { layerControlApi } from './layers/layerControlApi';
import { routeApi } from './route/routeApi';
import { RoutesSlice } from './route/routes';
import BaseMapLayerControlSlice from './layers/BaseMapLayerControl';
import UserSettingsSlice from './user/UserSettings';
import { LayerControlSlidersSlice } from './layers/LayerControl';
import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import ObsTimeSlice from './time-slider/ObsTimeSlice';
import ObsIntervalSlice from './time-slider/ObsIntervalSlice';
import { createWrapper } from 'next-redux-wrapper';
import authSlice from './auth/authSlice';
import { apiSlice } from './api/apiSlice';
import { airportApi } from './route/airportApi';
import { waypointApi } from './route/waypointApi';
import DataLoadTimeSlice from './layers/DataLoadTimeSlice';

const makeStore = () =>
  configureStore({
    reducer: {
      [ObsIntervalSlice.name]: ObsIntervalSlice.reducer,
      [DataLoadTimeSlice.name]: DataLoadTimeSlice.reducer,
      [airportApi.reducerPath]: airportApi.reducer,
      [waypointApi.reducerPath]: waypointApi.reducer,
      [routeApi.reducerPath]: routeApi.reducer,
      [layerControlApi.reducerPath]: layerControlApi.reducer,
      [RoutesSlice.name]: RoutesSlice.reducer,
      [ObsTimeSlice.name]: ObsTimeSlice.reducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
      [authSlice.name]: authSlice.reducer,
      [LayerControlSlidersSlice.name]: LayerControlSlidersSlice.reducer,
      [UserSettingsSlice.name]: UserSettingsSlice.reducer,
      [BaseMapLayerControlSlice.name]: BaseMapLayerControlSlice.reducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddlewares) => {
      const middleWares = getDefaultMiddlewares();
      middleWares.push(
        apiSlice.middleware,
        airportApi.middleware,
        waypointApi.middleware,
        routeApi.middleware,
        layerControlApi.middleware,
      );
      return middleWares;
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action>;

export const wrapper = createWrapper<AppStore>(makeStore);
