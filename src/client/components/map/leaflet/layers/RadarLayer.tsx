import { createContext, useContext, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectRadar } from '../../../../store/layers/LayerControl';
import { selectObsTime } from '../../../../store/time-slider/ObsTimeSlice';
import { addLeadingZeroes } from '../../common/AreoFunctions';

interface RadarLayers {
  radarContainer: L.LayerGroup;
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

const getAbsoluteMinutes = (time: number): number => {
  return Math.floor(time / 60 / 1000);
};

const RadarLayer = () => {
  const map = useMap();
  const radarLayers = useRadarLayersContext();
  const radarLayerState = useSelector(selectRadar);
  const observationTime = useSelector(selectObsTime);

  useEffect(() => {
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
        crs: L.CRS.EPSG4326,
      }),
      5: L.tileLayer.wms(compositeReflectivityUrl, {
        layers: compositeReflectivityLayer + '-m05m',
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
        crs: L.CRS.EPSG4326,
      }),
      10: L.tileLayer.wms(compositeReflectivityUrl, {
        layers: compositeReflectivityLayer + '-m10m',
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
        crs: L.CRS.EPSG4326,
      }),
      15: L.tileLayer.wms(compositeReflectivityUrl, {
        layers: compositeReflectivityLayer + '-m15m',
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
        crs: L.CRS.EPSG4326,
      }),
      20: L.tileLayer.wms(compositeReflectivityUrl, {
        layers: compositeReflectivityLayer + '-m20m',
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
        crs: L.CRS.EPSG4326,
      }),
      25: L.tileLayer.wms(compositeReflectivityUrl, {
        layers: compositeReflectivityLayer + '-m25m',
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
        crs: L.CRS.EPSG4326,
      }),
      30: L.tileLayer.wms(compositeReflectivityUrl, {
        layers: compositeReflectivityLayer + '-m30m',
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
        crs: L.CRS.EPSG4326,
      }),
      35: L.tileLayer.wms(compositeReflectivityUrl, {
        layers: compositeReflectivityLayer + '-m35m',
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
        crs: L.CRS.EPSG4326,
      }),
      40: L.tileLayer.wms(compositeReflectivityUrl, {
        layers: compositeReflectivityLayer + '-m40m',
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
        crs: L.CRS.EPSG4326,
      }),
      45: L.tileLayer.wms(compositeReflectivityUrl, {
        layers: compositeReflectivityLayer + '-m45m',
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
        crs: L.CRS.EPSG4326,
      }),
      50: L.tileLayer.wms(compositeReflectivityUrl, {
        layers: compositeReflectivityLayer + '-m50m',
        format: 'image/png',
        transparent: true,
        opacity: 0.575,
        crs: L.CRS.EPSG4326,
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

    // Object.values(radarLayers.baseReflectivity).forEach((wmsLayer) => wmsLayer.setOpacity(1).addTo(map));
    // Object.values(radarLayers.compositeReflectivity).forEach((wmsLayer) => wmsLayer.setOpacity(0).addTo(map));
    // Object.values(radarLayers.echoTopHeight).forEach((wmsLayer) => wmsLayer.setOpacity(0).addTo(map));
    // radarLayers.forecast.forEach((wmsLayer) => wmsLayer.setOpacity(0).addTo(map));
  }, []);

  useEffect(() => {
    hideLayers(Object.values(radarLayers.baseReflectivity));
    hideLayers(Object.values(radarLayers.compositeReflectivity));
    hideLayers(Object.values(radarLayers.echoTopHeight));
    hideLayers(radarLayers.forecast);
    if (!radarLayerState.checked) {
      return;
    }
    const differenceMinutes = getTimeDifference();
    const layerName = getTimeLayerName();
    if (layerName === null) return;
    if (differenceMinutes <= 0) {
      if (radarLayerState.baseReflectivity.checked) {
        showLayer(radarLayers.baseReflectivity[layerName]);
      } else if (radarLayerState.compositeReflectivity.checked) {
        showLayer(radarLayers.compositeReflectivity[layerName]);
      } else if (radarLayerState.echoTopHeight.checked) {
        showLayer(radarLayers.echoTopHeight[layerName]);
      }
    } else if (differenceMinutes < 18 * 60 && radarLayerState.forecastRadar.checked) {
      showLayer(radarLayers.forecast[layerName]);
    }
  }, [
    radarLayerState.checked,
    radarLayerState.baseReflectivity.checked,
    radarLayerState.compositeReflectivity.checked,
    radarLayerState.echoTopHeight.checked,
    radarLayerState.forecastRadar.checked,
    observationTime,
  ]);

  useEffect(() => {
    const opacity = radarLayerState.opacity / 100;
    Object.values(radarLayers.baseReflectivity).forEach((layer) => layer.setOpacity(opacity));
    Object.values(radarLayers.compositeReflectivity).forEach((layer) => layer.setOpacity(opacity));
    Object.values(radarLayers.echoTopHeight).forEach((layer) => layer.setOpacity(opacity));
    radarLayers.forecast.forEach((layer) => layer.setOpacity(opacity));
  }, [radarLayerState.opacity]);

  const showLayer = (layer: L.TileLayer.WMS) => {
    if (!layer) return;
    if (!map.hasLayer(layer)) map.addLayer(layer);
  };

  const showLayers = (layers: L.TileLayer.WMS[]) => {
    layers.forEach((layer) => {
      if (!layer) return;
      if (!map.hasLayer(layer)) {
        map.addLayer(layer);
      }
    });
  };

  const hideLayers = (layers: L.TileLayer.WMS[]) => {
    layers.forEach((layer) => {
      if (!layer) return;
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
  };

  const hideAllTime = () => {
    Object.values(radarLayers.baseReflectivity).forEach((layer) => layer.setOpacity(0));
    Object.values(radarLayers.compositeReflectivity).forEach((layer) => layer.setOpacity(0));
    Object.values(radarLayers.echoTopHeight).forEach((layer) => layer.setOpacity(0));
    radarLayers.forecast.forEach((layer) => layer.setOpacity(0));
  };

  const getTimeDifference = () => {
    const currentMinutes = getAbsoluteMinutes(Date.now());
    const referenceMinutes = getAbsoluteMinutes(new Date(observationTime).getTime());
    return referenceMinutes - currentMinutes;
  };

  const getTimeLayerName = () => {
    const differenceMinutes = getTimeDifference();
    if (differenceMinutes <= 0) {
      if (differenceMinutes < -50) {
        return null;
      }
      const diff = Math.abs(differenceMinutes);
      const layerName = Math.floor(diff / 5) * 5;
      return layerName;
    } else {
      if (differenceMinutes > 18 * 60) {
        return null;
      }
      const layerName = Math.floor(differenceMinutes / 15);
      return layerName;
    }
  };

  return null;
};

export default RadarLayer;
