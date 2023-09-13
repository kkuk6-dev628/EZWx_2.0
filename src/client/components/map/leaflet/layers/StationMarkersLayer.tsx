/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from 'axios';
import { LatLng } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Pane, useMap } from 'react-leaflet';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import SunCalc from 'suncalc';

import {
  PersonalMinimums,
  initialUserSettingsState,
  selectPersonalMinimums,
  selectSettings,
} from '../../../../store/user/UserSettings';
import {
  StationMarkersLayerItems,
  paneOrders,
  timeSliderInterval,
  wfsUrl4,
  windIconLimit,
} from '../../common/AreoConstants';
import {
  addLeadingZeroes,
  celsiusToFahrenheit,
  getAbsoluteHours,
  getLowestCeiling,
  getMetarCeilingCategory,
  getMetarVisibilityCategory,
  getQueryTime,
  getSkyConditions,
  getWorstSkyCondition,
  knotsToMph,
  loadFeaturesFromCache,
  loadFeaturesFromWeb,
  visibilityMileToMeter,
} from '../../common/AreoFunctions';
import { SimplifiedMarkersLayer } from './SimplifiedMarkersLayer';
import { selectActiveRoute } from '../../../../store/route/routes';
import { selectDataLoadTime } from '../../../../store/layers/DataLoadTimeSlice';
import { selectLayerControlState } from '../../../../store/layers/LayerControl';

const metarsProperties = [
  'geometry',
  'station_id',
  'auto',
  // 'elevation_ft',
  'temp_c',
  'dewpoint_c',
  'wind_dir_degrees',
  'observation_time',
  'wind_speed_kt',
  'wind_gust_kt',
  'crosswind_component_kt',
  'crosswind_runway_id',
  'flight_category',
  'raw_text',
  'visibility_statute_mi',
  'cloud_base_ft_agl_1',
  'sky_cover_1',
  'cloud_base_ft_agl_2',
  'sky_cover_2',
  'cloud_base_ft_agl_3',
  'sky_cover_3',
  'cloud_base_ft_agl_4',
  'sky_cover_4',
  'cloud_base_ft_agl_5',
  'sky_cover_5',
  'cloud_base_ft_agl_6',
  'sky_cover_6',
  'altim_in_hg',
  // 'sea_level_pressure_mb',
  'wx_string',
  'vert_vis_ft',
  // 'dewpointdepression',
  'relativehumiditypercent',
  'densityaltitudefeet',
];

const nbmStationProperties = [
  'faaid',
  'icaoid',
  'temp_c',
  'dewp_c',
  'skycov',
  'w_speed',
  'w_dir',
  'w_gust',
  'vis',
  'ceil',
  'l_cloud',
  'cross_r_id',
  'cross_com',
  'wx_1',
  'wx_2',
  'wx_3',
  'wx_prob_cov_1',
  'wx_prob_cov_2',
  'wx_prob_cov_3',
  'wx_inten_1',
  'wx_inten_2',
  'wx_inten_3',
  'valid_date',
  'geom',
  'pub',
];

const personalMinsColors = ['red', 'yellow', 'green'];

export function getNbmWeatherMarkerIcon(
  wx_1: number,
  w_speed: number,
  w_gust: number,
  skycov: number,
  latlng: { lat: number; lng: number },
  time: number,
): string {
  let isDayTime = true;
  const sunsetSunriseTime = SunCalc.getTimes(new Date(time), latlng.lat, latlng.lng);
  if (Date.parse(sunsetSunriseTime.sunrise) && Date.parse(sunsetSunriseTime.sunset)) {
    isDayTime = time >= sunsetSunriseTime.sunrise.getTime() && time <= sunsetSunriseTime.sunset.getTime();
  }
  let iconType = 'fas fa-question-square';
  if (!wx_1) {
    if (w_speed > 20 && w_gust > 25) {
      iconType = 'fa-solid fa-wind';
    } else {
      if (skycov < 6) {
        iconType = isDayTime ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      } else if (skycov < 31) {
        iconType = isDayTime ? 'fas fa-sun-cloud' : 'fas fa-moon-cloud';
      } else if (skycov < 58) {
        iconType = isDayTime ? 'fa-solid fa-cloud-sun' : 'fa-solid fa-cloud-moon';
      } else if (skycov < 88) {
        iconType = isDayTime ? 'fas fa-clouds-sun' : 'fas fa-clouds-moon';
      } else {
        iconType = 'fa-solid fa-cloud';
      }
    }
  } else {
    // console.log(feature.properties.icaoid, feature.properties.faaid, wx_1);
    switch (wx_1) {
      case 1:
        iconType = 'fa-solid fa-cloud-rain';
        break;
      case 2:
        iconType = 'fa-solid fa-icicles';
        break;
      case 3:
        iconType = 'fas fa-cloud-snow';
        break;
      case 4:
        if (skycov < 88) {
          iconType = isDayTime ? 'fas fa-cloud-bolt-sun' : 'fas fa-cloud-bolt-moon';
        } else {
          iconType = 'fa-solid fa-cloud-bolt';
        }
        break;
      case 5:
        if (skycov < 88) {
          iconType = isDayTime ? 'fa-solid fa-cloud-sun-rain' : 'fas fa-cloud-moon-rain';
        } else {
          iconType = 'fa-solid fa-cloud-showers-heavy';
        }
        break;
      case 6:
        iconType = 'fas fa-cloud-sleet';
        break;
      case 7:
        iconType = 'fas fa-cloud-snow';
        break;
      case 8:
        iconType = 'fas fa-fog';
        break;
    }
  }
  return iconType;
}

export const getCeilingFromMetars = (feature: GeoJSON.Feature) => {
  if (feature.properties.vert_vis_ft) {
    return feature.properties.vert_vis_ft;
  }
  const skyConditions = getSkyConditions(feature);
  const skyCondition = getLowestCeiling(skyConditions);
  if (skyCondition == null) return;
  const ceiling = skyCondition.cloudBase;
  return ceiling;
};

export const getFlightCategoryIconUrl = (feature: GeoJSON.Feature): string => {
  const skyConditions = getSkyConditions(feature);
  let sky: string;
  if (feature.properties.vert_vis_ft) {
    sky = 'OVX';
  } else if (skyConditions.length > 0) {
    sky = getWorstSkyCondition(skyConditions);
  }
  let flightCategory = feature.properties.flight_category;
  if (!flightCategory) {
    flightCategory = 'Black';
  }
  let iconUrl = '/icons/metar/MISSING.png';
  if (sky === 'CLR' && feature.properties.auto == null) {
    sky = 'SKC';
  }
  if (flightCategory && sky) {
    iconUrl = `/icons/metar/${flightCategory}-${sky}.png`;
  }
  return iconUrl;
};

export const flightCategoryToColor = (flightCategory: string): string => {
  return initialUserSettingsState.personalMinimumsState[flightCategory]
    ? initialUserSettingsState.personalMinimumsState[flightCategory].color
    : 'lightslategrey';
};

