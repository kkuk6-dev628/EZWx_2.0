import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Route } from '../../interfaces/route';
import toast from 'react-hot-toast';
import { LayerControlState } from '../../interfaces/layerControl';
import { setLayerControl, initialLayerControlState } from './LayerControl';

const baseUrl = '/api/layer-control';

export const layerControlApi = createApi({
  reducerPath: 'layerControlApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['LayerControl'],
  endpoints: (builder) => ({
    getLayerControlState: builder.query({
      query: () => ({ url: '', method: 'Get' }),
      // Provides a list of `Posts` by `id`.
      // If any mutation is executed that `invalidate`s any of these tags, this query will re-run to be always up-to-date.
      // The `LIST` id is a "virtual id" we just made up to be able to invalidate this query specifically if a new `Posts` element was added.
      providesTags: (result) =>
        // is result available?
        result
          ? // successful query
            [{ type: 'LayerControl', id: result.id }]
          : // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
            [{ type: 'LayerControl', id: 'LIST' }],
      transformResponse: (response: LayerControlState) => {
        if (!response) {
          return initialLayerControlState;
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.error(response);
        return initialLayerControlState;
      },
      // async onQueryStarted(arg, { queryFulfilled, dispatch }) {
      //   try {
      //     const result = await queryFulfilled;
      //     if (result.data) {
      //       dispatch(setLayerControl({ ...result.data }));
      //     }
      //   } catch (err) {
      //     console.error('Route cannot be pulled out.', err);
      //   }
      // },
    }),
    updateLayerControlState: builder.mutation({
      query: (data) => ({ url: '', method: 'Post', body: data }),
      transformResponse: (response: LayerControlState) => response,
      invalidatesTags: ['LayerControl'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          if (result.data) {
            console.info('LayerControl state saved!', result);
          }
        } catch (err) {
          console.error('Error: ', err);
        }
      },
    }),
  }),
});

export const { useGetLayerControlStateQuery, useUpdateLayerControlStateMutation } = layerControlApi;
