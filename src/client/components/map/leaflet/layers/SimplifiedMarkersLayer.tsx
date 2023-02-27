import { forwardRef, useEffect, useState } from 'react';
import { GeoJSON as GeoJSONLayer, useMapEvents } from 'react-leaflet';
import { emptyGeoJson } from '../../common/AreoConstants';
import { simplifyPoints } from '../../common/AreoFunctions';

export const SimplifiedMarkersLayer = forwardRef(
  ({ data, simplifyRadius, visible, unSimplifyFilter, ...props }: any, ref) => {
    const [displayedData, setDisplayedData] = useState<GeoJSON.FeatureCollection>(emptyGeoJson);
    const [renderedTime, setRenderedTime] = useState(Date.now());

    useEffect(() => {
      const newKey = Date.now();
      setRenderedTime(newKey);
    }, [displayedData]);

    useEffect(() => {
      if (visible) setSimplifiedFeatures(data);
    }, [data]);

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
