import { createSlice } from '@reduxjs/toolkit';
import { DateObject } from 'react-multi-date-picker';

const initialState = {
  day: new Date().getDate(),
  hour: new Date().getHours(),
  minute: new Date().getMinutes(),
  month: new Date().getMonth(),
  weekDay: new Date().getDay(),
};

export const timeSliderSlice = createSlice({
  name: 'timeSlider',
  initialState,
  reducers: {
    setTimeSliderValue: (state, action) => {
      state = action.payload;
    },
  },
});

export const { setTimeSliderValue } = timeSliderSlice.actions;

export default timeSliderSlice.reducer;
