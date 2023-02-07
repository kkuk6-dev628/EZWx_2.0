/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
import { useMapEvents, GeoJSON as GeoJSONLayer } from 'react-leaflet';
import L, { LatLng, Layer, PathOptions } from 'leaflet';
import axios from 'axios';
import MarkerClusterGroup from './MarkerClusterGroup';
import { useSelector } from 'react-redux';
import { selectObsTime } from '../../../../store/time-slider/ObsTimeSlice';
import { generateHash } from '../../common/AreoFunctions';
import GeoJSON, { FeatureCollection } from 'geojson';
import { AppState } from '../../../../store/store';

interface WFSLayerProps {
  url: string;
  initData?: FeatureCollection;
  maxFeatures: number;
  typeName: string;
  propertyNames?: string[];
  enableBBoxQuery?: boolean;
  geometryColumn?: string;
  interactive?: boolean;
  showLabelZoom?: number;
  getLabel?: (feature: GeoJSON.Feature) => string;
  style?: (feature: GeoJSON.Feature) => PathOptions;
  pointToLayer?: (feature: GeoJSON.Feature, latlng: LatLng) => L.Layer;
  serverFilter?: string;
  clientFilter?: (features: GeoJSON.Feature[], obsTime: Date) => GeoJSON.Feature[];
  isClusteredMarker?: boolean;
  selectClusterMarker?: (layers: Layer[]) => Layer;
  markerPane?: string;
  maxClusterRadius?: number;
  layerStateSelector?: (state: AppState) => any;
  cacheVersion?: number;
}

const emptyGeoJson: FeatureCollection = {
  type: 'FeatureCollection',
  features: new Array<GeoJSON.Feature>(),
};

const WFSLayer = React.forwardRef(
  (
    {
      url,
      initData = emptyGeoJson,
      maxFeatures,
      typeName,
      propertyNames,
      enableBBoxQuery,
      geometryColumn,
      interactive = true,
      showLabelZoom = 5,
      getLabel,
      style,
      pointToLayer,
      serverFilter: filter,
      clientFilter,
      isClusteredMarker = false,
      selectClusterMarker,
      markerPane,
      maxClusterRadius = 30,
      layerStateSelector,
      cacheVersion,
    }: WFSLayerProps,
    wfsRef: any,
  ) => {
    const observationTime = useSelector(selectObsTime);

    const [geoJSON, setGeoJSON] = useState<FeatureCollection>(initData);

    const [displayedData, setDisplayedData] = useState<FeatureCollection>(emptyGeoJson);

    const [geoJsonKey, setGeoJsonKey] = useState(12034512);

    useEffect(() => {
      const newKey = generateHash(JSON.stringify(displayedData));
      setGeoJsonKey(newKey);
    }, [displayedData]);

    useEffect(() => {
      if (clientFilter && geoJSON.features.length > 0) {
        const filteredFeatures = clientFilter(geoJSON.features, new Date(observationTime));
        setDisplayedData({
          type: 'FeatureCollection',
          features: filteredFeatures,
        });
      } else {
        setDisplayedData(geoJSON);
      }
    }, [geoJSON]);

    let layerState = null;
    if (layerStateSelector) {
      layerState = useSelector(layerStateSelector);
    }
    useEffect(() => {
      if (layerState && layerState.checked === false) return;
      if (clientFilter && geoJSON.features.length > 0) {
        const filteredFeatures = clientFilter(geoJSON.features, new Date(observationTime));
        setDisplayedData({
          type: 'FeatureCollection',
          features: filteredFeatures,
        });
      }
    }, [observationTime]);

    const setLabelShow = (layer: Layer, show: boolean) => {
      if (layer.getTooltip()) {
        const tooltip = layer.getTooltip();
        layer.unbindTooltip().bindTooltip(tooltip, {
          permanent: show,
        });
      }
    };

    const map = useMapEvents({
      zoomend: () => {
        const zoom = map.getZoom();
        if (zoom < showLabelZoom && (!lastZoom || lastZoom >= showLabelZoom)) {
          ref.current.eachLayer((l) => {
            setLabelShow(l, false);
          });
        } else if (zoom >= showLabelZoom && (!lastZoom || lastZoom < showLabelZoom)) {
          ref.current.eachLayer(function (l) {
            setLabelShow(l, true);
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
      initData.features.length == 0 ? fetchGeoJSON() : null;
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
      } as any;
      if (propertyNames) {
        params.propertyName = propertyNames.join(',');
      }
      if (filter) {
        params.cql_filter = filter;
      }
      if (enableBBoxQuery) {
        const geom = geometryColumn || 'wkb_geometry';
        if (params.cql_filter) {
          params.cql_filter += ` AND BBOX(${geom}, ${map.getBounds().toBBoxString()})`;
        } else {
          params.cql_filter = `BBOX(${geom}, ${map.getBounds().toBBoxString()})`;
        }
      }
      params.outputFormat = 'application/json';
      params.format_options = undefined;
      if (cacheVersion) params.v = cacheVersion;
      pendingFetch = true;
      // if (abortController) {
      //   abortController.abort();
      // }
      // setAbortController(new AbortController());
      axios
        .get(url, {
          params: params,
          // signal: abortController ? abortController.signal : null,
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
          // setAbortController(null);
        });
    };

    const onEachFeature = (feature, layer) => {
      if (feature.properties) {
        if (getLabel) {
          const zoom = map.getZoom();
          layer.bindTooltip(getLabel(feature), {
            permanent: zoom > showLabelZoom,
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
            key={geoJsonKey}
            ref={wfsRef}
            // @ts-ignore
            iconCreateFunction={(cluster) => {
              const children = cluster.getAllChildMarkers();
              let marker;
              if (selectClusterMarker) {
                marker = selectClusterMarker(children);
              }
              if (!marker) {
                marker = children.sort((a: any, b: any) => {
                  return a._leaflet_id > b._leaflet_id ? 1 : -1;
                })[0];
              }
              return marker.getIcon();
            }}
            zoomToBoundsOnClick={false}
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={false}
            maxClusterRadius={maxClusterRadius}
            clusterPane={markerPane ? markerPane : undefined}
          >
            {geoJSON != null && (
              <GeoJSONLayer
                ref={ref}
                data={displayedData}
                // @ts-ignore
                interactive={interactive}
                // @ts-ignore
                onEachFeature={onEachFeature}
                style={style}
                pointToLayer={pointToLayer}
                bubblingMouseEvents={true}
              ></GeoJSONLayer>
            )}
          </MarkerClusterGroup>
        )}
        {!isClusteredMarker && geoJSON != null && (
          <GeoJSONLayer
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
          ></GeoJSONLayer>
        )}
      </>
    );
  },
);

export default WFSLayer;
