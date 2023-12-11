import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '../store';

export interface ImageryState {
  showInformation: boolean;
  selectedFavoriteId: string;
}

const initialState: ImageryState = {
  showInformation: false,
  selectedFavoriteId: '',
};

export const ImagerySlice = createSlice({
  name: 'imageryState',
  initialState,
  reducers: {
    setShowInformation: (state) => {
      state.showInformation = !state.showInformation;
    },
    setSelectedFavoriteId: (state, action) => {
      state.selectedFavoriteId = action.payload;
    },
  },
});

export const { setShowInformation, setSelectedFavoriteId } = ImagerySlice.actions;
export const selectShowInformation = (state: AppState) => state.imageryState.showInformation;
export const selectSelectedFavoriteId = (state: AppState) => state.imageryState.selectedFavoriteId;

export default ImagerySlice;
