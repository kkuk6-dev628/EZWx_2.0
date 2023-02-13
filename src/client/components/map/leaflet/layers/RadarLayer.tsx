import { createContext, useContext } from 'react';
import { useMap } from 'react-leaflet';
import { addLeadingZeroes } from '../../common/AreoFunctions';

interface RadarLayers {
  // 0.5° base reflectivity
  baseReflectivity: {
    0: L.TileLayer.WMS;
    5: L.TileLayer.WMS;
    10: L.TileLayer.WMS;
    15: L.TileLayer.WMS;
    20: L.TileLayer.WMS;
    25: L.TileLayer.WMS;
    30: L.TileLayer.WMS;
    35: L.TileLayer.WMS;
    40: L.TileLayer.WMS;
    45: L.TileLayer.WMS;
    50: L.TileLayer.WMS;
  };
  // Composite reflectivity
  compositeReflectivity: {
    0: L.TileLayer.WMS;
    5: L.TileLayer.WMS;
    10: L.TileLayer.WMS;
    15: L.TileLayer.WMS;
    20: L.TileLayer.WMS;
    25: L.TileLayer.WMS;
    30: L.TileLayer.WMS;
    35: L.TileLayer.WMS;
    40: L.TileLayer.WMS;
    45: L.TileLayer.WMS;
    50: L.TileLayer.WMS;
  };
  // Echo top heights
  echoTopHeight: {
    0: L.TileLayer.WMS;
    5: L.TileLayer.WMS;
    10: L.TileLayer.WMS;
    15: L.TileLayer.WMS;
    20: L.TileLayer.WMS;
    25: L.TileLayer.WMS;
    30: L.TileLayer.WMS;
    35: L.TileLayer.WMS;
    40: L.TileLayer.WMS;
    45: L.TileLayer.WMS;
    50: L.TileLayer.WMS;
  };
  // Forecasts radar
  // Forecasts are available every 15 minutes between initialization and forecast hour 18.
  // Totally 72 layers will be exists.
  forecast: L.TileLayer.WMS[];
}

const RadarLayersContext = createContext<RadarLayers>({} as any);

export const MeteoLayersProvider = RadarLayersContext.Provider;

export function useRadarLayersContext() {
  const context = useContext(RadarLayersContext);

  if (context == null) {
    throw new Error('No context provided: useLayerControlContext() can only be used in a descendant of <LayerControl>');
  }

  return context;
}
const baseReflectivityUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi';
const baseReflectivityLayer = 'nexrad-n0q-900913';

const compositeReflectivityUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/hsr.cgi';
const compositeReflectivityLayer = 'q2-hsr-900913';

const echoTopHeightsUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/eet.cgi';
const echoTopHeightsLayer = 'nexrad-eet-900913';

const forecastRadarUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/hrrr/refd.cgi';
const forecastRadarLayer = 'refd_';

