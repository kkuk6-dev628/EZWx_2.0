import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AirportNbmData, RouteProfileDataset, RouteProfileState } from '../../interfaces/route-profile';

const initialRouteProfileState: RouteProfileState = {
  chartType: 'Wind',
  windLayer: 'Windspeed',
  icingLayers: ['Prob'],
  turbLayers: ['CAT'],
  maxAltitude: 500,
  showTemperature: true,
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
    getAirportNbm: builder.query<{ time: string; data: AirportNbmData[] }[], string[]>({
      query: (faaids: string[]) => ({
        url: 'data/airport-nbm?faaids=' + faaids.join(','),
        method: 'Get',
      }),
    }),
    getRouteProfileState: builder.query({
      query: () => ({ url: '', method: 'Get' }),
      transformResponse: (response: RouteProfileState): RouteProfileState => {
        if (!response) {
          return initialRouteProfileState;
        }
        return response;
      },
      transformErrorResponse: (response): RouteProfileState => {
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
      transformResponse: transformTimeBands,
    }),
    queryMwturbData: builder.mutation({
      query: (data) => ({ url: 'data/mwturb', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryHumidityData: builder.mutation({
      query: (data) => ({ url: 'data/g-humidity', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryTemperatureData: builder.mutation({
      query: (data) => ({ url: 'data/g-temperature', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryGfsWindDirectionData: builder.mutation({
      query: (data) => ({ url: 'data/g-winddirection', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryGfsWindSpeedData: builder.mutation({
      query: (data) => ({ url: 'data/g-windspeed', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryIcingProbData: builder.mutation({
      query: (data) => ({ url: 'data/icing-prob', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryIcingSevData: builder.mutation({
      query: (data) => ({ url: 'data/icing-sev', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryIcingSldData: builder.mutation({
      query: (data) => ({ url: 'data/icing-sld', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmCloudbase: builder.mutation({
      query: (data) => ({ url: 'data/n-cloudbase', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmCloudCeiling: builder.mutation({
      query: (data) => ({ url: 'data/n-cloudceiling', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmDewpoint: builder.mutation({
      query: (data) => ({ url: 'data/n-dewpoint', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmGust: builder.mutation({
      query: (data) => ({ url: 'data/n-gust', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmSkycover: builder.mutation({
      query: (data) => ({ url: 'data/n-skycover', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmTemp: builder.mutation({
      query: (data) => ({ url: 'data/n-t2m', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmVis: builder.mutation({
      query: (data) => ({ url: 'data/n-vis', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmWindDir: builder.mutation({
      query: (data) => ({ url: 'data/n-winddirection', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmWindSpeed: builder.mutation({
      query: (data) => ({ url: 'data/n-windspeed', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmWx1: builder.mutation({
      query: (data) => ({ url: 'data/n-wx-1', method: 'Post', body: data }),
      transformResponse: transformTimeBands,
    }),
    queryNbmFlightCategory: builder.mutation({
      query: (data) => ({ url: 'data/n-ceiling-vis', method: 'Post', body: data }),
      transformResponse: (response: any) => {
        return {
          skycover: transformTimeBands(response.skycover),
          cloudbase: transformTimeBands(response.cloudbase),
        };
      },
    }),
    queryNbmAll: builder.mutation({
      query: (data) => ({ url: 'data/n-all', method: 'Post', body: data }),
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
    getDepartureAdvisorData: builder.mutation({
      query: (data) => ({ url: 'data/d-advisor', method: 'Post', body: data }),
      transformResponse: (response: any) => {
        return {
          cat: transformTimeBands(response.cat),
          mwt: transformTimeBands(response.mwt),
          prob: transformTimeBands(response.prob),
          severity: transformTimeBands(response.severity),
          cloudceiling: transformTimeBands(response.cloudceiling),
          visibility: transformTimeBands(response.visibility),
          wx_1: transformTimeBands(response.wx_1),
          wx_2: transformTimeBands(response.wx_2),
          wxInten1: transformTimeBands(response.wxInten1),
          wxInten2: transformTimeBands(response.wxInten2),
          wxProbCov1: transformTimeBands(response.wxProbCov1),
          wxProbCov2: transformTimeBands(response.wxProbCov2),
        };
      },
    }),
  }),
});

export const {
  useGetAirportNbmQuery,
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
  useQueryNbmFlightCategoryMutation,
  useQueryNbmAllMutation,
  useGetDepartureAdvisorDataMutation,
} = routeProfileApi;
