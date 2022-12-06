/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
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
  interactive?: boolean;
  style?: (feature: L.feature) => L.style;
  featureClicked: (any) => void;
  resetHighlightRef: any;
}

const BoundedWFSLayer = ({
  url,
  maxFeatures,
  typeName,
  propertyNames,
  enableBBoxQuery,
  interactive = true,
  style,
  featureClicked,
  resetHighlightRef,
}: WFSLayerProps) => {
  const [geoJSON, setGeoJSON] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    fetchGeoJSON();
    resetHighlightRef.current = resetHighlight;
  }, []);

  const map = useMapEvents({
    zoomend: () => {
      if (enableBBoxQuery) fetchGeoJSON();
    },
    moveend: () => {
      if (enableBBoxQuery) fetchGeoJSON();
    },
  });

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

  function clickFeature(e) {
    // resetHighlight(e.target);
    featureClicked(e);
    highlightFeature(e);
  }
  function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
      weight: 5,
      color: '#ff0',
      dashArray: '',
      fillOpacity: 0.2,
    });
    layer.bringToFront();
  }
  function resetHighlight() {
    const layer = ref.current;
    if (layer) layer.resetStyle();
  }

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = ReactDOMServer.renderToString(
        <GeneralPopup feature={feature} title={typeName} />,
      );
      layer.bindPopup(popupContent);
    }
    layer.on({
      // mouseover: highlightFeature,
      // mouseout: resetHighlight,
      click: clickFeature,
    });
  };

  return (
    <>
      {geoJSON != null && (
        <GeoJSON
          ref={ref}
          data={geoJSON}
          // @ts-ignore
          interactive={interactive}
          // @ts-ignore
          onEachFeature={onEachFeature}
          style={style}
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
