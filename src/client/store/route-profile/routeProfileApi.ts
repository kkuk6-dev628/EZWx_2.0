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

const transformDataset = (response: any[]): RouteProfileDataset[] => {
  const results: RouteProfileDataset[] = response.map((row) => {
    return {
      time:
        row.time.substring(0, 4) +
        '-' +
        row.time.substring(4, 6) +
        '-' +
        row.time.substring(6, 11) +
        ':' +
        row.time.substring(11, 13),
      data: row.data.map((seg) => {
        return {
          position: seg.position,
          data: Object.entries(seg.data)
            .map((elevation) => {
              if (elevation[0] === 'width' || elevation[0] === 'height') {
                return;
              }
              return { elevation: row.elevations[elevation[0]], value: elevation[1][0] };
            })
            .filter((n) => n),
        };
      }),
      elevations: row.elevations,
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
    queryCaturbData: builder.mutation({
      query: (data) => ({ url: 'data/cat', method: 'Post', body: data }),
      transformResponse: transformDataset,
    }),
    queryMwturbData: builder.mutation({
      query: (data) => ({ url: 'data/mwturb', method: 'Post', body: data }),
      transformResponse: transformDataset,
    }),
    queryHumidityData: builder.mutation({
      query: (data) => ({ url: 'data/humidity', method: 'Post', body: data }),
      transformResponse: transformDataset,
    }),
    queryTemperatureData: builder.mutation({
      query: (data) => ({ url: 'data/temperature', method: 'Post', body: data }),
      transformResponse: transformDataset,
    }),
    queryGfsWindDirectionData: builder.mutation({
      query: (data) => ({ url: 'data/gfs-winddirection', method: 'Post', body: data }),
      transformResponse: transformDataset,
    }),
    queryGfsWindSpeedData: builder.mutation({
      query: (data) => ({ url: 'data/gfs-windspeed', method: 'Post', body: data }),
      transformResponse: transformDataset,
    }),
    queryIcingProbData: builder.mutation({
      query: (data) => ({ url: 'data/icing-prob', method: 'Post', body: data }),
      transformResponse: transformDataset,
    }),
    queryIcingSevData: builder.mutation({
      query: (data) => ({ url: 'data/icing-sev', method: 'Post', body: data }),
      transformResponse: transformDataset,
    }),
    queryIcingSldData: builder.mutation({
      query: (data) => ({ url: 'data/icing-sld', method: 'Post', body: data }),
      transformResponse: transformDataset,
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
