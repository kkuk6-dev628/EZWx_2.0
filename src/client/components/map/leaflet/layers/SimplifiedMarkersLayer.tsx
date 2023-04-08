/* eslint-disable @typescript-eslint/ban-ts-comment */
import { forwardRef, useEffect, useState } from 'react';
import { GeoJSON as GeoJSONLayer, useMapEvents } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectActiveRoute } from '../../../../store/route/routes';
import { selectSettings } from '../../../../store/user/UserSettings';
import { emptyGeoJson } from '../../common/AreoConstants';
import { LatLng } from 'leaflet';
import { Route } from '../../../../interfaces/route';
import RBush from 'rbush';

export const simplifyPoints = (
  map: L.Map,
  features: GeoJSON.Feature[],
  radius: number,
  route: Route,
  unSimplifyFilter?: (feature: GeoJSON.Feature) => boolean,
): GeoJSON.Feature[] => {
  if (!map) return [];

  const getBoxFromGeometry = (map: L.Map, geometry) => {
    const latlng = new LatLng(geometry.coordinates[1], geometry.coordinates[0]);
    const layerPoint = map.latLngToLayerPoint(latlng);
    return {
      minX: layerPoint.x - radius,
      minY: layerPoint.y - radius,
      maxX: layerPoint.x + radius,
      maxY: layerPoint.y + radius,
    };
  };

  const results: GeoJSON.Feature[] = [];
  const rbush = new RBush();
  if (route) {
    [
      route.departure.position,
      route.destination.position,
      ...route.routeOfFlight.map((item) => item.routePoint.position),
    ].forEach((position) => rbush.insert(getBoxFromGeometry(map, position)));
  }
  features.forEach((feature) => {
    // @ts-ignore
    const latlng = new LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
    if (map.getBounds().contains(latlng)) {
      const box = getBoxFromGeometry(map, feature.geometry);
      if ((unSimplifyFilter && unSimplifyFilter(feature)) || !rbush.collides(box)) {
        rbush.insert(box);
        results.push(feature);
      }
    }
  });
  return results;
};

export const SimplifiedMarkersLayer = forwardRef(
  ({ data, simplifyRadius, visible, unSimplifyFilter, ...props }: any, ref) => {
    const [displayedData, setDisplayedData] = useState<GeoJSON.FeatureCollection>(emptyGeoJson);
    const [renderedTime, setRenderedTime] = useState(Date.now());
    const activeRoute = useSelector(selectActiveRoute);
    const userSettings = useSelector(selectSettings);

    useEffect(() => {
      const newKey = Date.now();
      setRenderedTime(newKey);
    }, [displayedData, userSettings]);

    useEffect(() => {
      if (visible) setSimplifiedFeatures(data);
    }, [data, activeRoute]);

    const map = useMapEvents({
      zoomend: () => {
        if (visible) setSimplifiedFeatures(data);
      },
      moveend: () => {
        if (visible) setSimplifiedFeatures(data);
      },
    });
    const setSimplifiedFeatures = (geojson: GeoJSON.FeatureCollection) => {
      const simplifiedFeatures = simplifyPoints(
        map,
        geojson.features as GeoJSON.Feature[],
        simplifyRadius,
        activeRoute,
        unSimplifyFilter,
      );
      setDisplayedData({
        type: 'FeatureCollection',
        features: simplifiedFeatures,
      });
    };

    return <GeoJSONLayer key={renderedTime} data={displayedData} {...props} ref={ref}></GeoJSONLayer>;
  },
);
