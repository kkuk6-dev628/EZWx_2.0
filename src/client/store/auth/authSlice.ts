import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth'))?.email : '',
  id: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth'))?.id : '',
  displayName: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('auth'))?.displayName : '',
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

export const selectAuth = (state) => state.auth;

export default authSlice;
