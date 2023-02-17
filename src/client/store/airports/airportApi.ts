import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = getUrl();

function getUrl(): any {
  const url = new URL('https://eztile4.ezwxbrief.com/geoserver/EZWxBrief/ows');
  url.searchParams.set('maxFeatures', '14000');
  url.searchParams.set('request', 'GetFeature');
  url.searchParams.set('service', 'WFS');
  url.searchParams.set('typeName', 'EZWxBrief:airport');
  url.searchParams.set('version', '1.0.0');
  url.searchParams.set('srsName', 'EPSG:4326');
  url.searchParams.set('propertyName', 'icaoid,name,faaid,geometry');
  url.searchParams.set('cql_filter', 'faaid is not null');
  url.searchParams.set('outputFormat', 'application/json');
  url.searchParams.set('v', '1');
  return url;
}
type Property = {
  faaid: string | null;
  icaoid: string | null;
  name: string | null;
};

type Feature = {
  geometry: any;
  id: string;
  properties: Property;
  type: string;
};

type Response = {
  features: Feature[];
};

export const airportApi = createApi({
  reducerPath: 'airportApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getAirport: builder.query({
      query: () => ({ url: '', method: 'Get' }),
      transformResponse: (response: Response) => {
        return response?.features.reduce((acc, feature) => {
          if (feature.properties.name !== '') {
            if (feature.properties.faaid) {
              acc.push({ key: feature.properties.faaid, name: feature.properties.name, property: 'faaid' });
            }
            if (feature.properties.icaoid) {
              acc.push({ key: feature.properties.icaoid, name: feature.properties.name, property: 'icaoid' });
            }
          }
          return acc;
        }, []);
      },
    }),
  }),
});

export const { useGetAirportQuery } = airportApi;