export const getNbmFlightCategory = (feature: GeoJSON.Feature, personalMinimums: PersonalMinimums): string => {
  const visibility = feature.properties.vis;
  const [catVis] = getMetarVisibilityCategory(visibility, personalMinimums);
  const ceiling = feature.properties.ceil;
  const [catCeiling] = getMetarCeilingCategory(ceiling, personalMinimums);
  const categories = Object.keys(personalMinimums);
  const indexVis = categories.indexOf(catVis);
  const indexCeiling = categories.indexOf(catCeiling);
  let indexFinalCat: number;
  if (indexCeiling > -1 && indexVis > -1) {
    indexFinalCat = Math.min(indexCeiling, indexVis);
  } else if (indexCeiling > -1) {
    indexFinalCat = -1;
  } else if (indexVis > -1) {
    indexFinalCat = indexVis;
  } else {
    indexFinalCat = -1;
  }
  const finalCat = indexFinalCat > -1 ? categories[indexFinalCat] : 'Black';
  return finalCat;
};

export const getNbmFlightCategoryIconUrl = (feature: GeoJSON.Feature, personalMinimums: PersonalMinimums): string => {
  const finalCat = getNbmFlightCategory(feature, personalMinimums);
  const ceiling = feature.properties.ceil;
  let skyCondition: string;
  const skyCover = feature.properties.skycov;
  if (ceiling) {
    skyCondition = skyCover >= 88 ? 'OVC' : 'BKN';
  } else {
    if (skyCover < 6) {
      skyCondition = 'SKC';
    } else if (skyCover < 31) {
      skyCondition = 'FEW';
    } else {
      skyCondition = 'SCT';
    }
  }
  const iconUrl = `/icons/metar/${finalCat}-${skyCondition}.png`;
  return iconUrl;
};

export const isSameFeatures = (a: GeoJSON.Feature[], b: GeoJSON.Feature[], compareProperties: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  if (a.length === 0) {
    return true;
  }
  const undefinedProperties = compareProperties.filter(
    (compareProperty) => a[0].properties[compareProperty] === undefined,
  );
  if (undefinedProperties.length > 0) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    const differentProperties = compareProperties.filter(
      (compareProperty) => a[i].properties[compareProperty] !== b[i].properties[compareProperty],
    );
    if (differentProperties.length > 0) {
      return false;
    }
  }
  return true;
};

const nbmStations = {};

