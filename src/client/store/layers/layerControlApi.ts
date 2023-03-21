import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LayerControlState } from '../../interfaces/layerControl';
import { initialLayerControlState, setLayerControlState } from './LayerControl';

const baseUrl = '/api/layer-control';

export const layerControlApi = createApi({
  reducerPath: 'layerControlApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['LayerControl'],
  endpoints: (builder) => ({
    getLayerControlState: builder.query({
      query: () => ({ url: '', method: 'Get' }),
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
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data) {
            dispatch(setLayerControlState(result.data));
          }
        } catch (err) {
          console.error('LayerControl state cannot be pulled out.', err);
        }
      },
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
