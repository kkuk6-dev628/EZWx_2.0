import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AirportNbmData, RouteProfileDataset, RouteProfileState } from '../../interfaces/route-profile';

const initialRouteProfileState: RouteProfileState = {
  chartType: 'Wind',
  windLayer: 'SPEED',
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
    queryAirportNbm: builder.mutation<{ time: string; data: AirportNbmData[] }[], string[]>({
      query: (faaids: string[]) => ({
        url: 'data/airport-nbm',
        method: 'Post',
        body: { faaids: faaids },
      }),
    }),
    queryGfsData: builder.mutation({
      query: (data) => ({ url: 'data/g-data', method: 'Post', body: data }),
      transformResponse: (response: any) => {
        return {
          humidity: transformTimeBands(response.humidity),
          temperature: transformTimeBands(response.temperature),
          windDirection: transformTimeBands(response.windDirection),
          windSpeed: transformTimeBands(response.windSpeed),
        };
      },
    }),
    queryIcingTurbData: builder.mutation({
      query: (data) => ({ url: 'data/it-data', method: 'Post', body: data }),
      transformResponse: (response: any) => {
        return {
          cat: transformTimeBands(response.cat),
          mwt: transformTimeBands(response.mwt),
          sev: transformTimeBands(response.sev),
          sld: transformTimeBands(response.sld),
          prob: transformTimeBands(response.prob),
        };
      },
    }),
    queryNbmAll: builder.mutation({
      query: (data) => ({ url: 'data/n-data', method: 'Post', body: data }),
      transformResponse: (response: any) => {
        return {
          cloudbase: transformTimeBands(response.cloudbase),
          dewpoint: transformTimeBands(response.dewpoint),
          gust: transformTimeBands(response.gust),
          skycover: transformTimeBands(response.skycover),
          temperature: transformTimeBands(response.temperature),
          winddir: transformTimeBands(response.winddir),
          windspeed: transformTimeBands(response.windspeed),
        };
      },
    }),
    queryDepartureAdvisorData: builder.mutation({
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
  useQueryAirportNbmMutation,
  useGetRouteProfileStateQuery,
  useLazyGetRouteProfileStateQuery,
  useUpdateRouteProfileStateMutation,
  useQueryNbmAllMutation,
  useQueryDepartureAdvisorDataMutation,
  useQueryGfsDataMutation,
  useQueryIcingTurbDataMutation,
} = routeProfileApi;
