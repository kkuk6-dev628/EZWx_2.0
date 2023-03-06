import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Route } from '../../interfaces/routeInterfaces';
import { setActiveRoute } from './routes';
import toast from 'react-hot-toast';

const baseUrl = '/api/route';

export const routeApi = createApi({
  reducerPath: 'routeApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Route'],
  endpoints: (builder) => ({
    getRoutes: builder.query({
      query: () => ({ url: '', method: 'Get' }),
      // Provides a list of `Posts` by `id`.
      // If any mutation is executed that `invalidate`s any of these tags, this query will re-run to be always up-to-date.
      // The `LIST` id is a "virtual id" we just made up to be able to invalidate this query specifically if a new `Posts` element was added.
      providesTags: (result) =>
        // is result available?
        result
          ? // successful query
            [...result.map(({ id }) => ({ type: 'Route', id } as const)), { type: 'Route', id: 'LIST' }]
          : // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
            [{ type: 'Route', id: 'LIST' }],
      transformResponse: (response: any[]) => response,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data.length > 0) {
            dispatch(setActiveRoute({ ...result.data[0] }));
          }
        } catch (err) {
          toast.error(err, {
            position: 'top-right',
            duration: 3000,
          });
          console.error('Error: ', err);
        }
      },
    }),
    createRoute: builder.mutation({
      query: (data) => ({ url: '', method: 'Post', body: data }),
      transformResponse: (response: Route) => response,
      invalidatesTags: ['Route'],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (JSON.parse(JSON.stringify(result)).data) {
            toast.success('Route Saved!', {
              position: 'top-right',
              duration: 3000,
            });
            dispatch(setActiveRoute({ ...result.data }));
          }
        } catch (err) {
          toast.error(err, {
            position: 'top-right',
            duration: 3000,
          });
          console.error('Error: ', err);
        }
      },
    }),
  }),
});

export const { useGetRoutesQuery, useCreateRouteMutation } = routeApi;
