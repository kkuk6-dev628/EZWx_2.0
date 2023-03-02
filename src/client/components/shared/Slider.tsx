import * as React from 'react';
import Slider from '@mui/material/Slider';
export function StyledSlider({ min = 50, max = 500, onChange, value, name }) {
  return (
    <Slider
      max={max}
      min={min}
      className="setting__drawer__slider"
      valueLabelDisplay="on"
      onChange={onChange}
      value={value}
      name={name}
    />
  );
}
