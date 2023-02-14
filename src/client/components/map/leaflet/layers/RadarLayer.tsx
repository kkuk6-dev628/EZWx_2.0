import { createContext, useContext, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectRadar } from '../../../../store/layers/LayerControl';
import { selectObsTime } from '../../../../store/time-slider/ObsTimeSlice';
import { addLeadingZeroes } from '../../common/AreoFunctions';
import WMS from '../plugins/leaflet.wms';

interface RadarLayers {
  radarContainer: L.LayerGroup;
  // 0.5° base reflectivity
  baseReflectivity: (typeof WMS.Layer)[];
  // Echo top heights
  echoTopHeight: (typeof WMS.Layer)[];
  // Forecasts radar
  // Forecasts are available every 15 minutes between initialization and forecast hour 18.
  // Totally 72 layers will be exists.
  forecast: (typeof WMS.Layer)[];
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

const echoTopHeightsUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/eet.cgi';
const echoTopHeightsLayer = 'nexrad-eet-900913';

const forecastRadarUrl = 'https://mesonet.agron.iastate.edu/cgi-bin/wms/hrrr/refd.cgi';
const forecastRadarLayer = 'refd_';
const forecastMinute = 18 * 60;

const getAbsoluteMinutes = (time: number): number => {
  return Math.floor(time / 60 / 1000);
};

const RadarLayer = () => {
  const map = useMap();
  const radarLayers = useRadarLayersContext();
  const radarLayerState = useSelector(selectRadar);
  const observationTime = useSelector(selectObsTime);

  useEffect(() => {
    radarLayers.baseReflectivity = [
      WMS.layer(baseReflectivityUrl, baseReflectivityLayer, {
        transparent: true,
        format: 'image/png',
        tiled: false,
        identify: false,
      }).addTo(map),
    ];
    for (let m = 5; m <= 50; m += 5) {
      const layerName = `${baseReflectivityLayer}-m${addLeadingZeroes(m, 2)}m`;
      radarLayers.baseReflectivity.push(
        WMS.layer(baseReflectivityUrl, layerName, {
          transparent: true,
          format: 'image/png',
          tiled: false,
          identify: false,
        })
          .setOpacity(0)
          .addTo(map),
      );
    }

    radarLayers.echoTopHeight = [
      WMS.layer(echoTopHeightsUrl, echoTopHeightsLayer, {
        transparent: true,
        format: 'image/png',
        tiled: false,
        identify: false,
      }).addTo(map),
    ];
    for (let m = 5; m <= 50; m += 5) {
      const layerName = `${echoTopHeightsLayer}-m${addLeadingZeroes(m, 2)}m`;
      radarLayers.echoTopHeight.push(
        WMS.layer(echoTopHeightsUrl, layerName, {
          transparent: true,
          format: 'image/png',
          tiled: false,
          identify: false,
        })
          .setOpacity(0)
          .addTo(map),
      );
    }

    radarLayers.forecast = [];
    for (let m = 0; m <= forecastMinute; m += 15) {
      const layerName = `${forecastRadarLayer}${addLeadingZeroes(m, 4)}`;
      radarLayers.forecast.push(
        WMS.layer(forecastRadarUrl, layerName, {
          transparent: true,
          format: 'image/png',
          tiled: false,
          identify: false,
        })
          .setOpacity(0)
          .addTo(map),
      );
    }
  }, []);

  useEffect(() => {
    radarLayers.baseReflectivity.forEach((layer) => layer.setOpacity(0));
    radarLayers.echoTopHeight.forEach((layer) => layer.setOpacity(0));
    radarLayers.forecast.forEach((layer) => layer.setOpacity(0));
    if (!radarLayerState.checked) {
      return;
    }
    const differenceMinutes = getTimeDifference();
    const layerName = getTimeLayerName();
    if (layerName === null) return;
    if (differenceMinutes <= 0) {
      if (radarLayerState.baseReflectivity.checked) {
        showLayer(radarLayers.baseReflectivity, layerName);
      } else if (radarLayerState.echoTopHeight.checked) {
        showLayer(radarLayers.echoTopHeight, layerName);
      }
    } else if (differenceMinutes < forecastMinute && radarLayerState.forecastRadar.checked) {
      showLayer(radarLayers.forecast, layerName);
    }
  }, [
    radarLayerState.checked,
    radarLayerState.baseReflectivity.checked,
    radarLayerState.echoTopHeight.checked,
    radarLayerState.forecastRadar.checked,
    observationTime,
    radarLayerState.opacity,
  ]);

  const showLayer = (layers: (typeof WMS.Layer)[], layerIndex: number) => {
    if (!layers[layerIndex]) return;
    const opacity = radarLayerState.opacity / 100;
    layers[layerIndex].setOpacity(opacity);
  };

  const getTimeDifference = () => {
    const currentMinutes = getAbsoluteMinutes(Date.now());
    const referenceMinutes = getAbsoluteMinutes(new Date(observationTime).getTime());
    return referenceMinutes - currentMinutes;
  };

  const getTimeLayerName = () => {
    const differenceMinutes = getTimeDifference();
    if (differenceMinutes <= 0 && differenceMinutes >= -50) {
      const diff = Math.abs(differenceMinutes);
      const layerName = Math.floor(diff / 5);
      return layerName;
    } else {
      if (differenceMinutes > forecastMinute) {
        return null;
      }
      const layerName = Math.floor(differenceMinutes / 15);
      return layerName;
    }
  };

  return null;
};

export default RadarLayer;
