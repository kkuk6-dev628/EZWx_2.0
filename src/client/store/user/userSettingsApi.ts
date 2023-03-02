import { toast } from 'react-hot-toast';
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
          if (result.data) dispatch(setUserSettings({ ...result.data }));
        } catch (err) {
          console.error('Error: ', err);
        }
      },
    }),
    restoreSettings: builder.mutation({
      query: (id) => ({
        url: `/settings/restore/${id}`,
        method: 'PATCH',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          if (JSON.parse(JSON.stringify(result)).data) {
            toast.success('Settings Restored!', {
              position: 'top-right',
              duration: 3000,
            });
            dispatch(setUserSettings({ ...result.data }));
          }
        } catch (error) {
          console.error('Error: ', error);
          toast.error(error, {
            position: 'top-right',
            duration: 3000,
          });
        }
      },
    }),
    updateUserSettings: builder.mutation({
      query: (data) => ({
        url: '/settings/update',
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (JSON.parse(JSON.stringify(result)).data) {
            console.log('none')
            toast.success('Settings Saved!', {
              position: 'top-right',
              duration: 3000,
            });
            dispatch(setUserSettings({ ...result.data }));
          }
        } catch (err) {
          toast.error(err, {
            position: 'top-right',
            duration: 3000,
          });
          console.error('Error: ', err);
        }
      },
    }),
  }),
});

export const { useGetUserSettingsQuery, useUpdateUserSettingsMutation, useRestoreSettingsMutation } = userSettingsApi;
