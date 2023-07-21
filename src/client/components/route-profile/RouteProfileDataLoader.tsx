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
  useQueryNbmAllMutation,
  useQueryDepartureAdvisorDataMutation,
  useQueryGfsDataMutation,
  useQueryIcingTurbDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { CircularProgress } from '@mui/material';
import { QueryStatus, skipToken } from '@reduxjs/toolkit/query';
import { useDispatch } from 'react-redux';
import { AirportNbmData, NbmProperties, RouteProfileDataset, RouteSegment } from '../../interfaces/route-profile';
import { selectSettings } from '../../store/user/UserSettings';
import { selectFetchedDate, setFetchedDate, setRouteSegments } from '../../store/route-profile/RouteProfile';
import { windQueryElevations } from './WindChart';
import { useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import { useGetAirportQuery } from '../../store/route/airportApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import Point from '../../fly-js/src/Point';
import Latitude from '../../fly-js/src/Latitude';
import Longitude from '../../fly-js/src/Longitude';
import { nauticalMilesToMeters } from '../../fly-js/src/helpers/converters/DistanceConverter';

export const totalNumberOfElevations = 200;

export const contourMin = -100;

export const contourMax = 60;

export const flightCategoryDivide = 10;

export const NODATA = -9999;

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
  gData: 'g-windspeed',
  icingTurb: 'icing-turb',
  nbmAllAirport: 'nbm-airport',
  nbm: 'nbm-all',
  elevation: 'elevation-api',
  departureAdvisor: 'departure-advisor',
};

/**
 * calculate length of polyline.
 * @param coordinateList line coordinates
 * @param inMile flag to get retrun nautical miles or kilometers
 * @returns nautical miles or kilometers
 */
