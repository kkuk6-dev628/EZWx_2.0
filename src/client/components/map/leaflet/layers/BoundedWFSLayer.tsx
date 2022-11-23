import React, { useEffect, useState } from 'react';
import {
  useMapEvents,
  GeoJSON,
  Popup,
  FeatureGroup,
  Polyline,
  Polygon,
  CircleMarker,
} from 'react-leaflet';
import L from 'leaflet';
import jsonp from 'jsonp';
import { Typography, Divider } from '@material-ui/core';

interface WFSLayerProps {
  url: string;
  maxFeatures: number;
  typeName: string;
  jsonpCallbackName: string;
}

const BoundedWFSLayer = ({
  url,
  maxFeatures,
  typeName,
  jsonpCallbackName,
}: WFSLayerProps) => {
  const [geoJSON, setGeoJSON] = useState(null);

  const fetchGeoJSON = () => {
    jsonp(
      url,
      {
        param: `outputFormat=text/javascript&maxFeatures=${maxFeatures}&request=GetFeature&service=WFS&typeName=${typeName}&version=1.0.0&bbox=${map
          .getBounds()
          .toBBoxString()}&callback`,
        name: jsonpCallbackName,
      },
      (error, data: any) => {
        // console.log(data);
        if (error) {
          console.error(error);
        } else {
          setGeoJSON(data);
        }
      },
    );
  };

  useEffect(() => {
    fetchGeoJSON();
  }, []);
  const map = useMapEvents({
    zoomend: () => {
      fetchGeoJSON();
    },
    moveend: () => {
      fetchGeoJSON();
    },
  });

  return (
    <>
      {geoJSON != null &&
        geoJSON.features.map((feature, index) => {
          return (
            <FeatureGroup key={index}>
              <Popup>
                <Typography variant="subtitle2">
                  {feature.properties.product}
                </Typography>
                <Divider />
                <Typography variant="body2" style={{ margin: 3 }}>
                  Level: {feature.properties.level}
                </Typography>
                <Typography variant="body2" style={{ margin: 3 }}>
                  Forecast: {feature.properties.forecast}
                </Typography>
              </Popup>
              {feature.geometry.type == 'Point' && (
                <CircleMarker
                  pathOptions={{ color: 'blue' }}
                  radius={2}
                  center={L.GeoJSON.coordsToLatLng(
                    feature.geometry.coordinates,
                  )}
                />
              )}
              {feature.geometry.type == 'LineString' && (
                <Polyline
                  pathOptions={{ color: 'blue' }}
                  positions={L.GeoJSON.coordsToLatLngs(
                    feature.geometry.coordinates,
                    0,
                  )}
                />
              )}
              {feature.geometry.type == 'MultiLineString' && (
                <Polyline
                  pathOptions={{ color: 'blue' }}
                  positions={L.GeoJSON.coordsToLatLngs(
                    feature.geometry.coordinates,
                    1,
                  )}
                />
              )}
              {feature.geometry.type == 'Polygon' && (
                <Polygon
                  pathOptions={{ color: 'lime' }}
                  positions={L.GeoJSON.coordsToLatLngs(
                    feature.geometry.coordinates,
                    1,
                  )}
                />
              )}
              {feature.geometry.type == 'MultiPolygon' && (
                <Polygon
                  pathOptions={{ color: 'lime' }}
                  positions={L.GeoJSON.coordsToLatLngs(
                    feature.geometry.coordinates,
                    2,
                  )}
                />
              )}
            </FeatureGroup>
          );
        })}
    </>
  );
};

export default BoundedWFSLayer;
