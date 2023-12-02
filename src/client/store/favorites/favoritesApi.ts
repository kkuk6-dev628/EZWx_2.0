import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { NodeModel } from '@minoru/react-dnd-treeview';
import { CustomData } from '../../interfaces/favorites';

const baseUrl = '/api/favorites';

export const favoritesApi = createApi({
  reducerPath: 'favoritesApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['favoritesItems', 'favoritesOrder'],
  endpoints: (builder) => ({
    getFavoriteItems: builder.query<NodeModel<CustomData>[], void>({
      query: () => ({ url: baseUrl + '/get-favitems', method: 'Get' }),
      providesTags: [{ type: 'favoritesItems', id: 'LIST' }],
    }),
    getFavoritesOrder: builder.query<{ order: number[] }, void>({
      query: () => ({ url: baseUrl + '/get-favorder', method: 'Get' }),
      providesTags: [{ type: 'favoritesOrder', id: 'LIST' }],
    }),
  }),
});

export const { useGetFavoriteItemsQuery, useGetFavoritesOrderQuery } = favoritesApi;
