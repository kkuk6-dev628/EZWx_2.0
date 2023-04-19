/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useSelector } from 'react-redux';
import { selectActiveRoute } from '../../store/route/routes';
import L from 'leaflet';
import * as fly from '../../fly-js/fly';
import { Route } from '../../interfaces/route';
import { useEffect, useState } from 'react';
import 'leaflet-arc';
import { useGetRoutesQuery } from '../../store/route/routeApi';
import { selectAuth } from '../../store/auth/authSlice';
import {
  useQueryCaturbDataMutation,
  useQueryGfsWindDirectionDataMutation,
  useQueryGfsWindSpeedDataMutation,
  useQueryHumidityDataMutation,
  useQueryIcingProbDataMutation,
  useQueryIcingSevDataMutation,
  useQueryIcingSldDataMutation,
  useQueryMwturbDataMutation,
  useQueryTemperatureDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { CircularProgress } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { useDispatch } from 'react-redux';
import { RouteProfileDataset, RouteSegment } from '../../interfaces/route-profile';
import { selectSettings } from '../../store/user/UserSettings';
import { setRouteSegments } from '../../store/route-profile/RouteProfile';

export const totalNumberOfElevations = 512;

export const cacheKeys = {
  gfsWindspeed: 'gfs-windspeed',
  gfsWinddirection: 'gfs-winddirection',
  gfsTemperature: 'gfs-temperature',
  gfsHumidity: 'gfs-humidity',
  caturb: 'caturb',
  mwturb: 'mwturb',
  icingProb: 'icing-prob',
  icingSev: 'icing-sev',
  icingSld: 'icing-sld',
};

const getLineLength = (coordinateList: GeoJSON.Position[], inMile = false): number => {
  let routeLength = 0;
  const latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
  latlngs.reduce((a, b) => {
    if (a.lat !== b.lat || a.lng !== b.lng) {
      routeLength += a.distanceTo(b);
    }
    return b;
  });
  return inMile ? routeLength / 1852 : routeLength / 1000;
};

export const getValueFromDataset = (
  datasetAll: RouteProfileDataset[],
  time: Date,
  elevation: number,
  segmentIndex,
): number => {
  let speedData: RouteProfileDataset;
  for (const dataset of datasetAll) {
    const diff = time.getTime() - new Date(dataset.time).getTime();
    if (diff >= 0 && diff < 3600 * 1000) {
      speedData = dataset;
      break;
    }
  }

  for (const dataset of speedData.data[segmentIndex].data) {
    if (dataset.elevation == elevation) {
      return dataset.value;
    }
  }
};

export const getRouteLength = (route: Route, inMile = false): number => {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const routeLengthNm = getLineLength(coordinateList, inMile);
  return routeLengthNm;
};

export const interpolateRoute = (route: Route, divideNumber, returnAsLeaflet = false): L.LatLng[] => {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const totalLength = getLineLength(coordinateList);
  const interpolatedLatlngs = new Array<L.LatLng>();
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
  return returnAsLeaflet ? interpolatedLatlngs : L.GeoJSON.latLngsToCoords(interpolatedLatlngs);
};

export const getSegmentsCount = (route: Route): number => {
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
};

const RouteProfileDataLoader = () => {
  const auth = useSelector(selectAuth);
  const userSettings = useSelector(selectSettings);
  const observationTime = userSettings.observation_time;
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
  const activeRoute = useSelector(selectActiveRoute);
  const dispatch = useDispatch();
  const [segmentPositions, setSegmentPositions] = useState<L.LatLng[]>();

  if (auth.id) {
    useGetRoutesQuery('');
  }

  useEffect(() => {
    if (activeRoute) {
      const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
      setSegmentPositions(positions);
      if (!queryGfsWindDirectionDataResult.isLoading && !queryGfsWindDirectionDataResult.isSuccess)
        queryGfsWindDirectionData({ queryPoints: positions });
      if (!queryGfsWindSpeedDataResult.isLoading && !queryGfsWindSpeedDataResult.isSuccess)
        queryGfsWindSpeedData({ queryPoints: positions });
      if (
        !queryhumidityDataResult.isLoading &&
        !queryhumidityDataResult.isSuccess &&
        queryGfsWindDirectionDataResult.isSuccess
      )
        queryHumidityData({ queryPoints: positions });
      if (
        !queryTemperatureDataResult.isSuccess &&
        !queryTemperatureDataResult.isLoading &&
        queryGfsWindDirectionDataResult.isSuccess
      )
        queryTemperatureData({ queryPoints: positions });
      if (!queryCaturbDataResult.isLoading && !queryCaturbDataResult.isSuccess && queryhumidityDataResult.isSuccess)
        queryCaturbData({ queryPoints: positions });
      if (!queryMwturbDataResult.isLoading && !queryMwturbDataResult.isSuccess && queryhumidityDataResult.isSuccess)
        queryMwturbData({ queryPoints: positions });
      if (
        !queryIcingProbDataResult.isLoading &&
        !queryIcingProbDataResult.isSuccess &&
        queryhumidityDataResult.isSuccess
      )
        queryIcingProbData({ queryPoints: positions });
      if (!queryIcingSevDataResult.isLoading && !queryIcingSevDataResult.isSuccess && queryhumidityDataResult.isSuccess)
        queryIcingSevData({ queryPoints: positions });
      if (!queryIcingSldDataResult.isLoading && !queryIcingSldDataResult.isSuccess && queryhumidityDataResult.isSuccess)
        queryIcingSldData({ queryPoints: positions });
    }
  }, [activeRoute, queryGfsWindDirectionDataResult.isSuccess, queryhumidityDataResult.isSuccess]);

  useEffect(() => {
    if (queryGfsWindSpeedDataResult.isSuccess && queryGfsWindDirectionDataResult.isSuccess) {
      let positions;
      if (!segmentPositions) {
        positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
        setSegmentPositions(positions);
      } else {
        positions = segmentPositions;
      }

      const initialSegment = {
        position: { lat: positions[0][1], lng: positions[0][0] },
        accDistance: 0,
        arriveTime: new Date(observationTime).getTime(),
        course: fly.trueCourse(positions[0][1], positions[0][0], positions[1][1], positions[1][0], 2),
      };
      const segments: RouteSegment[] = [initialSegment];
      positions.reduce((acc: RouteSegment, curr: L.LatLng, index) => {
        try {
          const dist = fly.distanceTo(acc.position.lat, acc.position.lng, curr[1], curr[0], 2);
          const course = fly.trueCourse(acc.position.lat, acc.position.lng, curr[1], curr[0], 2);
          if (!dist) return acc;
          let speed: number;
          if (activeRoute.useForecastWinds) {
            const speedValue = getValueFromDataset(
              queryGfsWindSpeedDataResult.data,
              new Date(acc.arriveTime),
              activeRoute.altitude,
              index,
            );
            const dirValue = getValueFromDataset(
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
            console.log(
              `true_airspeed: ${userSettings.true_airspeed}, course: ${course}, windspeed: ${speedValue}, winddir: ${dirValue}, groundspeed: ${groundSpeed}`,
            );
            speed = groundSpeed;
          } else {
            speed = userSettings.true_airspeed;
          }
          const newTime = new Date(acc.arriveTime).getTime() + (3600 * 1000 * dist) / speed;
          const segment = {
            position: { lat: curr[1], lng: curr[0] },
            accDistance: acc.accDistance + dist,
            arriveTime: newTime,
            course: course,
          };
          segments.push(segment);
          return { ...segment };
        } catch (err) {
          console.warn(err);
          return acc;
        }
      }, initialSegment);

      dispatch(setRouteSegments(segments));
    }
  }, [
    queryGfsWindSpeedDataResult.isSuccess,
    queryGfsWindDirectionDataResult.isSuccess,
    observationTime,
    userSettings.true_airspeed,
    activeRoute,
  ]);

  useEffect(() => {
    if (queryCaturbDataResult.data) {
      // console.log(queryDataResult.data);
    }
  }, [queryCaturbDataResult.isSuccess]);

  return (
    <>
      {queryGfsWindSpeedDataResult.isLoading && (
        <div className="data-loading">
          <CircularProgress color="secondary" />
        </div>
      )}
    </>
  );
};

export default RouteProfileDataLoader;
