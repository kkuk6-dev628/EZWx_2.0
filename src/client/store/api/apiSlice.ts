/* eslint-disable @typescript-eslint/no-unused-vars */
// import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});
console.log('Api Port ', process.env.NEXT_PUBLIC_API_URL);

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.error) {
      // do something with the error
    }
    return result;
  },
  endpoints: (builder) => ({}),
});
