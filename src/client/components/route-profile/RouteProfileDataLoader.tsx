/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useSelector } from 'react-redux';
import { selectActiveRoute } from '../../store/route/routes';
import L from 'leaflet';
import * as fly from '../../fly-js/fly';
import * as d3 from 'd3-scale';
import { getFuzzyLocalTimeFromPoint } from '@mapbox/timespace';
import { Route, RoutePoint } from '../../interfaces/route';
import { useEffect, useState } from 'react';
import 'leaflet-arc';
import { useGetRoutesQuery } from '../../store/route/routeApi';
import { selectAuth } from '../../store/auth/authSlice';
import {
  routeProfileApi,
  useGetRouteProfileStateQuery,
  useQueryAirportPropertiesMutation,
  useQueryCaturbDataMutation,
  useQueryNbmFlightCategoryMutation,
  useQueryGfsWindDirectionDataMutation,
  useQueryGfsWindSpeedDataMutation,
  useQueryHumidityDataMutation,
  useQueryIcingProbDataMutation,
  useQueryIcingSevDataMutation,
  useQueryIcingSldDataMutation,
  useQueryMwturbDataMutation,
  useQueryNbmAllMutation,
  useQueryNbmCloudCeilingMutation,
  useQueryNbmCloudbaseMutation,
  useQueryNbmDewpointMutation,
  useQueryNbmGustMutation,
  useQueryNbmSkycoverMutation,
  useQueryNbmTempMutation,
  useQueryNbmVisMutation,
  useQueryNbmWindDirMutation,
  useQueryNbmWindSpeedMutation,
  useQueryNbmWx1Mutation,
  useQueryTemperatureDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { CircularProgress } from '@mui/material';
import { QueryStatus, skipToken } from '@reduxjs/toolkit/query';
import { useDispatch } from 'react-redux';
import { NbmProperties, RouteProfileDataset, RouteSegment } from '../../interfaces/route-profile';
import { selectSettings } from '../../store/user/UserSettings';
import { setRouteSegments } from '../../store/route-profile/RouteProfile';
import { windQueryElevations } from './WindChart';
import { useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import { useGetAirportQuery } from '../../store/route/airportApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';

export const totalNumberOfElevations = 512;

export const contourMin = -100;

export const contourMax = 60;

export const flightCategoryDivide = 10;

export const SUNSET_SUNRISE = {
  night: {
    start: 20,
    end: 4,
  },
  day: {
    start: 7,
    end: 17,
  },
};

export const NIGHT_GRADIENT_COLOR = 'rgb(24, 33, 48)';
export const DAY_GRADIENT_COLOR = 'rgb(109, 154, 229)';

export const cacheKeys = {
  airportProperties: 'airport-properties',
  gfsWindspeed: 'gfs-windspeed',
  gfsWinddirection: 'gfs-winddirection',
  gfsTemperature: 'gfs-temperature',
  gfsHumidity: 'gfs-humidity',
  caturb: 'caturb',
  mwturb: 'mwturb',
  icingProb: 'icing-prob',
  icingSev: 'icing-sev',
  icingSld: 'icing-sld',
  nbmCloudbase: 'nbm-cloudbase',
  nbmCloudCeiling: 'nbm-cloudceiling',
  nbmDewpoint: 'nbm-dewpoint',
  nbmGust: 'nbm-gust',
  nbmSkycover: 'nbm-skycover',
  nbmTemp: 'nbm-temp',
  nbmVis: 'nbm-vis',
  nbmWindDir: 'nbm-winddir',
  nbmWindSpeed: 'nbm-windspeed',
  nbmWx1: 'nbm-wx1',
  nbmAllAirport: 'nbm-all-airport',
  elevation: 'elevation-api',
};

/**
 * calculate length of polyline.
 * @param coordinateList line coordinates
 * @param inMile flag to get retrun nautical miles or kilometers
 * @returns nautical miles or kilometers
 */
function getLineLength(coordinateList: GeoJSON.Position[], inMile = false): number {
  let routeLength = 0;
  const latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
  latlngs.reduce((a, b) => {
    if (a.lat !== b.lat || a.lng !== b.lng) {
      routeLength += a.distanceTo(b);
    }
    return b;
  });
  return inMile ? routeLength / 1852 : routeLength / 1000;
}

function getLineLengthAndAccDistances(
  coordinateList: GeoJSON.Position[],
  inMile = false,
): { length: number; segments: any[] } {
  let routeLength = 0;
  const latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
  const points = [{ point: latlngs[0], accDistance: 0 }];
  latlngs.reduce((a, b) => {
    if (a.lat !== b.lat || a.lng !== b.lng) {
      routeLength += a.distanceTo(b);
    }
    points.push({ point: b, accDistance: inMile ? routeLength / 1852 : routeLength / 1000 });
    return b;
  });
  return { length: inMile ? routeLength / 1852 : routeLength / 1000, segments: points };
}

/**
 * Return airport type of RoutePoint closest to point in radius
 *
 * @param  {RoutePoint[]} airports is array of airport type of RoutePoint
 * @param  {L.LatLng} point is the center of search airport
 * @param  {Number} radius is the meters value
 * @return {RoutePoint}
 */
function findAirportByPoint(airports: RoutePoint[], point: L.LatLng, radius: number) {
  let airport: RoutePoint;
  let minDistance = Number.POSITIVE_INFINITY;
  for (const routePoint of airports) {
    const dist = point.distanceTo(L.latLng(routePoint.position.coordinates[1], routePoint.position.coordinates[0]));
    if (dist < radius) {
      if (dist < minDistance) {
        minDistance = dist;
        airport = routePoint;
      }
    }
  }
  return airport;
}

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
        return { value: filteredByElevation[0].value, time: new Date(filteredByTime.time[0]) };
      } else if (filteredByElevation.length === 2) {
        return {
          value: (filteredByElevation[0].value + filteredByElevation[0].value) / 2,
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
        result.push({ elevation: dataset.elevations[0], value: filteredByTime.value });
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
        return { value: filteredByTime.value, time: new Date(filteredByTime.time) };
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
          value: (filteredByTime_0.value + filteredByTime_1.value) / 2,
          time: new Date(filteredByTime_0.time),
        };
      }
    }
    return { value: null, time: null };
  } catch (e) {
    return { value: null, time: null };
  }
}

