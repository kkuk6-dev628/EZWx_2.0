import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import ObsTimeSlice from './ObsTimeSlice';
import ObsIntervalSlice from './ObsIntervalSlice';
import { createWrapper } from 'next-redux-wrapper';

const makeStore = () =>
  configureStore({
    reducer: {
      [ObsIntervalSlice.name]: ObsIntervalSlice.reducer,
      [ObsTimeSlice.name]: ObsTimeSlice.reducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
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
