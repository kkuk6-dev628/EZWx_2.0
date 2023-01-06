/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  type PathProps,
  createElementObject,
  createPathComponent,
  updateGridLayer,
  extendContext,
} from '@react-leaflet/core';
import React, { Component } from 'react';
import { LayerGroupProps, useMap, WMSTileLayer } from 'react-leaflet';
// @ts-ignore
import WMS, { WMSOptions } from 'leaflet.wms';
import { CRS } from 'leaflet';
import L from 'leaflet';

interface WMSLayerProps extends WMSOptions, LayerGroupProps, PathProps {
  url: string;
  options: {
    transparent: boolean;
    format: string;
    crs: CRS;
    info_format: string;
    identify: boolean;
    tiled: boolean;
    layers: Array<any>;
  };
  layer: string;
}

const WMSLayer = createPathComponent<WMS, WMSLayerProps>(
  function createWMSLayer({ url, options, layer }, ctx) {
    const map = useMap();
    const source = WMS.source(url, options);
    const layers = [];
    for (const name of options.layers) {
      layers.push(source.getLayer(name));
    }
    const layerGroup = L.layerGroup(layers);
    // @ts-ignore
    layerGroup.source = source;
    return createElementObject(
      layerGroup,
      extendContext(ctx, { overlayContainer: layerGroup }),
    );
  },
  function updateWMSLayer(layer, props, prevProps) {
    updateGridLayer(layer, props, prevProps);

    // if (props.options != null && props.options !== prevProps.options) {
    //   layer.setParams(props.options);
    // }
  },
);

export default WMSLayer;
