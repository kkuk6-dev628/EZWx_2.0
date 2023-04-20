/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PersonalMinimums } from './../../../store/user/UserSettings';
import { cacheStartTime, WeatherCausings } from './AreoConstants';
import geojson2svg from 'geojson-to-svg';
import { SkyCondition } from '../../../interfaces/layerControl';
import axios from 'axios';
import { db } from '../../caching/dexieDb';
import { Route, RoutePoint } from '../../../interfaces/route';
import { route as routeErrorMessages } from '../../lang/messages';

export const getAltitudeString = (value: string, isHundred = true, fzlbase?: string, fzltop?: string): string => {
  if (value === 'SFC' || value == '0') {
    return 'Surface';
  } else if (value === 'FZL') {
    let fzlstring = '';
    if (fzlbase === 'SFC') {
      fzlstring = 'Surface to';
    } else if (!isNaN(parseInt(fzlbase))) {
      fzlstring = `${parseInt(fzlbase) * (isHundred ? 100 : 1)} to`;
    }
    if (!isNaN(parseInt(fzltop))) {
      fzlstring += ` ${parseInt(fzltop) * (isHundred ? 100 : 1)} ft MSL`;
    }
    return fzlstring;
  } else if (!isNaN(parseInt(value))) {
    return parseInt(value) * (isHundred ? 100 : 1) + ' ft MSL';
  }
};

export const translateWeatherClausings = (dueto: string): string => {
  if (!dueto) {
    return '';
  }
  const weatherCausings = dueto.slice(dueto.lastIndexOf(' ') + 1);
  const splitWeatherCausing = weatherCausings.split('/');
  const wc = splitWeatherCausing.map((element) => {
    if (!WeatherCausings.hasOwnProperty(element)) {
      return;
    }
    return WeatherCausings[element];
  });
  return wc
    .filter((n) => n)
    .join(', ')
    .replace(/,(?=[^,]+$)/, ' and');
};

export const convertTimeFormat = (time: string | number | Date, useLocalTime: boolean) => {
  const dateObj = new Date(time);
  if (useLocalTime) {
    return `${dateObj.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })} ${dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    })}`;
  } else {
    return `${dateObj.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })} ${simpleTimeOnlyFormat(dateObj, false)}`;
  }
};

export const simpleTimeFormat = (time: Date, useLocalTime: boolean) => {
  return `${time.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    timeZone: !useLocalTime ? 'UTC' : undefined,
  })} ${simpleTimeOnlyFormat(time, useLocalTime)}`;
};

export const simpleTimeOnlyFormat = (time: Date, useLocalTime: boolean) => {
  if (useLocalTime) {
    return time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    });
  } else {
    return `${time.getUTCHours() < 10 ? '0' : ''}${time.getUTCHours()}${
      time.getUTCMinutes() < 10 ? '0' : ''
    }${time.getUTCMinutes()}Z`;
  }
};

export const getThumbnail = (feature, style) => {
  const svgString = geojson2svg().styles({ Polygon: style }).data(feature).render();
  return svgString;
};

export const round = (value, places) => {
  return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
};

export const celsiusToFahrenheit = (celsius: number, place = 0): number => {
  return round((celsius * 9) / 5 + 32, place);
};

export const getStandardTemp = (elevation: number, inFah = true) => {
  if (inFah) {
    return 59 - Math.round(elevation / 1000) * 3.6;
  }
  return 15 - Math.round(elevation / 1000) * 1.98;
};

export const knotsToMph = (knots: number, place = 0): number => {
  return round(knots * 1.15078, place);
};

export const meterToFeet = (meter: number, place = 0): number => {
  return round(meter * 3.28084, place);
};

export const createElementFromHTML = (htmlString) => {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
};

export const addLeadingZeroes = (str, max) => {
  str = str.toString();
  return str.length < max ? addLeadingZeroes('0' + str, max) : str;
};