export function getRouteLength(route: Route, inMile = false): number {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const routeLengthNm = getLineLength(coordinateList, inMile);
  return routeLengthNm;
}

interface Airport {
  point: L.LatLng;
  isRoutePoint: boolean;
  airport?: RoutePoint;
}

export function interpolateRouteWithStation(route: Route, divideNumber, airports: RoutePoint[]): Airport[] {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const totalLength = getLineLength(coordinateList);
  const interpolatedLatlngs = new Array<Airport>();
  const latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
  latlngs.map((latlng, index) => {
    if (index < latlngs.length - 1) {
      const nextLatlng = latlngs[index + 1];
      const segmentLength = latlng.distanceTo(nextLatlng);
      const vertices = Math.round((segmentLength * divideNumber) / (totalLength * 1000)) + 1;
      const segmentInterval = (totalLength * 1000) / divideNumber;
      //@ts-ignore
      const polyline = L.Polyline.Arc(latlng, nextLatlng, { color: '#f0fa', weight: 6, pane: 'route-line', vertices });
      const points: Airport[] = polyline.getLatLngs().map((latlng) => ({ point: latlng }));
      if (index === 0) {
        points[0].airport = route.departure;
        points[0].isRoutePoint = true;
        let routePoint = route.destination;
        if (route.routeOfFlight && route.routeOfFlight.length > 0) {
          routePoint = route.routeOfFlight[0].routePoint;
        }
        points[points.length - 1].airport = routePoint;
        points[points.length - 1].isRoutePoint = true;
        for (let i = 1; i < points.length - 1; i++) {
          const airport = findAirportByPoint(airports, points[i].point, segmentInterval / 2);
          points[i].airport = airport;
          points[i].isRoutePoint = false;
        }
        interpolatedLatlngs.push(...points);
      } else {
        if (index > 0 && index < latlngs.length - 2) {
          /////////////////////
          // departure, rf[0], rf[1], rf[2], dest
          //  0,           1,     2,     3,    4
          //    index === 0, index=1, index=2, index=3
          points[points.length - 1].airport = route.routeOfFlight[index].routePoint;
          points[points.length - 1].isRoutePoint = true;
        } else if (index === latlngs.length - 2) {
          points[points.length - 1].airport = route.destination;
          points[points.length - 1].isRoutePoint = true;
        }
        for (let i = 0; i < points.length - 1; i++) {
          const airport = findAirportByPoint(airports, points[i].point, segmentInterval / 2);
          points[i].airport = airport;
          points[i].isRoutePoint = false;
        }

        interpolatedLatlngs.push(...points.slice(1));
      }
      //@ts-ignore
    }
  });
  return interpolatedLatlngs;
}

