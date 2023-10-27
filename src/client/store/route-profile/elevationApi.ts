import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ElevationApiResult } from '../../interfaces/route-profile';

const baseUrl = 'https://api.elevationapi.com/api/Elevation';

export const elevationApi = createApi({
  reducerPath: 'elevationApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  endpoints: (builder) => ({
    getSingleElevation: builder.query<ElevationApiResult, any>({
      query: (params) => ({ url: '', method: 'Get', params: { lat: params.lat, lon: params.lng } }),
    }),
    queryElevationApi: builder.mutation({
      query: (data) => ({
        url: '/points',
        method: 'Post',
        body: {
          points: { type: 1, coordinates: data.queryPoints },
          dataSetName: 'AW3D30',
          reduceResolution: 20,
        },
      }),
      transformResponse: (response: ElevationApiResult): ElevationApiResult => response,
    }),
  }),
});

export const { useQueryElevationApiMutation, useGetSingleElevationQuery } = elevationApi;
