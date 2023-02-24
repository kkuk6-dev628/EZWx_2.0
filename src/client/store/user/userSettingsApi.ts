import { apiSlice } from './../api/apiSlice';
import { setUserSettings } from './UserSettings';

const userSettingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserSettings: builder.query({
      query: (id) => ({
        url: `/settings/${id}`,
        method: 'GET',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('result', result);
          dispatch(setUserSettings({ ...result.data }));
        } catch (err) {
          console.error('Error: ', err);
        }
      },
    }),
    updateUserSettings: builder.query({
      query: (data) => ({
        url: '/settings/update',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          console.log('result', result);
          dispatch(setUserSettings({ ...result.data }));
        } catch (err) {
          console.error('Error: ', err);
        }
      },
    }),
  }),
});

export const { useGetUserSettingsQuery, useUpdateUserSettingsQuery } = userSettingsApi;
