import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { transformTimeBands } from '../route-profile/routeProfileApi';
import { AirportWxState } from '../../interfaces/airportwx';

const baseUrl = '/api/airportwx';

export const initialAirportWxState: AirportWxState = {
  chartType: 'Wind',
  windLayer: 'SPEED',
  icingLayers: ['Prob'],
  turbLayers: ['CAT'],
  maxAltitude: 500,
  showTemperature: true,
  airport: 'KCLT',
  chartDays: 1,
  viewType: 'meteogram',
};

export const airportwxApi = createApi({
  reducerPath: 'airportwxApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['airportwxApi', 'airportwxState'],
  endpoints: (builder) => ({
    getRecentAirport: builder.query({
      query: () => ({ url: baseUrl + '/get-recent', method: 'Get' }),
      providesTags: [{ type: 'airportwxApi', id: 'LIST' }],
    }),
    addRecentAirport: builder.mutation({
      query: (data) => ({ url: baseUrl + '/add-recent', method: 'Post', body: data }),
      invalidatesTags: ['airportwxApi'],
    }),
    getAirportwxState: builder.query({
      query: () => ({ url: baseUrl + '/get-airportwx-state', method: 'Get' }),
      transformResponse: (response: AirportWxState): AirportWxState => {
        if (!response) {
          return initialAirportWxState;
        }
        return response;
      },
      transformErrorResponse: (response): AirportWxState => {
        console.error(response);
        return initialAirportWxState;
      },
      providesTags: ['airportwxState'],
    }),
    updateAirportwxState: builder.mutation({
      query: (data) => ({ url: baseUrl + '/update-airportwx-state', method: 'Post', body: data }),
      invalidatesTags: ['airportwxState'],
    }),
    getMeteogramData: builder.query({
      query: ({ lat, lng }) => ({ url: '/api/route-profile/data/mgram', method: 'Get', params: { lat, lng } }),
      transformResponse: (response: any) => {
        return {
          humidity: transformTimeBands(response.humidity),
          temperature: transformTimeBands(response.temperature),
          windDirection: transformTimeBands(response.windDirection),
          windSpeed: transformTimeBands(response.windSpeed),
          cat: transformTimeBands(response.cat),
          mwt: transformTimeBands(response.mwt),
          sev: transformTimeBands(response.sev),
          sld: transformTimeBands(response.sld),
          prob: transformTimeBands(response.prob),
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

    getMetarText: builder.query<[{ raw_text: string }], string>({
      query: (icaoid: string) => ({ url: `${baseUrl}/${icaoid}/metar`, method: 'Get' }),
    }),

    getTafText: builder.query<[{ raw_text: string }], string>({
      query: (icaoid: string) => ({ url: `${baseUrl}/${icaoid}/taf`, method: 'Get' }),
    }),
  }),
});

export const {
  useGetRecentAirportQuery,
  useAddRecentAirportMutation,
  useGetMeteogramDataQuery,
  useGetAirportwxStateQuery,
  useUpdateAirportwxStateMutation,
  useGetMetarTextQuery,
  useGetTafTextQuery,
} = airportwxApi;
