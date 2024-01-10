import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface HeaderState {
  showSavedView: boolean;
  showSettingsView: boolean;
  showGeneralSettings: boolean;
  showPersonalMins: boolean;
  loadedLandingPage: boolean;
}

const initialState: HeaderState = {
  showSavedView: false,
  showSettingsView: false,
  showGeneralSettings: false,
  showPersonalMins: false,
  loadedLandingPage: false,
};

export const HeaderSlice = createSlice({
  name: 'headerState',
  initialState,
  reducers: {
    setShowSavedView: (state, action) => {
      state.showSavedView = action.payload;
    },
    setShowSettingsView: (state, action) => {
      state.showSettingsView = action.payload;
    },
    setShowGeneralSettings: (state, action) => {
      state.showGeneralSettings = action.payload;
    },
    setShowPersonalMins: (state, action) => {
      state.showPersonalMins = action.payload;
    },
    setLoadedLandingPage: (state, action) => {
      state.loadedLandingPage = action.payload;
    },
  },
});

export const {
  setShowSavedView,
  setShowSettingsView,
  setShowGeneralSettings,
  setShowPersonalMins,
  setLoadedLandingPage,
} = HeaderSlice.actions;
export const selectShowSavedView = (state: AppState) => state.headerState.showSavedView;
export const selectShowSettingsView = (state: AppState) => state.headerState.showSettingsView;
export const selectShowGeneralSettings = (state: AppState) => state.headerState.showGeneralSettings;
export const selectShowPersonalMins = (state: AppState) => state.headerState.showPersonalMins;
export const selectLoadedLandingPage = (state: AppState) => state.headerState.loadedLandingPage;

export default HeaderSlice;
