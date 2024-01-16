import { createSlice } from '@reduxjs/toolkit';
import { authUser } from '../../interfaces/users';
import { AppState } from '../store';

const initialState: authUser = {
  email: '',
  id: '',
  displayName: '',
  avatar: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.email = action.payload.email;
      state.id = action.payload.id;
      state.displayName = action.payload.displayName;
      state.avatar = action.payload.avatar;
    },
    userLoggedOut: (state) => {
      state.email = '';
      state.id = '';
      state.displayName = '';
      state.avatar = '';
      localStorage.removeItem('auth');
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;

export const selectAuth = (state: AppState) => state.auth;

export default authSlice;
