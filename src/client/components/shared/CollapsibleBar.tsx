/* eslint-disable @typescript-eslint/ban-ts-comment */
import Slider from '@mui/material/Slider';
import React from 'react';
import { diffMinutes, getTimeRangeStart, simpleTimeFormat } from '../map/common/AreoFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { setObsTime } from '../../store/time-slider/ObsTimeSlice';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { selectObsInterval, setObsInterval } from '../../store/time-slider/ObsIntervalSlice';

function CollapsibleBar() {
  const dispatch = useDispatch();
  const obsInterval = useSelector(selectObsInterval);

  const valueToTime = (value: number): Date => {
    const origin = getTimeRangeStart();
    origin.setMinutes(value * 5);
    return origin;
  };

  const timeToValue = (time: Date): number => {
    const origin = getTimeRangeStart();
    const diff = diffMinutes(time, origin);
    return Math.floor(diff / 5);
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

  const handleIntervalChange = (minutes: number) => {
    dispatch(setObsInterval(minutes));
  };

  return (
    <div className="collps">
      <Slider
        key="time-range-slider"
        aria-label="Time Slider"
        defaultValue={timeToValue(new Date())}
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
      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <InputLabel id="Select Observation Interval">Interval</InputLabel>
        <Select
          labelId="select-observation-interval"
          id="select-observation-interval"
          value={obsInterval}
          label="Select Observation Interval"
          onChange={(e) => {
            // @ts-ignore
            handleIntervalChange(e.target.value);
          }}
        >
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={75}>75</MenuItem>
          <MenuItem value={90}>90</MenuItem>
        </Select>{' '}
      </FormControl>
    </div>
  );
}

export default CollapsibleBar;