export function interpolateRoute(route: Route, divideNumber, returnAsLeaflet = false): L.LatLng[] {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const totalLength = getLineLength(coordinateList);
  let interpolatedLatlngs = new Array<L.LatLng>();
  const latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
  latlngs.map((latlng, index) => {
    if (index < latlngs.length - 1) {
      const nextLatlng = latlngs[index + 1];
      const segmentLength = latlng.distanceTo(nextLatlng);
      const vertices = Math.round((segmentLength * divideNumber) / (totalLength * 1000)) + 1;
      //@ts-ignore
      const polyline = L.Polyline.Arc(latlng, nextLatlng, { color: '#f0fa', weight: 6, pane: 'route-line', vertices });
      //@ts-ignore
      interpolatedLatlngs.push(...(index > 0 ? polyline.getLatLngs().slice(1) : polyline.getLatLngs()));
    }
  });
  if (interpolatedLatlngs.length > 2 && divideNumber === totalNumberOfElevations) {
    const courseStart = fly.trueCourse(
      interpolatedLatlngs[1].lat,
      interpolatedLatlngs[1].lng,
      interpolatedLatlngs[0].lat,
      interpolatedLatlngs[0].lng,
      2,
    );
    const courseEnd = fly.trueCourse(
      interpolatedLatlngs[interpolatedLatlngs.length - 2].lat,
      interpolatedLatlngs[interpolatedLatlngs.length - 2].lng,
      interpolatedLatlngs[interpolatedLatlngs.length - 1].lat,
      interpolatedLatlngs[interpolatedLatlngs.length - 1].lng,
      2,
    );
    const extLength = totalLength / 13 / 2;
    const extStart = fly.enroute(interpolatedLatlngs[0].lat, interpolatedLatlngs[0].lng, courseStart, extLength, 6);
    const extEnd = fly.enroute(
      interpolatedLatlngs[interpolatedLatlngs.length - 1].lat,
      interpolatedLatlngs[interpolatedLatlngs.length - 1].lng,
      courseEnd,
      extLength,
      6,
    );
    interpolatedLatlngs = [
      L.latLng(extStart.latitude.degrees, extStart.longitude.degrees),
      ...interpolatedLatlngs,
      L.latLng(extEnd.latitude.degrees, extEnd.longitude.degrees),
    ];
  }
  return returnAsLeaflet ? interpolatedLatlngs : L.GeoJSON.latLngsToCoords(interpolatedLatlngs);
}

