import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import ObsTimeSlice from './ObsTimeSlice';
import { createWrapper } from 'next-redux-wrapper';
import authSlice from './auth/authSlice';
import { apiSlice } from './api/apiSlice';

const makeStore = () =>
  configureStore({
    reducer: {
      [ObsTimeSlice.name]: ObsTimeSlice.reducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
      [authSlice.name]: authSlice.reducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddlewares) =>
      getDefaultMiddlewares().concat(apiSlice.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore);
