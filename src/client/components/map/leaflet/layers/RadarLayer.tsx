import { createContext, useContext } from 'react';
import { useMap } from 'react-leaflet';

interface RadarLayers {
  // 0.5° base reflectivity
  n0q: {
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
  hsr: {
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
  eet: {
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
const echoTopHeightsUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/eet.cgi';
const forecastRadarUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/hrrr/refd.cgi';

const RadarLayer = () => {
  const map = useMap();
  const radarLayers = useRadarLayersContext();
  radarLayers.n0q = {
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
  Object.values(radarLayers.n0q).forEach((wmsLayer) => wmsLayer.addTo(map));
  return null;
};

export default RadarLayer;
