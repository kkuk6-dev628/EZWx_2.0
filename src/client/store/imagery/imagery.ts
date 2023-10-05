import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface ImageryState {
  showInformation: boolean;
}

const initialState: ImageryState = {
  showInformation: false,
};

export const ImagerySlice = createSlice({
  name: 'imageryState',
  initialState,
  reducers: {
    setShowInformation: (state) => {
      state.showInformation = !state.showInformation;
    },
  },
});

export const { setShowInformation } = ImagerySlice.actions;
export const selectShowInformation = (state: AppState) => state.imageryState.showInformation;

export default ImagerySlice;
