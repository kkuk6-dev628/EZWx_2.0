/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react';
import { useMapEvents, GeoJSON } from 'react-leaflet';
import jsonp from 'jsonp';
import * as ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import GeneralPopup from '../popups/GeneralPopup';

interface WFSLayerProps {
  url: string;
  maxFeatures: number;
  typeName: string;
  propertyNames?: string[];
  enableBBoxQuery?: boolean;
}

const BoundedWFSLayer = ({
  url,
  maxFeatures,
  typeName,
  propertyNames,
  enableBBoxQuery,
}: WFSLayerProps) => {
  const [geoJSON, setGeoJSON] = useState(null);
  let map;
  const fetchGeoJSON = () => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    let queryString = `outputFormat=text/javascript&maxFeatures=${maxFeatures}&request=GetFeature&service=WFS&typeName=${typeName}&version=1.0.0&format_options=callback:${callbackName}&srsName=EPSG:4326&`;
    if (propertyNames) {
      queryString += `propertyName=${propertyNames.join(',')}&`;
    }
    if (enableBBoxQuery) {
      queryString += `bbox=${map.getBounds().toBBoxString()},EPSG:4326&`;
    }
    jsonp(
      url,
      {
        param: queryString,
        name: callbackName,
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

  if (enableBBoxQuery) {
    map = useMapEvents({
      zoomend: () => {
        fetchGeoJSON();
      },
      moveend: () => {
        fetchGeoJSON();
      },
    });
  }
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = ReactDOMServer.renderToString(
        <GeneralPopup feature={feature} title={typeName} />,
      );
      layer.bindPopup(popupContent);
    }
  };

  return (
    <>
      {geoJSON != null && (
        <GeoJSON
          data={geoJSON}
          // @ts-ignore
          onEachFeature={onEachFeature}
          pointToLayer={(feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: '#ff7800',
              color: '#000',
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8,
            });
          }}
        ></GeoJSON>
      )}
    </>
  );
};

export default BoundedWFSLayer;
