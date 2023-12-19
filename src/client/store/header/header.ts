import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface HeaderState {
  showSavedView: boolean;
  showSettingsView: boolean;
  showGeneralSettings: boolean;
  showPersonalMins: boolean;
}

const initialState: HeaderState = {
  showSavedView: false,
  showSettingsView: false,
  showGeneralSettings: false,
  showPersonalMins: false,
};

export const HeaderSlice = createSlice({
  name: 'headerState',
  initialState,
  reducers: {
    setShowSavedView: (state) => {
      state.showSavedView = !state.showSavedView;
    },
    setShowSettingsView: (state) => {
      state.showSettingsView = !state.showSettingsView;
    },
    setShowGeneralSettings: (state, action) => {
      state.showGeneralSettings = action.payload;
    },
    setShowPersonalMins: (state, action) => {
      state.showPersonalMins = action.payload;
    },
  },
});

export const { setShowSavedView, setShowSettingsView, setShowGeneralSettings, setShowPersonalMins } =
  HeaderSlice.actions;
export const selectShowSavedView = (state: AppState) => state.headerState.showSavedView;
export const selectShowSettingsView = (state: AppState) => state.headerState.showSettingsView;
export const selectShowGeneralSettings = (state: AppState) => state.headerState.showGeneralSettings;
export const selectShowPersonalMins = (state: AppState) => state.headerState.showPersonalMins;

export default HeaderSlice;
