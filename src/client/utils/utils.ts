import SunCalc from 'suncalc';
import { initialUserSettingsState } from '../store/user/UserSettings';
import * as fly from '../fly-js/fly';
import { AirportNbmData, RouteProfileDataset } from '../interfaces/route-profile';
import {
  DAY_GRADIENT_COLOR,
  NIGHT_GRADIENT_COLOR,
  NODATA,
  SUNSET_SUNRISE,
  hourInMili,
  probStrings,
  wxStrings,
  intenStrings,
  iPadPortraitWidth,
  mobileLandscapeHeight,
} from './constants';
import * as d3 from 'd3-scale';
import { isSameRoutes, roundCloudHeight } from '../components/map/common/AreoFunctions';
import { SavedItemData } from '../interfaces/saved';

export const flightCategoryToColor = (flightCategory: string): string => {
  return initialUserSettingsState.personalMinimumsState[flightCategory]
    ? initialUserSettingsState.personalMinimumsState[flightCategory].color
    : 'lightslategrey';
};
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
export const makeWeatherString = (
  wx: number,
  prob: number,
  inten: number,
  skyCov: number,
  w_speed: number,
  w_gust: number,
  addCloudCover: boolean,
): string => {
  if (!wx) {
    if (w_speed > 20 && w_gust > 25) {
      return 'Wind over 20 knots and/or wind gust over 25 knots';
    } else {
      if (skyCov < 6) {
        return 'Fair/clear';
      } else if (skyCov < 31) {
        return 'Mostly clear';
      } else if (skyCov < 58) {
        return 'Partly cloudy';
      } else if (skyCov < 88) {
        return 'Mostly cloudy';
      } else {
        return 'Cloudy';
      }
    }
  } else if (wx === 4) {
    let skyString = 'Cloudy';
    if (skyCov < 6) {
      skyString = 'Fair/clear';
    } else if (skyCov < 31) {
      skyString = 'Mostly clear';
    } else if (skyCov < 58) {
      skyString = 'Partly cloudy';
    } else if (skyCov < 88) {
      skyString = 'Mostly cloudy';
    } else {
      skyString = 'Cloudy';
    }
    return addCloudCover
      ? `${skyString} with ${probStrings[prob].toLowerCase()} ${wxStrings[wx]}`
      : `${probStrings[prob]} ${wxStrings[wx]}`;
  } else if (wx === 5) {
    let skyString = 'Cloudy';
    if (skyCov < 6) {
      skyString = 'Fair/clear';
    } else if (skyCov < 31) {
      skyString = 'Mostly clear';
    } else if (skyCov < 58) {
      skyString = 'Partly cloudy';
    } else if (skyCov < 88) {
      skyString = 'Mostly cloudy';
    } else {
      skyString = 'Cloudy';
    }
    return addCloudCover
      ? `${skyString} with a ${probStrings[prob].toLowerCase()} of ${intenStrings[inten]} ${wxStrings[wx]}`
      : `${probStrings[prob]} of ${intenStrings[inten]} ${wxStrings[wx]}`;
  } else {
    if (wx in wxStrings && prob in probStrings && inten in intenStrings) {
      return `${probStrings[prob]} of ${intenStrings[inten]} ${wxStrings[wx]}`;
    }
  }
};
export function getMaxForecastTime(dataset: RouteProfileDataset[]): Date {
  let maxForecast = new Date();
  for (const item of dataset) {
    for (const timeString of item.time) {
      const time = new Date(timeString);
      if (time > maxForecast) {
        maxForecast = time;
      }
    }
  }
  return maxForecast;
}

export function getForecastTimes(dataset: RouteProfileDataset[]): Date[] {
  if (dataset && dataset.length > 0) {
    return dataset[0].time.map((strTime) => new Date(strTime));
  }
  return [];
}

