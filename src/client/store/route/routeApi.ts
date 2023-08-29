import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Route } from '../../interfaces/route';
import { setActiveRoute } from './routes';
import toast from 'react-hot-toast';
import { userLoggedOut } from '../auth/authSlice';

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
        result && Array.isArray(result)
          ? // successful query
            [...result.map(({ id }) => ({ type: 'Route', id } as const)), { type: 'Route', id: 'LIST' }]
          : // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
            [{ type: 'Route', id: 'LIST' }],
      transformResponse: (response: Route[], dispatch) => {
        if (!Array.isArray(response)) {
          return response;
        }
        return response.map((item) => {
          item.routeOfFlight = item.routeOfFlight.sort((a, b) => (a.order > b.order ? 1 : -1));
          return item;
        });
      },
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data.needSignin) {
            dispatch(userLoggedOut());
          }
          if (result.data.length > 0) {
            // dispatch(setActiveRoute({ ...result.data[0] }));
          }
        } catch (err) {
          // toast.error('error', {
          //   position: 'top-right',
          //   duration: 3000,
          // });
          console.error('Route cannot be pulled out.', err);
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
            dispatch(setActiveRoute({ ...result.data }));
            toast.success('Active route saved!', {
              position: 'top-right',
              duration: 3000,
            });
          }
        } catch (err) {
          toast.error('Error in creating route', {
            position: 'top-right',
            duration: 3000,
          });
          console.error('Error: ', err);
        }
      },
    }),
    deleteRoute: builder.mutation({
      query: (id) => ({ url: '/' + id, method: 'Delete' }),
      invalidatesTags: ['Route'],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data) {
            dispatch(setActiveRoute(null));
            toast.success(`Active route deleted!`, {
              position: 'top-right',
              duration: 3000,
            });
          }
        } catch (err) {
          toast.error('Error in deleting route', {
            position: 'top-right',
            duration: 3000,
          });
          console.error('Error: ', err);
        }
      },
    }),
  }),
});

export const { useGetRoutesQuery, useCreateRouteMutation, useDeleteRouteMutation } = routeApi;
