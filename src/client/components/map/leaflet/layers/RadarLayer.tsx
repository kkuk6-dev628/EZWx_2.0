import axios from 'axios';
import { createContext, useContext, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectRadar } from '../../../../store/layers/LayerControl';
import { selectObsTime } from '../../../../store/time-slider/ObsTimeSlice';
import { addLeadingZeroes } from '../../common/AreoFunctions';
import WMS from '../plugins/leaflet.wms';

interface Radar {
  valid_timespan: number;
  layer: typeof WMS.Layer;
}

interface ReflectivityRadar extends Radar {
  meta: {
    vcp: string;
    product: string;
    site: string;
    valid: string;
    processing_time_secs: number;
    radar_quorum: string;
  };
}

interface ForecastRadar extends Radar {
  meta: {
    model_init_utc: string;
    forecast_minute: number;
    model_forecast_utc: string;
  };
}

interface RadarLayers {
  // 0.5° base reflectivity
  baseReflectivity: ReflectivityRadar[];
  // Echo top heights
  echoTopHeight: ReflectivityRadar[];
  // Forecasts radar
  // Forecasts are available every 15 minutes between initialization and forecast hour 18.
  // Totally 72 layers will be exists.
  forecast: ForecastRadar[];
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
const forecastMinute1 = 36 * 60;
const forecastMinute2 = 48 * 60;

const getAbsoluteMinutes = (time: number): number => {
  return Math.floor(time / 60 / 1000);
};

const RadarLayer = () => {
  const map = useMap();
  const radarLayers = useRadarLayersContext();
  const radarLayerState = useSelector(selectRadar);
  const observationTime = useSelector(selectObsTime);

  useEffect(() => {
    fetchReflectivityJsons();
    setInterval(() => {
      const minutes = new Date().getMinutes();
      if (minutes % 5 === 0) {
        fetchReflectivityJsons();
      }
    }, 60 * 1000);

    fetchForecastJsons();
    setInterval(() => {
      const minutes = new Date().getMinutes();
      if (minutes === 0) {
        fetchForecastJsons();
      }
    }, 60 * 1000);
  }, []);

  useEffect(() => {
    radarLayers.baseReflectivity.forEach((baseReflectivity) => baseReflectivity.layer.setOpacity(0));
    radarLayers.echoTopHeight.forEach((echoTopHeight) => echoTopHeight.layer.setOpacity(0));
    radarLayers.forecast.forEach((forecast) => forecast.layer?.setOpacity(0));
    if (!radarLayerState.checked) {
      return;
    }
    const differenceMinutes = getTimeDifference();
    const opacity = radarLayerState.opacity / 100;
    let validRadar: Radar;
    if (differenceMinutes <= 0) {
      if (radarLayerState.baseReflectivity.checked) {
        validRadar = getValidRadar(radarLayers.baseReflectivity, new Date(observationTime).getTime());
      } else if (radarLayerState.echoTopHeight.checked) {
        validRadar = getValidRadar(radarLayers.echoTopHeight, new Date(observationTime).getTime());
      }
    } else if (differenceMinutes < forecastMinute1 && radarLayerState.forecastRadar.checked) {
      validRadar = getValidForecastRadar(radarLayers.forecast, new Date(observationTime).getTime());
    }
    if (validRadar) validRadar.layer?.setOpacity(opacity);
  }, [
    radarLayerState.checked,
    radarLayerState.baseReflectivity.checked,
    radarLayerState.echoTopHeight.checked,
    radarLayerState.forecastRadar.checked,
    observationTime,
    radarLayerState.opacity,
  ]);

  const getValidRadar = (radars: Radar[], obsTimeSpan: number): Radar => {
    const returns = radars.reduce((prev, curr) => {
      const prevDiff = prev.valid_timespan - obsTimeSpan;
      const currDiff = curr.valid_timespan - obsTimeSpan;
      if (prevDiff > currDiff && currDiff >= 0) {
        return curr;
      }
      return prev;
    });
    return returns;
  };

  const getValidForecastRadar = (radars: Radar[], obsTimeSpan: number): Radar => {
    const returns = radars.reduce((prev, curr) => {
      const prevDiff = obsTimeSpan - prev.valid_timespan;
      const currDiff = obsTimeSpan - curr.valid_timespan;
      if (prevDiff > currDiff && currDiff >= 0) {
        return curr;
      }
      return prev;
    });
    return returns;
  };

  const getTimeDifference = () => {
    const currentMinutes = getAbsoluteMinutes(Date.now());
    const referenceMinutes = getAbsoluteMinutes(new Date(observationTime).getTime());
    return referenceMinutes - currentMinutes;
  };

  const fetchReflectivityJsons = () => {
    if (!radarLayers.baseReflectivity) radarLayers.baseReflectivity = [];
    if (!radarLayers.echoTopHeight) radarLayers.echoTopHeight = [];
    for (let i = 0; i <= 10; i++) {
      const url1 = `https://mesonet.agron.iastate.edu/data/gis/images/4326/USCOMP/n0q_${i}.json`;
      axios.get(url1).then((data) => {
        if (!data.data) {
          return;
        }
        if (radarLayers.baseReflectivity[i] && radarLayers.baseReflectivity[i].layer) {
          if (map.hasLayer(radarLayers.baseReflectivity[i].layer)) {
            map.removeLayer(radarLayers.baseReflectivity[i].layer);
          }
        }
        const validTimeSpan = new Date(data.data.meta.valid).getTime();
        radarLayers.baseReflectivity[i] = {
          meta: { ...data.data.meta },
          valid_timespan: validTimeSpan,
          layer: WMS.layer(
            baseReflectivityUrl,
            i === 0 ? baseReflectivityLayer : `${baseReflectivityLayer}-m${addLeadingZeroes(i * 5, 2)}m`,
            {
              transparent: true,
              format: 'image/png',
              tiled: false,
              identify: false,
            },
          )
            .setOpacity(0)
            .addTo(map),
        };
      });
      const url2 = `https://mesonet.agron.iastate.edu/data/gis/images/4326/USCOMP/eet_${i}.json`;
      axios.get(url2).then((data) => {
        if (!data.data) {
          return;
        }
        if (radarLayers.echoTopHeight[i] && radarLayers.echoTopHeight[i].layer) {
          if (map.hasLayer(radarLayers.echoTopHeight[i].layer)) {
            map.removeLayer(radarLayers.echoTopHeight[i].layer);
          }
        }
        const validTimeSpan = new Date(data.data.meta.valid).getTime();
        radarLayers.echoTopHeight[i] = {
          meta: { ...data.data.meta },
          valid_timespan: validTimeSpan,
          layer: WMS.layer(
            echoTopHeightsUrl,
            i === 0 ? echoTopHeightsLayer : `${echoTopHeightsLayer}-m${addLeadingZeroes(i * 5, 2)}m`,
            {
              transparent: true,
              format: 'image/png',
              tiled: false,
              identify: false,
            },
          )
            .setOpacity(0)
            .addTo(map),
        };
      });
    }
  };

  const fetchForecastJsons = () => {
    if (!radarLayers.forecast) radarLayers.forecast = [];
    for (let m = 0; m <= forecastMinute; m += 15) {
      const url = `https://mesonet.agron.iastate.edu/data/gis/images/4326/hrrr/refd_${addLeadingZeroes(m, 4)}.json`;
      axios.get(url).then((data) => {
        if (!data.data) {
          return;
        }
        if (radarLayers.forecast[m] && radarLayers.forecast[m].layer) {
          if (map.hasLayer(radarLayers.forecast[m].layer)) {
            map.removeLayer(radarLayers.forecast[m].layer);
          }
        }
        const forecastTime = new Date(data.data.model_forecast_utc).getTime();
        radarLayers.forecast[m] = { meta: data.data, valid_timespan: forecastTime, layer: null };
        if (forecastTime > Date.now()) {
          radarLayers.forecast[m].layer = WMS.layer(
            forecastRadarUrl,
            forecastRadarLayer + addLeadingZeroes(radarLayers.forecast[m].meta.forecast_minute, 4),
            {
              transparent: true,
              format: 'image/png',
              tiled: false,
              identify: false,
            },
          )
            .setOpacity(0)
            .addTo(map);
        }
      });
    }
    for (let m = forecastMinute + 60; m <= forecastMinute1; m += 60) {
      const url = `https://mesonet.agron.iastate.edu/data/gis/images/4326/hrrr/refd_${addLeadingZeroes(m, 4)}.json`;
      axios.get(url).then((data) => {
        if (!data.data) {
          return;
        }
        if (radarLayers.forecast[m] && radarLayers.forecast[m].layer) {
          if (map.hasLayer(radarLayers.forecast[m].layer)) {
            map.removeLayer(radarLayers.forecast[m].layer);
          }
        }
        const forecastTime = new Date(data.data.model_forecast_utc).getTime();
        radarLayers.forecast[m] = { meta: data.data, valid_timespan: forecastTime, layer: null };
        if (forecastTime > Date.now()) {
          radarLayers.forecast[m].layer = WMS.layer(
            forecastRadarUrl,
            forecastRadarLayer + addLeadingZeroes(radarLayers.forecast[m].meta.forecast_minute, 4),
            {
              transparent: true,
              format: 'image/png',
              tiled: false,
              identify: false,
            },
          )
            .setOpacity(0)
            .addTo(map);
        }
      });
    }
  };

  return null;
};

export default RadarLayer;
