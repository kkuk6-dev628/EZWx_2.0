import * as React from 'react';
import Slider, { SliderProps } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

const SuccessSlider = styled(Slider)<SliderProps>(() => ({
  width: '100%',
  color: '#3f0c69',
  height: '14px',
  borderRadius: '3px',
  '& .MuiSlider-thumb': {
    borderRadius: '1px',
    backgroundColor: 'white',
    height: '24px',
    width: '15px',
    border: '1px solid whitesmoke',
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0px 0px 0px 0.1px white}`,
    },
    '&.Mui-active': {
      boxShadow: `0px 0px 0px 0.1px white}`,
    },
    '&.MuiSlider-valueLabel': {
      backgroundColor: 'transparent',
      padding: '0',
      fontSize: '0.8rem',
      top: '0',
      color: 'gray',
    },
  },
}));

export function StyledSlider({ min = 50, max = 500, onChange, value, name }) {
  return (
    <SuccessSlider
      max={max}
      min={min}
      valueLabelDisplay="on"
      defaultValue={30}
      onChange={onChange}
      value={value}
      name={name}
    />
  );
}
