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
  highlightStyle?: any;
  filter?: string;
}

const WFSLayer = ({
  url,
  maxFeatures,
  typeName,
  propertyNames,
  enableBBoxQuery,
  interactive = true,
  style,
  highlightStyle,
  filter,
}: WFSLayerProps) => {
  const [geoJSON, setGeoJSON] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    fetchGeoJSON();
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
    const params = {
      outputFormat: 'text/javascript',
      maxFeatures,
      request: 'GetFeature',
      service: 'WFS',
      typeName,
      version: '1.0.0',
      format_options: `callback:${callbackName}`,
      srsName: 'EPSG:4326',
    };
    if (propertyNames) {
      // @ts-ignore
      params.propertyName = propertyNames.join(',');
    }
    if (enableBBoxQuery) {
      // @ts-ignore
      params.bbox = `${map.getBounds().toBBoxString()},EPSG:4326`;
    }
    if (filter) {
      // @ts-ignore
      params.cql_filter = filter;
    }
    const paramString = L.Util.getParamString(params);
    jsonp(
      url,
      {
        param: paramString.slice(1) + '&',
        name: callbackName,
        timeout: 10000,
      },
      (error, data: any) => {
        // console.log(data);
        if (error) {
          console.error(error);
          setGeoJSON({
            type: 'FeatureCollection',
            features: [],
          });
        } else {
          setGeoJSON(data);
        }
      },
    );
  };

  function clickFeature(e) {
    highlightFeature(e);
    console.log('Layer clicked', e.target.feature.id);
  }
  function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle(
      highlightStyle ?? {
        weight: 5,
      },
    );
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
      // layer.bindPopup(popupContent);
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
          bubblingMouseEvents={true}
        ></GeoJSON>
      )}
    </>
  );
};

export default WFSLayer;
