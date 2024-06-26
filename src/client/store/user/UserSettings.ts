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
    MVFR: { cat: 'MVFR', color: '#4949FF', ceiling: 1000, visibility: 3 },
    VFR: { cat: 'VFR', color: '#008300', ceiling: 3000, visibility: 5 },
  },
  settings: {
    observation_time: Date.now(),
    observation_interval: 75,
    default_home_airport: 'KCLT',
    landing_page: undefined,
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
    active_route: undefined,
  },
};

export const UserSettingsSlice = createSlice({
  name: 'userSettings',
  initialState: initialUserSettingsState,
  reducers: {
    setUserSettings: (state, action) => {
      state.settings.observation_time = action.payload.observation_time;
      state.settings.observation_interval = action.payload.observation_interval;
      state.settings.default_home_airport = action.payload.default_home_airport;
      state.settings.landing_page = action.payload.landing_page;
      state.settings.default_temperature_unit = action.payload.default_temperature_unit;
      state.settings.default_time_display_unit = action.payload.default_time_display_unit;
      state.settings.default_wind_speed_unit = action.payload.default_wind_speed_unit;
      state.settings.default_distance_unit = action.payload.default_distance_unit;
      state.settings.default_visibility_unit = action.payload.default_visibility_unit;
      state.settings.max_takeoff_weight_category = action.payload.max_takeoff_weight_category;
      state.settings.true_airspeed = action.payload.true_airspeed;
      state.settings.ceiling_at_departure = action.payload.ceiling_at_departure;
      state.settings.surface_visibility_at_departure = action.payload.surface_visibility_at_departure;
      state.settings.crosswinds_at_departure_airport = action.payload.crosswinds_at_departure_airport;
      state.settings.ceiling_along_route = action.payload.ceiling_along_route;
      state.settings.surface_visibility_along_route = action.payload.surface_visibility_along_route;
      state.settings.en_route_icing_probability = action.payload.en_route_icing_probability;
      state.settings.en_route_icing_intensity = action.payload.en_route_icing_intensity;
      state.settings.en_route_turbulence_intensity = action.payload.en_route_turbulence_intensity;
      state.settings.en_route_convective_potential = action.payload.en_route_convective_potential;
      state.settings.ceiling_at_destination = action.payload.ceiling_at_destination;
      state.settings.surface_visibility_at_destination = action.payload.surface_visibility_at_destination;
      state.settings.crosswinds_at_destination_airport = action.payload.crosswinds_at_destination_airport;
    },
    setPersonalMinimums: (state, action) => {
      state.personalMinimumsState = action.payload;
    },
    setObservationTime: (state, action) => {
      state.settings.observation_time = action.payload;
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

export const { setUserSettings, setPersonalMinimums, setObservationTime } = UserSettingsSlice.actions;

export const selectPersonalMinimums = (state: AppState) => state.userSettings.personalMinimumsState;
export const selectSettings = (state: AppState) => state.userSettings.settings;

// export const selectPirep = (state: AppState) => state.layerControl.pirepState;

export default UserSettingsSlice;
