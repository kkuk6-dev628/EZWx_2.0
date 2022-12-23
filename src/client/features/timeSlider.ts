import { createSlice } from '@reduxjs/toolkit';
import { DateObject } from 'react-multi-date-picker';

const initialState = {
  date: new Date(),
};

export const timeSliderSlice = createSlice({
  name: 'timeSlider',
  initialState,
  reducers: {
    setTimeSliderValue: (state, action) => {
      state.date = action.payload;
    },
  },
});

export const { setTimeSliderValue } = timeSliderSlice.actions;

export default timeSliderSlice.reducer;
