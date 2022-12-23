/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
import { useMapEvents, GeoJSON } from 'react-leaflet';
import L, { LatLng, PathOptions } from 'leaflet';
import axios from 'axios';
import MarkerClusterGroup from './MarkerClusterGroup';
import { useSelector } from 'react-redux';
import { selectObsTime } from '../../../../store/ObsTimeSlice';
import { generateHash } from '../../common/AreoFunctions';
import { FeatureCollection } from 'geojson';

import { generateHash } from '../../common/AreoFunctions';
interface WFSLayerProps {
  url: string;
  maxFeatures: number;
  typeName: string;
  propertyNames?: string[];
  enableBBoxQuery?: boolean;
  interactive?: boolean;
  showLabelZoom?: number;
  getLabel?: (feature: GeoJSON.Feature) => string;
  style?: (feature: GeoJSON.Feature) => PathOptions;
  pointToLayer?: (feature: GeoJSON.Feature, latlng: LatLng) => L.Layer;
  serverFilter?: string;
  clientFilter?: (feature: GeoJSON.Feature, obsTime: Date) => boolean;
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
  serverFilter: filter,
  clientFilter,
  isClusteredMarker = false,
  markerPane,
}: WFSLayerProps) => {
  const observationTime = useSelector(selectObsTime);

  const [geoJSON, setGeoJSON] = useState<FeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });

  const [displayedData, setDisplayedData] = useState<FeatureCollection>({
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
        clientFilter(feature, new Date(observationTime)),
      );
      setDisplayedData({
        type: 'FeatureCollection',
        features: filteredFeatures,
      });
    } else {
      setDisplayedData(geoJSON);
    }
  }, [geoJSON]);

  useEffect(() => {
    if (clientFilter && geoJSON.features.length > 0) {
      const filteredFeatures = geoJSON.features.filter((feature) =>
        clientFilter(feature, new Date(observationTime)),
      );
      setDisplayedData({
        type: 'FeatureCollection',
        features: filteredFeatures,
      });
    }
  }, [observationTime]);

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
              data={displayedData}
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
          data={displayedData}
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