export function getSegmentsCount(route: Route): number {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const routeLengthNm = getLineLength(coordinateList, true);
  if (routeLengthNm <= 250) {
    return 7;
  } else if (routeLengthNm <= 500) {
    return 9;
  } else if (routeLengthNm <= 800) {
    return 11;
  } else {
    return 13;
  }
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

  const startHour = sortingTime[0].hour;
  const pHours = lastTime.hour - startHour;

  for (let i = startHour; i <= lastTime.hour; i++) {
    const hour = i % 24;

    const level = Math.round(((i - startHour) / pHours) * 100);

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

function getGradientStopColor(hour: number, minutes: number) {
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

  //@ts-ignore
  const colorTwilight = d3.scaleLinear().domain([0, twilightWhile]).range([NIGHT_GRADIENT_COLOR, DAY_GRADIENT_COLOR]);

  if (isEvening) {
    return colorTwilight(twilightWhile - (hourMinutes - day.end));
  }

  return colorTwilight(hourMinutes - night.end);
}

function getDayStatus(hour, minutes) {
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

function checkHourIsDay(hour, minutes) {
  const { day } = SUNSET_SUNRISE;
  return hour >= day.start && hour < day.end;
}

function checkHourIsNight(hour, minutes) {
  const { night, day } = SUNSET_SUNRISE;
  return hour >= night.start || hour < night.end;
}

function checkHourIsEvening(hour, minutes) {
  const { night, day } = SUNSET_SUNRISE;
  return hour >= day.end && hour < night.start;
}

const RouteProfileDataLoader = () => {
  const auth = useSelector(selectAuth);
  const userSettings = useSelector(selectSettings);
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null);
  const observationTime = userSettings.observation_time;
  const routeSegments = useSelector(selectRouteSegments);
  const [queryCaturbData, queryCaturbDataResult] = useQueryCaturbDataMutation({ fixedCacheKey: cacheKeys.caturb });
  const [queryMwturbData, queryMwturbDataResult] = useQueryMwturbDataMutation({ fixedCacheKey: cacheKeys.mwturb });
  const [queryHumidityData, queryhumidityDataResult] = useQueryHumidityDataMutation({
    fixedCacheKey: cacheKeys.gfsHumidity,
  });
  const [queryTemperatureData, queryTemperatureDataResult] = useQueryTemperatureDataMutation({
    fixedCacheKey: cacheKeys.gfsTemperature,
  });
  const [queryGfsWindDirectionData, queryGfsWindDirectionDataResult] = useQueryGfsWindDirectionDataMutation({
    fixedCacheKey: cacheKeys.gfsWinddirection,
  });
  const [queryGfsWindSpeedData, queryGfsWindSpeedDataResult] = useQueryGfsWindSpeedDataMutation({
    fixedCacheKey: cacheKeys.gfsWindspeed,
  });
  const [queryIcingProbData, queryIcingProbDataResult] = useQueryIcingProbDataMutation({
    fixedCacheKey: cacheKeys.icingProb,
  });
  const [queryIcingSevData, queryIcingSevDataResult] = useQueryIcingSevDataMutation({
    fixedCacheKey: cacheKeys.icingSev,
  });
  const [queryIcingSldData, queryIcingSldDataResult] = useQueryIcingSldDataMutation({
    fixedCacheKey: cacheKeys.icingSld,
  });
  const [queryNbmCloudbase, queryNbmCloudbaseResult] = useQueryNbmCloudbaseMutation({
    fixedCacheKey: cacheKeys.nbmCloudbase,
  });
  const [queryNbmFlightCategory, queryNbmFlightCatResult] = useQueryNbmFlightCategoryMutation({
    fixedCacheKey: cacheKeys.nbmCloudCeiling,
  });
  const [queryNbmDewpoint, queryNbmDewpointResult] = useQueryNbmDewpointMutation({
    fixedCacheKey: cacheKeys.nbmDewpoint,
  });
  const [queryNbmGust, queryNbmGustResult] = useQueryNbmGustMutation({
    fixedCacheKey: cacheKeys.nbmGust,
  });
  const [queryNbmTemp, queryNbmTempResult] = useQueryNbmTempMutation({
    fixedCacheKey: cacheKeys.nbmTemp,
  });
  const [queryNbmWindDir, queryNbmWindDirResult] = useQueryNbmWindDirMutation({
    fixedCacheKey: cacheKeys.nbmWindDir,
  });
  const [queryNbmWindSpeed, queryNbmWindSpeedResult] = useQueryNbmWindSpeedMutation({
    fixedCacheKey: cacheKeys.nbmWindSpeed,
  });
  const [queryNbmWx1, queryNbmWx1Result] = useQueryNbmWx1Mutation({
    fixedCacheKey: cacheKeys.nbmWx1,
  });
  const [queryNbmAllAirports, queryNbmAllAirportResult] = useQueryNbmAllMutation({
    fixedCacheKey: cacheKeys.nbmAllAirport,
  });
  const [, queryElevationsResult] = useQueryElevationApiMutation({ fixedCacheKey: cacheKeys.elevation });
  const activeRoute = useSelector(selectActiveRoute);
  const dispatch = useDispatch();
  const [forceRefetch, setForceRefetch] = useState(Date.now());
  let isLoading = false;
  const { isSuccess: isLoadedAirports, data: airportsTable } = useGetAirportQuery('');

  if (auth.id) {
    useGetRoutesQuery('');
  }

  function resetDataCaches() {
    queryGfsWindSpeedDataResult.reset();
    queryGfsWindDirectionDataResult.reset();
    queryTemperatureDataResult.reset();
    queryhumidityDataResult.reset();
    queryIcingProbDataResult.reset();
    queryIcingSevDataResult.reset();
    queryIcingSldDataResult.reset();
    queryCaturbDataResult.reset();
    queryMwturbDataResult.reset();
    queryElevationsResult.reset();
    queryNbmCloudbaseResult.reset();
    queryNbmFlightCatResult.reset();
    queryNbmDewpointResult.reset();
    queryNbmGustResult.reset();
    queryNbmTempResult.reset();
    queryNbmWindDirResult.reset();
    queryNbmWindSpeedResult.reset();
    queryNbmWx1Result.reset();
    queryNbmAllAirportResult.reset();
  }

  function queryGfsWindSpeed(dependencyResult: {
    status: QueryStatus;
    isUninitialized: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }) {
    if (activeRoute && (!dependencyResult || (!dependencyResult.isLoading && !dependencyResult.isUninitialized))) {
      const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
      if (!queryGfsWindSpeedDataResult.isLoading && !queryGfsWindSpeedDataResult.isSuccess) {
        queryGfsWindSpeedData({ queryPoints: positions, elevations: windQueryElevations });
      }
    }
  }

  function queryGfsWindDir(dependencyResult: {
    status: QueryStatus;
    isUninitialized: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }) {
    if (activeRoute && (!dependencyResult || (!dependencyResult.isLoading && !dependencyResult.isUninitialized))) {
      if (!queryGfsWindDirectionDataResult.isLoading && !queryGfsWindDirectionDataResult.isSuccess) {
        const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
        queryGfsWindDirectionData({ queryPoints: positions, elevations: windQueryElevations });
      }
    }
  }

  function queryGfsTemp(dependencyResult: {
    status: QueryStatus;
    isUninitialized: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }) {
    if (activeRoute && (!dependencyResult || (!dependencyResult.isLoading && !dependencyResult.isUninitialized))) {
      if (!queryTemperatureDataResult.isSuccess && !queryTemperatureDataResult.isLoading) {
        const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
        queryTemperatureData({ queryPoints: positions });
      }
    }
  }

  function queryGfsHumi(dependencyResult: {
    status: QueryStatus;
    isUninitialized: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }) {
    if (activeRoute && (!dependencyResult || (!dependencyResult.isLoading && !dependencyResult.isUninitialized))) {
      if (!queryhumidityDataResult.isLoading && !queryhumidityDataResult.isSuccess) {
        const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
        queryHumidityData({ queryPoints: positions });
      }
    }
  }

  function queryIcing(dependencyResult: {
    status: QueryStatus;
    isUninitialized: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }) {
    if (activeRoute && (!dependencyResult || (!dependencyResult.isLoading && !dependencyResult.isUninitialized))) {
      const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
      if (!queryIcingProbDataResult.isLoading && !queryIcingProbDataResult.isSuccess)
        queryIcingProbData({ queryPoints: positions });
      if (!queryIcingSevDataResult.isLoading && !queryIcingSevDataResult.isSuccess)
        queryIcingSevData({ queryPoints: positions });
      if (!queryIcingSldDataResult.isLoading && !queryIcingSldDataResult.isSuccess)
        queryIcingSldData({ queryPoints: positions });
    }
  }

  function queryTurb(dependencyResult: {
    status: QueryStatus;
    isUninitialized: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }) {
    if (activeRoute && (!dependencyResult || (!dependencyResult.isLoading && !dependencyResult.isUninitialized))) {
      const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
      if (!queryCaturbDataResult.isLoading && !queryCaturbDataResult.isSuccess)
        queryCaturbData({ queryPoints: positions });
      if (!queryMwturbDataResult.isLoading && !queryMwturbDataResult.isSuccess)
        queryMwturbData({ queryPoints: positions });
    }
  }

  function queryNbm(dependencyResult: {
    status: QueryStatus;
    isUninitialized: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }) {
    if (activeRoute && (!dependencyResult || (!dependencyResult.isLoading && !dependencyResult.isUninitialized))) {
      const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
      const positions_2 = interpolateRoute(activeRoute, getSegmentsCount(activeRoute) * flightCategoryDivide);
      if (!queryNbmDewpointResult.isLoading && !queryNbmDewpointResult.isSuccess)
        queryNbmDewpoint({ queryPoints: positions });
      if (!queryNbmGustResult.isLoading && !queryNbmGustResult.isSuccess) queryNbmGust({ queryPoints: positions });
      if (!queryNbmTempResult.isLoading && !queryNbmTempResult.isSuccess) queryNbmTemp({ queryPoints: positions });
      if (!queryNbmWindDirResult.isLoading && !queryNbmWindDirResult.isSuccess)
        queryNbmWindDir({ queryPoints: positions });
      if (!queryNbmWindSpeedResult.isLoading && !queryNbmWindSpeedResult.isSuccess)
        queryNbmWindSpeed({ queryPoints: positions });
      if (!queryNbmWx1Result.isLoading && !queryNbmWx1Result.isSuccess) queryNbmWx1({ queryPoints: positions });
    }
  }

  function queryNbmFlightCat(dependencyResult: {
    status: QueryStatus;
    isUninitialized: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }) {
    if (activeRoute && (!dependencyResult || (!dependencyResult.isLoading && !dependencyResult.isUninitialized))) {
      const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute) * flightCategoryDivide);
      if (!queryNbmFlightCatResult.isLoading && !queryNbmFlightCatResult.isSuccess)
        queryNbmFlightCategory({ queryPoints: positions });
    }
  }

  useEffect(() => {
    resetDataCaches();
    setForceRefetch(Date.now());
  }, [activeRoute]);

  switch (routeProfileApiState.chartType) {
    case 'Wind':
      useEffect(() => {
        queryGfsWindSpeed(null);
      }, [forceRefetch]);
      useEffect(() => {
        queryGfsWindDir(queryGfsWindSpeedDataResult);
      }, [queryGfsWindSpeedDataResult.isLoading]);
      useEffect(() => {
        queryGfsTemp(queryGfsWindDirectionDataResult);
      }, [queryGfsWindDirectionDataResult.isLoading]);
      useEffect(() => {
        queryNbm(queryTemperatureDataResult);
      }, [queryTemperatureDataResult.isLoading]);
      useEffect(() => {
        queryNbmFlightCat(queryNbmWindSpeedResult);
      }, [queryNbmWindSpeedResult.isLoading]);
      useEffect(() => {
        queryIcing(queryNbmFlightCatResult);
      }, [queryNbmFlightCatResult.isLoading]);

      useEffect(() => {
        queryTurb(queryNbmFlightCatResult);
      }, [queryNbmFlightCatResult.isLoading]);

      useEffect(() => {
        queryGfsHumi(queryIcingProbDataResult);
      }, [queryIcingProbDataResult.isLoading]);
      isLoading = !queryGfsWindDirectionDataResult.isSuccess;
      break;
    case 'Turb':
      useEffect(() => {
        queryTurb(null);
      }, [forceRefetch]);

      useEffect(() => {
        queryGfsWindSpeed(queryCaturbDataResult);
      }, [queryCaturbDataResult.isLoading]);

      useEffect(() => {
        queryGfsWindDir(queryGfsWindSpeedDataResult);
      }, [queryGfsWindSpeedDataResult.isLoading]);
      useEffect(() => {
        queryNbm(queryGfsWindDirectionDataResult);
      }, [queryGfsWindDirectionDataResult.isLoading]);
      useEffect(() => {
        queryNbmFlightCat(queryNbmWindSpeedResult);
      }, [queryNbmWindSpeedResult.isLoading]);
      useEffect(() => {
        queryGfsTemp(queryNbmFlightCatResult);
      }, [queryNbmFlightCatResult.isLoading]);
      useEffect(() => {
        queryIcing(queryTemperatureDataResult);
      }, [queryTemperatureDataResult.isLoading]);

      useEffect(() => {
        queryGfsHumi(queryIcingProbDataResult);
      }, [queryIcingProbDataResult.isLoading]);
      isLoading = !queryCaturbDataResult.isSuccess;
      break;
    case 'Icing':
      useEffect(() => {
        queryIcing(null);
      }, [forceRefetch]);
      useEffect(() => {
        queryGfsWindSpeed(queryIcingProbDataResult);
      }, [queryIcingProbDataResult.isLoading]);
      useEffect(() => {
        queryGfsWindDir(queryGfsWindSpeedDataResult);
      }, [queryGfsWindSpeedDataResult.isLoading]);
      useEffect(() => {
        queryGfsTemp(queryGfsWindDirectionDataResult);
      }, [queryGfsWindDirectionDataResult.isLoading]);
      useEffect(() => {
        queryNbm(queryTemperatureDataResult);
      }, [queryTemperatureDataResult.isLoading]);
      useEffect(() => {
        queryNbmFlightCat(queryNbmWindSpeedResult);
      }, [queryNbmWindSpeedResult.isLoading]);

      useEffect(() => {
        queryTurb(queryNbmFlightCatResult);
      }, [queryNbmFlightCatResult.isLoading]);

      useEffect(() => {
        queryGfsHumi(queryCaturbDataResult);
      }, [queryCaturbDataResult.isLoading]);
      isLoading = !queryIcingProbDataResult.isSuccess;
      break;
    case 'Clouds':
      useEffect(() => {
        queryNbmFlightCat(null);
      }, [forceRefetch]);
      useEffect(() => {
        queryNbm(queryNbmFlightCatResult);
      }, [queryNbmFlightCatResult.isLoading]);
      useEffect(() => {
        queryIcing(queryNbmWindSpeedResult);
      }, [queryNbmWindSpeedResult.isLoading]);
      useEffect(() => {
        queryGfsHumi(queryIcingSevDataResult);
      }, [queryIcingSevDataResult.isLoading]);
      useEffect(() => {
        queryGfsTemp(queryhumidityDataResult);
      }, [queryhumidityDataResult.isLoading]);
      useEffect(() => {
        queryGfsWindDir(queryTemperatureDataResult);
      }, [queryTemperatureDataResult.isLoading]);
      useEffect(() => {
        queryGfsWindSpeed(queryGfsWindDirectionDataResult);
      }, [queryGfsWindDirectionDataResult.isLoading]);

      useEffect(() => {
        queryTurb(queryGfsWindSpeedDataResult);
      }, [queryGfsWindSpeedDataResult.isLoading]);

      isLoading = !queryIcingProbDataResult.isSuccess;
      break;
  }

  function readNbmProperties(time: Date, segmentIndex): NbmProperties {
    const { value: cloudbase, time: forecastTime } = getValueFromDatasetByElevation(
      queryNbmCloudbaseResult.data,
      time,
      null,
      segmentIndex,
    );
    const { value: cloudceiling } = getValueFromDatasetByElevation(
      queryNbmFlightCatResult.data?.cloudceiling,
      time,
      null,
      segmentIndex * flightCategoryDivide,
    );
    const { value: dewpoint } = getValueFromDatasetByElevation(queryNbmDewpointResult.data, time, null, segmentIndex);
    const { value: gust } = getValueFromDatasetByElevation(queryNbmGustResult.data, time, null, segmentIndex);
    const { value: skycover } = getValueFromDatasetByElevation(
      queryNbmFlightCatResult.data?.skycover,
      time,
      null,
      segmentIndex * flightCategoryDivide,
    );
    const { value: temperature } = getValueFromDatasetByElevation(queryNbmTempResult.data, time, null, segmentIndex);
    const { value: visibility } = getValueFromDatasetByElevation(
      queryNbmFlightCatResult.data?.visibility,
      time,
      null,
      segmentIndex * flightCategoryDivide,
    );
    const { value: winddir } = getValueFromDatasetByElevation(queryNbmWindDirResult.data, time, null, segmentIndex);
    const { value: windspeed } = getValueFromDatasetByElevation(queryNbmWindSpeedResult.data, time, null, segmentIndex);
    const { value: wx_1 } = getValueFromDatasetByElevation(queryNbmWx1Result.data, time, null, segmentIndex);
    return {
      cloudbase,
      cloudceiling,
      dewpoint,
      gust,
      skycover,
      temperature,
      visibility,
      winddir,
      windspeed,
      wx_1,
      time: forecastTime?.getTime(),
    };
  }

  function buildSegments() {
    const positions = interpolateRouteWithStation(activeRoute, getSegmentsCount(activeRoute), airportsTable);
    const departureTime = getFuzzyLocalTimeFromPoint(observationTime, [positions[0].point.lng, positions[0].point.lat]);

    const initialSegment: RouteSegment = {
      position: { lat: positions[0].point.lat, lng: positions[0].point.lng },
      accDistance: 0,
      arriveTime: new Date(observationTime).getTime(),
      course: fly.trueCourse(
        positions[0].point.lat,
        positions[0].point.lng,
        positions[1].point.lat,
        positions[1].point.lng,
        2,
      ),
      airport: positions[0].airport,
      isRoutePoint: true,
      segmentNbmProps: readNbmProperties(new Date(observationTime), 0),
      departureTime: {
        full: departureTime.format('MM/dd/YYYY hh:mm A z'),
        date: departureTime.format('MM/dd/YYYY'),
        time: departureTime.format('HH:mm z'),
        hour: departureTime.hour(),
        minute: departureTime.minute(),
      },
    };
    const segments: RouteSegment[] = [initialSegment];
    positions.reduce((acc: RouteSegment, curr: Airport, index) => {
      try {
        const dist = fly.distanceTo(acc.position.lat, acc.position.lng, curr.point.lat, curr.point.lng, 2);
        const course = fly.trueCourse(acc.position.lat, acc.position.lng, curr.point.lat, curr.point.lng, 2);
        if (!dist) return acc;
        let speed: number;
        if (activeRoute.useForecastWinds) {
          if (queryGfsWindSpeedDataResult.isSuccess && queryGfsWindDirectionDataResult.isSuccess) {
            const { value: speedValue } = getValueFromDatasetByElevation(
              queryGfsWindSpeedDataResult.data,
              new Date(acc.arriveTime),
              activeRoute.altitude,
              index,
            );
            const { value: dirValue } = getValueFromDatasetByElevation(
              queryGfsWindDirectionDataResult.data,
              new Date(acc.arriveTime),
              activeRoute.altitude,
              index,
            );
            const { groundSpeed } = fly.calculateHeadingAndGroundSpeed(
              userSettings.true_airspeed,
              course,
              speedValue,
              dirValue,
              2,
            );
            speed = groundSpeed;
          } else {
            speed = userSettings.true_airspeed;
          }
        } else {
          speed = userSettings.true_airspeed;
        }
        const newTime = new Date(acc.arriveTime).getTime() + (3600 * 1000 * dist) / speed;
        const departureTime = getFuzzyLocalTimeFromPoint(newTime, [curr.point.lng, curr.point.lat]);

        const segment: RouteSegment = {
          position: { lat: curr.point.lat, lng: curr.point.lng },
          accDistance: acc.accDistance + dist,
          arriveTime: newTime,
          course: course,
          airport: curr.airport,
          isRoutePoint: curr.isRoutePoint,
          segmentNbmProps: readNbmProperties(new Date(newTime), index),
          departureTime: {
            full: departureTime.format('MMM DD, YYYY HH:mm z'),
            date: departureTime.format('MM/DD/YYYY'),
            time: departureTime.format('HH:mm z'),
            hour: departureTime.hour(),
            minute: departureTime.minute(),
          },
        };
        segments.push(segment);
        return { ...segment };
      } catch (err) {
        console.warn(err);
        return acc;
      }
    }, initialSegment);

    const airportPoints = segments.map((seg) => (seg.airport ? seg.airport.position.coordinates : null));
    if (!queryNbmAllAirportResult.isSuccess && !queryNbmAllAirportResult.isLoading)
      queryNbmAllAirports({ queryPoints: airportPoints });
    dispatch(setRouteSegments(segments));
  }
  useEffect(() => {
    if (activeRoute && isLoadedAirports) {
      buildSegments();
    }
  }, [
    queryGfsWindSpeedDataResult.isSuccess,
    queryGfsWindDirectionDataResult.isSuccess,
    queryNbmFlightCatResult.isSuccess,
    queryNbmWx1Result.isSuccess,
    observationTime,
    userSettings.true_airspeed,
    activeRoute,
  ]);

  useEffect(() => {
    if (queryNbmAllAirportResult.data) {
      if (routeSegments.find((seg) => seg.airportNbmProps)) {
        return;
      }
      const newSegments = routeSegments.map((seg, index) => {
        if (seg.airport) {
          const { value: cloudbase, time: forecastTime } = getValueFromDatasetByElevation(
            queryNbmAllAirportResult.data.cloudbase,
            new Date(seg.arriveTime),
            null,
            index,
          );
          return {
            ...seg,
            airportNbmProps: {
              time: forecastTime?.getTime(),
              cloudbase: cloudbase,
              cloudceiling: getValueFromDatasetByElevation(
                queryNbmAllAirportResult.data.cloudceiling,
                new Date(seg.arriveTime),
                null,
                index,
              ).value,
              dewpoint: getValueFromDatasetByElevation(
                queryNbmAllAirportResult.data.dewpoint,
                new Date(seg.arriveTime),
                null,
                index,
              ).value,
              gust: getValueFromDatasetByElevation(
                queryNbmAllAirportResult.data.gust,
                new Date(seg.arriveTime),
                null,
                index,
              ).value,
              skycover: getValueFromDatasetByElevation(
                queryNbmAllAirportResult.data.skycover,
                new Date(seg.arriveTime),
                null,
                index,
              ).value,
              temperature: getValueFromDatasetByElevation(
                queryNbmAllAirportResult.data.temperature,
                new Date(seg.arriveTime),
                null,
                index,
              ).value,
              visibility: getValueFromDatasetByElevation(
                queryNbmAllAirportResult.data.visibility,
                new Date(seg.arriveTime),
                null,
                index,
              ).value,
              winddir: getValueFromDatasetByElevation(
                queryNbmAllAirportResult.data.winddir,
                new Date(seg.arriveTime),
                null,
                index,
              ).value,
              windspeed: getValueFromDatasetByElevation(
                queryNbmAllAirportResult.data.windspeed,
                new Date(seg.arriveTime),
                null,
                index,
              ).value,
            },
          };
        } else {
          return { ...seg };
        }
      });
      dispatch(setRouteSegments(newSegments));
    }
  }, [routeSegments, queryNbmAllAirportResult.isSuccess]);

  return (
    <>
      {isLoading && (
        <div className="data-loading">
          <CircularProgress color="secondary" />
        </div>
      )}
    </>
  );
};

export default RouteProfileDataLoader;
