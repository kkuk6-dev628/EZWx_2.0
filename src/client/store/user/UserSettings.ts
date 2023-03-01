import { createSlice } from '@reduxjs/toolkit';
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

const initialState: any = {
  personalMinimumsState: {
    LIFR: { cat: 'LIFR', color: '#f0f', ceiling: 0, visibility: 0 },
    IFR: { cat: 'IFR', color: '#f00', ceiling: 500, visibility: 1 },
    MVFR: { cat: 'MVFR', color: '#00f', ceiling: 1000, visibility: 3 },
    VFR: { cat: 'VFR', color: '#008300', ceiling: 3000, visibility: 5 },
  },
  settings: {
    default_home_airport: '',
    default_temperature_unit: true,
    default_time_display_unit: true,
    default_wind_speed_unit: true,
    default_distance_unit: true,
    default_visibility_unit: true,
    max_takeoff_weight_category: 'light',
    true_airspeed: 2,
    ceiling_at_departure: [100, 6000],
    surface_visibility_at_departure: [2, 12],
    crosswinds_at_departure_airport: [3, 35],
    ceiling_along_route: [100, 6000],
    surface_visibility_along_route: [2, 12],
    en_route_icing_probability: [5, 100],
    en_route_icing_intensity: [2, 10],
    en_route_turbulence_intensity: [5, 100],
    en_route_convective_potential: [2, 12],
    ceiling_at_destination: [100, 6000],
    surface_visibility_at_destination: [2, 12],
    crosswinds_at_destination_airport: [3, 35],
  },
};

export const UserSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    setUserSettings: (state, action) => {
      state.settings = action.payload;
    },
    setPersonalMinimums: (state, action) => {
      state.personalMinimumsState = action.payload;
    },
  },
});

export const { setUserSettings, setPersonalMinimums } = UserSettingsSlice.actions;

export const selectPersonalMinimums = (state: AppState) => state.userSettings.personalMinimumsState;
export const selectSettings = (state: AppState) => state.userSettings.settings;

// export const selectPirep = (state: AppState) => state.layerControl.pirepState;

export default UserSettingsSlice;
