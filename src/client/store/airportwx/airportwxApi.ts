import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = '/api/airportwx';

export const airportwxApi = createApi({
  reducerPath: 'airportwxApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['airportwxApi'],
  endpoints: (builder) => ({
    getRecentAirport: builder.query({
      query: () => ({ url: '/get-recent', method: 'Get' }),
      providesTags: [{ type: 'airportwxApi', id: 'LIST' }],
    }),
    addRecentAirport: builder.mutation({
      query: (data) => ({ url: '/add-recent', method: 'Post', body: data }),
      invalidatesTags: ['airportwxApi'],
    }),
  }),
});

export const { useGetRecentAirportQuery, useAddRecentAirportMutation } = airportwxApi;
