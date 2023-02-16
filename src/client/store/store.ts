import BaseMapLayerControlSlice from './layers/BaseMapLayerControl';
import UserSettingsSlice from './user/UserSettings';
import { LayerControlSlice } from './layers/LayerControl';
import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import ObsTimeSlice from './time-slider/ObsTimeSlice';
import ObsIntervalSlice from './time-slider/ObsIntervalSlice';
import { createWrapper } from 'next-redux-wrapper';
import authSlice from './auth/authSlice';
import { apiSlice } from './api/apiSlice';
import { airportApi } from './airports/airportApi';

const makeStore = () =>
  configureStore({
    reducer: {
      [ObsIntervalSlice.name]: ObsIntervalSlice.reducer,
      [airportApi.reducerPath]: airportApi.reducer,
      [ObsTimeSlice.name]: ObsTimeSlice.reducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
      [authSlice.name]: authSlice.reducer,
      [LayerControlSlice.name]: LayerControlSlice.reducer,
      [UserSettingsSlice.name]: UserSettingsSlice.reducer,
      [BaseMapLayerControlSlice.name]: BaseMapLayerControlSlice.reducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddlewares) =>
      getDefaultMiddlewares().concat(apiSlice.middleware).concat(airportApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action>;

export const wrapper = createWrapper<AppStore>(makeStore);
