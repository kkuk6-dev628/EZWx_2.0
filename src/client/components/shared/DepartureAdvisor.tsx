/* eslint-disable @typescript-eslint/ban-ts-comment */
import Slider from '@mui/material/Slider';
import React, { useEffect, useState } from 'react';
import { diffMinutes, getTimeRangeStart, simpleTimeFormat, simpleTimeOnlyFormat } from '../map/common/AreoFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { selectSettings, setUserSettings } from '../../store/user/UserSettings';
import { useUpdateUserSettingsMutation } from '../../store/user/userSettingsApi';
import { selectAuth } from '../../store/auth/authSlice';

function DepartureAdvisor() {
  const dispatch = useDispatch();
  const settingsState = useSelector(selectSettings);
  const obsInterval = settingsState.observation_interval;
  let defaultTime;
  const [updateUserSettingsAPI] = useUpdateUserSettingsMutation();
  const auth = useSelector(selectAuth);
  const [hideDotsBars, setHideDotsBars] = useState(true);

  useEffect(() => {
    setHideDotsBars(false);
  }, [settingsState.observation_time]);

  useEffect(() => {
    if (!hideDotsBars) {
      setHideDotsBars(true);
    }
  }, [settingsState.observation_time, hideDotsBars]);

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

  function valuetext(value: number) {
    return (
      <div className="slider-label-container">
        <div className={'bars-container' + (hideDotsBars ? ' fade-out' : '')}>
          <div className="bar">
            <i className="dot circle red"></i>
            <i className="dot circle red"></i>
            <i className="dot circle red"></i>
            <i className="dot circle red"></i>
            <i className="dot rect yellow"></i>
            <i className="dot rect yellow"></i>
            <i className="dot rect yellow"></i>
            <i className="dot rect yellow"></i>
            <i className="dot triangle green"></i>
            <i className="dot triangle green"></i>
            <i className="dot triangle green"></i>
            <i className="dot triangle green"></i>
          </div>
          <div className="bar">
            <i className="dot circle red"></i>
            <i className="dot circle red"></i>
            <i className="dot rect yellow"></i>
            <i className="dot rect yellow"></i>
            <i className="dot triangle green"></i>
            <i className="dot triangle green"></i>
            <i className="dot triangle green"></i>
            <i className="dot triangle green"></i>
            <i className="dot circle red"></i>
            <i className="dot circle red"></i>
            <i className="dot rect yellow"></i>
            <i className="dot rect yellow"></i>
          </div>
          <div className="bar">
            <i className="dot circle red"></i>
            <i className="dot circle red"></i>
            <i className="dot rect yellow"></i>
            <i className="dot rect yellow"></i>
            <i className="dot triangle green"></i>
            <i className="dot circle red"></i>
            <i className="dot circle red"></i>
            <i className="dot rect yellow"></i>
            <i className="dot rect yellow"></i>
            <i className="dot triangle green"></i>
            <i className="dot triangle green"></i>
            <i className="dot triangle green"></i>
          </div>
        </div>
        <div className="label">{simpleTimeOnlyFormat(valueToTime(value), settingsState.default_time_display_unit)}</div>
      </div>
    );
  }

  const handleTimeChange = (time: Date, commit = true) => {
    const timespan = time.getTime();
    const newSettings = { ...settingsState, observation_time: timespan };
    if (commit && auth.id) updateUserSettingsAPI(newSettings);
    dispatch(setUserSettings(newSettings));
  };

  const handleIntervalChange = (minutes: number) => {
    const newSettings = { ...settingsState, observation_interval: minutes };
    if (auth.id) updateUserSettingsAPI(newSettings);
    dispatch(setUserSettings(newSettings));
  };

  if (
    settingsState.observation_time >= getTimeRangeStart().getTime() &&
    settingsState.observation_time <= valueToTime(84 * 12).getTime()
  ) {
    defaultTime = new Date(settingsState.observation_time);
  } else {
    defaultTime = new Date();
    handleTimeChange(defaultTime, true);
  }

  function handleClick3h(isForward) {
    const newTime = settingsState.observation_time + (isForward ? 1 : -1) * 3 * 3600 * 1000;
    handleTimeChange(new Date(newTime), true);
  }

  function handleClickHour(hour: number) {
    const oldTime = new Date(settingsState.observation_time);
    settingsState.default_time_display_unit ? oldTime.setHours(hour, 0, 0, 0) : oldTime.setUTCHours(hour, 0, 0, 0);
    handleTimeChange(oldTime, true);
  }

  return (
    <div className="departure-advisor">
      <div className="blocks-container">
        <div className="move-left" onClick={() => handleClick3h(false)}>
          -3h
        </div>
        <div className="blocks-date">
          <div className="horizental-blocks">
            <div className="block green" onClick={() => handleClickHour(3)}>
              3z
            </div>
            <div className="block red" onClick={() => handleClickHour(6)}>
              6z
            </div>
            <div className="block yellow" onClick={() => handleClickHour(9)}>
              9z
            </div>
            <div className="block grey" onClick={() => handleClickHour(12)}>
              12z
            </div>
            <div className="block grey" onClick={() => handleClickHour(15)}>
              15z
            </div>
            <div className="block grey" onClick={() => handleClickHour(18)}>
              18z
            </div>
            <div className="block grey" onClick={() => handleClickHour(21)}>
              21z
            </div>
            <div className="block grey" onClick={() => handleClickHour(24)}>
              24z
            </div>
          </div>
          <div className="date">
            {simpleTimeFormat(new Date(settingsState.observation_time), settingsState.default_time_display_unit)}
          </div>
        </div>
        <div className="move-right" onClick={() => handleClick3h(true)}>
          +3h
        </div>
      </div>
      <Slider
        className="time-slider"
        key={`time-range-slider`}
        aria-label="Time Slider"
        // defaultValue={timeToValue(defaultTime)}
        value={timeToValue(defaultTime)}
        max={84 * 12}
        valueLabelFormat={valuetext}
        step={1}
        valueLabelDisplay="on"
        onChange={(_e, newValue: number) => {
          handleTimeChange(valueToTime(newValue), false);
        }}
        onChangeCommitted={(_e, newValue: number) => {
          handleTimeChange(valueToTime(newValue));
        }}
      />
    </div>
  );
}

export default DepartureAdvisor;
