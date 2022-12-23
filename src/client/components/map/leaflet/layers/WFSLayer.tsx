/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { Children, useEffect, useRef, useState } from 'react';
import { useMapEvents, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import Image from 'next/image';
import ReactDOMServer from 'react-dom/server';
import ConvectiveOutlookLayer from './ConvectiveOutlookLayer';
import MarkerClusterGroup from './MarkerClusterGroup';
import { useSelector } from 'react-redux';
import { selectObsTime } from '../../../../store/ObsTimeSlice';

import { generateHash } from '../../common/AreoFunctions';
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
  pointToLayer?: (feature: L.feature, latlng: any) => L.Marker;
  highlightStyle?: any;
  serverFilter?: string;
  clientFilter?: (feature: L.feature, obsTime: Date) => boolean;
  isClusteredMarker?: boolean;
  markerPane?: string;
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
  serverFilter: filter,
  clientFilter,
  isClusteredMarker = false,
  markerPane,
}: WFSLayerProps) => {
  const selector = useSelector(selectObsTime);
  console.log('selector', selector);
  const [geoJSON, setGeoJSON] = useState({
    type: 'FeatureCollection',
    features: [],
  });

  const [displayedData, setDisplayedData] = useState({
    type: 'FeatureCollection',
    features: [],
  });

  const [geoJsonKey, setGeoJsonKey] = useState(12034512);

  useEffect(() => {
    const newKey = generateHash(JSON.stringify(displayedData));
    setGeoJsonKey(newKey);
  }, [displayedData]);

  useEffect(() => {
    if (clientFilter && geoJSON.features.length > 0) {
      const filteredFeatures = geoJSON.features.filter((feature) =>
        clientFilter(feature, new Date()),
      );
      setDisplayedData({
        type: 'FeatureCollection',
        features: filteredFeatures,
      });
    } else {
      setDisplayedData(geoJSON);
    }
  }, [geoJSON]);

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
  const ref = useRef(null);
  useEffect(() => {
    fetchGeoJSON();
  }, []);

  let lastZoom: number;

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
    params.outputFormat = 'application/json';
    params.format_options = undefined;
    pendingFetch = true;
    axios
      .get(url, {
        params: params,
        headers: {
          'Cache-Control': 'public, max-age=31536000',
        },
      })
      .then((data) => {
        if (typeof data.data === 'string') {
          console.log(typeName + ': Invalid json data!', data.data);
        } else {
          setGeoJSON(data.data);
          map?.removeLayer(ref.current);
        }
      })
      .catch((reason) => {
        console.log(typeName, reason);
      })
      .finally(() => {
        pendingFetch = false;
      });
  };

  // function clickFeature(e) {
  //   // highlightFeature(e);
  //   // console.log('Layer clicked', e.target.feature.id);
  // }
  // function highlightFeature(e) {
  //   const layer = e.target;
  //   layer.setStyle(
  //     highlightStyle ?? {
  //       weight: 5,
  //     },
  //   );
  //   layer.bringToFront();
  // }
  // function resetHighlight() {
  //   const layer = ref.current;
  //   if (layer) layer.resetStyle();
  // }

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      if (getLabel) {
        layer.bindTooltip(getLabel(feature), {
          permanent: false,
          direction: 'center',
          className: 'my-labels',
          opacity: 1,
        });
      }
    }
  };

  return (
    <>
      {isClusteredMarker && (
        <MarkerClusterGroup
          // @ts-ignore
          iconCreateFunction={(cluster) => {
            return cluster.getAllChildMarkers()[0].getIcon();
          }}
          zoomToBoundsOnClick={false}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={false}
          maxClusterRadius={30}
          clusterPane={markerPane ? markerPane : undefined}
        >
          {geoJSON != null && (
            <GeoJSON
              key={geoJsonKey}
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
        </MarkerClusterGroup>
      )}
      {!isClusteredMarker && geoJSON != null && (
        <GeoJSON
          key={geoJsonKey}
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
