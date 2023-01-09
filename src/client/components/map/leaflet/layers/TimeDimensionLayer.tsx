/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import {
  type PathProps,
  createElementObject,
  createElementHook,
  createPathHook,
  updateGridLayer,
  extendContext,
} from '@react-leaflet/core';
import { LayerGroupProps } from 'react-leaflet';
import 'leaflet-timedimension';
import 'leaflet-timedimension/dist/leaflet.timedimension.control.css';
import { CRS, WMSOptions } from 'leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

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
    subdomains: string | string[];
  };
  layer: string;
}

const useTimeDimensionLayerElement = createElementHook<
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
const useTimeDimensionLayer = createPathHook(useTimeDimensionLayerElement);

const TimeDimensionLayer = (props) => {
  useEffect(() => {
    L.TimeDimension.Layer.WMS.include({
      _getCapabilitiesUrl: function () {
        let url = this._baseLayer.getURL();
        if (this._getCapabilitiesAlternateUrl)
          url = this._getCapabilitiesAlternateUrl;
        if (
          this._baseLayer.options.subdomains &&
          this._baseLayer.options.subdomains.length > 0
        ) {
          url = url.replace('{s}', this._baseLayer.options.subdomains[0]);
        }
        const params = L.extend({}, this._getCapabilitiesParams, {
          request: 'GetCapabilities',
          service: 'WMS',
          version: this._wmsVersion,
        });
        url = url + L.Util.getParamString(params, url, params.uppercase);
        return url;
      },
      _parseTimeDimensionFromCapabilities: function (xml) {
        const layers = xml.querySelectorAll('Layer[queryable="1"]');
        const layerName = this._baseLayer.wmsParams.layers.split(':')[1];
        let layer = null;
        let times = null;

        layers.forEach(function (current) {
          if (current.querySelector('Name').innerHTML === layerName) {
            layer = current;
          }
        });
        if (layer) {
          times = this._getTimesFromLayerCapabilities(layer);
          if (!times) {
            times = this._getTimesFromLayerCapabilities(layer.parentNode);
          }
        }

        return times;
      },
    });
  }, []);

  useTimeDimensionLayer(props);
  return null;
};

export default TimeDimensionLayer;
