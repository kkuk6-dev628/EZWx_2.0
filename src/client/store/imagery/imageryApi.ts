import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ImageryCollectionItem, ImageryState } from '../../interfaces/imagery';

const baseUrl = '/';

export const initialImageryState: ImageryState = {
  selectedLvl1: 0,
  selectedLvl2: 0,
  selectedLvl3: 0,
  selectedImageryName: 'U.S. Sfc Analysis',
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
    getImageryState: builder.query({
      query: () => ({ url: '/api/imagery', method: 'Get' }),
      transformResponse: (response: ImageryState): ImageryState => {
        if (!response) {
          return initialImageryState;
        }
        return response;
      },
      transformErrorResponse: (response): ImageryState => {
        console.error(response);
        return initialImageryState;
      },
      providesTags: [{ type: 'ImageryState', id: 'LIST' }],
    }),
    updateImageryState: builder.mutation({
      query: (data) => ({ url: '/api/imagery', method: 'Post', body: data }),
      invalidatesTags: ['ImageryState'],
    }),
  }),
});

export const { useGetWxJsonQuery, useGetImageryStateQuery, useUpdateImageryStateMutation } = imageryApi;
