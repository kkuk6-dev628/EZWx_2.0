import { authUser } from '../../interfaces/users';
import { apiSlice } from './../api/apiSlice';
import { userLoggedIn, userLoggedOut } from './authSlice';

const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<authUser, any>({
      query: (data: any) => ({
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
    signout: builder.mutation<null, null>({
      query: () => ({
        url: '/auth/signout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
          window.location = '/home' as any;
        } catch (err) {
          // do nothing
          console.log('Error: ', err);
        }
      },
    }),
    existUser: builder.query<boolean, string>({
      query: (email) => ({ url: '/user/find?email=' + email }),
    }),
  }),
});

export const { useSigninMutation, useSignupMutation, useGetUserQuery, useSignoutMutation, useExistUserQuery } = authApi;
