import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ImageryCollectionItem } from '../../interfaces/imagery';

const baseUrl = '/';

export const imageryApi = createApi({
  reducerPath: 'imageryApi',
  baseQuery: fetchBaseQuery(),
  tagTypes: ['Imagery'],
  endpoints: (builder) => ({
    getWxJson: builder.query({
      query: () => ({ url: 'wx.json', method: 'Get' }),
      transformResponse: (response: any): { ROOTURL: string; TAB: ImageryCollectionItem[] } => {
        return response.TABS;
      },
    }),
  }),
});

export const { useGetWxJsonQuery } = imageryApi;
