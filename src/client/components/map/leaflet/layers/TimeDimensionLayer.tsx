/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  type PathProps,
  createElementObject,
  createPathComponent,
  updateGridLayer,
  extendContext,
} from '@react-leaflet/core';
import { LayerGroupProps } from 'react-leaflet';
import 'leaflet-timedimension';
import 'leaflet-timedimension/dist/leaflet.timedimension.control.css';
import { CRS, WMSOptions } from 'leaflet';
import L from 'leaflet';

interface TimeDimensionLayerProps
  extends WMSOptions,
    LayerGroupProps,
    PathProps {
  url: string;
  options: {
    transparent: boolean;
    format: string;
    crs: CRS;
    info_format: string;
    identify: boolean;
    tiled: boolean;
    layers: string;
  };
  layer: string;
}

const TimeDimensionLayer = createPathComponent<
  L.TimeDimension.Layer.WMS,
  TimeDimensionLayerProps
>(
  function createWMSLayer({ url, options }, ctx) {
    const wmsLayer = L.tileLayer.wms(url, options);

    // Create and add a TimeDimension Layer to the map
    const tdWmsLayer = L.timeDimension.layer.wms(wmsLayer);
    return createElementObject(
      tdWmsLayer,
      extendContext(ctx, {
        overlayContainer: tdWmsLayer,
      }),
    );
  },
  function updateWMSLayer(layer, props, prevProps) {
    updateGridLayer(layer, props, prevProps);

    // if (props.options != null && props.options !== prevProps.options) {
    //   layer.setParams(props.options);
    // }
  },
);

export default TimeDimensionLayer;
