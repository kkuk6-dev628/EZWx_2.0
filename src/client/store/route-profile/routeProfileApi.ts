import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RouteProfileDataset, RouteProfileState } from '../../interfaces/route-profile';

const initialRouteProfileState: RouteProfileState = {
  chartType: 'Wind',
  windLayer: 'Windspeed',
  icingLayers: ['Prob'],
  turbLayers: ['CAT'],
  maxAltitude: 500,
};

const baseUrl = '/api/route-profile';

const transformElevationBands = (response: any[]): RouteProfileDataset[] => {
  const results: RouteProfileDataset[] = response.map((row) => {
    return {
      time: row.time,
      data: row.data.map((seg) => {
        return {
          position: seg.position,
          data: Object.entries(seg.data)
            .map((elevation) => {
              if (elevation[0] === 'width' || elevation[0] === 'height') {
                return;
              }
              return { elevation: parseInt(row.elevations[elevation[0]]), value: elevation[1][0] };
            })
            .filter((n) => n),
        };
      }),
      elevations: row.elevations,
    };
  });
  return results;
};

const transformTimeBands = (response: any[]): RouteProfileDataset[] => {
  const results: RouteProfileDataset[] = response.map((row) => {
    return {
      time: row.time,
      elevations: row.elevations.map((el) => parseInt(el)),
      data: row.data.map((seg) => {
        return {
          position: seg.position,
          data: Object.entries(seg.data)
            .map((elevation) => {
              if (elevation[0] === 'width' || elevation[0] === 'height') {
                return;
              }
              return { elevation: parseInt(row.elevations[0]), value: elevation[1][0], time: row.time[elevation[0]] };
            })
            .filter((n) => n),
        };
      }),
    };
  });
  return results;
};

export const routeProfileApi = createApi({
  reducerPath: 'routeProfileApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['RouteProfileState'],
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
      providesTags: [{ type: 'RouteProfileState', id: 'LIST' }],
    }),
    updateRouteProfileState: builder.mutation({
      query: (data) => ({ url: '', method: 'Post', body: data }),
      invalidatesTags: ['RouteProfileState'],
    }),
    queryAirportProperties: builder.mutation({
      query: (data) => ({ url: 'data/airport-props', method: 'Post', body: data }),
      transformResponse: transformElevationBands,
    }),
    queryCaturbData: builder.mutation({
      query: (data) => ({ url: 'data/cat', method: 'Post', body: data }),
      transformResponse: transformElevationBands,
    }),
    queryMwturbData: builder.mutation({
      query: (data) => ({ url: 'data/mwturb', method: 'Post', body: data }),
      transformResponse: transformElevationBands,
    }),
    queryHumidityData: builder.mutation({
      query: (data) => ({ url: 'data/humidity', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryTemperatureData: builder.mutation({
      query: (data) => ({ url: 'data/temperature', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryGfsWindDirectionData: builder.mutation({
      query: (data) => ({ url: 'data/gfs-winddirection', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryGfsWindSpeedData: builder.mutation({
      query: (data) => ({ url: 'data/gfs-windspeed', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryIcingProbData: builder.mutation({
      query: (data) => ({ url: 'data/icing-prob', method: 'Post', body: data }),
      transformResponse: transformElevationBands,
    }),
    queryIcingSevData: builder.mutation({
      query: (data) => ({ url: 'data/icing-sev', method: 'Post', body: data }),
      transformResponse: transformElevationBands,
    }),
    queryIcingSldData: builder.mutation({
      query: (data) => ({ url: 'data/icing-sld', method: 'Post', body: data }),
      transformResponse: transformElevationBands,
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
  useQueryIcingProbDataMutation,
  useQueryIcingSevDataMutation,
  useQueryIcingSldDataMutation,
} = routeProfileApi;
