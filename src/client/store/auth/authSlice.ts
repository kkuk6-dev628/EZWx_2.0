import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.accessToken = action.payload.accessToken;
    },
    userLoggedOut: (state) => {
      state.accessToken = '';
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;

export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice;
