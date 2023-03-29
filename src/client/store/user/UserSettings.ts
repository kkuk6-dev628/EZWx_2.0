import { createSlice } from '@reduxjs/toolkit';
import { UserSettings } from '../../interfaces/users';
import { AppState } from '../store';

export interface PersonalMinimumItem {
  color: string;
  ceiling: number;
  visibility: number;
  cat: string;
}

export interface PersonalMinimums {
  LIFR: PersonalMinimumItem;
  IFR: PersonalMinimumItem;
  MVFR: PersonalMinimumItem;
  VFR: PersonalMinimumItem;
}

export interface UserSettingsState {
  personalMinimumsState: PersonalMinimums;
}

export const initialUserSettingsState: {
  personalMinimumsState: PersonalMinimums;
  settings: UserSettings;
} = {
  personalMinimumsState: {
    LIFR: { cat: 'LIFR', color: '#f0f', ceiling: 0, visibility: 0 },
    IFR: { cat: 'IFR', color: '#f00', ceiling: 500, visibility: 1 },
    MVFR: { cat: 'MVFR', color: '#00f', ceiling: 1000, visibility: 3 },
    VFR: { cat: 'VFR', color: '#008300', ceiling: 3000, visibility: 5 },
  },
  settings: {
    observation_time: Date.now(),
    observation_interval: 75,
    default_home_airport: 'KCLT',
    default_temperature_unit: false,
    default_time_display_unit: false,
    default_wind_speed_unit: false,
    default_distance_unit: false,
    default_visibility_unit: false,
    max_takeoff_weight_category: 'light',
    true_airspeed: 110,
    ceiling_at_departure: [1000, 3000],
    surface_visibility_at_departure: [3, 7],
    crosswinds_at_departure_airport: [10, 15],
    ceiling_along_route: [1000, 3000],
    surface_visibility_along_route: [3, 7],
    en_route_icing_probability: [10, 20],
    en_route_icing_intensity: [1, 3],
    en_route_turbulence_intensity: [16, 36],
    en_route_convective_potential: [1, 3],
    ceiling_at_destination: [1000, 3000],
    surface_visibility_at_destination: [3, 7],
    crosswinds_at_destination_airport: [10, 15],
  },
};

export const UserSettingsSlice = createSlice({
  name: 'userSettings',
  initialState: initialUserSettingsState,
  reducers: {
    setUserSettings: (state, action) => {
      state.settings = action.payload;
    },
    setPersonalMinimums: (state, action) => {
      state.personalMinimumsState = action.payload;
    },
  },
});

export interface SettingsLoadTimeState {
  settingsLoadTimeState: number;
}

const initialSettingsLoadTimeState: SettingsLoadTimeState = {
  settingsLoadTimeState: Date.now(),
};

export const SettingsLoadTimeSlice = createSlice({
  name: 'settingsLoadTime',
  initialState: initialSettingsLoadTimeState,
  reducers: {
    setSettingsLoadTime: (state, action) => {
      state.settingsLoadTimeState = action.payload;
    },
  },
});

export const { setSettingsLoadTime } = SettingsLoadTimeSlice.actions;

export const selectSettingsLoadTime = (state: AppState) => state.settingsLoadTime.settingsLoadTimeState;

export const { setUserSettings, setPersonalMinimums } = UserSettingsSlice.actions;

export const selectPersonalMinimums = (state: AppState) => state.userSettings.personalMinimumsState;
export const selectSettings = (state: AppState) => state.userSettings.settings;

// export const selectPirep = (state: AppState) => state.layerControl.pirepState;

export default UserSettingsSlice;