export const StationMarkersLayer = () => {
  const [displayedGeojson, setDisplayedGeojson] = useState<GeoJSON.FeatureCollection>();
  const stationTimeRef = useRef<any[]>([]);
  const [clusterRadius, setClusterRadius] = useState(20);
  const layerState = useSelector(selectLayerControlState);
  const personalMinimums = useSelector(selectPersonalMinimums);
  const [indexedData, setIndexedData] = useState({});
  const userSettings = useSelector(selectSettings);
  const observationTime = userSettings.observation_time;
  const [isPast, setIsPast] = useState(true);
  const activeRoute = useSelector(selectActiveRoute);
  const dataLoadTime = useSelector(selectDataLoadTime);
  const [fetchedNbmStationData, setFetchedNbmStationData] = useState('');

  const geojsonLayerRef = useRef();

  const map = useMap();

  useEffect(() => {
    loadMetars();
    loadNbmStationMarkers();
  }, [dataLoadTime]);

  useEffect(() => {
    if (!indexedData || !isPast) return;
    if (Object.keys(indexedData).length > 0) {
      setDisplayedGeojson((prevState) => {
        if (!prevState || prevState.features.length === 0) {
          const filteredFeatures = metarsFilter(new Date(observationTime));
          return {
            type: 'FeatureCollection',
            features: filteredFeatures,
          };
        }
        return prevState;
      });
    }
  }, [indexedData]);

  useEffect(() => {
    if (isPast) return;
    setDisplayedGeojson((prevState) => {
      if (!prevState || prevState.features.length === 0) {
        const nbmStationData = getNbmStationDataForObservationTime();
        if (nbmStationData.length > 0) {
          return {
            type: 'FeatureCollection',
            features: nbmStationData,
          };
        }
      }
      return prevState;
    });
  }, [fetchedNbmStationData]);

  useEffect(() => {
    if (layerState && layerState.stationMarkersState.checked === false) return;
    const obsHour = getAbsoluteHours(observationTime);
    const currentHour = getAbsoluteHours(Date.now());
    if (obsHour > currentHour) {
      setIsPast(false);
      updateNbmStationMarkers();
    } else {
      setIsPast(true);
      if (Object.keys(indexedData).length > 0) {
        const filteredFeatures = metarsFilter(new Date(observationTime));
        setDisplayedData(filteredFeatures);
      }
    }
  }, [observationTime]);

  useEffect(() => {
    if (isPast) {
      layerState.stationMarkersState.markerType === StationMarkersLayerItems.surfaceWindBarbs.value
        ? setClusterRadius(20)
        : setClusterRadius(30);
      if (Object.keys(indexedData).length > 0) {
        const filteredFeatures = metarsFilter(new Date(observationTime));
        setDisplayedData(filteredFeatures);
      }
      // setRenderedTime(Date.now());
    } else {
      updateNbmStationMarkers();
    }
  }, [
    layerState.stationMarkersState.markerType,
    layerState.stationMarkersState.flightCategory.all.checked,
    layerState.stationMarkersState.flightCategory.vfr.checked,
    layerState.stationMarkersState.flightCategory.mvfr.checked,
    layerState.stationMarkersState.flightCategory.ifr.checked,
    layerState.stationMarkersState.flightCategory.lifr.checked,
    layerState.stationMarkersState.usePersonalMinimums.evaluationType,
    layerState.stationMarkersState.usePersonalMinimums.routePointType,
  ]);

  const updateNbmStationMarkers = () => {
    const nbmStationData = getNbmStationDataForObservationTime();
    setDisplayedData(nbmStationData);
  };

  const getNbmStationDataForObservationTime = (): GeoJSON.Feature[] => {
    const stationTime = stationTimeRef.current;
    if (stationTime.length > 0) {
      const obsHour = getAbsoluteHours(observationTime);
      const lastTime = new Date(stationTime[stationTime.length - 1].valid_date);
      lastTime.setHours(lastTime.getHours() + 3);
      if (getAbsoluteHours(lastTime) < obsHour) {
        return [];
      }
      const validStation = stationTime.reduce((acc, cur) => {
        const prevDiff = Math.abs(getAbsoluteHours(acc.valid_date) - obsHour);
        const currDiff = Math.abs(getAbsoluteHours(cur.valid_date) - obsHour);
        if (prevDiff - currDiff > 0 && getAbsoluteHours(cur.valid_date) <= obsHour) {
          return cur;
        }
        return acc;
      });
      if (nbmStations[validStation.station_table_name]) {
        const filtered = stationForecastFilter(nbmStations[validStation.station_table_name]);
        return filtered;
      }
    }
    return [];
  };

  const setDisplayedData = (features: GeoJSON.Feature[]) => {
    setDisplayedGeojson({
      type: 'FeatureCollection',
      features: features,
    });
  };

  const loadMetars = () => {
    const currentTime = new Date();
    const lastTime = new Date();
    lastTime.setHours(lastTime.getHours() - 12);
    // loadFeaturesFromCache('metars', setMetars);
    const queuedLoadWeb = (time: Date) => {
      if (time < lastTime) {
        return;
      }
      const serverFilter = `observation_time DURING ${getQueryTime(time)}`;
      loadFeaturesFromWeb(
        wfsUrl4,
        'EZWxBrief:metar',
        metarsProperties,
        'metars',
        (features) => {
          buildIndexedData([...features]);
          const newTime = new Date(time.getTime());
          newTime.setMinutes(newTime.getMinutes() - 75);
          queuedLoadWeb(newTime);
        },
        undefined,
        serverFilter,
      );
    };
    queuedLoadWeb(currentTime);
  };

  const loadNbmStationMarkers = () => {
    axios
      .get('/api/station-time/findAll')
      .then((result) => {
        if (!Array.isArray(result.data)) {
          console.log(result.data);
          return;
        }
        stationTimeRef.current = result.data;

        const stationTimes = [...result.data].filter((stationTime) => {
          const stationValidHour = getAbsoluteHours(stationTime.valid_date);
          return stationValidHour >= getAbsoluteHours(Date.now());
        });
        const stationTimesWeb = [...stationTimes];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // const queuedLoadCache = () => {
        //   if (stationTimes.length === 0) {
        //     return;
        //   }
        //   const [stationTime] = stationTimes.splice(0, 1);
        //   loadFeaturesFromCache(stationTime.station_table_name, (features) => {
        //     addNbmStation(stationTime.station_table_name, features);
        //     queuedLoadCache();
        //   });
        // };
        // limit number of requests to 3 at the same time.
        // queuedLoadCache();
        // queuedLoadCache();
        // queuedLoadCache();

        const queuedLoadWeb = () => {
          if (stationTimesWeb.length === 0) {
            return;
          }
          const [stationTime] = stationTimesWeb.splice(0, 1);
          loadFeaturesFromWeb(
            wfsUrl4,
            `EZWxBrief:${stationTime.station_table_name}`,
            nbmStationProperties,
            stationTime.station_table_name,
            (features) => {
              addNbmStation(stationTime.station_table_name, features);
              queuedLoadWeb();
              setFetchedNbmStationData(stationTime.station_table_name);
            },
            (a, b) =>
              b.properties.pub - a.properties.pub ||
              (a.properties.icaoid ? -1 : 1) ||
              (a.properties.faaid as string).localeCompare(b.properties.faaid),
            undefined,
          );
        };
        queuedLoadWeb();
        queuedLoadWeb();
        queuedLoadWeb();
      })
      .catch((reason) => {
        console.log(reason);
      });
  };

  const addNbmStation = (datasetName: string, features: GeoJSON.Feature[]) => {
    // const nbmStationsClone = { ...nbmStations };
    nbmStations[datasetName] = features;
    // setNbmStations(nbmStationsClone);
  };

  const unSimplifyFilter = (feature) => {
    if (
      userSettings.default_home_airport === feature.properties.station_id ||
      userSettings.default_home_airport === feature.properties.icaoid
    ) {
      return true;
    }
    if (!activeRoute) return false;
    const routePoints = [
      activeRoute.departure,
      activeRoute.destination,
      ...activeRoute.routeOfFlight.map((item) => item.routePoint),
    ];
    const index = routePoints.findIndex((routePoint) => {
      if (feature.properties.station_id) {
        return feature.properties.station_id.indexOf(routePoint.key) > -1;
      }
      return feature.properties.icaoid == routePoint.key || feature.properties.faaid == routePoint.key;
    });
    return index > -1;
  };

  const buildIndexedData = (features: GeoJSON.Feature[]): any => {
    const data = {};
    features.map((feature) => {
      const obsTime = new Date(feature.properties.observation_time).getTime();
      const index = Math.floor(obsTime / timeSliderInterval);
      if (index in data === false) {
        data[index] = [];
      }
      data[index].push(feature);
    });
    setIndexedData((prevState) => ({ ...prevState, ...data } as any));
    return data;
  };

  const metarsFilter = (observationTime: Date): GeoJSON.Feature[] => {
    const obsHour = getAbsoluteHours(observationTime);
    const currentHour = getAbsoluteHours(Date.now());
    if (obsHour - currentHour > 0) {
      return [];
    }
    const filteredFeatures = {};
    const obsTime = new Date(observationTime).getTime();
    const startIndex = Math.floor((obsTime - 75 * 60 * 1000) / timeSliderInterval);
    const endIndex = Math.floor(obsTime / timeSliderInterval);
    for (let index = startIndex; index < endIndex; index++) {
      const iData = indexedData[index] as GeoJSON.Feature[];
      if (iData) {
        iData.map((feature) => {
          if (
            layerState.stationMarkersState.markerType === StationMarkersLayerItems.flightCategory.value &&
            layerState.stationMarkersState.flightCategory.all.checked === false
          ) {
            if (
              !layerState.stationMarkersState.flightCategory.vfr.checked &&
              feature.properties.flight_category === 'VFR'
            ) {
              return;
            }
            if (
              !layerState.stationMarkersState.flightCategory.mvfr.checked &&
              feature.properties.flight_category === 'MVFR'
            ) {
              return;
            }
            if (
              !layerState.stationMarkersState.flightCategory.ifr.checked &&
              feature.properties.flight_category === 'IFR'
            ) {
              return;
            }
            if (
              !layerState.stationMarkersState.flightCategory.lifr.checked &&
              feature.properties.flight_category === 'LIFR'
            ) {
              return;
            }
          }
          if (filteredFeatures[feature.properties.station_id]) {
            const prevFeature = filteredFeatures[feature.properties.station_id];
            if (new Date(prevFeature.properties.observation_time) < new Date(feature.properties.observation_time)) {
              filteredFeatures[feature.properties.station_id] = feature;
            }
          } else {
            filteredFeatures[feature.properties.station_id] = feature;
          }
        });
      }
    }
    const ordered = Object.keys(filteredFeatures)
      .sort()
      .reduce((obj, key) => {
        obj[key] = filteredFeatures[key];
        return obj;
      }, {});
    const result = Object.values(ordered);
    return result as any;
  };

  const stationForecastFilter = (features: GeoJSON.Feature[]): GeoJSON.Feature[] => {
    if (
      layerState.stationMarkersState.markerType !== StationMarkersLayerItems.flightCategory.value ||
      layerState.stationMarkersState.flightCategory.all.checked === true
    ) {
      return features;
    }
    const filtered = features.filter((feature) => {
      const flightCategory = getNbmFlightCategory(feature, personalMinimums);
      if (layerState.stationMarkersState.flightCategory.vfr.checked && flightCategory === 'VFR') {
        return true;
      }
      if (layerState.stationMarkersState.flightCategory.mvfr.checked && flightCategory === 'MVFR') {
        return true;
      }
      if (layerState.stationMarkersState.flightCategory.ifr.checked && flightCategory === 'IFR') {
        return true;
      }
      if (layerState.stationMarkersState.flightCategory.lifr.checked && flightCategory === 'LIFR') {
        return true;
      }
      if (flightCategory === 'BLACK') {
        return true;
      }
      return false;
    });
    return filtered;
  };

  const pointToLayer = (feature: GeoJSON.Feature, latlng: LatLng): L.Layer => {
    let marker = null;
    if (isPast) {
      switch (layerState.stationMarkersState.markerType) {
        case StationMarkersLayerItems.usePersonalMinimum.value:
          marker = getPersonalMinsMarker(feature, latlng);
          break;
        case StationMarkersLayerItems.flightCategory.value:
          marker = getFlightCatMarker(feature, latlng);
          break;
        case StationMarkersLayerItems.ceilingHeight.value:
          marker = getCeilingHeightMarker(feature, latlng);
          break;
        case StationMarkersLayerItems.surfaceVisibility.value:
          marker = getSurfaceVisibilityMarker(feature, latlng, feature.properties.visibility_statute_mi);
          break;
        case StationMarkersLayerItems.surfaceWindSpeed.value:
          marker = getSurfaceWindSpeedMarker(feature, latlng, feature.properties.wind_speed_kt);
          break;
        case StationMarkersLayerItems.surfaceWindBarbs.value:
          marker = getSurfaceWindBarbsMarker(
            feature,
            latlng,
            feature.properties.wind_speed_kt,
            feature.properties.wind_dir_degrees,
          );
          break;
        case StationMarkersLayerItems.surfaceWindGust.value:
          marker = getSurfaceWindGustMarker(feature, latlng, feature.properties.wind_gust_kt);
          break;
        case StationMarkersLayerItems.surfaceTemperature.value:
          marker = getSurfaceTemperatureMarker(feature, latlng, feature.properties.temp_c);
          break;
        case StationMarkersLayerItems.surfaceDewpoint.value:
          marker = getSurfaceDewpointMarker(feature, latlng, feature.properties.dewpoint_c);
          break;
        case StationMarkersLayerItems.dewpointDepression.value:
          marker = getDewpointDepressionMarker(
            feature,
            latlng,
            feature.properties.temp_c,
            feature.properties.dewpoint_c,
          );
          break;
        case StationMarkersLayerItems.weather.value:
          marker = getWeatherMarker(feature, latlng);
          break;
      }
    } else {
      switch (layerState.stationMarkersState.markerType) {
        case StationMarkersLayerItems.usePersonalMinimum.value:
          marker = getPersonalMinsMarker(feature, latlng);
          break;
        case StationMarkersLayerItems.flightCategory.value:
          marker = getFlightCatMarker(feature, latlng);
          break;
        case StationMarkersLayerItems.ceilingHeight.value:
          marker = getNbmCeilingHeightMarker(feature, latlng, feature.properties.ceil, feature.properties.skycov);
          break;
        case StationMarkersLayerItems.surfaceVisibility.value:
          marker = getSurfaceVisibilityMarker(feature, latlng, feature.properties.vis);
          break;
        case StationMarkersLayerItems.surfaceWindSpeed.value:
          marker = getSurfaceWindSpeedMarker(feature, latlng, feature.properties.w_speed);
          break;
        case StationMarkersLayerItems.surfaceWindBarbs.value:
          marker = getSurfaceWindBarbsMarker(feature, latlng, feature.properties.w_speed, feature.properties.w_dir);
          break;
        case StationMarkersLayerItems.surfaceWindGust.value:
          marker = getSurfaceWindGustMarker(feature, latlng, feature.properties.w_gust);
          break;
        case StationMarkersLayerItems.surfaceTemperature.value:
          marker = getSurfaceTemperatureMarker(feature, latlng, feature.properties.temp_c);
          break;
        case StationMarkersLayerItems.surfaceDewpoint.value:
          marker = getSurfaceDewpointMarker(feature, latlng, feature.properties.dewp_c);
          break;
        case StationMarkersLayerItems.dewpointDepression.value:
          marker = getDewpointDepressionMarker(feature, latlng, feature.properties.temp_c, feature.properties.dewp_c);
          break;
        case StationMarkersLayerItems.weather.value:
          marker = getNbmWeatherMarker(feature, latlng);
          break;
      }
    }
    marker?.on('click', (e) => {
      map.fire('click', e);
    });
    return marker;
  };

  const getPersonalMinsCategoryForCeiling = (ceiling: number): number => {
    if (!ceiling) return 3;
    let ceilingCategory = userSettings.ceiling_at_departure;
    switch (layerState.stationMarkersState.usePersonalMinimums.routePointType) {
      case 'departure':
        ceilingCategory = userSettings.ceiling_at_departure;
        break;
      case 'en_route':
        ceilingCategory = userSettings.ceiling_along_route;
        break;
      case 'destination':
        ceilingCategory = userSettings.ceiling_at_destination;
        break;
    }
    if (ceiling <= ceilingCategory[0]) return 0;
    if (ceiling >= ceilingCategory[1]) return 2;
    return 1;
  };

  const getPersonalMinsCategoryForVisibility = (visibility: number): number => {
    if (!visibility) return;
    let visibilityCategory = userSettings.surface_visibility_at_departure;
    switch (layerState.stationMarkersState.usePersonalMinimums.routePointType) {
      case 'departure':
        visibilityCategory = userSettings.surface_visibility_at_departure;
        break;
      case 'en_route':
        visibilityCategory = userSettings.surface_visibility_along_route;
        break;
      case 'destination':
        visibilityCategory = userSettings.surface_visibility_at_destination;
        break;
    }
    if (visibility <= visibilityCategory[0]) return 0;
    if (visibility >= visibilityCategory[1]) return 2;
    return 1;
  };

  const getPersonalMinsCategoryForCrosswinds = (crosswinds: number): number => {
    let crosswindsCategory = userSettings.crosswinds_at_departure_airport;
    switch (layerState.stationMarkersState.usePersonalMinimums.routePointType) {
      case 'departure':
        crosswindsCategory = userSettings.crosswinds_at_departure_airport;
        break;
      case 'destination':
        crosswindsCategory = userSettings.crosswinds_at_destination_airport;
        break;
    }
    if (crosswinds <= crosswindsCategory[0]) return 2;
    if (crosswinds >= crosswindsCategory[1]) return 0;
    return 1;
  };

  const getPersonalMinsMarker = (feature: GeoJSON.Feature, latlng: LatLng): L.Marker => {
    const ceiling = isPast ? getCeilingFromMetars(feature) : feature.properties.ceil;
    const visibility = isPast ? feature.properties.visibility_statute_mi : feature.properties.vis;
    const ceilingCategory = getPersonalMinsCategoryForCeiling(ceiling);
    const visibilityCategory = getPersonalMinsCategoryForVisibility(visibility);
    let color = 'green';
    switch (layerState.stationMarkersState.usePersonalMinimums.evaluationType) {
      case 'flight_category':
        color = personalMinsColors[Math.min(ceilingCategory, visibilityCategory)];
        break;
      case 'ceiling':
        if (!ceiling) {
          return;
          color = 'black';
        } else {
          color = personalMinsColors[ceilingCategory];
        }
        break;
      case 'visibility':
        if (!visibility) {
          return;
          color = 'black';
        } else {
          color = personalMinsColors[visibilityCategory];
        }
        break;
      case 'crosswind':
        const crosswinds = isPast ? feature.properties.crosswind_component_kt : feature.properties.cross_com;
        // const windDir = isPast ? feature.properties.wind_dir_degrees : feature.properties.w_dir;
        // const windSpeed = isPast ? feature.properties.wind_speed_kt : feature.properties.w_speed;
        if (crosswinds != null) {
          const crosswindsCategory = getPersonalMinsCategoryForCrosswinds(crosswinds);
          color = personalMinsColors[crosswindsCategory];
        } else {
          return;
        }
        break;
    }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-personal-mins ' + color,
        html: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        //popupAnchor: [0, -14]
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getFlightCatMarker = (feature: GeoJSON.Feature, latlng: LatLng): L.Marker => {
    let iconUrl: string;
    if (isPast) {
      iconUrl = getFlightCategoryIconUrl(feature);
    } else {
      iconUrl = getNbmFlightCategoryIconUrl(feature, personalMinimums);
    }

    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-icon',
        html: ReactDOMServer.renderToString(
          <>
            <Image src={iconUrl} alt={''} width={20} height={20} loading="eager" />
          </>,
        ),
        iconSize: [20, 20],
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getCeilingHeightMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
    const skyConditions = getSkyConditions(feature);
    const ceiling = getCeilingFromMetars(feature);
    if (!ceiling) return;
    const ceilingAmount = addLeadingZeroes(ceiling / 100, 3);
    const worstSkyCondition = getWorstSkyCondition(skyConditions);
    let iconUrl = '';
    const [cat] = getMetarCeilingCategory(ceiling, personalMinimums);
    iconUrl = `/icons/metar/${cat}-${worstSkyCondition}.png`;
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-ceiling-icon',
        html: ReactDOMServer.renderToString(
          <>
            <div style={{ display: 'inline', verticalAlign: -7, marginLeft: -4 }}>
              <Image src={iconUrl} alt={''} width={20} height={20} loading="eager" />
            </div>
            <div
              style={{
                display: 'inline',
                fontWeight: 'bold',
                color: 'white',
                verticalAlign: -2,
              }}
            >
              {ceilingAmount}
            </div>
          </>,
        ),
        iconSize: [50, 20],
        iconAnchor: [25, 10],
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getNbmCeilingHeightMarker = (
    feature: GeoJSON.Feature,
    latlng: LatLng,
    ceilingHeight: number,
    skyCover: number,
  ) => {
    if (!ceilingHeight) return;
    const ceilingAmount = addLeadingZeroes(ceilingHeight / 100, 3);
    const worstSkyCondition = skyCover >= 88 ? 'OVC' : 'BKN';
    let iconUrl = '';
    const [cat] = getMetarCeilingCategory(ceilingHeight, personalMinimums);
    iconUrl = `/icons/metar/${cat}-${worstSkyCondition}.png`;
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-ceiling-icon',
        html: ReactDOMServer.renderToString(
          <>
            <div style={{ display: 'inline', verticalAlign: -7, marginLeft: -4 }}>
              <Image src={iconUrl} alt={''} width={20} height={20} loading="eager" />
            </div>
            <div
              style={{
                display: 'inline',
                fontWeight: 'bold',
                color: 'white',
                verticalAlign: -2,
              }}
            >
              {ceilingAmount}
            </div>
          </>,
        ),
        iconSize: [50, 20],
        iconAnchor: [25, 10],
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getSurfaceVisibilityMarker = (feature: GeoJSON.Feature, latlng: LatLng, visibility: any) => {
    if (!visibility) return;
    const [category] = getMetarVisibilityCategory(visibility, personalMinimums);
    let iconUrl = '/icons/metar/MISSING.png';
    if (userSettings.default_visibility_unit) {
      if (visibility === 0.25 && feature.properties.raw_text && feature.properties.raw_text.indexOf('M1/4SM') > -1) {
        visibility = '<400';
      } else {
        visibility = visibilityMileToMeter(visibility);
      }
    } else {
      if (visibility === 0.25 && feature.properties.raw_text && feature.properties.raw_text.indexOf('M1/4SM') > -1) {
        visibility = '<0.25';
      }
      if (visibility > 4) {
        visibility = Math.ceil(visibility);
      }
    }
    if (category) {
      iconUrl = `/icons/metar/${category}-OVC.png`;
    } else {
      iconUrl = `/icons/metar/Black-OVC.png`;
    }

    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-visibility-icon',
        html: ReactDOMServer.renderToString(
          <>
            <div style={{ display: 'inline', verticalAlign: -7, marginLeft: -4 }}>
              <Image src={iconUrl} alt={''} width={20} height={20} loading="eager" />
            </div>
            <div
              style={{
                display: 'inline',
                fontWeight: 'bold',
                color: 'white',
                verticalAlign: -2,
              }}
            >
              {visibility}
            </div>
          </>,
        ),
        iconSize: [50, 20],
        iconAnchor: [25, 10],
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getSurfaceWindSpeedMarker = (feature: GeoJSON.Feature, latlng: LatLng, windSpeed: number) => {
    if (!windSpeed) return;
    let colorCode = 'black';
    if (windSpeed > 30) {
      colorCode = 'c10000';
    } else if (windSpeed > 25 && windSpeed <= 30) {
      colorCode = 'cc0000';
    } else if (windSpeed > 20 && windSpeed <= 25) {
      colorCode = 'fe0000';
    } else if (windSpeed > 15 && windSpeed <= 20) {
      colorCode = 'f79749';
    } else if (windSpeed > 10 && windSpeed <= 15) {
      colorCode = 'ffbf00';
    } else if (windSpeed > 5 && windSpeed <= 10) {
      colorCode = 'lightGreen';
    } else if (windSpeed <= 5) {
      colorCode = 'darkerGreen';
    }
    if (userSettings.default_wind_speed_unit) {
      windSpeed = knotsToMph(windSpeed);
    }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-wind-icon ' + colorCode,
        html: `${windSpeed}`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        //popupAnchor: [0, -13]
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getSurfaceWindGustMarker = (feature: GeoJSON.Feature, latlng: LatLng, windGust: number) => {
    if (!windGust) return;
    let colorCode = 'black';
    if (windGust > 45) {
      colorCode = 'c10000';
    } else if (windGust > 40 && windGust <= 45) {
      colorCode = 'cc0000';
    } else if (windGust > 35 && windGust <= 40) {
      colorCode = 'fe0000';
    } else if (windGust > 30 && windGust <= 35) {
      colorCode = 'f79749';
    } else if (windGust > 20 && windGust <= 30) {
      colorCode = 'ffbf00';
    } else if (windGust > 10 && windGust <= 20) {
      colorCode = 'lightGreen';
    } else if (windGust <= 10) {
      colorCode = 'darkerGreen';
    }
    if (userSettings.default_wind_speed_unit) {
      windGust = knotsToMph(windGust);
    }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-wind-icon ' + colorCode,
        html: windGust.toString(),
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        //popupAnchor: [0, -13]
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getSurfaceTemperatureMarker = (feature: GeoJSON.Feature, latlng: LatLng, tempInCelcius: number) => {
    if (!tempInCelcius) return;
    let colorCode = 'black';
    if (tempInCelcius > 38) {
      colorCode = 'c10000';
    } else if (tempInCelcius > 32 && tempInCelcius <= 38) {
      colorCode = 'cc0000';
    } else if (tempInCelcius > 27 && tempInCelcius <= 32) {
      colorCode = 'fe0000';
    } else if (tempInCelcius > 21 && tempInCelcius <= 27) {
      colorCode = 'f79749';
    } else if (tempInCelcius > 16 && tempInCelcius <= 21) {
      colorCode = 'ffbf00';
    } else if (tempInCelcius > 10 && tempInCelcius <= 16) {
      colorCode = 'lightGreen';
    } else if (tempInCelcius > 4 && tempInCelcius <= 10) {
      colorCode = 'darkerGreen';
    } else if (tempInCelcius > -1 && tempInCelcius <= 4) {
      colorCode = 'lightBlue';
    } else if (tempInCelcius > -7 && tempInCelcius <= -1) {
      colorCode = 'darkerBlue';
    } else if (tempInCelcius > -12 && tempInCelcius <= -7) {
      colorCode = 'purple';
    } else if (tempInCelcius >= -18 && tempInCelcius <= -12) {
      colorCode = 'magenta';
    } else if (tempInCelcius < -18) {
      colorCode = 'cc0199';
    }
    if (userSettings.default_temperature_unit) {
      tempInCelcius = celsiusToFahrenheit(tempInCelcius);
    }
    tempInCelcius = Math.round(tempInCelcius);
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-temperature-icon ' + colorCode,
        html: tempInCelcius.toString(),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        //popupAnchor: [0, -14]
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getSurfaceDewpointMarker = (feature: GeoJSON.Feature, latlng: LatLng, tempInCelcius: number) => {
    if (!tempInCelcius) return;
    let colorCode = 'black';
    if (tempInCelcius > 38) {
      colorCode = 'c10000';
    } else if (tempInCelcius > 32 && tempInCelcius <= 38) {
      colorCode = 'cc0000';
    } else if (tempInCelcius > 27 && tempInCelcius <= 32) {
      colorCode = 'fe0000';
    } else if (tempInCelcius > 21 && tempInCelcius <= 27) {
      colorCode = 'f79749';
    } else if (tempInCelcius > 16 && tempInCelcius <= 21) {
      colorCode = 'ffbf00';
    } else if (tempInCelcius > 10 && tempInCelcius <= 16) {
      colorCode = 'lightGreen';
    } else if (tempInCelcius > 4 && tempInCelcius <= 10) {
      colorCode = 'darkerGreen';
    } else if (tempInCelcius > -1 && tempInCelcius <= 4) {
      colorCode = 'lightBlue';
    } else if (tempInCelcius > -7 && tempInCelcius <= -1) {
      colorCode = 'darkerBlue';
    } else if (tempInCelcius > -12 && tempInCelcius <= -7) {
      colorCode = 'purple';
    } else if (tempInCelcius >= -18 && tempInCelcius <= -12) {
      colorCode = 'magenta';
    } else if (tempInCelcius < -18) {
      colorCode = 'cc0199';
    }
    if (userSettings.default_temperature_unit) {
      tempInCelcius = celsiusToFahrenheit(tempInCelcius);
    }
    tempInCelcius = Math.round(tempInCelcius);
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-temperature-icon ' + colorCode,
        html: tempInCelcius.toString(),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        //popupAnchor: [0, -14]
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getDewpointDepressionMarker = (
    feature: GeoJSON.Feature,
    latlng: LatLng,
    temperature: number,
    dewpointTemperature: number,
  ) => {
    if (!dewpointTemperature || !temperature) {
      return;
    }
    let dewpointDepression = temperature - dewpointTemperature;
    let dewpointDepressionInCelcius = Math.round(dewpointDepression);
    if (dewpointDepressionInCelcius < 0) {
      dewpointDepressionInCelcius = 0;
    }
    dewpointDepression = Math.round(dewpointDepression);
    if (dewpointDepression < 0) {
      dewpointDepression = 0;
    }
    let colorCode = 'black';
    if (dewpointDepressionInCelcius > 7) {
      colorCode = 'darkerGreen';
    } else if (dewpointDepressionInCelcius > 4 && dewpointDepressionInCelcius <= 7) {
      colorCode = 'lightBlue';
    } else if (dewpointDepressionInCelcius > 2 && dewpointDepressionInCelcius <= 4) {
      colorCode = 'darkerBlue';
    } else if (dewpointDepressionInCelcius > 1 && dewpointDepressionInCelcius <= 2) {
      colorCode = 'purple';
    } else if (dewpointDepressionInCelcius <= 1) {
      colorCode = 'magenta';
    }

    if (userSettings.default_temperature_unit) {
      dewpointDepressionInCelcius = celsiusToFahrenheit(temperature) - celsiusToFahrenheit(dewpointTemperature);
    }

    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-temperature-icon ' + colorCode,
        html: dewpointDepressionInCelcius.toString(),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        //popupAnchor: [0, -13]
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getSurfaceWindBarbsMarker = (
    feature: GeoJSON.Feature,
    latlng: LatLng,
    windSpeed: number,
    windDirection: number,
  ) => {
    let iconUrl = '/icons/barbs/0-kt.png';
    let transformAngle = 'rotate(0deg)';
    if (isNaN(windSpeed) || windSpeed === null) {
      return;
    }
    if (isNaN(windDirection) || windDirection === null) {
      windDirection = 0;
    }
    let anchor = [16, 27];
    if (windSpeed <= 2) {
      anchor = [15, 15];
    }
    if (windSpeed >= 3 && windSpeed <= 7) {
      iconUrl = '/icons/barbs/5-kt.png';
    } else if (windSpeed >= 8 && windSpeed <= 12) {
      iconUrl = '/icons/barbs/10-kt.png';
    } else if (windSpeed >= 13 && windSpeed <= 17) {
      iconUrl = '/icons/barbs/15-kt.png';
    } else if (windSpeed >= 18 && windSpeed <= 22) {
      iconUrl = '/icons/barbs/20-kt.png';
    } else if (windSpeed >= 23 && windSpeed <= 27) {
      iconUrl = '/icons/barbs/25-kt.png';
    } else if (windSpeed >= 28 && windSpeed <= 32) {
      iconUrl = '/icons/barbs/30-kt.png';
    } else if (windSpeed >= 33 && windSpeed <= 37) {
      iconUrl = '/icons/barbs/35-kt.png';
    } else if (windSpeed >= 38 && windSpeed <= 42) {
      iconUrl = '/icons/barbs/40-kt.png';
    } else if (windSpeed >= 43 && windSpeed <= 47) {
      iconUrl = '/icons/barbs/45-kt.png';
    } else if (windSpeed >= 48 && windSpeed <= 52) {
      iconUrl = '/icons/barbs/50-kt.png';
    } else if (windSpeed >= 53 && windSpeed <= 57) {
      iconUrl = '/icons/barbs/55-kt.png';
    } else if (windSpeed >= 58 && windSpeed <= 62) {
      iconUrl = '/icons/barbs/60-kt.png';
    } else if (windSpeed >= 63 && windSpeed <= 67) {
      iconUrl = '/icons/barbs/65-kt.png';
    } else if (windSpeed >= 68 && windSpeed <= 72) {
      iconUrl = '/icons/barbs/70-kt.png';
    } else if (windSpeed >= 73 && windSpeed <= 77) {
      iconUrl = '/icons/barbs/75-kt.png';
    } else if (windSpeed >= 78 && windSpeed <= 82) {
      iconUrl = '/icons/barbs/80-kt.png';
    } else if (windSpeed >= 83 && windSpeed <= 87) {
      iconUrl = '/icons/barbs/85-kt.png';
    } else if (windSpeed >= 88 && windSpeed <= 92) {
      iconUrl = '/icons/barbs/90-kt.png';
    } else if (windSpeed >= 93 && windSpeed <= 97) {
      iconUrl = '/icons/barbs/95-kt.png';
    } else if (windSpeed >= 98 && windSpeed <= 102) {
      iconUrl = '/icons/barbs/100-kt.png';
    } else if (windSpeed >= 103 && windSpeed <= 107) {
      iconUrl = '/icons/barbs/105-kt.png';
    } else if (windSpeed >= 108 && windSpeed <= 112) {
      iconUrl = '/icons/barbs/110-kt.png';
    } else if (windSpeed >= 113 && windSpeed <= 117) {
      iconUrl = '/icons/barbs/115-kt.png';
    } else if (windSpeed >= 118 && windSpeed <= 122) {
      iconUrl = '/icons/barbs/120-kt.png';
    } else if (windSpeed >= 123 && windSpeed <= 140) {
      iconUrl = '/icons/barbs/125-kt.png';
    } else if (windSpeed >= 141 && windSpeed <= 175) {
      iconUrl = '/icons/barbs/150-kt.png';
    } else if (windSpeed > 175) {
      iconUrl = '/icons/barbs/200-kt.png';
    }

    if (windSpeed > 2) {
      transformAngle = 'rotate(' + windDirection + 'deg)';
    }

    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: '',
        html: ReactDOMServer.renderToString(
          <>
            <Image
              src={iconUrl}
              style={{
                transform: transformAngle,
                // transformOrigin: '16px 26px',
              }}
              alt={''}
              width={30}
              height={30}
              loading="eager"
            />
          </>,
        ),
        iconSize: [30, 30],
        iconAnchor: anchor as any,
        //popupAnchor: [0, 0]
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getWeatherMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
    let isDayTime = true;
    const sunsetSunriseTime = SunCalc.getTimes(new Date(), latlng.lat, latlng.lng);
    if (Date.parse(sunsetSunriseTime.sunrise) && Date.parse(sunsetSunriseTime.sunset)) {
      const obsTime = new Date(feature.properties.observation_time).getTime();
      isDayTime = obsTime >= sunsetSunriseTime.sunrise.getTime() && obsTime <= sunsetSunriseTime.sunset.getTime();
    }
    let condition = '';
    let worstSkyConditionFetched = false;

    let weatherIconClass = 'fas fa-question-square';
    let iconColor = 'lightslategrey';
    if (Object.keys(personalMinimums).indexOf(feature.properties.flight_category) > -1) {
      iconColor = personalMinimums[feature.properties.flight_category].color;
    }

    if (!feature.properties.wx_string) {
      //if wxString is not set, then get marker's icon from wind speed
      if (
        (feature.properties.wind_speed_kt && feature.properties.wind_speed_kt > windIconLimit.windSpeed) ||
        (feature.properties.wind_gust_kt && feature.properties.wind_gust_kt > windIconLimit.windGust)
      ) {
        weatherIconClass = 'fas fa-wind';
      } else {
        //get icon from worst sky condition
        condition = getWorstSkyCondition(getSkyConditions(feature));

        worstSkyConditionFetched = true;
        switch (condition) {
          case 'SKC':
          case 'CLR':
          case 'CAVOK':
            weatherIconClass = isDayTime ? 'fas fa-sun' : 'fas fa-moon';
            break;
          case 'FEW':
            weatherIconClass = isDayTime ? 'fas fa-sun-cloud' : 'fas fa-moon-cloud';
            break;
          case 'SCT':
            weatherIconClass = isDayTime ? 'fas fa-cloud-sun' : 'fas fa-cloud-moon';
            break;
          case 'BKN':
            weatherIconClass = isDayTime ? 'fas fa-clouds-sun' : 'fas fa-clouds-moon';
            break;
          case 'OVC':
          case 'OVX':
            weatherIconClass = 'fas fa-cloud';
        }
      }
    } else {
      const weatherString = feature.properties.wx_string.replace('-', '').replace('+', '');
      switch (weatherString) {
        case 'SN':
        case 'SHSN':
        case 'SN FZFG':
        case 'SN BR':
        case 'SN FG':
        case 'SN FZFG DRSN':
        case 'SHSN DRSN':
        case 'DRSN SHSN':
        case 'SN DRSN':
        case 'SG DRSN':
        case 'SG':
        case 'VCSH DRSN':
        case 'SN FZFG BLSN':
        case 'FZFG SN':
          weatherIconClass = 'fas fa-cloud-snow';
          break;
        case 'RASN':
        case 'SNRA':
        case 'SN RA':
        case 'SNPL':
        case 'PLSN':
        case 'PL BR':
        case 'PL FG':
        case 'PL HZ':
        case 'RA SN BR':
        case 'SN RA BR':
          weatherIconClass = 'fas fa-cloud-sleet';
          break;
        case 'RAPL':
        case 'PLRA':
        case 'PL':
          weatherIconClass = 'fas fa-cloud-hail-mixed';
          break;
        case 'FZRA':
        case 'FZRASN':
        case 'FZRA FZFG':
        case 'FZDZ BR':
        case 'FZRA BR':
        case 'FZRA FG':
        case 'FZRA HZ':
        case 'FZDZ':
        case 'FZDZ FZFG':
          weatherIconClass = 'fas fa-icicles';
          break;
        case 'RA':
        case 'RA BR':
        case 'RA HZ':
        case 'RA FG':
        case 'RA BCFG':
          weatherIconClass = 'fas fa-cloud-rain';
          break;
        case 'DZ':
        case 'DZ BR':
          weatherIconClass = 'fas fa-cloud-drizzle';
          break;
        case 'SHRA':
        case 'VCSH':
        case 'DRSN VCSH':
          weatherIconClass = 'fas fa-cloud-showers-heavy';
          break;
        case 'TS':
        case 'TS BR':
        case 'TSRA':
        case 'TSRA FG':
        case 'TSSN':
        case 'VCTSRA':
        case 'VCTS':
        case 'VCTS RA':
        case 'VCTS R':
        case 'VCTS RA BR':
        case 'RA BR VCTS':
        case 'VCTS BR':
        case 'VCTS HZ':
        case 'TS FZRA BR':
        case 'TS FZRA FG':
        case 'TS FZRA HZ':
          if (!worstSkyConditionFetched) {
            condition = getWorstSkyCondition(getSkyConditions(feature));
          }
          if (condition === 'SCT' || condition === 'FEW') {
            weatherIconClass = isDayTime ? 'fas fa-thunderstorm-sun' : 'fas fa-thunderstorm-moon';
          } else {
            weatherIconClass = 'fas fa-thunderstorm';
          }
          break;
        case 'TSRA BR':
          weatherIconClass = 'fas fa-thunderstorm';
          break;
        case 'SS':
        case 'DU':
        case 'BLSA':
        case 'BLDU':
        case 'HZ DS SQ':
        case 'HZ DS':
          weatherIconClass = 'fas fa-sun-dust';
          break;
        case 'BLSN':
        case 'DRSN':
        case 'SN BLSN':
        case 'IC BLSN':
        case 'IC DRSN':
        case 'DRSN -SN':
        case 'IC -SN DRSN':
          weatherIconClass = 'fas fa-snow-blowing';
          break;
        case 'IC':
        case 'IC HZ':
        case 'IC BR':
          weatherIconClass = 'fas fa-sparkles';
          break;
        case 'FC':
          weatherIconClass = 'fas fa-tornado';
          break;
        case 'GR':
          weatherIconClass = 'fas fa-cloud-hail';
          break;
        case 'FG':
        case 'FZFG':
        case 'VCFG':
        case 'MIFG':
        case 'PRFG':
        case 'BCFG':
        case 'BR BCFG':
        case 'BCFG BR':
        case 'BCFG HZ':
        case 'MIFG BR':
        case 'FZFG UP':
          weatherIconClass = 'fas fa-fog';
          break;
        case 'FU':
        case 'HZ FU':
        case 'BR FU':
        case 'FU HZ':
          weatherIconClass = 'fas fa-fire-smoke';
          break;
        case 'UP':
        case 'BR UP':
        case 'HZ UP':
        case 'BR':
        case 'HZ':
          if (
            (feature.properties.wind_speed_kt && feature.properties.wind_speed_kt > windIconLimit.windSpeed) ||
            (feature.properties.wind_gust_kt && feature.properties.wind_gust_kt > windIconLimit.windGust)
          ) {
            weatherIconClass = 'fas fa-wind';
          } else {
            //get icon from worst sky condition
            if (!worstSkyConditionFetched) {
              condition = getWorstSkyCondition(getSkyConditions(feature));
            }
            switch (condition) {
              case 'SKC':
              case 'CLR':
                weatherIconClass = isDayTime ? 'fas fa-sun' : 'fas fa-moon';
                break;
              case 'FEW':
                weatherIconClass = isDayTime ? 'fas fa-sun-cloud' : 'fas fa-moon-cloud';
                break;
              case 'SCT':
                weatherIconClass = isDayTime ? 'fas fa-cloud-sun' : 'fas fa-cloud-moon';
                break;
              case 'BKN':
                weatherIconClass = isDayTime ? 'fas fa-clouds-sun' : 'fas fa-clouds-moon';
                break;
              case 'OVC':
              case 'OVX':
                weatherIconClass = 'fas fa-cloud';
            }
          }
          break;
        case 'TSPL':
          if (!worstSkyConditionFetched) {
            condition = getWorstSkyCondition(getSkyConditions(feature));
          }
          switch (condition) {
            case 'SKC':
            case 'CLR':
              weatherIconClass = isDayTime ? 'fas fa-sun' : 'fas fa-moon';
              break;
            case 'FEW':
            case 'SCT':
              weatherIconClass = isDayTime ? 'fas fa-thunderstorm-sun' : 'fas fa-thunderstorm-moon';
              break;
            case 'BKN':
            case 'OVC':
            case 'OVX':
              weatherIconClass = 'fas fa-cloud-bolt';
              break;
          }
          break;
      }
    }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-weather-icon',
        html: "<i style='color:" + iconColor + "' class='" + weatherIconClass + " fa-2x'></i>",
        iconSize: [32, 26],
        iconAnchor: [16, 13],
        //popupAnchor: [0, -13]
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getNbmWeatherMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
    const flightCategory = getNbmFlightCategory(feature, personalMinimums);
    let iconColor = 'lightslategrey';
    if (flightCategory in personalMinimums) {
      iconColor = personalMinimums[flightCategory].color;
    }
    const iconType = getNbmWeatherMarkerIcon(
      feature.properties.wx_1,
      feature.properties.w_speed,
      feature.properties.w_gust,
      feature.properties.skycov,
      latlng,
      observationTime,
    );
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-weather-icon',
        html: "<i style='color:" + iconColor + "' class='" + iconType + " fa-2x'></i>",
        iconSize: [32, 26],
        iconAnchor: [16, 13],
        //popupAnchor: [0, -13]
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  return (
    <Pane name={'station-markers'} style={{ zIndex: paneOrders.station }}>
      {displayedGeojson != null && (
        <SimplifiedMarkersLayer
          key={userSettings.default_home_airport}
          ref={geojsonLayerRef}
          data={displayedGeojson}
          visible={layerState.stationMarkersState.checked}
          simplifyRadius={clusterRadius}
          interactive={true}
          pointToLayer={pointToLayer}
          bubblingMouseEvents={true}
          unSimplifyFilter={unSimplifyFilter}
        ></SimplifiedMarkersLayer>
      )}
    </Pane>
  );
};
