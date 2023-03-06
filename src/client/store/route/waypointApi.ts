import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RoutePoint } from '../../interfaces/routeInterfaces';

const baseUrl = getUrl();

function getUrl(): any {
  const url = new URL('https://eztile4.ezwxbrief.com/geoserver/EZWxBrief/ows');
  url.searchParams.set('maxFeatures', '100000');
  url.searchParams.set('request', 'GetFeature');
  url.searchParams.set('service', 'WFS');
  url.searchParams.set('typeName', 'EZWxBrief:waypoint');
  url.searchParams.set('version', '1.0.0');
  url.searchParams.set('srsName', 'EPSG:4326');
  url.searchParams.set('propertyName', 'name,city,state,country,wkb_geometry');
  url.searchParams.set('outputFormat', 'application/json');
  url.searchParams.set('v', '1');
  return url;
}

export const waypointApi = createApi({
  reducerPath: 'waypointApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getWaypoints: builder.query({
      query: () => ({ url: '', method: 'Get' }),
      transformResponse: (response: GeoJSON.FeatureCollection) => {
        return response?.features.reduce((acc: RoutePoint[], feature) => {
          if (feature.properties.city) {
            acc.push({
              key: feature.properties.name,
              name: feature.properties.city,
              type: 'waypoint',
              position: feature.geometry as GeoJSON.Point,
            });
          } else {
            acc.push({
              key: feature.properties.name,
              name: feature.properties.state + '/' + feature.properties.country,
              type: 'waypoint',
              position: feature.geometry as GeoJSON.Point,
            });
          }
          return acc;
        }, []);
      },
    }),
  }),
});

export const { useGetWaypointsQuery } = waypointApi;
