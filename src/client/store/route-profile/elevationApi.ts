import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ElevationApiResult } from '../../interfaces/route-profile';

const baseUrl = 'https://api.elevationapi.com/api/Elevation/points';

export const elevationApi = createApi({
  reducerPath: 'elevationApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  endpoints: (builder) => ({
    queryElevationApi: builder.mutation({
      query: (data) => ({
        url: '',
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

export const { useQueryElevationApiMutation } = elevationApi;