export const generateHash = (s: string): number => {
  let hash = 0,
    i,
    chr;
  if (s.length === 0) return hash;
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const getCacheVersion = (updateInterval: number): number => {
  const now = Math.floor(Date.now() / 1000);
  const version = Math.floor((now - cacheStartTime) / updateInterval / 60);
  return version;
};

export const getTimeRangeStart = () => {
  const origin = new Date();
  origin.setHours(origin.getHours() - 12, 0, 0);
  origin.setMinutes(0);
  origin.setSeconds(0);
  origin.setMilliseconds(0);
  return origin;
};

export const getQueryTime = (time: Date): string => {
  const start = new Date(time);
  start.setMinutes(time.getMinutes() - 75);
  start.setSeconds(0);
  start.setMilliseconds(0);
  return start.toISOString() + '/' + time.toISOString();
};

/**
 * Gets the relative humidity in percent from temperature and dewpoint in celsius.
 * @param {number} temperature in celsius
 * @param {number} dewpoint in celsius
 * @returns {number} in percent
 */
export const calcRelativeHumidity = (temperature: number, dewpoint: number): number => {
  const temp_k = temperature + 273.15;
  const dewp_k = dewpoint + 273.15;
  const Rv = 461,
    T0 = 273.15,
    e0 = 0.6113,
    L = 2.5e6;
  const es = e0 * Math.exp((L / Rv) * (1 / T0 - 1 / temp_k));
  const e = e0 * Math.exp((L / Rv) * (1 / T0 - 1 / dewp_k));
  let rh = (e / es) * 100;
  if (rh > 100) rh = 100;
  return rh;
};

export const getAirportNameById = (id: string, airportsData: any[]): string => {
  if (!airportsData) return;
  let airport = airportsData.find((item) => {
    return item.key === id;
  });
  if (!airport && id) {
    airport = airportsData.find((item) => {
      return item.key === id.slice(1);
    });
  }
  if (airport) {
    return airport.name;
  }
  return null;
};

export const validateRoute = (route: Route): boolean | string => {
  if (route.departure && route.destination) {
    if (isSameRoutePoints(route.departure, route.destination)) {
      if (!route.routeOfFlight || route.routeOfFlight.length === 0) {
        return routeErrorMessages.en.noWaypointsError;
      }
    }
    const wayPoints = [
      route.departure,
      ...route.routeOfFlight.map((routeOfFlight) => routeOfFlight.routePoint),
      route.destination,
    ];
    for (let i = 0; i < wayPoints.length - 1; i++) {
      if (isSameRoutePoints(wayPoints[i], wayPoints[i + 1])) {
        return routeErrorMessages.en.zeroLengthLegError;
      }
    }
    return true;
  }
  if (!route.departure && !route.destination) {
    return routeErrorMessages.en.noValidAirportError;
  }
  return !route.departure ? routeErrorMessages.en.noValidDepartureError : routeErrorMessages.en.noValidDestinationError;
};

export const isSameRoutePoints = (routePoint1: RoutePoint, routePoint2: RoutePoint): boolean => {
  return routePoint1.key === routePoint2.key && routePoint1.type === routePoint2.type;
};

export const isSameRoutes = (route1: Route, route2: Route): boolean => {
  if (!route1 && route2) {
    return false;
  }
  if (route1 && !route2) {
    return false;
  }
  if (!route1 && !route2) {
    return true;
  }
  if (!isSameRoutePoints(route1.departure, route2.departure)) {
    return false;
  }
  if (!isSameRoutePoints(route1.destination, route2.destination)) {
    return false;
  }
  if (route1.routeOfFlight.length !== route2.routeOfFlight.length) {
    return false;
  }
  for (let i = 0; i < route1.routeOfFlight.length; i++) {
    if (!isSameRoutePoints(route1.routeOfFlight[i].routePoint, route2.routeOfFlight[i].routePoint)) {
      return false;
    }
  }
  if (route1.altitude !== route2.altitude) {
    return false;
  }
  if (route1.useForecastWinds !== route2.useForecastWinds) {
    return false;
  }
  return true;
};

export const diffMinutes = (date1: Date, date2: Date) => {
  const diff = (date1.getTime() - date2.getTime()) / (60 * 1000);
  return Math.abs(Math.round(diff));
};

export const getMetarVisibilityCategory = (visibility: number, personalMinimums: PersonalMinimums): any[] => {
  if (visibility === null || !isFinite(visibility)) {
    return [];
  }
  let visibilityMinimum = personalMinimums.VFR;
  if (visibility < personalMinimums.IFR.visibility) {
    visibilityMinimum = personalMinimums.LIFR;
  } else if (visibility >= personalMinimums.IFR.visibility && visibility < personalMinimums.MVFR.visibility) {
    visibilityMinimum = personalMinimums.IFR;
  } else if (visibility >= personalMinimums.MVFR.visibility && visibility <= personalMinimums.VFR.visibility) {
    visibilityMinimum = personalMinimums.MVFR;
  } else if (visibility > personalMinimums.VFR.visibility) {
    visibilityMinimum = personalMinimums.VFR;
  }

  return [visibilityMinimum.cat, visibilityMinimum.color];
};

export const toTitleCase = (str) => {
  return str
    ? str.replace(/\w\S[^\-\/\s]*/g, function (txt: string) {
        return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
      })
    : null;
};

export const getAbsoluteHours = (date: string | Date | number) => {
  return Math.floor(new Date(date).getTime() / 3600 / 1000);
};

export const storeFeaturesToCache = (datasetName: string, features: GeoJSON.Feature[]) => {
  db[datasetName].clear();
  const chunkSize = 400;
  let i = 0;
  const chunkedAdd = () => {
    if (features.length <= i) return;
    db[datasetName]
      .bulkAdd(features.slice(i, i + chunkSize))
      .catch((error) => console.log(error))
      .finally(() => {
        i += chunkSize;
        chunkedAdd();
      });
  };
  chunkedAdd();
};

export const loadFeaturesFromCache = (
  datasetName: string,
  setFeaturesFunc: (features: GeoJSON.Feature[]) => void,
  sortFunc?: (a: GeoJSON.Feature, b: GeoJSON.Feature) => number,
) => {
  if (db[datasetName]) {
    db[datasetName].toArray().then((features) => {
      if (sortFunc) {
        features = features.sort(sortFunc);
      }
      setFeaturesFunc(features);
    });
  }
};

export const loadFeaturesFromWeb = (
  url: string,
  wfsTypeName: string,
  propertyNames: string[],
  datasetName: string,
  setFeaturesFunc?: (features: GeoJSON.Feature[]) => void,
  sortFunc?: (a: GeoJSON.Feature, b: GeoJSON.Feature) => number,
  filter?: string,
  // storeCache = true,
) => {
  const params = {
    outputFormat: 'application/json',
    maxFeatures: 200000,
    request: 'GetFeature',
    service: 'WFS',
    typeName: wfsTypeName,
    version: '1.0.0',
    srsName: 'EPSG:4326',
    propertyName: propertyNames.join(','),
    cql_filter: filter,
  } as any;
  axios
    .get(url, {
      params: params,
      // signal: abortController ? abortController.signal : null,
    })
    .then((data) => {
      if (typeof data.data === 'string') {
        console.log(wfsTypeName + ': Invalid json data!', data.data);
      } else {
        let features: GeoJSON.Feature[] = data.data.features;
        if (sortFunc) {
          features = features.sort(sortFunc);
        }
        // if (storeCache) storeFeaturesToCache(datasetName, features);
        if (setFeaturesFunc) setFeaturesFunc(features);
      }
    })
    .catch((reason) => {
      console.log(wfsTypeName, reason);
    });
};

export const visibilityMileToMeter = (mile: number): number => {
  if (mile >= 7) return 9999; // yes that is 9999
  else if (mile >= 6 && mile < 7) return 9000;
  else if (mile >= 5 && mile < 6) return 8000;
  else if (mile >= 4.5 && mile < 5) return 7000;
  else if (mile >= 4 && mile < 4.5) return 6000;
  else if (mile >= 3.5 && mile < 4) return 5000;
  else if (mile >= 3 && mile < 3.5) return 4800;
  else if (mile == 2.75) return 4400;
  else if (mile == 2.5) return 4000;
  else if (mile == 2.25) return 3600;
  else if (mile == 2.0) return 3200;
  else if (mile == 1.88) return 3000;
  else if (mile == 1.75) return 2800;
  else if (mile == 1.63) return 2600;
  else if (mile == 1.5) return 2400;
  else if (mile == 1.38) return 2200;
  else if (mile == 1.25) return 2000;
  else if (mile == 1.13) return 1800;
  else if (mile == 1) return 1600;
  else if (mile == 0.88) return 1400;
  else if (mile == 0.75) return 1200;
  else if (mile == 0.63) return 1000;
  else if (mile == 0.5) return 800;
  else if (mile == 0.38) return 600;
  else if (mile == 0.31) return 500;
  else if (mile == 0.25) return 400;
  else if (mile == 0.13) return 200;
  else if (mile == 0.06) return 100;
  else if (mile == 0) return 0;
  return 0.0;
};

export const visibilityMileToFraction = (mile: number): string => {
  if (mile === undefined || mile === null) {
    return null;
  }
  let fraction = mile.toString();
  switch (mile) {
    case 0:
      fraction = '0';
      break;
    case 0.06:
      fraction = '1/16';
      break;
    case 0.13:
      fraction = '1/8';
      break;
    case 0.25:
      fraction = '1/4';
      break;
    case 0.38:
      fraction = '3/8';
      break;
    case 0.5:
      fraction = '1/2';
      break;
    case 0.62:
    case 0.63:
      fraction = '5/8';
      break;
    case 0.75:
      fraction = '3/4';
      break;
    case 0.88:
      fraction = '7/8';
      break;
    case 1:
      fraction = '1';
      break;
    case 1.13:
      fraction = '1 1/8';
      break;
    case 1.24:
    case 1.25:
      fraction = '1 1/4';
      break;
    case 1.38:
      fraction = '1 3/8';
      break;
    case 1.5:
      fraction = '1 1/2';
      break;
    case 1.63:
      fraction = '1 5/8';
      break;
    case 1.75:
    case 1.86:
      fraction = '1 3/4';
      break;
    case 1.88:
      fraction = '1 7/8';
      break;
    case 2:
      fraction = '2';
      break;
    case 2.25:
      fraction = '2 1/4';
      break;
    case 2.49:
    case 2.5:
      fraction = '2 1/2';
      break;
    case 2.75:
      fraction = '2 3/4';
      break;
    case 3:
    case 3.11:
      fraction = '3';
      break;
    case 3.5:
      fraction = '3 1/2';
      break;
    case 3.73:
      fraction = '4';
      break;
  }
  return fraction;
};

export const getMetarCeilingCategory = (ceiling: number, personalMinimums: PersonalMinimums): any[] => {
  if (ceiling === null || !isFinite(ceiling)) {
    return [undefined, '#000', Infinity];
  }
  let ceilingMinimum = personalMinimums.VFR;
  if (ceiling < personalMinimums.IFR.ceiling) {
    ceilingMinimum = personalMinimums.LIFR;
  } else if (ceiling >= personalMinimums.IFR.ceiling && ceiling < personalMinimums.MVFR.ceiling) {
    ceilingMinimum = personalMinimums.IFR;
  } else if (ceiling >= personalMinimums.MVFR.ceiling && ceiling <= personalMinimums.VFR.ceiling) {
    ceilingMinimum = personalMinimums.MVFR;
  } else if (ceiling > personalMinimums.VFR.ceiling) {
    ceilingMinimum = personalMinimums.VFR;
  }

  return [ceilingMinimum.cat, ceilingMinimum.color];
};

export const getLowestCeiling = (skyConditions: SkyCondition[]): SkyCondition => {
  skyConditions = skyConditions.filter((skyCondition) => {
    return skyCondition.skyCover === 'OVC' || skyCondition.skyCover === 'OVX' || skyCondition.skyCover === 'BKN';
  });
  if (skyConditions && skyConditions.length > 0) {
    const skyCondition = skyConditions.reduce(function (acc, loc) {
      return acc.cloudBase < loc.cloudBase ? acc : loc;
    });
    return skyCondition;
  }
  return null;
};

export const getSkyConditions = (feature: GeoJSON.Feature): SkyCondition[] => {
  const skyConditions: SkyCondition[] = [];
  for (let i = 1; i <= 6; i++) {
    if (feature.properties[`sky_cover_${i}`]) {
      if (feature.properties[`sky_cover_${i}`] === 'OVX') {
        skyConditions.push({
          skyCover: 'OVX',
          cloudBase: feature.properties.vert_vis_ft,
        });
      } else {
        if (feature.properties[`sky_cover_${i}`] === 'CLR' && feature.properties.auto == null) {
          skyConditions.push({
            skyCover: 'SKC',
            cloudBase: feature.properties[`cloud_base_ft_agl_${i}`],
          });
        } else {
          skyConditions.push({
            skyCover: feature.properties[`sky_cover_${i}`],
            cloudBase: feature.properties[`cloud_base_ft_agl_${i}`],
          });
        }
      }
    }
  }
  return skyConditions;
};

export const getWorstSkyCondition = (skyConditions: SkyCondition[]): string => {
  if (skyConditions.length === 1) {
    return skyConditions[0].skyCover;
  }

  const ovxSkyConditions = skyConditions.filter((skyCondition) => {
    return skyCondition.skyCover === 'OVX';
  });

  if (ovxSkyConditions.length > 0) {
    return 'OVX';
  }

  const ovcSkyConditions = skyConditions.filter((skyCondition) => {
    return skyCondition.skyCover === 'OVC';
  });

  if (ovcSkyConditions.length > 0) {
    return 'OVC';
  }

  const bknSkyConditions = skyConditions.filter((skyCondition) => {
    return skyCondition.skyCover === 'BKN';
  });

  if (bknSkyConditions.length > 0) {
    return 'BKN';
  }

  const sctSkyConditions = skyConditions.filter((skyCondition) => {
    return skyCondition.skyCover === 'SCT';
  });

  if (sctSkyConditions.length > 0) {
    return 'SCT';
  }

  const fewSkyConditions = skyConditions.filter((skyCondition) => {
    return skyCondition.skyCover === 'FEW';
  });

  if (fewSkyConditions.length > 0) {
    return 'FEW';
  }

  const skySkyConditions = skyConditions.filter((skyCondition) => {
    return skyCondition.skyCover === 'SKC';
  });

  if (skySkyConditions.length > 0) {
    return 'SKC';
  }

  const clrSkyConditions = skyConditions.filter((skyCondition) => {
    return skyCondition.skyCover === 'CLR' || skyCondition.skyCover === 'CAVOK';
  });

  if (clrSkyConditions.length > 0) {
    return 'CLR';
  }
};

export const getMetarDecodedWxString = (wxString: string): string => {
  let result = wxString;
  switch (wxString) {
    case 'FZRA':
      result = 'Moderate freezing rain';
      break;
    case '-FZRA':
      result = 'Light freezing rain';
      break;
    case '+FZRA':
      result = 'Heavy freezing rain';
      break;
    case '-FZRA BR':
      result = 'Light freezing rain and mist';
      break;
    case 'FZRA BR':
      result = 'Moderate freezing rain and mist';
      break;
    case '+FZRA BR':
      result = 'Heavy freezing rain and mist';
      break;
    case '-FZRA FG':
      result = 'Light freezing rain and fog';
      break;
    case 'FZRA FG':
      result = 'Moderate freezing rain and fog';
      break;
    case '+FZRA FG':
      result = 'Heavy freezing rain and fog';
      break;
    case '-FZRA HZ':
      result = 'Light freezing rain and haze';
      break;
    case 'FZRA HZ':
      result = 'Moderate freezing rain and haze';
      break;
    case '+FZRA HZ':
      result = 'Heavy freezing rain and haze';
      break;
    case '-FZRA FZFG':
      result = 'Light freezing rain in freezing fog';
      break;
    case 'FZRA FZFG':
      result = 'Moderate freezing rain in freezing fog';
      break;
    case '+FZRA FZFG':
      result = 'Heavy freezing rain in freezing fog';
      break;
    case 'FZDZ':
      result = 'Moderate freezing drizzle';
      break;
    case '-FZDZ':
      result = 'Light freezing drizzle';
      break;
    case '+FZDZ':
      result = 'Heavy freezing drizzle';
      break;
    case 'RA':
      result = 'Moderate rain';
      break;
    case '-RA':
      result = 'Light rain';
      break;
    case '+RA':
      result = 'Heavy rain';
      break;
    case 'DZ':
      result = 'Moderate drizzle';
      break;
    case '-DZ':
      result = 'Light drizzle';
      break;
    case '+DZ':
      result = 'Heavy drizzle';
      break;
    case '-DZ BR':
      result = 'Light drizzle and mist';
      break;
    case 'DZ BR':
      result = 'Moderate drizzle and mist';
      break;
    case '+DZ BR':
      result = 'Heavy drizzle and mist';
      break;
    case 'PL':
      result = 'Moderate ice pellets';
      break;
    case '-PL':
      result = 'Light ice pellets';
      break;
    case '+PL':
      result = 'Heavy ice pellets';
      break;
    case '-PL BR':
      result = 'Light ice pellets and mist';
      break;
    case 'PL BR':
      result = 'Moderate ice pellets and mist';
      break;
    case '+PL BR':
      result = 'Heavy ice pellets and mist';
      break;
    case '-PL FG':
      result = 'Light ice pellets and fog';
      break;
    case 'PL FG':
      result = 'Moderate ice pellets and fog';
      break;
    case '+PL FG':
      result = 'Heavy ice pellets and fog';
      break;
    case '-PL HZ':
      result = 'Light ice pellets and haze';
      break;
    case 'PL HZ':
      result = 'Moderate ice pellets and haze';
      break;
    case '+PL HZ':
      result = 'Heavy ice pellets and haze';
      break;
    case 'TSRA':
      result = 'Thunderstorms and moderate rain';
      break;
    case '-TSRA':
      result = 'Thunderstorms and light rain';
      break;
    case '+TSRA':
      result = 'Thunderstorms and heavy rain';
      break;
    case 'TSRA BR':
      result = 'Thunderstorms, moderate rain and mist';
      break;
    case '-TSRA BR':
      result = 'Thunderstorms, light rain and mist';
      break;
    case '+TSRA BR':
      result = 'Thunderstorms, heavy rain and mist';
      break;
    case 'TSRA FG':
      result = 'Thunderstorms, moderate rain and fog';
      break;
    case '-TSRA FG':
      result = 'Thunderstorms, light rain and fog';
      break;
    case '+TSRA FG':
      result = 'Thunderstorms, heavy rain and fog';
      break;
    case 'TSSN':
      result = 'Thunderstorms and moderate snow';
      break;
    case '-TSSN':
      result = 'Thunderstorms and light snow';
      break;
    case '+TSSN':
      result = 'Thunderstorms and heavy snow';
      break;
    case 'SN':
      result = 'Moderate snow';
      break;
    case '-SN':
      result = 'Light snow';
      break;
    case '+SN':
      result = 'Heavy snow';
      break;
    case '-SG':
      result = 'Light snow grains';
      break;
    case 'SG':
      result = 'Moderate snow grains';
      break;
    case '+SG':
      result = 'Heavy snow grains';
      break;
    case '-SN BR':
      result = 'Light snow and mist';
      break;
    case 'SN BR':
      result = 'Moderate snow and mist';
      break;
    case '+SN BR':
      result = 'Heavy snow and mist';
      break;
    case '-SN -RA':
      result = 'Light snow and light rain mixed';
      break;
    case '-SHSN DRSN':
      result = 'Light snow showers and drifting snow';
      break;
    case 'SHSN DRSN':
      result = 'Moderate snow showers and drifting snow';
      break;
    case 'DRSN SHSN':
      result = 'Snow showers and drifting snow';
      break;
    case 'DRSN -SN':
      result = 'Light snow and drifting snow';
      break;
    case '+SHSN DRSN':
      result = 'Heavy snow showers and drifting snow';
      break;
    case '-SN DRSN':
      result = 'Light snow and drifting snow';
      break;
    case 'SN DRSN':
      result = 'Moderate snow and drifting snow';
      break;
    case '+SN DRSN':
      result = 'Heavy snow and drifting snow';
      break;
    case '-SG DRSN':
      result = 'Light snow grains and drifting snow';
      break;
    case 'SG DRSN':
      result = 'Moderate snow grains and drifting snow';
      break;
    case '+SG DRSN':
      result = 'Heavy snow grains and drifting snow';
      break;
    case 'SN FZFG BLSN':
      result = 'Moderate snow and freezing fog with blowing snow';
      break;
    case '-SN FZFG BLSN':
      result = 'Light snow and freezing fog with blowing snow';
      break;
    case '+SN FZFG BLSN':
      result = 'Heavy snow and freezing fog with blowing snow';
      break;
    case '-SHSN FZFG BLSN':
      result = 'Light snow showers and freezing fog with blowing snow';
      break;
    case 'SHSN FZFG BLSN':
      result = 'Moderate snow showers and freezing fog with blowing snow';
      break;
    case '+SHSN FZFG BLSN':
      result = 'Heavy snow showers and freezing fog with blowing snow';
      break;
    case 'SHRA':
      result = 'Moderate rain showers';
      break;
    case '-SHRA':
      result = 'Light rain showers';
      break;
    case '+SHRA':
      result = 'Heavy rain showers';
      break;
    case 'SHSN':
      result = 'Moderate snow showers';
      break;
    case '-SHSN':
      result = 'Light snow showers';
      break;
    case '+SHSN':
      result = 'Heavy snow showers';
      break;
    case 'SHPL':
      result = 'Moderate ice pellet showers';
      break;
    case '-SHPL':
      result = 'Light ice pellet showers';
      break;
    case '+SHPL':
      result = 'Heavy ice pellet showers';
      break;
    case 'SHGS':
      result = 'Moderate snow pellet showers';
      break;
    case '-SHGS':
      result = 'Light snow pellet showers';
      break;
    case '+SHGS':
      result = 'Heavy snow pellet showers';
      break;
    case 'SHGR':
      result = 'Moderate hail showers';
      break;
    case '-SHGR':
      result = 'Light hail showers';
      break;
    case '+SHGR':
      result = 'Heavy hail showers';
      break;
    case 'P6SM':
      result = 'Better than 6 miles visibility';
      break;
    case 'SNPL':
      result = 'Moderate snow mixed with ice pellets';
      break;
    case '-SNPL':
      result = 'Light snow mixed with ice pellets';
      break;
    case '+SNPL':
      result = 'Heavy snow mixed with ice pellets';
      break;
    case 'FZDZSN':
      result = 'Freezing drizzle and snow';
      break;
    case 'FZRASN':
      result = 'Freezing rain and snow';
      break;
    case 'FZRAPL':
      result = 'Freezing rain and ice pellets';
      break;
    case 'RAPL':
      result = 'Moderate rain mixed with ice pellets';
      break;
    case '-RAPL':
      result = 'Light rain mixed with ice pellets';
      break;
    case '+RAPL':
      result = 'Heavy rain mixed with ice pellets';
      break;
    case '-RA BR':
      result = 'Light rain and mist';
      break;
    case 'RA BR':
      result = 'Moderate rain and mist';
      break;
    case '+RA BR':
      result = 'Heavy rain and mist';
      break;
    case '-RA BCFG':
      result = 'Light rain and patchy fog';
      break;
    case 'RA BCFG':
      result = 'Moderate rain and patchy fog';
      break;
    case '+RA BCFG':
      result = 'Heavy rain and patchy fog';
      break;
    case 'BR BCFG':
      result = 'Mist and patchy fog';
      break;
    case 'BCFG BR':
      result = 'Patchy fog and mist';
      break;
    case 'BCFG HZ':
      result = 'Patchy fog and haze';
      break;
    case '-RA HZ':
      result = 'Light rain and haze';
      break;
    case 'RA HZ':
      result = 'Moderate rain and haze';
      break;
    case '+RA HZ':
      result = 'Heavy rain and haze';
      break;
    case '-RA FG':
      result = 'Light rain and fog';
      break;
    case 'RA FG':
      result = 'Moderate rain and fog';
      break;
    case '+RA FG':
      result = 'Heavy rain and fog';
      break;
    case 'PLRA':
      result = 'Moderate ice pellets mixed with rain';
      break;
    case '-PLRA':
      result = 'Light ice pellets mixed with rain';
      break;
    case '+PLRA':
      result = 'Heavy ice pellets mixed with rain';
      break;
    case 'PLSN':
      result = 'Moderate ice pellets mixed with snow';
      break;
    case '-PLSN':
      result = 'Light ice pellets mixed with snow';
      break;
    case '+PLSN':
      result = 'Heavy ice pellets mixed with snow';
      break;
    case 'TSSNGS':
      result = 'Thunderstorms, moderate snow and hail';
      break;
    case '-TSSNGS':
      result = 'Thunderstorms, light snow and hail';
      break;
    case '+TSSNGS':
      result = 'Thunderstorms, heavy snow and hail';
      break;
    case 'MIFG':
      result = 'Shallow fog';
      break;
    case 'MIFG BR':
      result = 'Shallow fog and mist';
      break;
    case '-RA -SN BR':
      result = 'Light rain and snow in mist';
      break;
    case '-SN -RA BR':
      result = 'Light snow and rain in mist';
      break;
    case '-VCTSRA':
      result = 'Thunderstorms in the vicinity with light rain';
      break;
    case 'VCTSRA':
      result = 'Thunderstorms in the vicinity with moderate rain';
      break;
    case '+VCTSRA':
      result = 'Thunderstorms in the vicinity with heavy rain';
      break;
    case 'HZ DS SQ':
      result = 'Dust storms and squalls with haze';
      break;
    case 'HZ DS':
      result = 'Dust storms with haze';
      break;
    case 'BR UP':
      result = 'Unknown precipitation type and mist';
      break;
    case 'SS':
      result = 'Moderate sandstorm';
      break;
    case '-SS':
      result = 'Light sandstorm';
      break;
    case '+SS':
      result = 'Heavy sandstorm';
      break;
    case 'DS':
      result = 'Moderate duststorm';
      break;
    case '-DS':
      result = 'Light duststorm';
      break;
    case '+DS':
      result = 'Heavy duststorm';
      break;
    case 'TSRAGR':
      result = 'Thunderstorms, moderate rain and hail';
      break;
    case '-TSRAGR':
      result = 'Thunderstorms, light rain and hail';
      break;
    case '+TSRAGR':
      result = 'Thunderstorms, heavy rain and hail';
      break;
    case 'TSPL':
      result = 'Thunderstorms and moderate ice pellets';
      break;
    case '-TSPL':
      result = 'Thunderstorms and light ice pellets';
      break;
    case '+TSPL':
      result = 'Thunderstorms and heavy ice pellets';
      break;
    case '+FC':
      result = 'Tornado or waterspout';
      break;
    case 'SN BLSN':
      result = 'Moderate snow and blowing snow';
      break;
    case '-SN BLSN':
      result = 'Light snow and blowing snow';
      break;
    case '+SN BLSN':
      result = 'Heavy snow and blowing snow';
      break;
    //no intensity mods
    case 'BLPY':
      result = 'Spray';
      break;
    case 'UP':
      result = 'Unknown precipitation type';
      break;
    case 'SQ':
      result = 'Squalls';
      break;
    case 'FG':
      result = 'Fog';
      break;
    case '-SN FG':
      result = 'Light snow and fog';
      break;
    case 'SN FG':
      result = 'Moderate snow and fog';
      break;
    case '+SN FG':
      result = 'Heavy snow and fog';
      break;
    case 'DRSN':
      result = 'Drifting snow';
      break;
    case 'DRSA':
      result = 'Driving sand';
      break;
    case 'PRFG':
      result = 'Partial fog';
      break;
    case 'BCFG':
      result = 'Patchy fog';
      break;
    case 'BR':
      result = 'Mist';
      break;
    case 'HZ':
      result = 'Haze';
      break;
    case 'FC':
      result = 'Funnel cloud';
      break;
    case 'BLSA':
      result = 'Blowing sand';
      break;
    case 'BLSN':
      result = 'Blowing snow';
      break;
    case 'BLDU':
      result = 'Blowing dust';
      break;
    case 'SKC':
      result = 'Sky clear';
      break;
    case 'CLR':
      result = 'Sky clear below 12,000 feet';
      break;
    case 'TS':
      result = 'Thunderstorms';
      break;
    case 'TS BR':
      result = 'Thunderstorms and mist';
      break;
    case 'TS -FZRA BR':
      result = 'Thunderstorms with light freezing rain and mist';
      break;
    case 'TS FZRA BR':
      result = 'Thunderstorms with moderate freezing rain and mist';
      break;
    case 'TS +FZRA BR':
      result = 'Thunderstorms with heavy freezing rain and mist';
      break;
    case 'TS -FZRA FG':
      result = 'Thunderstorms with light freezing rain and fog';
      break;
    case 'TS FZRA FG':
      result = 'Thunderstorms with moderate freezing rain and fog';
      break;
    case 'TS +FZRA FG':
      result = 'Thunderstorms with heavy freezing rain and fog';
      break;
    case 'TS -FZRA HZ':
      result = 'Thunderstorms with light freezing rain and haze';
      break;
    case 'TS FZRA HZ':
      result = 'Thunderstorms with moderate freezing rain and haze';
      break;
    case 'TS +FZRA HZ':
      result = 'Thunderstorms with heavy freezing rain and haze';
      break;
    case 'TSGS':
      result = 'Thunderstorms and snow pellets';
      break;
    case 'TSGR':
      result = 'Thunderstorms and hail';
      break;
    case 'FZFG':
      result = 'Freezing fog';
      break;
    case '-SN FZFG':
      result = 'Light snow and freezing fog';
      break;
    case 'SN FZFG':
      result = 'Moderate snow and freezing fog';
      break;
    case '+SN FZFG':
      result = 'Heavy snow and freezing fog';
      break;
    case 'VCSH':
      result = 'Showers in the vicinity';
      break;
    case 'DRSN VCSH':
      result = 'Drifting snow and showers in the vicinity';
      break;
    case 'VCTS':
      result = 'Thunderstorms in the vicinity';
      break;
    case 'VCTS BR':
      result = 'Thunderstorms in the vicinity and mist';
      break;
    case 'VCTS HZ':
      result = 'Thunderstorms in the vicinity and haze';
      break;
    case 'VCTS -RA':
      result = 'Thunderstorms in the vicinity and light rain';
      break;
    case 'VCTS RA':
      result = 'Thunderstorms in the vicinity and moderate rain';
      break;
    case 'VCTS +RA':
      result = 'Thunderstorms in the vicinity and heavy rain';
      break;
    case 'VCTS +RA BR':
      result = 'Thunderstorms in the vicinity with heavy rain and mist';
      break;
    case 'VCTS RA BR':
      result = 'Thunderstorms in the vicinity with moderate rain and mist';
      break;
    case 'VCTS -RA BR':
      result = 'Thunderstorms in the vicinity with light rain and mist';
      break;
    case '+RA BR VCTS':
      result = 'Heavy rain and mist with thunderstorms in the vicinity';
      break;
    case 'RA BR VCTS':
      result = 'Moderate rain and mist with thunderstorms in the vicinity';
      break;
    case '-RA BR VCTS':
      result = 'Light rain and mist with thunderstorms in the vicinity';
      break;
    case 'VCSS':
      result = 'Sandstorm in the vicinity';
      break;
    case 'VCDS':
      result = 'Dust storm in the vicinity';
      break;
    case 'VCFG':
      result = 'Fog in the vicinity';
      break;
    case 'SA':
      result = 'Sand';
      break;
    case 'DU':
      result = 'Dust';
      break;
    case 'VA':
      result = 'Volcanic ash';
      break;
    case 'FU':
      result = 'Smoke';
      break;
    case 'HZ FU':
      result = 'Haze and smoke';
      break;
    case 'FU HZ':
      result = 'Smoke and haze';
      break;
    case 'BR FU':
      result = 'Mist and smoke';
      break;
    case 'GR':
      result = 'Hail';
      break;
    case 'GS':
      result = 'Snow grains';
      break;
    case 'IC':
      result = 'Ice cystals';
      break;
    case 'IC HZ':
      result = 'Ice crystals and haze';
      break;
    case 'IC BR':
      result = 'Ice crystals and mist';
      break;
    case 'IC BLSN':
      result = 'Ice crystals and blowing snow';
      break;
    case 'IC DRSN':
      result = 'Ice crystals and drifting snow';
      break;
    case 'IC -SN DRSN':
      result = 'Light snow, ice crystals and drifting snow';
      break;
    case 'VCSH DRSN':
      result = 'Showers in the vicinity and drifting snow';
      break;
    case 'FZFG UP':
      result = 'Unknown precipitation and freezing fog';
      break;
    case '-FZDZ BR':
      result = 'Light freezing drizzle and mist';
      break;
    case 'FZDZ BR':
      result = 'Moderate freezing drizzle and mist';
      break;
    case '+FZDZ BR':
      result = 'Heavy freezing drizzle and mist';
      break;
    case '-FZDZ FZFG':
      result = 'Light freezing drizzle and freezing fog';
      break;
    case 'FZDZ FZFG':
      result = 'Moderate freezing drizzle and freezing fog';
      break;
    case '+FZDZ FZFG':
      result = 'Heavy freezing drizzle and freezing fog';
      break;
    case '-TSPL':
      result = 'Thunderstorms and light ice pellets';
      break;
    case 'TSPL':
      result = 'Thunderstorms and moderate ice pellets';
      break;
    case '+TSPL':
      result = 'Thunderstorms and heavy ice pellets';
      break;
  }
  return result;
};
