import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RouteProfileState } from '../../interfaces/route-profile';

const initialRouteProfileState: RouteProfileState = {
  chartType: 'Wind',
  windLayer: 'Windspeed',
  icingLayers: ['Prob'],
  turbLayers: ['CAT'],
  maxAltitude: 500,
};

const baseUrl = '/api/route-profile';

export const routeProfileApi = createApi({
  reducerPath: 'routeProfileApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['RouteProfile'],
  endpoints: (builder) => ({
    getRouteProfileState: builder.query({
      query: () => ({ url: '', method: 'Get' }),
      transformResponse: (response: RouteProfileState) => {
        if (!response) {
          return initialRouteProfileState;
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.error(response);
        return initialRouteProfileState;
      },
    }),
    updateRouteProfileState: builder.mutation({
      query: (data) => ({ url: '', method: 'Post', body: data }),
    }),
    queryRouteProfileData: builder.mutation({
      query: (data) => ({ url: 'data/findAll', method: 'Post', body: data }),
    }),
  }),
});

export const {
  useGetRouteProfileStateQuery,
  useLazyGetRouteProfileStateQuery,
  useUpdateRouteProfileStateMutation,
  useQueryRouteProfileDataMutation,
} = routeProfileApi;