export function getMaxForecastElevation(dataset: RouteProfileDataset[]): number {
  let maxElevation = 0;
  for (const item of dataset) {
    for (const elevation of item.elevations) {
      const el = typeof elevation === 'number' ? elevation : parseInt(elevation, 10);
      if (el > maxElevation) {
        maxElevation = el;
      }
    }
  }
  return maxElevation;
}

export function getMinMaxValueByElevation(
  dataset: RouteProfileDataset[],
  elevation: number,
): { min: number; max: number } {
  let maxValue = Number.NEGATIVE_INFINITY;
  let minValue = Number.POSITIVE_INFINITY;
  for (const item of dataset) {
    for (const subitem of item.data) {
      for (const value of subitem.data) {
        if (value.elevation <= elevation) {
          if (value.value > maxValue) {
            maxValue = value.value;
          }
          if (value.value < minValue) {
            minValue = value.value;
          }
        }
      }
    }
  }
  return { max: maxValue, min: minValue };
}

export function getValueFromDataset(
  datasetAll: RouteProfileDataset[],
  time: Date,
  elevation: number,
  segmentIndex,
): { value: number; time: Date } {
  try {
    const filteredByTime = datasetAll.reduce((prev, curr) => {
      if (prev.time && prev.time.length === 1) {
        const diff = time.getTime() - new Date(curr.time[0]).getTime();
        const diffPrev = time.getTime() - new Date(prev.time[0]).getTime();
        return diff >= 0 && diff < diffPrev ? curr : prev;
      }
      return prev;
    });

    const forecastTime = new Date(filteredByTime.time[0]);
    if (time.getTime() - forecastTime.getTime() < 3600 * 3 * 1000) {
      const filteredByElevation = filteredByTime.data[segmentIndex].data.filter((dataset) => {
        return Math.abs(dataset.elevation - elevation) < 1000;
      });
      if (filteredByElevation.length === 1) {
        return {
          value: filteredByElevation[0].value === NODATA ? null : filteredByElevation[0].value,
          time: new Date(filteredByTime.time[0]),
        };
      } else if (filteredByElevation.length === 2) {
        return {
          value:
            filteredByElevation[0].value === NODATA
              ? null
              : (filteredByElevation[0].value + filteredByElevation[0].value) / 2,
          time: new Date(filteredByTime.time[0]),
        };
      }
    }
    return { value: null, time: null };
  } catch (e) {
    // console.warn(e);
    // console.log(datasetAll, time, elevation, segmentIndex);
    return { value: null, time: null };
  }
}
export function getValuesFromDatasetAllElevationByTime(
  datasetAll: RouteProfileDataset[],
  time: Date,
  segmentIndex,
): { elevation: number; value: number }[] {
  try {
    if (!datasetAll) {
      return [];
    }
    const filteredByTime = datasetAll.reduce((prev, curr) => {
      if (prev.time && prev.time.length === 1) {
        const diff = time.getTime() - new Date(curr.time[0]).getTime();
        const diffPrev = time.getTime() - new Date(prev.time[0]).getTime();
        return diff >= 0 && diff < diffPrev ? curr : prev;
      }
      return prev;
    });

    const forecastTime = new Date(filteredByTime.time[0]);
    if (time.getTime() - forecastTime.getTime() < 3600 * 3 * 1000) {
      return filteredByTime.data[segmentIndex].data;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function getValuesFromDatasetAllElevationByElevation(
  datasetAll: RouteProfileDataset[],
  time: Date,
  segmentIndex,
): { elevation: number; value: number }[] {
  try {
    if (!datasetAll) {
      return [];
    }
    const result = [];
    datasetAll.forEach((dataset) => {
      const filteredByTime = dataset.data[segmentIndex].data.reduce((prev, curr) => {
        if (prev.time) {
          const diff = time.getTime() - new Date(curr.time).getTime();
          const diffPrev = time.getTime() - new Date(prev.time).getTime();
          return diff >= 0 && diff < diffPrev ? curr : prev;
        }
        return prev;
      });

      const forecastTime = new Date(filteredByTime.time);
      if (time.getTime() - forecastTime.getTime() < 3600 * 3 * 1000) {
        result.push({
          elevation: dataset.elevations[0],
          value: filteredByTime.value === NODATA ? null : filteredByTime.value,
        });
      }
    });
    return result;
  } catch (e) {
    return [];
  }
}
export function getValueFromDatasetByElevation(
  datasetAll: RouteProfileDataset[],
  time: Date,
  elevation: number,
  segmentIndex,
): { value: number; time: Date } {
  try {
    if (!datasetAll) {
      return { value: null, time: null };
    }
    const filteredByElevations = datasetAll.filter((dataset) => {
      if (dataset.elevations && dataset.elevations.length === 1) {
        return Math.abs(dataset.elevations[0] - elevation) < 1000;
      }
      return false;
    });

    if (datasetAll.length === 1 && filteredByElevations.length === 0) {
      filteredByElevations.push(datasetAll[0]);
    }

    if (filteredByElevations.length === 1) {
      const filteredByTime = filteredByElevations[0].data[segmentIndex].data.reduce((prev, curr) => {
        if (prev.time) {
          const diff = time.getTime() - new Date(curr.time).getTime();
          const diffPrev = time.getTime() - new Date(prev.time).getTime();
          return diff >= 0 && diff < diffPrev ? curr : prev;
        }
        return prev;
      });
      const forecastTime = new Date(filteredByTime.time);
      if (time.getTime() - forecastTime.getTime() < 3600 * 3 * 1000) {
        return {
          value: filteredByTime.value === NODATA ? null : filteredByTime.value,
          time: new Date(filteredByTime.time),
        };
      }
    } else if (filteredByElevations.length === 2) {
      const filteredByTime_0 = filteredByElevations[0].data[segmentIndex].data.reduce((prev, curr) => {
        if (prev.time) {
          const diff = time.getTime() - new Date(curr.time).getTime();
          const diffPrev = time.getTime() - new Date(prev.time).getTime();
          return diff >= 0 && diff < diffPrev ? curr : prev;
        }
        return prev;
      });
      const forecastTime_0 = new Date(filteredByTime_0.time);
      const filteredByTime_1 = filteredByElevations[1].data[segmentIndex].data.reduce((prev, curr) => {
        if (prev.time && prev.time.length === 1) {
          const diff = time.getTime() - new Date(curr.time).getTime();
          const diffPrev = time.getTime() - new Date(prev.time).getTime();
          return diff >= 0 && diff < diffPrev ? curr : prev;
        }
        return prev;
      });
      const forecastTime_1 = new Date(filteredByTime_1.time);
      if (
        time.getTime() - forecastTime_0.getTime() < 3600 * 3 * 1000 &&
        time.getTime() - forecastTime_1.getTime() < 3600 * 3 * 1000
      ) {
        return {
          value: filteredByTime_0.value === NODATA ? null : (filteredByTime_0.value + filteredByTime_1.value) / 2,
          time: new Date(filteredByTime_0.time),
        };
      }
    }
    return { value: null, time: null };
  } catch (e) {
    return { value: null, time: null };
  }
}

export function getIndexByElevation(datasetAll: RouteProfileDataset[], position: GeoJSON.Position): number {
  if (!datasetAll || datasetAll.length === 0) {
    return -1;
  }
  let closestIndex = 0;
  let closestDistance = Infinity;
  datasetAll[0].data.forEach((dataset, index) => {
    const distance = fly.distanceTo(position[1], position[0], dataset.position[1], dataset.position[0], 6);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex;
}

export function getTimeGradientStops(times: { time: Date; hour: number; minute: number }[]) {
  const sortingTime = [...times];

  const lastTime = sortingTime[sortingTime.length - 1];
  const startStop = {
    level: 0,
    stopColor: getGradientStopColor(sortingTime[0].hour, sortingTime[0].minute),
  };
  const finishStop = {
    level: 100,
    stopColor: getGradientStopColor(lastTime.hour, lastTime.minute),
  };

  const stops = [];
  const { day, night } = SUNSET_SUNRISE;

  const startHourAbs = Math.floor(sortingTime[0].time.getTime() / hourInMili);
  const endHourAbs = Math.floor(lastTime.time.getTime() / hourInMili);
  const pHours = endHourAbs - startHourAbs;

  for (const time of sortingTime) {
    const hour = time.hour;
    const hourAbs = Math.floor(time.time.getTime() / hourInMili);

    const level = Math.round(((hourAbs - startHourAbs) / pHours) * 100);

    if (hour === day.start || hour === day.end) {
      stops.push({
        level,
        stopColor: DAY_GRADIENT_COLOR,
      });
    }

    if (hour === night.start || hour === night.end) {
      stops.push({
        level,
        stopColor: NIGHT_GRADIENT_COLOR,
      });
    }
  }

  return [startStop, ...stops, finishStop];
}

export function getGradientStopColor(hour: number, minutes: number) {
  const { isDay, isNight, isEvening } = getDayStatus(hour, minutes);

  if (isDay) {
    return DAY_GRADIENT_COLOR;
  }
  if (isNight) {
    return NIGHT_GRADIENT_COLOR;
  }

  const hourMinutes = hour + minutes / 60;

  const { night, day } = SUNSET_SUNRISE,
    twilightWhile = night.start - day.end;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const colorTwilight = d3.scaleLinear().domain([0, twilightWhile]).range([NIGHT_GRADIENT_COLOR, DAY_GRADIENT_COLOR]);

  if (isEvening) {
    return colorTwilight(twilightWhile - (hourMinutes - day.end));
  }

  return colorTwilight(hourMinutes - night.end);
}

export function getDayStatus(hour, minutes) {
  const isDay = checkHourIsDay(hour, minutes);
  if (isDay) {
    return {
      isDay: true,
    };
  }

  const isNight = checkHourIsNight(hour, minutes);
  if (isNight) {
    return {
      isNight: true,
    };
  }

  const isEvening = checkHourIsEvening(hour, minutes);
  if (isEvening) {
    return {
      isEvening: true,
    };
  }

  return {
    isMorning: true,
  };
}

export function checkHourIsDay(hour, minutes) {
  const { day } = SUNSET_SUNRISE;
  return hour >= day.start && hour < day.end;
}

export function checkHourIsNight(hour, minutes) {
  const { night, day } = SUNSET_SUNRISE;
  return hour >= night.start || hour < night.end;
}

export function checkHourIsEvening(hour, minutes) {
  const { night, day } = SUNSET_SUNRISE;
  return hour >= day.end && hour < night.start;
}
export function getAirportNbmData(
  data: { time: string; data: AirportNbmData[] }[],
  time: number,
  airportid: string,
): { time: Date; data: AirportNbmData } {
  const nullResult = { time: null, data: null };
  const hours3 = 3 * 3600 * 1000;
  if (!airportid) {
    return nullResult;
  }
  const timeData = data.reduce((prev, curr) => {
    const prevDiff = time - new Date(prev.time).getTime();
    const currDiff = time - new Date(curr.time).getTime();
    if (currDiff >= 0 && currDiff <= hours3 && currDiff < prevDiff) {
      return curr;
    }
    return prev;
  });
  const resultDiff = time - new Date(timeData.time).getTime();
  if (resultDiff < 0 || resultDiff > hours3) {
    return nullResult;
  }
  const airportData = timeData.data.filter((timeD) => {
    return timeD.icaoid === airportid || timeD.faaid === airportid;
  });
  if (airportData.length > 0) {
    return { time: new Date(timeData.time), data: airportData[0] };
  }
  return nullResult;
}

export function makeSkyConditions(
  lowestCloud: number,
  ceiling: number,
  skyCover: number,
): { skyCover: string; cloudBase: number }[] {
  const skyConditions = [];
  if (ceiling > 0) {
    skyConditions.push({
      skyCover: skyCover >= 88 ? 'OVC' : 'BKN',
      cloudBase: ceiling,
    });
    if (lowestCloud > 0 && roundCloudHeight(lowestCloud) !== roundCloudHeight(ceiling)) {
      skyConditions.push({
        skyCover: 'SCT',
        cloudBase: lowestCloud,
      });
    }
  } else if (lowestCloud > 0) {
    let skyCondition: string;
    if (skyCover < 6) {
      skyCondition = 'SKC';
    } else if (skyCover < 31) {
      skyCondition = 'FEW';
    } else {
      skyCondition = 'SCT';
    }
    skyConditions.push({
      skyCover: skyCondition,
      cloudBase: lowestCloud,
    });
  } else {
    skyConditions.push({
      skyCover: 'SKC',
      cloudBase: 0,
    });
  }

  const skyConditionsAsc = skyConditions.sort((a, b) => {
    return a.cloudBase > b.cloudBase ? 1 : -1;
  });
  return skyConditionsAsc;
}
export const getCurrentHour = () => Math.floor(Date.now() / hourInMili);
export const weatherFontContents = {
  'fas fa-question-square': '\uf2fd',
  'fa-solid fa-wind': '\uf72e',
  'fa-solid fa-sun': '\uf185',
  'fa-solid fa-moon': '\uf186',
  'fas fa-sun-cloud': '\uf763',
  'fas fa-moon-cloud': '\uf754',
  'fa-solid fa-cloud-sun': '\uf6c4',
  'fa-solid fa-cloud-moon': '\uf6c3',
  'fas fa-clouds-sun': '\uf746',
  'fas fa-clouds-moon': '\uf745',
  'fa-solid fa-cloud': '\uf0c2',
  'fa-solid fa-cloud-rain': '\uf73d',
  'fa-solid fa-icicles': '\uf7ad',
  'fas fa-cloud-snow': '\uf742',
  'fas fa-cloud-bolt-sun': '\uf76e',
  'fas fa-cloud-bolt-moon': '\uf76d',
  'fa-solid fa-cloud-bolt': '\uf76c',
  'fa-solid fa-cloud-sun-rain': '\uf743',
  'fas fa-cloud-moon-rain': '\uf73c',
  'fa-solid fa-cloud-showers-heavy': '\uf740',
  'fas fa-cloud-sleet': '\uf741',
  'fas fa-fog': '\uf74e',
};
export const calcChartWidth = (viewWidth: number, _viewHeight: number) => {
  if (viewWidth < iPadPortraitWidth) {
    return 900;
  } else {
    return viewWidth - 140;
  }
};
export const calcChartHeight = (_viewWidth: number, viewHeight: number) => {
  if (viewHeight < mobileLandscapeHeight) {
    return viewHeight - 200;
  } else {
    if (_viewWidth < iPadPortraitWidth) {
      return viewHeight - 270;
    }
    return viewHeight - 220;
  }
};
export const isTouchScreenDevice = () => {
  try {
    document.createEvent('TouchEvent');
    return true;
  } catch (e) {
    return false;
  }
};
export function isTouchDevice() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
export function Position2Latlng(pos: GeoJSON.Position) {
  return { lat: pos[1], lng: pos[0] };
}
export function isSameJson(a: any, b: any): boolean {
  return JSON.stringify(a) == JSON.stringify(b);
}

export function isSameSavedItem(a: SavedItemData, b: SavedItemData) {
  switch (a.type) {
    case 'airport':
      return a.data.key === b.data.key;
    case 'imagery':
      return a.data.FAVORITE_ID === b.data.FAVORITE_ID;
    case 'route':
      return isSameRoutes(a.data, b.data);
  }
}
