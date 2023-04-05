import { response } from 'express';
import { toast } from 'react-hot-toast';
import { UserSettings } from '../../interfaces/users';
import { apiSlice } from './../api/apiSlice';
import { initialUserSettingsState, setUserSettings } from './UserSettings';

const userSettingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserSettings: builder.query({
      query: (id) => ({
        url: `/settings/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: UserSettings) => {
        if (response) {
          return { ...response, observation_time: parseInt(response.observation_time as unknown as string) };
        }
        return initialUserSettingsState.settings;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          if (result.data && 'default_home_airport' in result.data) {
            const settings = { ...result.data };
            if (!result.data.observation_time) {
              settings.observation_time = initialUserSettingsState.settings.observation_time;
            }
            if (!result.data.observation_interval) {
              settings.observation_interval = initialUserSettingsState.settings.observation_interval;
            }
            dispatch(setUserSettings(settings));
          }
        } catch (err) {
          console.error('Error: ', err);
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
            const settings = { ...result.data };
            if (!result.data.observation_time) {
              settings.observation_time = initialUserSettingsState.settings.observation_time;
            }
            if (!result.data.observation_interval) {
              settings.observation_interval = initialUserSettingsState.settings.observation_interval;
            }
            dispatch(setUserSettings(settings));
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

export const { useGetUserSettingsQuery, useUpdateUserSettingsMutation } = userSettingsApi;
