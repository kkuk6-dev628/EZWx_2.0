/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { useMap } from 'react-leaflet';
// @ts-ignore
import * as WMS from 'leaflet.wms';
import { CRS } from 'leaflet';

interface WMSLayerProps {
  url: string;
  options: {
    transparent: boolean;
    format: string;
    crs: CRS;
    info_format: string;
    identify: boolean;
    tiled: boolean;
  };
  layers: string[];
}
const WMSLayer = React.forwardRef(
  ({ url, options, layers }: WMSLayerProps, ref) => {
    const map = useMap();

    // Add WMS source/layers
    const source = WMS.source(url, options);

    for (const name of layers) {
      source.getLayer(name).addTo(map);
    }
    // @ts-ignore
    ref.current = source;
    return null;
  },
);

export default WMSLayer;
