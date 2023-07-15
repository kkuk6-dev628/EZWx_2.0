import { createSlice } from '@reduxjs/toolkit';
import { authUser } from '../../interfaces/users';
import { AppState } from '../store';

const initialState: authUser = {
  email: '',
  id: '',
  displayName: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.email = action.payload.email;
      state.id = action.payload.id;
      state.displayName = action.payload.displayName;
    },
    userLoggedOut: (state) => {
      state.email = '';
      state.id = '';
      state.displayName = '';
      localStorage.removeItem('auth');
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;

export const selectAuth = (state: AppState) => state.auth;

export default authSlice;
