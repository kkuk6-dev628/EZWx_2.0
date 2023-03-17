import { forwardRef, useEffect, useState } from 'react';
import { GeoJSON as GeoJSONLayer, useMapEvents } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectActiveRoute } from '../../../../store/route/routes';
import { selectSettings } from '../../../../store/user/UserSettings';
import { emptyGeoJson } from '../../common/AreoConstants';
import { simplifyPoints } from '../../common/AreoFunctions';

export const isSameFeatures = (a: GeoJSON.Feature[], b: GeoJSON.Feature[], compareProperties: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  if (a.length === 0) {
    return true;
  }
  const undefinedProperties = compareProperties.filter(
    (compareProperty) => a[0].properties[compareProperty] === undefined,
  );
  if (undefinedProperties.length > 0) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    const differentProperties = compareProperties.filter(
      (compareProperty) => a[i].properties[compareProperty] !== b[i].properties[compareProperty],
    );
    if (differentProperties.length > 0) {
      return false;
    }
  }
  return true;
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
      setDisplayedData((prevState) => {
        if (!prevState || !isSameFeatures(prevState.features, simplifiedFeatures, ['station_id', 'observation_time'])) {
          return {
            type: 'FeatureCollection',
            features: simplifiedFeatures,
          };
        }
        return prevState;
      });
    };

    return <GeoJSONLayer key={renderedTime} data={displayedData} {...props} ref={ref}></GeoJSONLayer>;
  },
);
