import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ImageryCollectionItem, ImageryState } from '../../interfaces/imagery';

const baseUrl = '/api/imagery';

export const initialImageryState: ImageryState = {
  selectedLvl1: 0,
  selectedLvl2: 0,
  selectedLvl3: 0,
  selectedImageryName: 'U.S. Sfc Analysis',
  selectedImageryId: 'SFC_ANL_WITH_MODELS',
};

export const imageryApi = createApi({
  reducerPath: 'imageryApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['ImageryState'],
  endpoints: (builder) => ({
    getWxJson: builder.query({
      query: () => ({ url: 'wx.json', method: 'Get' }),
      transformResponse: (response: any): { ROOTURL: string; TAB: ImageryCollectionItem[] } => {
        return response.TABS;
      },
    }),
    getRecentImagery: builder.query({
      query: () => ({ url: baseUrl + '/recents', method: 'Get' }),
      transformResponse: (response: ImageryState[]): ImageryState[] => {
        if (!response) {
          return [initialImageryState];
        }
        return response;
      },
      transformErrorResponse: (response): ImageryState[] => {
        console.error(response);
        return [initialImageryState];
      },
      providesTags: [{ type: 'ImageryState', id: 'LIST' }],
    }),
    addRecentImagery: builder.mutation({
      query: (data) => ({ url: baseUrl + '/add-recent', method: 'Post', body: data }),
      invalidatesTags: ['ImageryState'],
    }),
    deleteRecentImagery: builder.mutation({
      query: (data) => ({ url: baseUrl + '/del-recent', method: 'Post', body: data }),
      invalidatesTags: ['ImageryState'],
    }),
  }),
});

export const {
  useGetWxJsonQuery,
  useGetRecentImageryQuery,
  useAddRecentImageryMutation,
  useDeleteRecentImageryMutation,
} = imageryApi;
