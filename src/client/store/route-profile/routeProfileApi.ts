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
    queryCaturbData: builder.mutation({
      query: (data) => ({ url: 'data/cat', method: 'Post', body: data }),
    }),
    queryMwturbData: builder.mutation({
      query: (data) => ({ url: 'data/mwturb', method: 'Post', body: data }),
    }),
    queryHumidityData: builder.mutation({
      query: (data) => ({ url: 'data/humidity', method: 'Post', body: data }),
    }),
    queryTemperatureData: builder.mutation({
      query: (data) => ({ url: 'data/temperature', method: 'Post', body: data }),
    }),
    queryGfsWindDirectionData: builder.mutation({
      query: (data) => ({ url: 'data/gfs-winddirection', method: 'Post', body: data }),
    }),
    queryGfsWindSpeedData: builder.mutation({
      query: (data) => ({ url: 'data/gfs-windspeed', method: 'Post', body: data }),
    }),
  }),
});

export const {
  useGetRouteProfileStateQuery,
  useLazyGetRouteProfileStateQuery,
  useUpdateRouteProfileStateMutation,
  useQueryCaturbDataMutation,
  useQueryMwturbDataMutation,
  useQueryHumidityDataMutation,
  useQueryTemperatureDataMutation,
  useQueryGfsWindDirectionDataMutation,
  useQueryGfsWindSpeedDataMutation,
} = routeProfileApi;
