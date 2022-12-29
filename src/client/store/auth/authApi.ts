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
              accessToken: result.data.accessToken,
            }),
          );
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
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
              accessToken: result.data.accessToken,
            }),
          );

          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
            }),
          );
        } catch (err) {
          // do nothing
        }
      },
    }),
  }),
});

export const { useSigninMutation, useSignupMutation } = authApi;
