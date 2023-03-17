import { forwardRef, useEffect, useState } from 'react';
import { GeoJSON as GeoJSONLayer, useMapEvents } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectActiveRoute } from '../../../../store/route/routes';
import { selectSettings } from '../../../../store/user/UserSettings';
import { emptyGeoJson } from '../../common/AreoConstants';
import { simplifyPoints } from '../../common/AreoFunctions';

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
