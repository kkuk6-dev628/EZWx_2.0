import { layerControlApi } from './layers/layerControlApi';
import { routeApi } from './route/routeApi';
import { RoutesSlice } from './route/routes';
import BaseMapLayerControlSlice from './layers/BaseMapLayerControl';
import UserSettingsSlice, { SettingsLoadTimeSlice } from './user/UserSettings';
import { LayerControlSlidersSlice } from './layers/LayerControl';
import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import authSlice from './auth/authSlice';
import { apiSlice } from './api/apiSlice';
import DataLoadTimeSlice from './layers/DataLoadTimeSlice';
import { routeProfileApi } from './route-profile/routeProfileApi';
import { elevationApi } from './route-profile/elevationApi';
import RouteProfileSlice from './route-profile/RouteProfile';
import { imageryApi } from './imagery/imageryApi';
import ImagerySlice from './imagery/imagery';
import airportwxSlice from './airportwx/airportwx';
import { airportwxApi } from './airportwx/airportwxApi';

const makeStore = () =>
  configureStore({
    reducer: {
      [DataLoadTimeSlice.name]: DataLoadTimeSlice.reducer,
      [routeApi.reducerPath]: routeApi.reducer,
      [layerControlApi.reducerPath]: layerControlApi.reducer,
      [routeProfileApi.reducerPath]: routeProfileApi.reducer,
      [elevationApi.reducerPath]: elevationApi.reducer,
      [imageryApi.reducerPath]: imageryApi.reducer,
      [airportwxApi.reducerPath]: airportwxApi.reducer,
      [RoutesSlice.name]: RoutesSlice.reducer,
      [ImagerySlice.name]: ImagerySlice.reducer,
      [airportwxSlice.name]: airportwxSlice.reducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
      [authSlice.name]: authSlice.reducer,
      [LayerControlSlidersSlice.name]: LayerControlSlidersSlice.reducer,
      [UserSettingsSlice.name]: UserSettingsSlice.reducer,
      [BaseMapLayerControlSlice.name]: BaseMapLayerControlSlice.reducer,
      [SettingsLoadTimeSlice.name]: SettingsLoadTimeSlice.reducer,
      [RouteProfileSlice.name]: RouteProfileSlice.reducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddlewares) => {
      const middleWares = getDefaultMiddlewares();
      middleWares.push(
        apiSlice.middleware,
        routeApi.middleware,
        layerControlApi.middleware,
        routeProfileApi.middleware,
        elevationApi.middleware,
        imageryApi.middleware,
        airportwxApi.middleware as any,
      );
      return middleWares;
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action>;

export const wrapper = createWrapper<AppStore>(makeStore);
