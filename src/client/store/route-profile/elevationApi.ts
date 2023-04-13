import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ElevationApiResult, OpenMeteoApiResult, OpenTopoApiResult } from '../../interfaces/route-profile';

const baseUrl = '/api/route-profile/data/elevations';

export const elevationApi = createApi({
  reducerPath: 'elevationApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  endpoints: (builder) => ({
    queryOpenTopo: builder.mutation({
      query: (data) => ({ url: '', method: 'Post', body: data }),
      transformResponse: (response: OpenTopoApiResult) => response,
    }),
    queryOpenMeteo: builder.mutation({
      query: (data) => ({ url: '', method: 'Post', body: data }),
      transformResponse: (response: OpenMeteoApiResult) => response,
    }),
    queryElevationApi: builder.mutation({
      query: (data) => ({ url: '', method: 'Post', body: data }),
      transformResponse: (response: ElevationApiResult) => response,
    }),
  }),
});

export const { useQueryOpenTopoMutation, useQueryOpenMeteoMutation, useQueryElevationApiMutation } = elevationApi;
