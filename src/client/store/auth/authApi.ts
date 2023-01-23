import { apiSlice } from './../api/apiSlice';
import { userLoggedIn } from './authSlice';

const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (data) => ({
        url: '/auth/signup',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;

          localStorage.setItem(
            'auth',
            JSON.stringify({
              email: result.data.email,
              id: result.data.id,
              displayName: result.data.displayName,
            }),
          );

          dispatch(
            userLoggedIn({
              email: result.data.email,
              id: result.data.id,
              displayName: result.data.displayName,
            }),
          );
        } catch (err) {
          console.error('Error: ', err);
        }
      },
    }),
    signin: builder.mutation({
      query: (data) => ({
        url: '/auth/signin',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          localStorage.setItem(
            'auth',
            JSON.stringify({
              email: result.data.email,
              id: result.data.id,
              displayName: result.data.displayName,
            }),
          );

          dispatch(
            userLoggedIn({
              email: result.data.email,
              id: result.data.id,
              displayName: result.data.displayName,
            }),
          );
        } catch (err) {
          // do nothing
          console.log('Error: ', err);
        }
      },
    }),
  }),
});

export const { useSigninMutation, useSignupMutation } = authApi;
