/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
import { useMapEvents, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import Image from 'next/image';
import ReactDOMServer from 'react-dom/server';
import ConvectiveOutlookLayer from './ConvectiveOutlookLayer';

interface WFSLayerProps {
  url: string;
  maxFeatures: number;
  typeName: string;
  propertyNames?: string[];
  enableBBoxQuery?: boolean;
  interactive?: boolean;
  showLabelZoom?: number;
  getLabel?: (feature: L.feature) => string;
  style?: (feature: L.feature) => L.style;
  pointToLayer?: (feature: L.feature, latlng: any) => L.style;
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
  showLabelZoom = 5,
  getLabel,
  style,
  pointToLayer,
  highlightStyle,
  filter,
}: WFSLayerProps) => {
  const [geoJSON, setGeoJSON] = useState({
    type: 'FeatureCollection',
    features: [],
  });
  const ref = useRef(null);
  let lastZoom;

  useEffect(() => {
    fetchGeoJSON();
  }, []);

  const map = useMapEvents({
    zoomend: () => {
      const zoom = map.getZoom();
      if (enableBBoxQuery) fetchGeoJSON();
      if (zoom < showLabelZoom && (!lastZoom || lastZoom >= showLabelZoom)) {
        ref.current.eachLayer((l) => {
          if (l.getTooltip()) {
            const tooltip = l.getTooltip();
            l.unbindTooltip().bindTooltip(tooltip, {
              permanent: false,
            });
          }
        });
      } else if (
        zoom >= showLabelZoom &&
        (!lastZoom || lastZoom < showLabelZoom)
      ) {
        ref.current.eachLayer(function (l) {
          if (l.getTooltip()) {
            const tooltip = l.getTooltip();
            l.unbindTooltip().bindTooltip(tooltip, {
              permanent: true,
            });
          }
        });
      }
      lastZoom = zoom;
    },
    moveend: () => {
      if (enableBBoxQuery) fetchGeoJSON();
    },
  });

  let pendingFetch = false;
  const fetchGeoJSON = () => {
    if (pendingFetch) return;
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
    // const paramString = L.Util.getParamString(params);
    // jsonp(
    //   url,
    //   {
    //     param: paramString.slice(1) + '&',
    //     name: callbackName,
    //     timeout: 10000,
    //   },
    //   (error, data: any) => {
    //     // console.log(data);
    //     if (error) {
    //       console.error(error);
    //       setGeoJSON({
    //         type: 'FeatureCollection',
    //         features: [],
    //       });
    //     } else {
    //       setGeoJSON(data);
    //     }
    //   },
    // );
    params.outputFormat = 'application/json';
    params.format_options = undefined;
    pendingFetch = true;
    axios
      .get(url, { params: params })
      .then((data) => {
        if (typeof data.data === 'string') {
          console.log(data.data);
        } else {
          setGeoJSON(data.data);
          map?.removeLayer(ref.current);
        }
      })
      .catch((reason) => {
        console.log(reason);
      })
      .finally(() => {
        pendingFetch = false;
      });
  };

  function clickFeature(e) {
    // highlightFeature(e);
    // console.log('Layer clicked', e.target.feature.id);
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
      if (getLabel) {
        // const center = layer.getBounds().getCenter();
        layer.bindTooltip(getLabel(feature), {
          permanent: false,
          direction: 'center',
          className: 'my-labels',
          opacity: 1,
        });
      }
      // const popupContent = ReactDOMServer.renderToString(
      //   <GeneralPopup feature={feature} title={typeName} />,
      // );
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
          key={JSON.stringify(geoJSON)}
          ref={ref}
          data={geoJSON}
          // @ts-ignore
          interactive={interactive}
          // @ts-ignore
          onEachFeature={onEachFeature}
          style={style}
          pointToLayer={pointToLayer}
          bubblingMouseEvents={true}
        ></GeoJSON>
      )}
    </>
  );
};

export default WFSLayer;
