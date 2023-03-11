/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from 'axios';
import { LatLng } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Pane, useMap } from 'react-leaflet';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import SunCalc from 'suncalc';

import { selectMetar } from '../../../../store/layers/LayerControl';
import { PersonalMinimums, selectPersonalMinimums } from '../../../../store/user/UserSettings';
import { MetarMarkerTypes, paneOrders, timeSliderInterval, wfsUrl, windIconLimit } from '../../common/AreoConstants';
import {
  addLeadingZeroes,
  getAbsoluteHours,
  getLowestCeiling,
  getMetarCeilingCategory,
  getMetarVisibilityCategory,
  getSkyConditions,
  getWorstSkyCondition,
  loadFeaturesFromCache,
  loadFeaturesFromWeb,
} from '../../common/AreoFunctions';
import { selectObsTime } from '../../../../store/time-slider/ObsTimeSlice';
import { SimplifiedMarkersLayer } from './SimplifiedMarkersLayer';
import { selectActiveRoute } from '../../../../store/route/routes';

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
  'valid_date',
  'geom',
];

export const getFlightCategoryIconUrl = (feature: GeoJSON.Feature): { iconUrl: string; ceiling: number } => {
  const skyConditions = getSkyConditions(feature);
  let sky: string, ceiling: number;
  if (feature.properties.vert_vis_ft) {
    sky = 'OVX';
    ceiling = feature.properties.vert_vis_ft;
  } else if (skyConditions.length > 0) {
    const skyCondition = getLowestCeiling(skyConditions);
    if (skyCondition) ceiling = skyCondition.cloudBase;
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
  return { iconUrl, ceiling };
};

export const getNbmFlightCategoryIconUrl = (feature: GeoJSON.Feature, personalMinimums: PersonalMinimums): string => {
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
const nbmStations = {};

export const StationMarkersLayer = () => {
  const [metars, setMetars] = useState<GeoJSON.Feature[]>([]);
  const [displayedGeojson, setDisplayedGeojson] = useState<GeoJSON.FeatureCollection>();
  const [stationTime, setStationTime] = useState<any[]>([]);
  const [clusterRadius, setClusterRadius] = useState(20);
  const layerState = useSelector(selectMetar);
  const personalMinimums = useSelector(selectPersonalMinimums);
  const [indexedData, setIndexedData] = useState();
  const observationTime = useSelector(selectObsTime);
  const [isPast, setIsPast] = useState(true);
  const [renderedTime, setRenderedTime] = useState(Date.now());
  const activeRoute = useSelector(selectActiveRoute);

  const geojsonLayerRef = useRef();

  const map = useMap();

  useEffect(() => {
    loadFeaturesFromCache('metars', setMetars);
    loadFeaturesFromWeb(wfsUrl, 'EZWxBrief:metar', metarsProperties, 'metars', setMetars);
    loadNbmStationMarkers();
  }, []);

  useEffect(() => {
    if (!metars) return;
    if (metars.length > 0) {
      const filteredFeatures = metarsFilter(metars, new Date(observationTime));
      setDisplayedData(filteredFeatures);
    }
  }, [metars]);

  useEffect(() => {
    if (layerState && layerState.checked === false) return;
    const obsHour = getAbsoluteHours(observationTime);
    const currentHour = getAbsoluteHours(Date.now());
    if (obsHour > currentHour) {
      setIsPast(false);
      if (stationTime.length > 0) {
        const validStation = stationTime.reduce((acc, cur) => {
          const prevDiff = Math.abs(getAbsoluteHours(acc.valid_date) - obsHour);
          const currDiff = Math.abs(getAbsoluteHours(cur.valid_date) - obsHour);
          if (prevDiff - currDiff > 0) {
            return cur;
          }
          return acc;
        });
        if (nbmStations[validStation.station_table_name]) {
          setDisplayedData(nbmStations[validStation.station_table_name]);
        }
      }
    } else {
      setIsPast(true);
      if (metars.length > 0) {
        const filteredFeatures = metarsFilter(metars, new Date(observationTime));
        console.log(filteredFeatures);
        setDisplayedData(filteredFeatures);
      }
    }
  }, [observationTime]);

  useEffect(() => {
    layerState.markerType === MetarMarkerTypes.surfaceWindBarbs.value ? setClusterRadius(20) : setClusterRadius(30);
    setRenderedTime(Date.now());
  }, [
    layerState.markerType,
    layerState.flightCategory.all.checked,
    layerState.flightCategory.vfr.checked,
    layerState.flightCategory.mvfr.checked,
    layerState.flightCategory.ifr.checked,
    layerState.flightCategory.lifr.checked,
  ]);

  const setDisplayedData = (features: GeoJSON.Feature[]) => {
    setDisplayedGeojson({
      type: 'FeatureCollection',
      features: features,
    });
  };

  const loadNbmStationMarkers = () => {
    axios
      .get('/api/station-time/findAll')
      .then((result) => {
        if (!Array.isArray(result.data)) {
          console.log(result.data);
          return;
        }
        setStationTime(result.data);
        result.data.forEach((stationTime) => {
          const stationValidHour = Math.floor(new Date(stationTime.valid_date).getTime() / 3600 / 1000);
          if (1 || stationValidHour >= getAbsoluteHours(Date.now())) {
            loadFeaturesFromCache(stationTime.station_table_name, (features) => {
              addNbmStation(stationTime.station_table_name, features);
            });
            loadFeaturesFromWeb(
              wfsUrl,
              `EZWxBrief:${stationTime.station_table_name}`,
              nbmStationProperties,
              stationTime.station_table_name,
              (features) => {
                addNbmStation(stationTime.station_table_name, features);
              },
              'faaid',
            );
          }
        });
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
    // const toLog = {};
    features.map((feature) => {
      const obsTime = new Date(feature.properties.observation_time).getTime();
      const index = Math.floor(obsTime / timeSliderInterval);
      if (index in data === false) {
        data[index] = [];
        // toLog[new Date(index * timeSliderInterval).toLocaleTimeString()] = [];
      }
      data[index].push(feature);
      // toLog[new Date(index * timeSliderInterval).toLocaleTimeString()].push({
      //   id: feature.properties.station_id,
      //   tm: feature.properties.observation_time,
      // });
    });
    // console.log(toLog);
    setIndexedData(data as any);
    return data;
  };

  const metarsFilter = (features: GeoJSON.Feature[], observationTime: Date): GeoJSON.Feature[] => {
    const obsHour = getAbsoluteHours(observationTime);
    const currentHour = getAbsoluteHours(Date.now());
    if (obsHour - currentHour > 0) {
      return [];
    }
    let indexedFeatures = indexedData;
    if (!indexedFeatures) {
      indexedFeatures = buildIndexedData(features);
    }
    if (!indexedFeatures) return [];
    const filteredFeatures = {};
    const obsTime = new Date(observationTime).getTime();
    const startIndex = Math.floor((obsTime - 75 * 60 * 1000) / timeSliderInterval);
    const endIndex = Math.floor(obsTime / timeSliderInterval);
    for (let index = startIndex; index < endIndex; index++) {
      const iData = indexedFeatures[index] as GeoJSON.Feature[];
      if (iData) {
        iData.map((feature) => {
          if (
            layerState.markerType === MetarMarkerTypes.flightCategory.value &&
            layerState.flightCategory.all.checked === false
          ) {
            if (!layerState.flightCategory.vfr.checked && feature.properties.flight_category === 'VFR') {
              return;
            }
            if (!layerState.flightCategory.mvfr.checked && feature.properties.flight_category === 'MVFR') {
              return;
            }
            if (!layerState.flightCategory.ifr.checked && feature.properties.flight_category === 'IFR') {
              return;
            }
            if (!layerState.flightCategory.lifr.checked && feature.properties.flight_category === 'LIFR') {
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
    // console.log(ordered);
    const result = Object.values(ordered);
    return result as any;
  };

  const pointToLayer = (feature: GeoJSON.Feature, latlng: LatLng): L.Layer => {
    let marker = null;
    if (isPast) {
      switch (layerState.markerType) {
        case MetarMarkerTypes.flightCategory.value:
          marker = getFlightCatMarker(feature, latlng);
          break;
        case MetarMarkerTypes.ceilingHeight.value:
          marker = getCeilingHeightMarker(feature, latlng);
          break;
        case MetarMarkerTypes.surfaceVisibility.value:
          marker = getSurfaceVisibilityMarker(feature, latlng, feature.properties.visibility_statute_mi);
          break;
        case MetarMarkerTypes.surfaceWindSpeed.value:
          marker = getSurfaceWindSpeedMarker(feature, latlng, feature.properties.wind_speed_kt);
          break;
        case MetarMarkerTypes.surfaceWindBarbs.value:
          marker = getSurfaceWindBarbsMarker(
            feature,
            latlng,
            feature.properties.wind_speed_kt,
            feature.properties.wind_dir_degrees,
          );
          break;
        case MetarMarkerTypes.surfaceWindGust.value:
          marker = getSurfaceWindGustMarker(feature, latlng, feature.properties.wind_gust_kt);
          break;
        case MetarMarkerTypes.surfaceTemperature.value:
          marker = getSurfaceTemperatureMarker(feature, latlng, feature.properties.temp_c);
          break;
        case MetarMarkerTypes.surfaceDewpoint.value:
          marker = getSurfaceDewpointMarker(feature, latlng, feature.properties.dewpoint_c);
          break;
        case MetarMarkerTypes.dewpointDepression.value:
          marker = getDewpointDepressionMarker(
            feature,
            latlng,
            feature.properties.temp_c,
            feature.properties.dewpoint_c,
          );
          break;
        case MetarMarkerTypes.weather.value:
          marker = getWeatherMarker(feature, latlng);
          break;
      }
    } else {
      switch (layerState.markerType) {
        case MetarMarkerTypes.flightCategory.value:
          marker = getFlightCatMarker(feature, latlng);
          break;
        case MetarMarkerTypes.ceilingHeight.value:
          marker = getNbmCeilingHeightMarker(feature, latlng, feature.properties.ceil, feature.properties.skycov);
          break;
        case MetarMarkerTypes.surfaceVisibility.value:
          marker = getSurfaceVisibilityMarker(feature, latlng, feature.properties.vis);
          break;
        case MetarMarkerTypes.surfaceWindSpeed.value:
          marker = getSurfaceWindSpeedMarker(feature, latlng, feature.properties.w_speed);
          break;
        case MetarMarkerTypes.surfaceWindBarbs.value:
          marker = getSurfaceWindBarbsMarker(feature, latlng, feature.properties.w_speed, feature.properties.w_dir);
          break;
        case MetarMarkerTypes.surfaceWindGust.value:
          marker = getSurfaceWindGustMarker(feature, latlng, feature.properties.w_gust);
          break;
        case MetarMarkerTypes.surfaceTemperature.value:
          marker = getSurfaceTemperatureMarker(feature, latlng, feature.properties.temp_c);
          break;
        case MetarMarkerTypes.surfaceDewpoint.value:
          marker = getSurfaceDewpointMarker(feature, latlng, feature.properties.dewp_c);
          break;
        case MetarMarkerTypes.dewpointDepression.value:
          marker = getDewpointDepressionMarker(feature, latlng, feature.properties.temp_c, feature.properties.dewp_c);
          break;
        case MetarMarkerTypes.weather.value:
          marker = getFlightCatMarker(feature, latlng);
          break;
      }
    }
    marker?.on('click', (e) => {
      map.fire('click', e);
    });
    return marker;
  };

  const getFlightCatMarker = (feature: GeoJSON.Feature, latlng: LatLng): L.Marker => {
    let iconUrl: string;
    if (isPast) {
      iconUrl = getFlightCategoryIconUrl(feature).iconUrl;
    } else {
      iconUrl = getNbmFlightCategoryIconUrl(feature, personalMinimums);
    }

    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-icon',
        html: ReactDOMServer.renderToString(
          <>
            <Image src={iconUrl} alt={''} width={16} height={16} />
          </>,
        ),
        iconSize: [16, 16],
      }),
      pane: 'station-markers',
    });
    return metarMarker;
  };

  const getCeilingHeightMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
    const skyConditions = getSkyConditions(feature);
    const skyCondition = getLowestCeiling(skyConditions);
    if (skyCondition == null) return;
    const ceiling = skyCondition.cloudBase;
    const ceilingAmount = addLeadingZeroes(ceiling / 100, 3);
    const worstSkyCondition = getWorstSkyCondition(skyConditions);
    let iconUrl = '';
    if (layerState.usePersonalMinimums) {
    } else {
      const [cat] = getMetarCeilingCategory(ceiling, personalMinimums);
      iconUrl = `/icons/metar/${cat}-${worstSkyCondition}.png`;
    }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-ceiling-icon',
        html: ReactDOMServer.renderToString(
          <>
            <div style={{ display: 'inline', verticalAlign: -7, marginLeft: -4 }}>
              <Image src={iconUrl} alt={''} width={20} height={20} />
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
    if (layerState.usePersonalMinimums) {
    } else {
      const [cat] = getMetarCeilingCategory(ceilingHeight, personalMinimums);
      iconUrl = `/icons/metar/${cat}-${worstSkyCondition}.png`;
    }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-ceiling-icon',
        html: ReactDOMServer.renderToString(
          <>
            <div style={{ display: 'inline', verticalAlign: -7, marginLeft: -4 }}>
              <Image src={iconUrl} alt={''} width={20} height={20} />
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
    if (visibility === 0.25 && feature.properties.raw_text && feature.properties.raw_text.indexOf('M1/4SM') > -1) {
      visibility = '<0.25';
    }
    if (visibility > 4) {
      visibility = Math.ceil(visibility);
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
              <Image src={iconUrl} alt={''} width={20} height={20} />
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
    // const useKnots =
    //   $('#hdnUserWindSpeed').val().trim() === 'knots' ? true : false;
    // if (!useKnots) {
    //   windSpeed = Math.round(parseFloat(windSpeed) * 1.152);
    // }
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
    // const useKnots =
    //   $('#hdnUserWindSpeed').val().trim() === 'knots' ? true : false;
    // if (!useKnots) {
    //   windGust = Math.round(parseFloat(windGust) * 1.152);
    // }
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
    tempInCelcius = Math.round(tempInCelcius);
    // const tempInCelcius = Math.round((temperature - 32) * (5 / 9));
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
    // const useCelcius =
    //   $('#hdnUserTemperatureSetting').val().trim() === 'celsius' ? true : false;
    // if (useCelcius) {
    //   temperature = tempInCelcius;
    // } else {
    //   temperature = Math.round(temperature);
    // }
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
    tempInCelcius = Math.round(tempInCelcius);
    // const tempInCelcius = Math.round((temperature - 32) * (5 / 9));
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
    // const useCelcius =
    //   $('#hdnUserTemperatureSetting').val().trim() === 'celsius' ? true : false;
    // if (useCelcius) {
    //   temperature = tempInCelcius;
    // } else {
    //   temperature = Math.round(temperature);
    // }
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
    // const useCelcius =
    //   $('#hdnUserTemperatureSetting').val().trim() === 'celsius' ? true : false;
    let dewpointDepression = temperature - dewpointTemperature;
    // const temperatureInCelcius = Math.round((temperature - 32) * (5 / 9));
    let dewpointDepressionInCelcius = Math.round(dewpointDepression);
    // const dewpointTemperatureInCelcius = Math.round(
    //   (dewpointTemperature - 32) * (5 / 9),
    // );
    // let dewpointDepressionInCelcius = Math.round(
    //   temperatureInCelcius - dewpointTemperatureInCelcius,
    // );
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

    // if (useCelcius) {
    //   dewpointDepression = dewpointDepressionInCelcius;
    // }

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
    if (isNaN(windSpeed)) {
      windSpeed = 0;
    }
    if (isNaN(windDirection)) {
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
        case 'SN DRSN':
        case 'SG DRSN':
        case 'SG':
        case 'VCSH DRSN':
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
        case 'IC DRSN':
          weatherIconClass = 'fas fa-snow-blowing';
          break;
        case 'IC':
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

  return (
    <Pane name={'station-markers'} style={{ zIndex: paneOrders.station }}>
      {displayedGeojson != null && (
        <SimplifiedMarkersLayer
          key={renderedTime}
          ref={geojsonLayerRef}
          data={displayedGeojson}
          visible={layerState.checked}
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
