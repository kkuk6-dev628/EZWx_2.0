/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useSelector } from 'react-redux';
import { selectActiveRoute } from '../../store/route/routes';
import L from 'leaflet';
import * as fly from '../../fly-js/fly';
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
import { useDispatch } from 'react-redux';
import { AirportNbmData, NbmProperties, RouteSegment } from '../../interfaces/route-profile';
import { selectSettings } from '../../store/user/UserSettings';
import { selectFetchedDate, setFetchedDate, setRouteSegments } from '../../store/route-profile/RouteProfile';
import { windQueryElevations } from '../../utils/constants';
import { useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import { useGetAirportQuery } from '../../store/route/airportApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import Point from '../../fly-js/src/Point';
import Latitude from '../../fly-js/src/Latitude';
import Longitude from '../../fly-js/src/Longitude';
import { flightCategoryDivide, totalNumberOfElevations, cacheKeys } from '../../utils/constants';
import { getValueFromDatasetByElevation } from '../../utils/utils';

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

export function getSegmentInterval(route: Route, segmentsCount: number) {
  return getRouteLength(route, true) / segmentsCount;
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
      if (exclude.filter((ex) => ex.key === routePoint.key && ex.type !== 'icaoid').length > 0) {
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

export interface SegmentPoint {
  point: L.LatLng;
  isRoutePoint: boolean;
  airport?: RoutePoint;
}

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

export function calcEndMargin(route: Route) {
  return calcHighResolution(route) * Math.round(0.6 * flightCategoryDivide);
}

export function calcHighResolution(route: Route) {
  const routePoints = [route.departure, ...route.routeOfFlight.map((item) => item.routePoint), route.destination];
  const totalLength = getLineLength(
    routePoints.map((routePoint) => routePoint.position.coordinates),
    true,
  );
  const divideNumber = getSegmentsCount(route) * flightCategoryDivide;
  const interval = totalLength / divideNumber;
  return interval;
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
    queryGfsDataResult.reset();
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
    setIsLoading(true);
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
      airport: activeRoute.departure,
      isRoutePoint: true,
      segmentNbmProps: readNbmProperties(new Date(observationTime), 0),
      departureTime: {
        full: departureTime.format('ddd, MMM DD, YYYY kk:mm z'),
        date: departureTime.format('MM/dd/YYYY'),
        time: departureTime.format('kk:mm z'),
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
          airport: index < positions.length - 1 ? curr.airport : activeRoute.destination,
          isRoutePoint: curr.isRoutePoint,
          segmentNbmProps: readNbmProperties(new Date(newTime), index),
          departureTime: {
            full: departureTime.format('ddd, MMM DD, YYYY kk:mm z'),
            date: departureTime.format('MM/DD/YYYY'),
            time: departureTime.format('kk:mm z'),
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