const RadarLayer = () => {
  const map = useMap();
  const radarLayers = useRadarLayersContext();
  radarLayers.baseReflectivity = {
    0: L.tileLayer.wms(baseReflectivityUrl, {
      layers: baseReflectivityLayer,
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    5: L.tileLayer.wms(baseReflectivityUrl, {
      layers: baseReflectivityLayer + '-m05m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    10: L.tileLayer.wms(baseReflectivityUrl, {
      layers: baseReflectivityLayer + '-m10m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    15: L.tileLayer.wms(baseReflectivityUrl, {
      layers: baseReflectivityLayer + '-m15m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    20: L.tileLayer.wms(baseReflectivityUrl, {
      layers: baseReflectivityLayer + '-m20m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    25: L.tileLayer.wms(baseReflectivityUrl, {
      layers: baseReflectivityLayer + '-m25m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    30: L.tileLayer.wms(baseReflectivityUrl, {
      layers: baseReflectivityLayer + '-m30m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    35: L.tileLayer.wms(baseReflectivityUrl, {
      layers: baseReflectivityLayer + '-m35m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    40: L.tileLayer.wms(baseReflectivityUrl, {
      layers: baseReflectivityLayer + '-m40m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    45: L.tileLayer.wms(baseReflectivityUrl, {
      layers: baseReflectivityLayer + '-m45m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    50: L.tileLayer.wms(baseReflectivityUrl, {
      layers: baseReflectivityLayer + '-m50m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
  };
  radarLayers.compositeReflectivity = {
    0: L.tileLayer.wms(compositeReflectivityUrl, {
      layers: compositeReflectivityLayer,
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    5: L.tileLayer.wms(compositeReflectivityUrl, {
      layers: compositeReflectivityLayer + '-m05m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    10: L.tileLayer.wms(compositeReflectivityUrl, {
      layers: compositeReflectivityLayer + '-m10m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    15: L.tileLayer.wms(compositeReflectivityUrl, {
      layers: compositeReflectivityLayer + '-m15m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    20: L.tileLayer.wms(compositeReflectivityUrl, {
      layers: compositeReflectivityLayer + '-m20m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    25: L.tileLayer.wms(compositeReflectivityUrl, {
      layers: compositeReflectivityLayer + '-m25m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    30: L.tileLayer.wms(compositeReflectivityUrl, {
      layers: compositeReflectivityLayer + '-m30m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    35: L.tileLayer.wms(compositeReflectivityUrl, {
      layers: compositeReflectivityLayer + '-m35m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    40: L.tileLayer.wms(compositeReflectivityUrl, {
      layers: compositeReflectivityLayer + '-m40m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    45: L.tileLayer.wms(compositeReflectivityUrl, {
      layers: compositeReflectivityLayer + '-m45m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    50: L.tileLayer.wms(compositeReflectivityUrl, {
      layers: compositeReflectivityLayer + '-m50m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
  };
  radarLayers.echoTopHeight = {
    0: L.tileLayer.wms(echoTopHeightsUrl, {
      layers: echoTopHeightsLayer,
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    5: L.tileLayer.wms(echoTopHeightsUrl, {
      layers: echoTopHeightsLayer + '-m05m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    10: L.tileLayer.wms(echoTopHeightsUrl, {
      layers: echoTopHeightsLayer + '-m10m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    15: L.tileLayer.wms(echoTopHeightsUrl, {
      layers: echoTopHeightsLayer + '-m15m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    20: L.tileLayer.wms(echoTopHeightsUrl, {
      layers: echoTopHeightsLayer + '-m20m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    25: L.tileLayer.wms(echoTopHeightsUrl, {
      layers: echoTopHeightsLayer + '-m25m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    30: L.tileLayer.wms(echoTopHeightsUrl, {
      layers: echoTopHeightsLayer + '-m30m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    35: L.tileLayer.wms(echoTopHeightsUrl, {
      layers: echoTopHeightsLayer + '-m35m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    40: L.tileLayer.wms(echoTopHeightsUrl, {
      layers: echoTopHeightsLayer + '-m40m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    45: L.tileLayer.wms(echoTopHeightsUrl, {
      layers: echoTopHeightsLayer + '-m45m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
    50: L.tileLayer.wms(echoTopHeightsUrl, {
      layers: echoTopHeightsLayer + '-m50m',
      format: 'image/png',
      transparent: true,
      opacity: 0.575,
    }),
  };
  radarLayers.forecast = [];
  for (let i = 0; i < 18; i++) {
    radarLayers.forecast.push(
      L.tileLayer.wms(forecastRadarUrl, {
        layers: forecastRadarLayer + addLeadingZeroes(`${i}15`, 4),
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
      }),
      L.tileLayer.wms(forecastRadarUrl, {
        layers: forecastRadarLayer + addLeadingZeroes(`${i}30`, 4),
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
      }),
      L.tileLayer.wms(forecastRadarUrl, {
        layers: forecastRadarLayer + addLeadingZeroes(`${i}45`, 4),
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
      }),
    );
  }
  Object.values(radarLayers.baseReflectivity).forEach((wmsLayer) => wmsLayer.setOpacity(1).addTo(map));
  // Object.values(radarLayers.compositeReflectivity).forEach((wmsLayer) => wmsLayer.setOpacity(0).addTo(map));
  // Object.values(radarLayers.echoTopHeight).forEach((wmsLayer) => wmsLayer.setOpacity(0).addTo(map));
  // radarLayers.forecast.forEach((wmsLayer) => wmsLayer.setOpacity(0).addTo(map));
  return null;
};

export default RadarLayer;
