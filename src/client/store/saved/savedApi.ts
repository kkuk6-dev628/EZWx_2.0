import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { NodeModel } from '@minoru/react-dnd-treeview';
import { SavedItemData, SavedOrderItem } from '../../interfaces/saved';

const baseUrl = '/api/saved';

export const savedApi = createApi({
  reducerPath: 'savedApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['savedItems', 'savedOrder'],
  endpoints: (builder) => ({
    getSavedItems: builder.query<NodeModel<SavedItemData>[], void>({
      query: () => ({ url: baseUrl + '/get-saveditems', method: 'Get' }),
      providesTags: [{ type: 'savedItems', id: 'LIST' }],
    }),
    updateSavedItem: builder.mutation<
      any,
      { id?: number; parent: number; text?: string; data?: SavedItemData; droppable?: any }
    >({
      query: (data) => ({ url: baseUrl + '/update-saveditem', method: 'Post', body: data }),
      invalidatesTags: ['savedItems'],
    }),
    getSavedOrder: builder.query<{ order: SavedOrderItem[] }, void>({
      query: () => ({ url: baseUrl + '/get-savedorder', method: 'Get' }),
      providesTags: [{ type: 'savedOrder', id: 'LIST' }],
    }),
    updateSavedOrder: builder.mutation<any, { order: SavedOrderItem[] }>({
      query: (data) => ({ url: baseUrl + '/update-savedorder', method: 'Post', body: data }),
      invalidatesTags: ['savedOrder'],
    }),
  }),
});

export const { useGetSavedItemsQuery, useGetSavedOrderQuery, useUpdateSavedItemMutation, useUpdateSavedOrderMutation } =
  savedApi;
