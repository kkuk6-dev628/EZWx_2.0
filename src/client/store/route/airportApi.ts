import { FeatureCollection } from 'geojson';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RoutePoint } from '../../interfaces/routeInterfaces';

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

export const airportApi = createApi({
  reducerPath: 'airportApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getAirport: builder.query({
      query: () => ({ url: '', method: 'Get' }),
      transformResponse: (response: FeatureCollection) => {
        return response?.features.reduce((acc: RoutePoint[], feature) => {
          if (feature.properties.name !== '') {
            if (feature.properties.icaoid) {
              acc.push({
                key: feature.properties.icaoid,
                name: feature.properties.name,
                type: 'icaoid',
                position: feature.geometry as GeoJSON.Point,
              });
            } else if (feature.properties.faaid) {
              acc.push({
                key: feature.properties.faaid,
                name: feature.properties.name,
                type: 'faaid',
                position: feature.geometry as GeoJSON.Point,
              });
            }
          }
          return acc;
        }, []);
      },
    }),
  }),
});

export const { useGetAirportQuery } = airportApi;
