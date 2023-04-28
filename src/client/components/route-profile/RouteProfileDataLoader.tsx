/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useSelector } from 'react-redux';
import { selectActiveRoute } from '../../store/route/routes';
import L from 'leaflet';
import * as fly from '../../fly-js/fly';
import * as d3 from 'd3-scale';
import { getFuzzyLocalTimeFromPoint } from '@mapbox/timespace';
import { Route } from '../../interfaces/route';
import { useEffect, useState } from 'react';
import 'leaflet-arc';
import { useGetRoutesQuery } from '../../store/route/routeApi';
import { selectAuth } from '../../store/auth/authSlice';
import {
  routeProfileApi,
  useGetRouteProfileStateQuery,
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
import { windQueryElevations } from './WindChart';

export const totalNumberOfElevations = 512;

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

export function getValueFromDataset(
  datasetAll: RouteProfileDataset[],
  time: Date,
  elevation: number,
  segmentIndex,
): { value: number; time: Date } {
  try {
    const filteredByTime = datasetAll.filter((dataset) => {
      if (dataset.time && dataset.time.length === 1) {
        const diff = time.getTime() - new Date(dataset.time[0]).getTime();
        return diff >= 0 && diff < 3600 * 1000;
      }
      return false;
    });

    if (filteredByTime.length > 0) {
      const filteredByElevation = filteredByTime[0].data[segmentIndex].data.filter((dataset) => {
        return Math.abs(dataset.elevation - elevation) < 1000;
      });
      if (filteredByElevation.length === 1) {
        return { value: filteredByElevation[0].value, time: new Date(filteredByTime[0].time[0]) };
      } else if (filteredByElevation.length === 2) {
        return {
          value: (filteredByElevation[0].value + filteredByElevation[0].value) / 2,
          time: new Date(filteredByTime[0].time[0]),
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

export function getRouteLength(route: Route, inMile = false): number {
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  const routeLengthNm = getLineLength(coordinateList, inMile);
  return routeLengthNm;
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
  const [forceRefetch, setForceRefetch] = useState(Date.now());
  let isLoading = false;

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
    // queryGfsWindSpeedDataResult.reset();
    // queryGfsWindSpeedDataResult.reset();
    // queryGfsWindSpeedDataResult.reset();
    // queryGfsWindSpeedDataResult.reset();
  }

  useEffect(() => {
    resetDataCaches();
    setForceRefetch(Date.now());
  }, [activeRoute]);
  switch (routeProfileApiState.chartType) {
    case 'Wind':
      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryGfsWindDirectionDataResult.isLoading && !queryGfsWindDirectionDataResult.isSuccess)
            queryGfsWindDirectionData({ queryPoints: positions, elevations: windQueryElevations });
          if (!queryGfsWindSpeedDataResult.isLoading && !queryGfsWindSpeedDataResult.isSuccess)
            queryGfsWindSpeedData({ queryPoints: positions, elevations: windQueryElevations });
        }
      }, [forceRefetch]);

      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryGfsWindDirectionDataResult.isLoading) {
            if (!queryTemperatureDataResult.isSuccess && !queryTemperatureDataResult.isLoading)
              queryTemperatureData({ queryPoints: positions });
            if (!queryhumidityDataResult.isLoading && !queryhumidityDataResult.isSuccess)
              queryHumidityData({ queryPoints: positions });
            if (!queryCaturbDataResult.isLoading && !queryCaturbDataResult.isSuccess)
              queryCaturbData({ queryPoints: positions });
            if (!queryMwturbDataResult.isLoading && !queryMwturbDataResult.isSuccess)
              queryMwturbData({ queryPoints: positions });
          }
        }
      }, [queryGfsWindDirectionDataResult.isLoading]);

      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryCaturbDataResult.isLoading) {
            if (!queryIcingProbDataResult.isLoading && !queryIcingProbDataResult.isSuccess)
              queryIcingProbData({ queryPoints: positions });
            if (!queryIcingSevDataResult.isLoading && !queryIcingSevDataResult.isSuccess)
              queryIcingSevData({ queryPoints: positions });
            if (!queryIcingSldDataResult.isLoading && !queryIcingSldDataResult.isSuccess)
              queryIcingSldData({ queryPoints: positions });
          }
        }
      }, [queryCaturbDataResult.isLoading]);
      isLoading = !queryGfsWindSpeedDataResult.isSuccess;
      break;
    case 'Turb':
      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryCaturbDataResult.isLoading && !queryCaturbDataResult.isSuccess)
            queryCaturbData({ queryPoints: positions });
          if (!queryMwturbDataResult.isLoading && !queryMwturbDataResult.isSuccess)
            queryMwturbData({ queryPoints: positions });
        }
      }, [forceRefetch]);

      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryCaturbDataResult.isLoading) {
            if (!queryGfsWindDirectionDataResult.isLoading && !queryGfsWindDirectionDataResult.isSuccess)
              queryGfsWindDirectionData({ queryPoints: positions, elevations: windQueryElevations });
            if (!queryGfsWindSpeedDataResult.isLoading && !queryGfsWindSpeedDataResult.isSuccess)
              queryGfsWindSpeedData({ queryPoints: positions, elevations: windQueryElevations });
          }
        }
      }, [queryCaturbDataResult.isLoading]);

      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryGfsWindSpeedDataResult.isLoading) {
            if (!queryIcingProbDataResult.isLoading && !queryIcingProbDataResult.isSuccess)
              queryIcingProbData({ queryPoints: positions });
            if (!queryIcingSevDataResult.isLoading && !queryIcingSevDataResult.isSuccess)
              queryIcingSevData({ queryPoints: positions });
            if (!queryIcingSldDataResult.isLoading && !queryIcingSldDataResult.isSuccess)
              queryIcingSldData({ queryPoints: positions });
            if (!queryhumidityDataResult.isLoading && !queryhumidityDataResult.isSuccess)
              queryHumidityData({ queryPoints: positions });
            if (!queryTemperatureDataResult.isSuccess && !queryTemperatureDataResult.isLoading)
              queryTemperatureData({ queryPoints: positions });
          }
        }
      }, [queryGfsWindSpeedDataResult.isLoading]);
      isLoading = !queryCaturbDataResult.isSuccess;
      break;
    case 'Icing':
      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryIcingProbDataResult.isLoading && !queryIcingProbDataResult.isSuccess)
            queryIcingProbData({ queryPoints: positions });
          if (!queryIcingSevDataResult.isLoading && !queryIcingSevDataResult.isSuccess)
            queryIcingSevData({ queryPoints: positions });
          if (!queryIcingSldDataResult.isLoading && !queryIcingSldDataResult.isSuccess)
            queryIcingSldData({ queryPoints: positions });
          if (!queryTemperatureDataResult.isSuccess && !queryTemperatureDataResult.isLoading)
            queryTemperatureData({ queryPoints: positions });
        }
      }, [forceRefetch]);

      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryTemperatureDataResult.isLoading) {
            if (!queryGfsWindDirectionDataResult.isLoading && !queryGfsWindDirectionDataResult.isSuccess)
              queryGfsWindDirectionData({ queryPoints: positions, elevations: windQueryElevations });
            if (!queryGfsWindSpeedDataResult.isLoading && !queryGfsWindSpeedDataResult.isSuccess)
              queryGfsWindSpeedData({ queryPoints: positions, elevations: windQueryElevations });
          }
        }
      }, [queryTemperatureDataResult.isLoading]);

      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryGfsWindDirectionDataResult.isLoading) {
            if (!queryhumidityDataResult.isLoading && !queryhumidityDataResult.isSuccess)
              queryHumidityData({ queryPoints: positions });
            if (!queryCaturbDataResult.isLoading && !queryCaturbDataResult.isSuccess)
              queryCaturbData({ queryPoints: positions });
            if (!queryMwturbDataResult.isLoading && !queryMwturbDataResult.isSuccess)
              queryMwturbData({ queryPoints: positions });
          }
        }
      }, [queryGfsWindDirectionDataResult.isLoading]);
      isLoading = !queryIcingProbDataResult.isSuccess;
      break;
    case 'Clouds':
      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryGfsWindDirectionDataResult.isLoading && !queryGfsWindDirectionDataResult.isSuccess)
            queryGfsWindDirectionData({ queryPoints: positions, elevations: windQueryElevations });
          if (!queryGfsWindSpeedDataResult.isLoading && !queryGfsWindSpeedDataResult.isSuccess)
            queryGfsWindSpeedData({ queryPoints: positions, elevations: windQueryElevations });
          if (!queryTemperatureDataResult.isSuccess && !queryTemperatureDataResult.isLoading)
            queryTemperatureData({ queryPoints: positions });
        }
      }, [forceRefetch]);

      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryGfsWindDirectionDataResult.isLoading) {
            if (!queryhumidityDataResult.isLoading && !queryhumidityDataResult.isSuccess)
              queryHumidityData({ queryPoints: positions });
            if (!queryCaturbDataResult.isLoading && !queryCaturbDataResult.isSuccess)
              queryCaturbData({ queryPoints: positions });
            if (!queryMwturbDataResult.isLoading && !queryMwturbDataResult.isSuccess)
              queryMwturbData({ queryPoints: positions });
          }
        }
      }, [queryGfsWindDirectionDataResult.isLoading]);

      useEffect(() => {
        if (activeRoute) {
          const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
          if (!queryCaturbDataResult.isLoading) {
            if (!queryIcingProbDataResult.isLoading && !queryIcingProbDataResult.isSuccess)
              queryIcingProbData({ queryPoints: positions });
            if (!queryIcingSevDataResult.isLoading && !queryIcingSevDataResult.isSuccess)
              queryIcingSevData({ queryPoints: positions });
            if (!queryIcingSldDataResult.isLoading && !queryIcingSldDataResult.isSuccess)
              queryIcingSldData({ queryPoints: positions });
          }
        }
      }, [queryCaturbDataResult.isLoading]);
      isLoading = !queryIcingProbDataResult.isSuccess;
      break;
  }

  useEffect(() => {
    if (activeRoute) {
      const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute));
      const departureTime = getFuzzyLocalTimeFromPoint(observationTime, [positions[0][0], positions[0][1]]);

      const initialSegment = {
        position: { lat: positions[0][1], lng: positions[0][0] },
        accDistance: 0,
        arriveTime: new Date(observationTime).getTime(),
        course: fly.trueCourse(positions[0][1], positions[0][0], positions[1][1], positions[1][0], 2),
        departureTime: {
          full: departureTime.format('MM/dd/YYYY hh:mm A z'),
          date: departureTime.format('MM/dd/YYYY'),
          time: departureTime.format('HH:mm z'),
          hour: departureTime.hour(),
          minute: departureTime.minute(),
        },
      };
      const segments: RouteSegment[] = [initialSegment];
      positions.reduce((acc: RouteSegment, curr: L.LatLng, index) => {
        try {
          const dist = fly.distanceTo(acc.position.lat, acc.position.lng, curr[1], curr[0], 2);
          const course = fly.trueCourse(acc.position.lat, acc.position.lng, curr[1], curr[0], 2);
          if (!dist) return acc;
          let speed: number;
          if (activeRoute.useForecastWinds) {
            if (queryGfsWindSpeedDataResult.isSuccess && queryGfsWindDirectionDataResult.isSuccess) {
              const { value: speedValue } = getValueFromDataset(
                queryGfsWindSpeedDataResult.data,
                new Date(acc.arriveTime),
                activeRoute.altitude,
                index,
              );
              const { value: dirValue } = getValueFromDataset(
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
          const departureTime = getFuzzyLocalTimeFromPoint(newTime, [curr[0], curr[1]]);

          const segment = {
            position: { lat: curr[1], lng: curr[0] },
            accDistance: acc.accDistance + dist,
            arriveTime: newTime,
            course: course,
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

      dispatch(setRouteSegments(segments));
    }
  }, [
    queryGfsWindSpeedDataResult.isLoading,
    queryGfsWindDirectionDataResult.isLoading,
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
      {isLoading && (
        <div className="data-loading">
          <CircularProgress color="secondary" />
        </div>
      )}
    </>
  );
};

export default RouteProfileDataLoader;
