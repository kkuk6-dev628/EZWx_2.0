import Slider from '@mui/material/Slider';
import React, { useState } from 'react';
import { simpleTimeFormat } from '../map/AreoFunctions';
import TimeSlider from './TimeSlider';
import { useDispatch, useSelector } from 'react-redux';
import { setTimeSliderValue } from '../../features/timeSlider';
function CollapsibleBar() {
  const selector = useSelector((state) => state);
  console.log(selector);
  const dispatch = useDispatch();
  // const [windowSize, setWindowSize] = useState(setWindowSize());
  const valueToTime = (value) => {
    const currentDate = new Date();
    const origin = new Date();
    origin.setDate(currentDate.getDate() - 1);
    origin.setHours(12, 0, 0);
    origin.setMinutes(value * 5);
    return origin;
  };
  const marks = [
    {
      value: 0,
      label: simpleTimeFormat(valueToTime(0)),
    },
    {
      value: 12 * 12,
      label: simpleTimeFormat(valueToTime(12 * 12)),
    },
    {
      value: 36 * 12,
      label: simpleTimeFormat(valueToTime(36 * 12)),
    },
    {
      value: 60 * 12,
      label: simpleTimeFormat(valueToTime(60 * 12)),
    },
    {
      value: 84 * 12,
      label: simpleTimeFormat(valueToTime(84 * 12)),
    },
  ];

  function valuetext(value: number) {
    return <div>{simpleTimeFormat(valueToTime(value))}</div>;
  }

  const handleTimeChange = (time) => {
    // console.log(time);
    const convertSerializable = new Date(time);
    //conver to string
    const timestamp = convertSerializable.toISOString();
    // console.log(timestamp);
    dispatch(setTimeSliderValue(timestamp));
  };

  return (
    <div className="collps">
      <Slider
        style={{ width: '90%' }}
        aria-label="Time Slider"
        defaultValue={80}
        max={84 * 12}
        valueLabelFormat={valuetext}
        step={1}
        marks={marks}
        valueLabelDisplay="on"
        onChange={(e) => {
          handleTimeChange(valueToTime(e.target.value));
        }}
        onChangeCommitted={(e) => {
          // console.log(e);
        }}
      />
    </div>
  );
}

export default CollapsibleBar;
