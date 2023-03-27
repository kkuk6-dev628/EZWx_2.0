/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
import { useMapEvents, GeoJSON as GeoJSONLayer } from 'react-leaflet';
import L, { LatLng, Layer, PathOptions } from 'leaflet';
import axios from 'axios';
import { useSelector } from 'react-redux';
import GeoJSON, { FeatureCollection } from 'geojson';
import { emptyGeoJson } from '../../common/AreoConstants';
import { selectDataLoadTime } from '../../../../store/layers/DataLoadTimeSlice';
import { selectLayerControlState } from '../../../../store/layers/LayerControl';
import { selectSettings } from '../../../../store/user/UserSettings';

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
  layerStateName?: string;
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
      layerStateName: layerStateSelector,
      cacheVersion,
    }: WFSLayerProps,
    parentRef: any,
  ) => {
    const userSettings = useSelector(selectSettings);
    const observationTime = userSettings.observation_time;
    const [geoJSON, setGeoJSON] = useState<FeatureCollection>(initData);
    const [displayedData, setDisplayedData] = useState<FeatureCollection>(emptyGeoJson);
    const [geoJsonKey, setGeoJsonKey] = useState(12034512);
    const localRef = useRef();
    const dataLoadTime = useSelector(selectDataLoadTime);
    const layerControlState = useSelector(selectLayerControlState);

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
      layerState = layerControlState[layerStateSelector];
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
          const label = getLabel(feature);
          // if (feature.id.indexOf('canadian_province') > -1) {
          //   console.log(feature.id, label);
          // }
          if (label === 'Ontario' && feature.id !== 'canadian_province.13') {
            return;
          }

          layer.bindTooltip(getLabel(feature), {
            permanent: zoom > showLabelZoom,
            direction: 'center',
            className: 'my-labels',
            opacity: 1,
          });
          const tooltip = layer.getTooltip();
          switch (feature.id) {
            case 'canadian_province.13': // Ontario
              layer.on('tooltipopen', (_t, _l) => {
                tooltip.setLatLng([51.38618232920632, -86.62995945187947]);
              });
              break;
            case 'canadian_province.2': // Nunavut
              layer.on('tooltipopen', (_t, _l) => {
                tooltip.setLatLng([65.69453068687591, -94.78918016983596]);
              });
              break;
            case 'canadian_province.1': // Northwest Territories canadian_province.8 Newfoundland and Labrado
              layer.on('tooltipopen', (_t, _l) => {
                tooltip.setLatLng([63.66887925342884, -119.86859756117303]);
              });
              break;
            case 'canadian_province.8': // Newfoundland and Labrado
              layer.on('tooltipopen', (_t, _l) => {
                tooltip.setLatLng([53.58961734060831, -61.489673782957254]);
              });
              break;
            case 'canadian_province.12': // Nova scotia
              layer.on('tooltipopen', (_t, _l) => {
                tooltip.setLatLng([44.85387773982307, -63.76924782162695]);
              });
              break;
            case 'canadian_province.9': // British Columbia
              layer.on('tooltipopen', (_t, _l) => {
                tooltip.setLatLng([54.352781266660024, -125.18142039625991]);
              });
              break;
            case 'canadian_province.10': // Prince Edward Island
              layer.on('tooltipopen', (_t, _l) => {
                tooltip.setLatLng([46.311809920768496, -63.13277395149652]);
              });
              break;
          }
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
