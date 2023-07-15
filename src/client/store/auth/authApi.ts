import { authUser } from '../../interfaces/users';
import { apiSlice } from './../api/apiSlice';
import { userLoggedIn } from './authSlice';

const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<authUser, any>({
      query: (data) => ({
        url: '/auth/signup',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;

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
    signin: builder.mutation<authUser, any>({
      query: (data) => ({
        url: '/auth/signin',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

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
    getUser: builder.query<authUser, null>({
      query: () => ({
        url: '/auth/getUser',
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

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
    signout: builder.query<null, null>({
      query: () => ({
        url: '/auth/signout',
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;

          dispatch(
            userLoggedIn({
              email: '',
              id: '',
              displayName: '',
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

export const { useSigninMutation, useSignupMutation, useGetUserQuery } = authApi;
