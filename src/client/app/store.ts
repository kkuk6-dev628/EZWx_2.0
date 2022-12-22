import { configureStore } from '@reduxjs/toolkit';
import timeSliderReducer from '../features/timeSlider/timeSliderSlice';

export const store = configureStore({
  reducer: {
    timeSlider: timeSliderReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
