import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ElevationApiResult } from '../../interfaces/route-profile';

const baseUrl = '/api/route-profile/data/elevations';

export const elevationApi = createApi({
  reducerPath: 'elevationApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  endpoints: (builder) => ({
    queryElevations: builder.mutation({
      query: (data) => ({ url: '', method: 'Post', body: data }),
    }),
  }),
});

export const { useQueryElevationsMutation } = elevationApi;
