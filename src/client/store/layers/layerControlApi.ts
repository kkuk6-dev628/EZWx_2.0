import { BaseMapLayerControlState } from './../../interfaces/layerControl';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LayerControlState } from '../../interfaces/layerControl';
import { initialBaseLayerControlState, setBaseMapLayerControl } from './BaseMapLayerControl';
import { initialLayerControlState, setLayerControlState } from './LayerControl';

const baseUrl = '/api/layer-control';

export const layerControlApi = createApi({
  reducerPath: 'layerControlApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['LayerControl'],
  endpoints: (builder) => ({
    getLayerControlState: builder.query({
      query: () => ({ url: '', method: 'Get' }),
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
            dispatch(setLayerControlState({ ...result.data }));
          }
        } catch (err) {
          console.error('LayerControl state cannot be pulled out.', err);
        }
      },
    }),
    updateLayerControlState: builder.mutation({
      query: (data) => ({ url: '', method: 'Post', body: data }),
      transformResponse: (response: LayerControlState) => response,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (!arg.id && result.data) {
            dispatch(setLayerControlState({ ...arg, id: result.data }));
          }
        } catch (err) {
          console.error('Error: ', err);
        }
      },
    }),
    getBaseLayerControlState: builder.query({
      query: () => ({ url: '/base', method: 'Get' }),
      transformResponse: (response: BaseMapLayerControlState) => {
        if (!response || !response.usProvincesState) {
          return initialBaseLayerControlState;
        }
        return response;
      },
      transformErrorResponse: (response) => {
        console.error(response);
        return initialBaseLayerControlState;
      },
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data) {
            dispatch(setBaseMapLayerControl({ ...result.data }));
          }
        } catch (err) {
          console.error('Base LayerControl state cannot be pulled out.', err);
        }
      },
    }),
    updateBaseLayerControlState: builder.mutation({
      query: (data) => ({ url: '/base', method: 'Post', body: data }),
      transformResponse: (response: BaseMapLayerControlState) => response,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (!arg.id && result.data) {
            dispatch(setBaseMapLayerControl({ ...arg, id: result.data }));
          }
        } catch (err) {
          console.error('Error: ', err);
        }
      },
    }),
  }),
});

export const {
  useGetLayerControlStateQuery,
  useLazyGetLayerControlStateQuery,
  useUpdateLayerControlStateMutation,
  useGetBaseLayerControlStateQuery,
  useLazyGetBaseLayerControlStateQuery,
  useUpdateBaseLayerControlStateMutation,
} = layerControlApi;
