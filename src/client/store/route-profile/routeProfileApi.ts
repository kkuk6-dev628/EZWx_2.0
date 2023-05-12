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
          data: seg.data
            ? Object.entries(seg.data)
                .map((elevation) => {
                  if (elevation[0] === 'width' || elevation[0] === 'height') {
                    return;
                  }
                  return {
                    elevation: parseInt(row.elevations[0]),
                    value: elevation[1][0],
                    time: row.time[elevation[0]],
                  };
                })
                .filter((n) => n)
            : null,
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
      // transformResponse: transformElevationBands,
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
    queryNbmCloudbase: builder.mutation({
      query: (data) => ({ url: 'data/nbm-cloudbase', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmCloudCeiling: builder.mutation({
      query: (data) => ({ url: 'data/nbm-cloudceiling', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmDewpoint: builder.mutation({
      query: (data) => ({ url: 'data/nbm-dewpoint', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmGust: builder.mutation({
      query: (data) => ({ url: 'data/nbm-gust', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmSkycover: builder.mutation({
      query: (data) => ({ url: 'data/nbm-skycover', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmTemp: builder.mutation({
      query: (data) => ({ url: 'data/nbm-t2m', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmVis: builder.mutation({
      query: (data) => ({ url: 'data/nbm-vis', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmWindDir: builder.mutation({
      query: (data) => ({ url: 'data/nbm-winddirection', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmWindSpeed: builder.mutation({
      query: (data) => ({ url: 'data/nbm-windspeed', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmWx1: builder.mutation({
      query: (data) => ({ url: 'data/nbm-wx-1', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmAll: builder.mutation({
      query: (data) => ({ url: 'data/nbm-all', method: 'Post', body: data }),
      transformResponse: (response: any) => {
        return {
          cloudbase: transformTimeBands(response.cloudbase),
          cloudceiling: transformTimeBands(response.cloudceiling),
          dewpoint: transformTimeBands(response.dewpoint),
          gust: transformTimeBands(response.gust),
          skycover: transformTimeBands(response.skycover),
          temperature: transformTimeBands(response.temperature),
          visibility: transformTimeBands(response.visibility),
          winddir: transformTimeBands(response.winddir),
          windspeed: transformTimeBands(response.windspeed),
        };
      },
    }),
  }),
});

export const {
  useGetRouteProfileStateQuery,
  useLazyGetRouteProfileStateQuery,
  useUpdateRouteProfileStateMutation,
  useQueryAirportPropertiesMutation,
  useQueryCaturbDataMutation,
  useQueryMwturbDataMutation,
  useQueryHumidityDataMutation,
  useQueryTemperatureDataMutation,
  useQueryGfsWindDirectionDataMutation,
  useQueryGfsWindSpeedDataMutation,
  useQueryIcingProbDataMutation,
  useQueryIcingSevDataMutation,
  useQueryIcingSldDataMutation,
  useQueryNbmCloudbaseMutation,
  useQueryNbmCloudCeilingMutation,
  useQueryNbmDewpointMutation,
  useQueryNbmGustMutation,
  useQueryNbmSkycoverMutation,
  useQueryNbmTempMutation,
  useQueryNbmVisMutation,
  useQueryNbmWindDirMutation,
  useQueryNbmWindSpeedMutation,
  useQueryNbmWx1Mutation,
  useQueryNbmAllMutation,
} = routeProfileApi;
