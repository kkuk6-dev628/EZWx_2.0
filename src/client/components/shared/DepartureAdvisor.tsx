/* eslint-disable @typescript-eslint/ban-ts-comment */
import Slider from '@mui/material/Slider';
import React from 'react';
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
        <div className="bars-container">
          <div className="bar">
            <i className="dot circle"></i>
            <i className="dot circle"></i>
            <i className="dot circle"></i>
            <i className="dot circle"></i>
            <i className="dot rect"></i>
            <i className="dot rect"></i>
            <i className="dot rect"></i>
            <i className="dot rect"></i>
            <i className="dot triangle"></i>
            <i className="dot triangle"></i>
            <i className="dot triangle"></i>
            <i className="dot triangle"></i>
          </div>
          <div className="bar">
            <i className="dot circle"></i>
            <i className="dot circle"></i>
            <i className="dot circle"></i>
            <i className="dot circle"></i>
            <i className="dot rect"></i>
            <i className="dot rect"></i>
            <i className="dot rect"></i>
            <i className="dot rect"></i>
            <i className="dot triangle"></i>
            <i className="dot triangle"></i>
            <i className="dot triangle"></i>
            <i className="dot triangle"></i>
          </div>
          <div className="bar">
            <i className="dot circle"></i>
            <i className="dot circle"></i>
            <i className="dot circle"></i>
            <i className="dot circle"></i>
            <i className="dot rect"></i>
            <i className="dot rect"></i>
            <i className="dot rect"></i>
            <i className="dot rect"></i>
            <i className="dot triangle"></i>
            <i className="dot triangle"></i>
            <i className="dot triangle"></i>
            <i className="dot triangle"></i>
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
  const marks = [
    {
      value: 0,
      label: simpleTimeFormat(valueToTime(0), settingsState.default_time_display_unit),
    },
    {
      value: 12 * 12,
      label: simpleTimeFormat(valueToTime(12 * 12), settingsState.default_time_display_unit),
    },
    {
      value: 36 * 12,
      label: simpleTimeFormat(valueToTime(36 * 12), settingsState.default_time_display_unit),
    },
    {
      value: 60 * 12,
      label: simpleTimeFormat(valueToTime(60 * 12), settingsState.default_time_display_unit),
    },
    {
      value: 84 * 12,
      label: simpleTimeFormat(valueToTime(84 * 12), settingsState.default_time_display_unit),
    },
  ];

  return (
    <div className="departure-advisor">
      <div className="blocks-container">
        <div className="move-left">-3h</div>
        <div className="blocks-date">
          <div className="horizental-blocks">
            <div className="block green">3z</div>
            <div className="block red">6z</div>
            <div className="block yellow">9z</div>
            <div className="block grey">12z</div>
            <div className="block grey">15z</div>
            <div className="block grey">18z</div>
            <div className="block grey">21z</div>
            <div className="block grey">24z</div>
          </div>
          <div className="date">
            {simpleTimeFormat(new Date(settingsState.observation_time), settingsState.default_time_display_unit)}
          </div>
        </div>
        <div className="move-right">+3h</div>
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
