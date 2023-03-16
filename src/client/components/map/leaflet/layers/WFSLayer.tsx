/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
import { useMapEvents, GeoJSON as GeoJSONLayer } from 'react-leaflet';
import L, { LatLng, Layer, PathOptions } from 'leaflet';
import axios from 'axios';
import MarkerClusterGroup from '../react-layers/MarkerClusterGroup';
import { useSelector } from 'react-redux';
import { selectObsTime } from '../../../../store/time-slider/ObsTimeSlice';
import { generateHash } from '../../common/AreoFunctions';
import GeoJSON, { FeatureCollection } from 'geojson';
import { AppState } from '../../../../store/store';
import { useLiveQuery } from 'dexie-react-hooks';
import { emptyGeoJson } from '../../common/AreoConstants';
import Dexie from 'dexie';
import { selectDataLoadTime } from '../../../../store/layers/DataLoadTimeSlice';

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
  readDb: () => any;
  writeDb: (features: GeoJSON.Feature[]) => void;
  layerStateSelector?: (state: AppState) => any;
  cacheVersion?: number;
}

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
      readDb,
      writeDb,
      layerStateSelector,
      cacheVersion,
    }: WFSLayerProps,
    parentRef: any,
  ) => {
    const observationTime = useSelector(selectObsTime);
    const [geoJSON, setGeoJSON] = useState<FeatureCollection>(initData);
    const [displayedData, setDisplayedData] = useState<FeatureCollection>(emptyGeoJson);
    const [geoJsonKey, setGeoJsonKey] = useState(12034512);
    const localRef = useRef();
    const dataLoadTime = useSelector(selectDataLoadTime);

    useEffect(() => {
      const newKey = Date.now();
      typeName === 'EZWxBrief:metar' &&
        console.log('updated key', 'diff:', geoJsonKey - newKey, 'displayedData', displayedData.features.length);
      setGeoJsonKey(newKey);
    }, [displayedData]);

    useEffect(() => {
      if (!geoJSON) return;
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
      if (!geoJSON) return;
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
        const layer = localRef.current as L.GeoJSON;
        if (!layer) return;
        if (zoom < showLabelZoom && (!lastZoom || lastZoom >= showLabelZoom)) {
          layer.eachLayer((l) => {
            setLabelShow(l, false);
          });
        } else if (zoom >= showLabelZoom && (!lastZoom || lastZoom < showLabelZoom)) {
          layer.eachLayer(function (l) {
            setLabelShow(l, true);
          });
        }
        lastZoom = zoom;
      },
      moveend: () => {
        if (enableBBoxQuery) fetchGeoJSON();
      },
    });
    useEffect(() => {
      if (initData.features.length == 0) {
        readDb().then((cachedFeatures) => {
          if (cachedFeatures && cachedFeatures.length > 0) {
            setGeoJSON({
              type: 'FeatureCollection',
              features: cachedFeatures,
            });
          }
        });
        fetchGeoJSON();
      }
    }, [dataLoadTime]);

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
            if (localRef.current && map.hasLayer(localRef.current)) map.removeLayer(localRef.current);
            writeDb(data.data.features);
            setGeoJSON(data.data);
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
        {displayedData != null && (
          <GeoJSONLayer
            key={geoJsonKey}
            ref={(ref) => {
              if (parentRef) parentRef.current = ref;
              localRef.current = ref as any;
            }}
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
