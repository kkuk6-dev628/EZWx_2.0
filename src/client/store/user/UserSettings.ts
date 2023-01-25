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

const initialState: UserSettingsState = {
  personalMinimumsState: {
    LIFR: { cat: 'LIFR', color: '#f0f', ceiling: 0, visibility: 0 },
    IFR: { cat: 'IFR', color: '#f00', ceiling: 500, visibility: 1 },
    MVFR: { cat: 'MVFR', color: '#00f', ceiling: 1000, visibility: 3 },
    VFR: { cat: 'VFR', color: '#008300', ceiling: 3000, visibility: 5 },
  },
};

export const UserSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    setPersonalMinimums: (state, action) => {
      state.personalMinimumsState = action.payload;
    },
    // setPirep: (state, action) => {
    //   state.pirepState = action.payload;
    // },
  },
});

export const { setPersonalMinimums } = UserSettingsSlice.actions;

export const selectPersonalMinimums = (state: AppState) =>
  state.userSettings.personalMinimumsState;

// export const selectPirep = (state: AppState) => state.layerControl.pirepState;

export default UserSettingsSlice;