export function getLineLength(coordinateList: GeoJSON.Position[], inMile = false): number {
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
function findAirportByPoint(airports: RoutePoint[], point: L.LatLng, radius: number, exclude: RoutePoint[]) {
  const proxyAirports: { dist: number; airport: RoutePoint }[] = [];
  for (const routePoint of airports) {
    const dist = point.distanceTo(L.latLng(routePoint.position.coordinates[1], routePoint.position.coordinates[0]));
    if (dist < radius) {
      if (exclude.filter((ex) => ex.key == routePoint.key).length > 0) {
        continue;
      }
      proxyAirports.push({ dist, airport: routePoint });
    }
  }
  if (proxyAirports.length > 0) {
    const sortedAirports = proxyAirports.sort((a, b) => {
      if (a.airport.type === 'icaoid' && b.airport.type !== 'icaoid') {
        return -1;
      }
      if (a.airport.type !== 'icaoid' && b.airport.type === 'icaoid') {
        return 1;
      }
      if (a.dist < b.dist) {
        return -1;
      }
      if (a.dist > b.dist) {
        return 1;
      }
    });
    return sortedAirports[0].airport;
  }
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

export function getRouteLength(route: Route, inMile = false): number {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const routeLengthNm = getLineLength(coordinateList, inMile);
  return routeLengthNm;
}

export function getSegmentInterval(route: Route, segmentsCount: number) {
  return getRouteLength(route, true) / segmentsCount;
}

export interface SegmentPoint {
  point: L.LatLng;
  isRoutePoint: boolean;
  airport?: RoutePoint;
}

// export function interpolateRouteWithStation(route: Route, divideNumber, airports: RoutePoint[]): SegmentPoint[] {
//   const coordinateList = [
//     route.departure.position.coordinates,
//     ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
//     route.destination.position.coordinates,
//   ];
//   const totalLength = getLineLength(coordinateList);
//   const interpolatedLatlngs = new Array<SegmentPoint>();
//   const latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
//   latlngs.map((latlng, index) => {
//     if (index < latlngs.length - 1) {
//       const nextLatlng = latlngs[index + 1];
//       const segmentLength = latlng.distanceTo(nextLatlng);
//       const vertices = Math.round((segmentLength * divideNumber) / (totalLength * 1000)) + 1;
//       const segmentInterval = (totalLength * 1000) / divideNumber;
//       //@ts-ignore
//       const polyline = L.Polyline.Arc(latlng, nextLatlng, { color: '#f0fa', weight: 6, pane: 'route-line', vertices });
//       const points: SegmentPoint[] = polyline.getLatLngs().map((latlng) => ({ point: latlng }));
//       if (index === 0) {
//         points[0].airport = route.departure;
//         points[0].isRoutePoint = true;
//         let routePoint = route.destination;
//         if (route.routeOfFlight && route.routeOfFlight.length > 0) {
//           routePoint = route.routeOfFlight[0].routePoint;
//         }
//         points[points.length - 1].airport = routePoint;
//         points[points.length - 1].isRoutePoint = true;
//         for (let i = 1; i < points.length - 1; i++) {
//           const airport = findAirportByPoint(
//             airports,
//             points[i].point,
//             segmentInterval / 2,
//             route.routeOfFlight.map((routeOfFlight) => routeOfFlight.routePoint),
//           );
//           points[i].airport = airport;
//           points[i].isRoutePoint = false;
//         }
//         interpolatedLatlngs.push(...points);
//       } else {
//         if (index > 0 && index < latlngs.length - 2) {
//           /////////////////////
//           // departure, rf[0], rf[1], rf[2], dest
//           //  0,           1,     2,     3,    4
//           //    index === 0, index=1, index=2, index=3
//           points[points.length - 1].airport = route.routeOfFlight[index].routePoint;
//           points[points.length - 1].isRoutePoint = true;
//         } else if (index === latlngs.length - 2) {
//           points[points.length - 1].airport = route.destination;
//           points[points.length - 1].isRoutePoint = true;
//         }
//         for (let i = 0; i < points.length - 1; i++) {
//           const airport = findAirportByPoint(
//             airports,
//             points[i].point,
//             segmentInterval / 2,
//             route.routeOfFlight.map((routeOfFlight) => routeOfFlight.routePoint),
//           );
//           points[i].airport = airport;
//           points[i].isRoutePoint = false;
//         }

//         interpolatedLatlngs.push(...points.slice(1));
//       }
//       //@ts-ignore
//     }
//   });
//   return interpolatedLatlngs;
// }

export function interpolateLegByInterval(start: L.LatLng, end: L.LatLng, interval: number, offset: number) {
  const latlngs: Point[] = [];
  let distance = offset;
  let current: Point = new Point(new Latitude(start.lat), new Longitude(start.lng));
  const legLength = fly.distanceTo(start.lat, start.lng, end.lat, end.lng, 6);
  if (legLength <= distance) {
    return { reminder: legLength, latlngs: [] };
  }
  let reminderDistance = 0;
  do {
    const course = fly.trueCourse(current.latitude.degrees, current.longitude.degrees, end.lat, end.lng, 2);
    current = fly.enroute(current.latitude.degrees, current.longitude.degrees, course, distance, 6);
    latlngs.push(current);
    reminderDistance = fly.distanceTo(current.latitude.degrees, current.longitude.degrees, end.lat, end.lng, 6);
    distance = interval;
  } while (reminderDistance > interval);
  return { reminder: reminderDistance, latlngs };
}

export function interpolateRouteByInterval(
  route: Route,
  divideNumber: number,
  airports: RoutePoint[] = null,
  findAirports = false,
): SegmentPoint[] {
  const routePoints = [route.departure, ...route.routeOfFlight.map((item) => item.routePoint), route.destination];
  const totalLength = getLineLength(
    routePoints.map((routePoint) => routePoint.position.coordinates),
    true,
  );
  const interval = totalLength / divideNumber;
  const segmentPoints = new Array<SegmentPoint>();
  let offset = 0;
  let attachLegStart = true;
  routePoints.reduce((prev, curr, routePointsIndex) => {
    const prevLatLng = L.GeoJSON.coordsToLatLng(prev.position.coordinates as [number, number]);
    const currLatLng = L.GeoJSON.coordsToLatLng(curr.position.coordinates as [number, number]);
    const { reminder: reminder, latlngs: points } = interpolateLegByInterval(prevLatLng, currLatLng, interval, offset);
    offset = points.length === 0 ? offset - reminder : interval - reminder;
    const segmentPointsInLeg = points.map((point, index) => {
      const latlng = L.latLng(point.latitude.degrees, point.longitude.degrees);
      const airportRadius = index === 0 ? interval * 0.3 : interval * 0.5;
      let airport = null;
      if (findAirports) {
        airport = findAirportByPoint(airports, latlng, fly.nauticalMilesTo('Meters', airportRadius, 6), [
          ...route.routeOfFlight.map((routeOfFlight) => routeOfFlight.routePoint),
          route.departure,
          route.destination,
        ]);
      }

      return {
        point: latlng,
        airport,
        isRoutePoint:
          (index === 0 && attachLegStart) || (index === points.length - 1 && routePointsIndex < routePoints.length - 1),
      };
    });
    attachLegStart = points.length === 0;
    segmentPoints.push(...segmentPointsInLeg);
    return curr;
  });
  segmentPoints.push({
    point: L.GeoJSON.coordsToLatLng(route.destination.position.coordinates as any),
    isRoutePoint: true,
    // airport: findAirports
    //   ? findAirportByPoint(
    //       airports,
    //       L.latLng(route.destination.position.coordinates[1], route.destination.position.coordinates[0]),
    //       fly.nauticalMilesTo('Meters', interval * 0.5, 6),
    //       [...route.routeOfFlight.map((routeOfFlight) => routeOfFlight.routePoint), route.departure, route.destination],
    //     )
    //   : null,
  });
  return segmentPoints;
}

export function extendLine(latlngs: L.LatLng[], extDistance: number): L.LatLng[] {
  const interval = fly.distanceTo(latlngs[0].lat, latlngs[0].lng, latlngs[1].lat, latlngs[1].lng, 6);
  const courseStart = fly.trueCourse(latlngs[1].lat, latlngs[1].lng, latlngs[0].lat, latlngs[0].lng, 2);
  const courseEnd = fly.trueCourse(
    latlngs[latlngs.length - 2].lat,
    latlngs[latlngs.length - 2].lng,
    latlngs[latlngs.length - 1].lat,
    latlngs[latlngs.length - 1].lng,
    2,
  );
  const startExtends = [];
  let accDist = 0;
  let extLatLng = latlngs[0];
  while (accDist < extDistance) {
    const extStart = fly.enroute(extLatLng.lat, extLatLng.lng, courseStart, interval, 6);
    extLatLng = L.latLng(extStart.latitude.degrees, extStart.longitude.degrees);
    startExtends.push(extLatLng);
    accDist += interval;
  }
  const lastStart = fly.enroute(latlngs[0].lat, latlngs[0].lng, courseStart, extDistance, 6);
  const lastStartLatLng = L.latLng(lastStart.latitude.degrees, lastStart.longitude.degrees);
  startExtends.push(lastStartLatLng);

  const endExtends = [];
  accDist = 0;
  let extEndLatLng = latlngs[latlngs.length - 1];
  while (accDist < extDistance) {
    const extEnd = fly.enroute(extEndLatLng.lat, extEndLatLng.lng, courseEnd, interval, 6);
    extEndLatLng = L.latLng(extEnd.latitude.degrees, extEnd.longitude.degrees);
    endExtends.push(extEndLatLng);
    accDist += interval;
  }
  const lastEnd = fly.enroute(
    latlngs[latlngs.length - 1].lat,
    latlngs[latlngs.length - 1].lng,
    courseEnd,
    extDistance,
    6,
  );
  const lastEndLatLng = L.latLng(lastEnd.latitude.degrees, lastEnd.longitude.degrees);
  endExtends.push(lastEndLatLng);
  return [...startExtends.reverse(), ...latlngs, ...endExtends];
}

export function interpolateRoute(route: Route, divideNumber, returnAsLeaflet = false, margin = 0): L.LatLng[] {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const totalLength = getLineLength(coordinateList, false) * 1000;
  const interpolatedLatlngs = new Array<L.LatLng>();
  let latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
  if (divideNumber === totalNumberOfElevations) {
    const courseStart = fly.trueCourse(latlngs[1].lat, latlngs[1].lng, latlngs[0].lat, latlngs[0].lng, 2);
    const courseEnd = fly.trueCourse(
      latlngs[latlngs.length - 2].lat,
      latlngs[latlngs.length - 2].lng,
      latlngs[latlngs.length - 1].lat,
      latlngs[latlngs.length - 1].lng,
      2,
    );
    const extStart = fly.enroute(latlngs[0].lat, latlngs[0].lng, courseStart, margin, 6);
    const extEnd = fly.enroute(latlngs[latlngs.length - 1].lat, latlngs[latlngs.length - 1].lng, courseEnd, margin, 6);
    latlngs = [
      L.latLng(extStart.latitude.degrees, extStart.longitude.degrees),
      ...latlngs,
      L.latLng(extEnd.latitude.degrees, extEnd.longitude.degrees),
    ];
  }
  latlngs.map((latlng, index) => {
    if (index < latlngs.length - 1) {
      const nextLatlng = latlngs[index + 1];
      const segmentLength = latlng.distanceTo(nextLatlng);
      const vertices = Math.round((segmentLength * divideNumber) / totalLength) + 1;
      //@ts-ignore
      const polyline = L.Polyline.Arc(latlng, nextLatlng, { color: '#f0fa', weight: 6, pane: 'route-line', vertices });
      //@ts-ignore
      interpolatedLatlngs.push(...(index > 0 ? polyline.getLatLngs().slice(1) : polyline.getLatLngs()));
    }
  });
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
  const [hourState, setHourState] = useState(0);
  const routeSegments = useSelector(selectRouteSegments);
  const [queryNbmAll, queryNbmAllResult] = useQueryNbmAllMutation({
    fixedCacheKey: cacheKeys.nbm,
  });
  const [queryNbmAllAirport, queryNbmAllAirportResult] = useQueryNbmAllMutation({
    fixedCacheKey: cacheKeys.nbmAllAirport,
  });
  const [, queryDepartureAdvisorDataResult] = useQueryDepartureAdvisorDataMutation({
    fixedCacheKey: cacheKeys.departureAdvisor,
  });
  const [queryGfsData, queryGfsDataResult] = useQueryGfsDataMutation({
    fixedCacheKey: cacheKeys.gData,
  });
  const [queryIcintTurb, queryIcingTurbDataResult] = useQueryIcingTurbDataMutation({
    fixedCacheKey: cacheKeys.icingTurb,
  });
  const [, queryElevationsResult] = useQueryElevationApiMutation({ fixedCacheKey: cacheKeys.elevation });
  const activeRoute = useSelector(selectActiveRoute);
  const dispatch = useDispatch();
  const fetchedDate = useSelector(selectFetchedDate);
  const [isLoading, setIsLoading] = useState(true);
  const { isSuccess: isLoadedAirports, data: airportsTable } = useGetAirportQuery('');

  if (auth.id) {
    useGetRoutesQuery('');
  }

  function resetDataCaches() {
    queryElevationsResult.reset();
    queryNbmAllResult.reset();
    queryDepartureAdvisorDataResult.reset();
    queryIcingTurbDataResult.reset();
    queryNbmAllAirportResult.reset();
  }

  function gfsWindElevations(activeRoute: Route) {
    const elevations = [...windQueryElevations];
    if (activeRoute.useForecastWinds) {
      if (activeRoute.altitude % 1000 === 0) {
        if (!elevations.includes(activeRoute.altitude)) {
          elevations.push(activeRoute.altitude);
        }
      } else {
        const floor = Math.floor(activeRoute.altitude / 1000) * 1000;
        const above = floor + 1000;
        if (!elevations.includes(floor)) {
          elevations.push(floor);
        }
        if (!elevations.includes(above)) {
          elevations.push(above);
        }
      }
    }
    return elevations;
  }

  useEffect(() => {
    setIsLoading(
      routeProfileApiState.chartType === 'Wind' ? !queryGfsDataResult.isSuccess : !queryIcingTurbDataResult.isSuccess,
    );
  }, [routeProfileApiState.chartType, queryGfsDataResult.isSuccess, queryIcingTurbDataResult.isSuccess, activeRoute]);

  useEffect(() => {
    // console.log(activeRoute);
    // console.log(new Date(fetchedDate).toISOString(), new Date().toISOString());
    resetDataCaches();
    dispatch(setFetchedDate(Date.now()));
  }, [activeRoute]);

  useEffect(() => {
    if (!activeRoute) {
      return;
    }
    if (routeProfileApiState.chartType === 'Wind') {
      if (!queryDepartureAdvisorDataResult.isSuccess) {
        return;
      }
      const positions = interpolateRouteByInterval(activeRoute, getSegmentsCount(activeRoute)).map((pt) =>
        L.GeoJSON.latLngToCoords(pt.point),
      );
      const elevations = gfsWindElevations(activeRoute);
      queryGfsData({ queryPoints: positions, elevations });
    } else {
      if (queryIcingTurbDataResult.isLoading || queryIcingTurbDataResult.isSuccess) {
        return;
      }
      const positions = interpolateRouteByInterval(
        activeRoute,
        getSegmentsCount(activeRoute) * flightCategoryDivide,
      ).map((pt) => L.GeoJSON.latLngToCoords(pt.point));
      queryIcintTurb({ queryPoints: positions });
      queryNbmAll({ queryPoints: positions });
    }
  }, [fetchedDate, queryDepartureAdvisorDataResult.isSuccess]);

  useEffect(() => {
    if (!activeRoute) {
      return;
    }
    if (routeProfileApiState.chartType === 'Wind') {
      if (!queryGfsDataResult.isSuccess || queryIcingTurbDataResult.isLoading || queryIcingTurbDataResult.isSuccess) {
        return;
      }
      const positions = interpolateRouteByInterval(
        activeRoute,
        getSegmentsCount(activeRoute) * flightCategoryDivide,
      ).map((pt) => L.GeoJSON.latLngToCoords(pt.point));
      queryIcintTurb({ queryPoints: positions });
      queryNbmAll({ queryPoints: positions });
    } else {
      if (!queryIcingTurbDataResult.isSuccess || queryGfsDataResult.isSuccess || queryGfsDataResult.isLoading) {
        return;
      }
      const positions = interpolateRouteByInterval(activeRoute, getSegmentsCount(activeRoute)).map((pt) =>
        L.GeoJSON.latLngToCoords(pt.point),
      );
      const elevations = gfsWindElevations(activeRoute);
      queryGfsData({ queryPoints: positions, elevations });
    }
  }, [queryGfsDataResult.isSuccess, queryIcingTurbDataResult.isSuccess]);

  function readNbmProperties(time: Date, segmentIndex): AirportNbmData {
    const { value: l_cloud, time: forecastTime } = getValueFromDatasetByElevation(
      queryNbmAllResult.data?.cloudbase,
      time,
      null,
      segmentIndex * flightCategoryDivide,
    );
    const { value: ceil } = getValueFromDatasetByElevation(
      queryDepartureAdvisorDataResult.data?.cloudceiling,
      time,
      null,
      segmentIndex * flightCategoryDivide,
    );
    const { value: dewp_c } = getValueFromDatasetByElevation(
      queryNbmAllResult.data?.dewpoint,
      time,
      null,
      segmentIndex,
    );
    const { value: w_gust } = getValueFromDatasetByElevation(queryNbmAllResult.data?.gust, time, null, segmentIndex);
    const { value: skycov } = getValueFromDatasetByElevation(
      queryNbmAllResult.data?.skycover,
      time,
      null,
      segmentIndex * flightCategoryDivide,
    );
    const { value: temp_c } = getValueFromDatasetByElevation(
      queryNbmAllResult.data?.temperature,
      time,
      null,
      segmentIndex,
    );
    const { value: vis } = getValueFromDatasetByElevation(
      queryDepartureAdvisorDataResult.data?.visibility,
      time,
      null,
      segmentIndex * flightCategoryDivide,
    );
    const { value: w_dir } = getValueFromDatasetByElevation(queryNbmAllResult.data?.winddir, time, null, segmentIndex);
    const { value: w_speed } = getValueFromDatasetByElevation(
      queryNbmAllResult.data?.windspeed,
      time,
      null,
      segmentIndex,
    );
    const { value: wx_1 } = getValueFromDatasetByElevation(
      queryDepartureAdvisorDataResult.data?.wx_1,
      time,
      null,
      segmentIndex,
    );
    const { value: wx_2 } = getValueFromDatasetByElevation(
      queryDepartureAdvisorDataResult.data?.wx_2,
      time,
      null,
      segmentIndex,
    );
    const { value: wx_inten_1 } = getValueFromDatasetByElevation(
      queryDepartureAdvisorDataResult.data?.wxInten1,
      time,
      null,
      segmentIndex,
    );
    const { value: wx_inten_2 } = getValueFromDatasetByElevation(
      queryDepartureAdvisorDataResult.data?.wxInten2,
      time,
      null,
      segmentIndex,
    );
    const { value: wx_prob_cov_1 } = getValueFromDatasetByElevation(
      queryDepartureAdvisorDataResult.data?.wxProbCov1,
      time,
      null,
      segmentIndex,
    );
    const { value: wx_prob_cov_2 } = getValueFromDatasetByElevation(
      queryDepartureAdvisorDataResult.data?.wxProbCov2,
      time,
      null,
      segmentIndex,
    );
    return {
      l_cloud,
      ceil,
      dewp_c,
      w_gust,
      skycov,
      temp_c,
      vis,
      w_dir,
      w_speed,
      wx_1,
      wx_2,
      wx_inten_1,
      wx_inten_2,
      wx_prob_cov_1,
      wx_prob_cov_2,
    };
  }

  function buildSegments() {
    const segmentsCount = getSegmentsCount(activeRoute);
    const positions = interpolateRouteByInterval(activeRoute, getSegmentsCount(activeRoute), airportsTable, true);
    const interval = getSegmentInterval(activeRoute, segmentsCount);
    const departureTime = getFuzzyLocalTimeFromPoint(observationTime, [positions[0].point.lng, positions[0].point.lat]);

    const initialSegment: RouteSegment = {
      position: { lat: positions[0].point.lat, lng: positions[0].point.lng },
      accDistance: 0,
      arriveTime: observationTime,
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
        offset: departureTime.utcOffset(),
      },
    };
    const segments: RouteSegment[] = [initialSegment];
    let arriveTime = observationTime;
    positions.reduce((prev: SegmentPoint, curr: SegmentPoint, index) => {
      try {
        const course = fly.trueCourse(prev.point.lat, prev.point.lng, curr.point.lat, curr.point.lng, 2);
        let speed: number;
        if (activeRoute.useForecastWinds) {
          if (queryGfsDataResult.isSuccess) {
            const { value: speedValue } = getValueFromDatasetByElevation(
              queryGfsDataResult.data?.windSpeed,
              new Date(arriveTime),
              activeRoute.altitude,
              index,
            );
            const { value: dirValue } = getValueFromDatasetByElevation(
              queryGfsDataResult.data?.windDirection,
              new Date(arriveTime),
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
        const newTime = arriveTime + (3600 * 1000 * interval) / speed;
        const departureTime = getFuzzyLocalTimeFromPoint(newTime, [curr.point.lng, curr.point.lat]);

        const segment: RouteSegment = {
          position: { lat: curr.point.lat, lng: curr.point.lng },
          accDistance: interval * index,
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
            offset: departureTime.utcOffset(),
          },
        };
        segments.push(segment);
        arriveTime = newTime;
        return curr;
      } catch (err) {
        console.warn(err);
        return prev;
      }
    });

    const airportPoints = segments.map((seg) => (seg.airport ? seg.airport.position.coordinates : null));
    if (!queryNbmAllAirportResult.isSuccess && !queryNbmAllAirportResult.isLoading)
      queryNbmAllAirport({ queryPoints: airportPoints });
    dispatch(setRouteSegments(segments));
  }

  useEffect(() => {
    const hour = new Date(observationTime);
    hour.setMinutes(0, 0, 0);
    setHourState(hour.getTime());
  }, [observationTime]);

  useEffect(() => {
    if (activeRoute && queryDepartureAdvisorDataResult.isSuccess && isLoadedAirports && queryGfsDataResult.isSuccess) {
      buildSegments();
    }
  }, [
    queryGfsDataResult.isSuccess,
    observationTime,
    userSettings.true_airspeed,
    activeRoute,
    queryDepartureAdvisorDataResult.isSuccess,
  ]);

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
