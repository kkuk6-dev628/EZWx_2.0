/* eslint-disable @typescript-eslint/ban-ts-comment */
import Slider from '@mui/material/Slider';
import React from 'react';
import {
  getTimeRangeStart,
  simpleTimeFormat,
} from '../map/common/AreoFunctions';
import { useDispatch } from 'react-redux';
import { setObsTime } from '../../store/ObsTimeSlice';
function CollapsibleBar() {
  const dispatch = useDispatch();
  const valueToTime = (value) => {
    const origin = getTimeRangeStart();
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

  const handleTimeChange = (time: Date) => {
    dispatch(setObsTime(time.toISOString()));
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
          // @ts-ignore
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
