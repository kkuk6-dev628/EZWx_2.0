import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ElevationApiResult } from '../../interfaces/route-profile';

const baseUrl = 'https://api.opentopodata.org/v1/aster30m';

export const elevationApi = createApi({
  reducerPath: 'elevationApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    mode: 'no-cors',
    prepareHeaders: (headers) => {
      headers.set('Access-Control-Allow-Origin', '*');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    queryElevations: builder.query({
      query: (latlngs: { lat: number; lng: number }[]) => ({
        url: '?locations=' + latlngs.map((latlng) => latlng.lat + ',' + latlng.lng).join('|'),
        method: 'Get',
      }),
      // transformResponse: (response: ElevationApiResult) => {
      //   return response;
      // },
      // transformErrorResponse: (response) => {
      //   console.error(response);
      //   return null;
      // },
    }),
  }),
});

export const { useQueryElevationsQuery } = elevationApi;
