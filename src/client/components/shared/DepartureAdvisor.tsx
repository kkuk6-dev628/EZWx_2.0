/* eslint-disable @typescript-eslint/ban-ts-comment */
import Slider from '@mui/material/Slider';
import React, { useEffect, useState } from 'react';
import { diffMinutes, getTimeRangeStart, simpleTimeFormat, simpleTimeOnlyFormat } from '../map/common/AreoFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { PersonalMinimums, selectSettings, setUserSettings } from '../../store/user/UserSettings';
import { useUpdateUserSettingsMutation } from '../../store/user/userSettingsApi';
import { selectAuth } from '../../store/auth/authSlice';
import {
  useGetAirportNbmQuery,
  useGetDepartureAdvisorDataMutation,
  useQueryGfsWindDirectionDataMutation,
  useQueryGfsWindSpeedDataMutation,
} from '../../store/route-profile/routeProfileApi';
import {
  cacheKeys,
  flightCategoryDivide,
  getSegmentsCount,
  getValueFromDatasetByElevation,
  interpolateRoute,
} from '../route-profile/RouteProfileDataLoader';
import { selectActiveRoute } from '../../store/route/routes';
import { LatLng } from 'leaflet';
import fly from '../../fly-js/fly';
import { getAirportNbmData } from '../route-profile/RouteProfileChart';
import { UserSettings } from '../../interfaces/users';
import { jsonClone } from '../utils/ObjectUtil';

type personalMinValue = 0 | 1 | 2 | 10;
type personalMinColor = 'red' | 'yellow' | 'green' | 'grey';
type personalMinShape = 'rect' | 'circle' | 'triangle';

interface PersonalMinsEvaluation {
  departureCeiling: { value: personalMinValue; color: personalMinColor };
  departureVisibility: { value: personalMinValue; color: personalMinColor };
  departureCrosswind: { value: personalMinValue; color: personalMinColor };
  alongRouteCeiling: { value: personalMinValue; color: personalMinColor };
  alongRouteVisibility: { value: personalMinValue; color: personalMinColor };
  alongRouteProb: { value: personalMinValue; color: personalMinColor };
  alongRouteSeverity: { value: personalMinValue; color: personalMinColor };
  alongRouteTurbulence: { value: personalMinValue; color: personalMinColor };
  alongRouteConvection: { value: personalMinValue; color: personalMinColor };
  destinationCeiling: { value: personalMinValue; color: personalMinColor };
  destinationVisibility: { value: personalMinValue; color: personalMinColor };
  destinationCrosswind: { value: personalMinValue; color: personalMinColor };
}

const personalMinValueToColor: { 0: personalMinColor; 1: personalMinColor; 2: personalMinColor; 10: personalMinColor } =
  {
    0: 'red',
    1: 'yellow',
    2: 'green',
    10: 'grey',
  };
const personalMinValueToShape: { 0: personalMinShape; 1: personalMinShape; 2: personalMinShape; 10: personalMinShape } =
  {
    0: 'triangle',
    1: 'rect',
    2: 'circle',
    10: 'rect',
  };

const initialEvaluation: PersonalMinsEvaluation = {
  departureCeiling: {
    value: 10,
    color: 'grey',
  },
  departureVisibility: {
    value: 10,
    color: 'grey',
  },
  departureCrosswind: {
    value: 10,
    color: 'grey',
  },
  alongRouteCeiling: {
    value: 10,
    color: 'grey',
  },
  alongRouteVisibility: {
    value: 10,
    color: 'grey',
  },
  alongRouteProb: {
    value: 10,
    color: 'grey',
  },
  destinationCeiling: {
    value: 10,
    color: 'grey',
  },
  destinationVisibility: {
    value: 10,
    color: 'grey',
  },
  destinationCrosswind: {
    value: 10,
    color: 'grey',
  },
  alongRouteSeverity: {
    value: 10,
    color: 'grey',
  },
  alongRouteTurbulence: {
    value: 10,
    color: 'grey',
  },
  alongRouteConvection: {
    value: 10,
    color: 'grey',
  },
};

function getWheatherMinimumsAlongRoute(
  positions: LatLng[],
  personalMins: UserSettings,
  observationTime: number,
  useForecastWinds: boolean,
  routeAltitude: number,
  trueAirSpeed: number,
  departureData,
  gfsWindspeed,
  gfsWinddirection,
  departureAirportID: string,
  destAirportID: string,
  airportNbmData,
): PersonalMinsEvaluation {
  let accDistance = 0;
  let arriveTime = new Date(observationTime).getTime();
  let dist = 0;
  let course = 0;
  const personalMinsEvaluation: PersonalMinsEvaluation = jsonClone(initialEvaluation);

  const ceilings = [];
  const visibilities = [];
  const icingProbs = [];
  const icingSeverities = [];
  const turbulences = [];

  positions.forEach((curr: LatLng, index) => {
    try {
      const nextPos = index < positions.length - 1 ? positions[index + 1] : null;
      dist = index < positions.length - 1 ? fly.distanceTo(curr.lat, curr.lng, nextPos.lat, nextPos.lng, 2) : dist;
      course = index < positions.length - 1 ? fly.trueCourse(curr.lat, curr.lng, nextPos.lat, nextPos.lng, 2) : course;
      if (index < positions.length - 1 && !dist) return;
      let speed: number;
      if (useForecastWinds) {
        if (gfsWindspeed.isSuccess && gfsWinddirection.isSuccess) {
          const { value: speedValue } = getValueFromDatasetByElevation(
            gfsWindspeed.data,
            new Date(arriveTime),
            routeAltitude,
            Math.round(index / flightCategoryDivide),
          );
          const { value: dirValue } = getValueFromDatasetByElevation(
            gfsWinddirection.data,
            new Date(arriveTime),
            routeAltitude,
            Math.round(index / flightCategoryDivide),
          );
          const { groundSpeed } = fly.calculateHeadingAndGroundSpeed(trueAirSpeed, course, speedValue, dirValue, 2);
          speed = groundSpeed;
        } else {
          speed = trueAirSpeed;
        }
      } else {
        speed = trueAirSpeed;
      }
      const newTime = new Date(arriveTime).getTime() + (3600 * 1000 * dist) / speed;
      const { value: cloudceiling, time: forecastTime } = getValueFromDatasetByElevation(
        departureData.data?.cloudceiling,
        new Date(arriveTime),
        null,
        index,
      );
      const { value: visibility } = getValueFromDatasetByElevation(
        departureData.data?.visibility,
        new Date(arriveTime),
        null,
        index,
      );
      if (index === 0) {
        if (personalMins.ceiling_at_departure[1] <= cloudceiling || cloudceiling === null || cloudceiling === 0) {
          personalMinsEvaluation.departureCeiling.value = 2;
          personalMinsEvaluation.departureCeiling.color = personalMinValueToColor[2];
        } else if (personalMins.ceiling_at_departure[0] <= cloudceiling) {
          personalMinsEvaluation.departureCeiling.value = 1;
          personalMinsEvaluation.departureCeiling.color = personalMinValueToColor[1];
        } else {
          personalMinsEvaluation.departureCeiling.value = 0;
          personalMinsEvaluation.departureCeiling.color = personalMinValueToColor[0];
        }
        if (personalMins.surface_visibility_at_departure[1] <= visibility || visibility === null) {
          personalMinsEvaluation.departureVisibility.value = 2;
          personalMinsEvaluation.departureVisibility.color = personalMinValueToColor[2];
        } else if (personalMins.surface_visibility_at_departure[0] <= visibility) {
          personalMinsEvaluation.departureVisibility.value = 1;
          personalMinsEvaluation.departureVisibility.color = personalMinValueToColor[1];
        } else {
          personalMinsEvaluation.departureVisibility.value = 0;
          personalMinsEvaluation.departureVisibility.color = personalMinValueToColor[0];
        }
        const { data: forCrosswind } = getAirportNbmData(airportNbmData, observationTime, departureAirportID);
        if (!forCrosswind || personalMins.crosswinds_at_departure_airport[0] > forCrosswind.cross_com) {
          personalMinsEvaluation.departureCrosswind.value = 2;
          personalMinsEvaluation.departureCrosswind.color = personalMinValueToColor[2];
        } else if (personalMins.crosswinds_at_departure_airport[1] > forCrosswind.cross_com) {
          personalMinsEvaluation.departureCrosswind.value = 1;
          personalMinsEvaluation.departureCrosswind.color = personalMinValueToColor[1];
        } else {
          personalMinsEvaluation.departureCrosswind.value = 0;
          personalMinsEvaluation.departureCrosswind.color = personalMinValueToColor[0];
        }
      } else if (index === positions.length - 1) {
        if (personalMins.ceiling_at_destination[0] <= cloudceiling || cloudceiling === null || cloudceiling === 0) {
          personalMinsEvaluation.destinationCeiling.value = 2;
          personalMinsEvaluation.destinationCeiling.color = personalMinValueToColor[2];
        } else if (personalMins.ceiling_at_destination[1] <= cloudceiling) {
          personalMinsEvaluation.destinationCeiling.value = 1;
          personalMinsEvaluation.destinationCeiling.color = personalMinValueToColor[1];
        } else {
          personalMinsEvaluation.destinationCeiling.value = 0;
          personalMinsEvaluation.destinationCeiling.color = personalMinValueToColor[0];
        }
        if (personalMins.surface_visibility_at_destination[0] <= visibility) {
          personalMinsEvaluation.destinationVisibility.value = 2;
          personalMinsEvaluation.destinationVisibility.color = personalMinValueToColor[2];
        } else if (personalMins.surface_visibility_at_destination[1] <= visibility) {
          personalMinsEvaluation.destinationVisibility.value = 1;
          personalMinsEvaluation.destinationVisibility.color = personalMinValueToColor[1];
        } else {
          personalMinsEvaluation.destinationVisibility.value = 0;
          personalMinsEvaluation.destinationVisibility.color = personalMinValueToColor[0];
        }
        const { data: forCrosswind } = getAirportNbmData(airportNbmData, arriveTime, destAirportID);
        if (!forCrosswind || personalMins.crosswinds_at_destination_airport[0] > forCrosswind.cross_com) {
          personalMinsEvaluation.destinationCrosswind.value = 2;
          personalMinsEvaluation.destinationCrosswind.color = personalMinValueToColor[2];
        } else if (personalMins.crosswinds_at_destination_airport[1] > forCrosswind.cross_com) {
          personalMinsEvaluation.destinationCrosswind.value = 1;
          personalMinsEvaluation.destinationCrosswind.color = personalMinValueToColor[1];
        } else {
          personalMinsEvaluation.destinationCrosswind.value = 0;
          personalMinsEvaluation.destinationCrosswind.color = personalMinValueToColor[0];
        }
      } else {
        cloudceiling && ceilings.push(cloudceiling);
        visibility && visibilities.push(visibility);
        const { value: icingProb } = getValueFromDatasetByElevation(
          departureData.data?.prob,
          new Date(arriveTime),
          null,
          index,
        );
        const { value: icingSeverity } = getValueFromDatasetByElevation(
          departureData.data?.severity,
          new Date(arriveTime),
          null,
          index,
        );
        const { value: cat } = getValueFromDatasetByElevation(
          departureData.data?.cat,
          new Date(arriveTime),
          null,
          index,
        );
        const { value: mwt } = getValueFromDatasetByElevation(
          departureData.data?.mwt,
          new Date(arriveTime),
          null,
          index,
        );
        icingProb && icingProbs.push(icingProb);
        icingSeverity && icingSeverities.push(icingSeverity);
        turbulences.push(Math.max(cat, mwt));
      }
      accDistance += dist;
      arriveTime = newTime;
    } catch (err) {
      console.warn(err);
    }
  });
  const alongCeiling = Math.min(...ceilings);
  const alongVisibility = Math.min(...visibilities);
  const alongIcingProb = Math.max(...icingProbs);
  const alongIcingSeverity = Math.max(...icingSeverities);
  const alongTurbulence = Math.max(...turbulences);

  if (personalMins.ceiling_along_route[0] <= alongCeiling) {
    personalMinsEvaluation.alongRouteCeiling.value = 2;
    personalMinsEvaluation.alongRouteCeiling.color = personalMinValueToColor[2];
  } else if (personalMins.ceiling_along_route[1] <= alongCeiling) {
    personalMinsEvaluation.alongRouteCeiling.value = 1;
    personalMinsEvaluation.alongRouteCeiling.color = personalMinValueToColor[1];
  } else {
    personalMinsEvaluation.alongRouteCeiling.value = 0;
    personalMinsEvaluation.alongRouteCeiling.color = personalMinValueToColor[0];
  }

  if (personalMins.surface_visibility_along_route[0] <= alongVisibility) {
    personalMinsEvaluation.alongRouteVisibility.value = 2;
    personalMinsEvaluation.alongRouteVisibility.color = personalMinValueToColor[2];
  } else if (personalMins.surface_visibility_along_route[1] <= alongVisibility) {
    personalMinsEvaluation.alongRouteVisibility.value = 1;
    personalMinsEvaluation.alongRouteVisibility.color = personalMinValueToColor[1];
  } else {
    personalMinsEvaluation.alongRouteVisibility.value = 0;
    personalMinsEvaluation.alongRouteVisibility.color = personalMinValueToColor[0];
  }

  if (personalMins.en_route_icing_probability[0] > alongIcingProb) {
    personalMinsEvaluation.alongRouteProb.value = 2;
    personalMinsEvaluation.alongRouteProb.color = personalMinValueToColor[2];
  } else if (personalMins.en_route_icing_probability[1] > alongIcingProb) {
    personalMinsEvaluation.alongRouteProb.value = 1;
    personalMinsEvaluation.alongRouteProb.color = personalMinValueToColor[1];
  } else {
    personalMinsEvaluation.alongRouteProb.value = 0;
    personalMinsEvaluation.alongRouteProb.color = personalMinValueToColor[0];
  }

  if (personalMins.en_route_icing_intensity[0] > alongIcingSeverity) {
    personalMinsEvaluation.alongRouteSeverity.value = 2;
    personalMinsEvaluation.alongRouteSeverity.color = personalMinValueToColor[2];
  } else if (personalMins.en_route_icing_intensity[1] > alongIcingSeverity) {
    personalMinsEvaluation.alongRouteSeverity.value = 1;
    personalMinsEvaluation.alongRouteSeverity.color = personalMinValueToColor[1];
  } else {
    personalMinsEvaluation.alongRouteSeverity.value = 0;
    personalMinsEvaluation.alongRouteSeverity.color = personalMinValueToColor[0];
  }

  if (personalMins.en_route_turbulence_intensity[0] > alongTurbulence) {
    personalMinsEvaluation.alongRouteTurbulence.value = 2;
    personalMinsEvaluation.alongRouteTurbulence.color = personalMinValueToColor[2];
  } else if (personalMins.en_route_turbulence_intensity[1] > alongTurbulence) {
    personalMinsEvaluation.alongRouteTurbulence.value = 1;
    personalMinsEvaluation.alongRouteTurbulence.color = personalMinValueToColor[1];
  } else {
    personalMinsEvaluation.alongRouteTurbulence.value = 0;
    personalMinsEvaluation.alongRouteTurbulence.color = personalMinValueToColor[0];
  }

  return personalMinsEvaluation;
}

function DepartureAdvisor(props: { showPast: boolean }) {
  const dispatch = useDispatch();
  const settingsState = useSelector(selectSettings);
  const activeRoute = useSelector(selectActiveRoute);
  let defaultTime;
  const [updateUserSettingsAPI] = useUpdateUserSettingsMutation();
  const auth = useSelector(selectAuth);
  const [hideDotsBars, setHideDotsBars] = useState(true);
  const [getDepartureAdvisorData, getDepartureAdvisorDataResult] = useGetDepartureAdvisorDataMutation({
    fixedCacheKey: cacheKeys.departureAdvisor,
  });
  const [queryGfsWindDirectionData, queryGfsWindDirectionDataResult] = useQueryGfsWindDirectionDataMutation({
    fixedCacheKey: cacheKeys.gfsWinddirection,
  });
  const [queryGfsWindSpeedData, queryGfsWindSpeedDataResult] = useQueryGfsWindSpeedDataMutation({
    fixedCacheKey: cacheKeys.gfsWindspeed,
  });
  const { data: airportNbmData, isSuccess: isAirportNbmLoaded } = useGetAirportNbmQuery(
    activeRoute ? [activeRoute.departure.key, activeRoute.destination.key] : [],
    {
      skip: activeRoute === null,
    },
  );

  const [currEval, setCurrEval] = useState(initialEvaluation);
  const [beforeEval, setBeforeEval] = useState(initialEvaluation);
  const [afterEval, setAfterEval] = useState(initialEvaluation);
  const [colorByTimes, setColorByTimes] = useState(Array.from({ length: 8 }));
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(0);

  useEffect(() => {
    const day = new Date(settingsState.observation_time).getUTCDay();
    const hour = new Date(settingsState.observation_time);
    hour.setMinutes(0, 0, 0);
    setDay(day);
    setHour(hour.getTime());
    setHideDotsBars(false);
  }, [settingsState.observation_time]);

  useEffect(() => {
    if (activeRoute) {
      getDepartureAdvisorDataResult.reset();
      const queryPoints = interpolateRoute(activeRoute, getSegmentsCount(activeRoute) * flightCategoryDivide);
      const elevations = [];
      if (activeRoute.altitude % 1000 === 0) {
        elevations.push(activeRoute.altitude);
      } else {
        elevations.push(Math.floor(activeRoute.altitude / 1000) * 1000);
        elevations.push(Math.round(activeRoute.altitude / 1000) * 1000);
      }
      getDepartureAdvisorData({ queryPoints, elevations });
    }
  }, [activeRoute]);

  useEffect(() => {
    if (activeRoute && getDepartureAdvisorDataResult.isSuccess) {
      const queryPoints = interpolateRoute(activeRoute, getSegmentsCount(activeRoute) * flightCategoryDivide, true);
      const currEvaluation = getWheatherMinimumsAlongRoute(
        queryPoints,
        settingsState,
        settingsState.observation_time,
        activeRoute.useForecastWinds,
        activeRoute.altitude,
        settingsState.true_airspeed,
        getDepartureAdvisorDataResult,
        queryGfsWindSpeedDataResult,
        queryGfsWindDirectionDataResult,
        activeRoute.departure.key,
        activeRoute.destination.key,
        airportNbmData,
      );

      setCurrEval(currEvaluation);
      const beforeEvaluation = getWheatherMinimumsAlongRoute(
        queryPoints,
        settingsState,
        settingsState.observation_time - 3600 * 1000,
        activeRoute.useForecastWinds,
        activeRoute.altitude,
        settingsState.true_airspeed,
        getDepartureAdvisorDataResult,
        queryGfsWindSpeedDataResult,
        queryGfsWindDirectionDataResult,
        activeRoute.departure.key,
        activeRoute.destination.key,
        airportNbmData,
      );
      setBeforeEval(beforeEvaluation);
      const afterEvaluation = getWheatherMinimumsAlongRoute(
        queryPoints,
        settingsState,
        settingsState.observation_time + 3600 * 1000,
        activeRoute.useForecastWinds,
        activeRoute.altitude,
        settingsState.true_airspeed,
        getDepartureAdvisorDataResult,
        queryGfsWindSpeedDataResult,
        queryGfsWindDirectionDataResult,
        activeRoute.departure.key,
        activeRoute.destination.key,
        airportNbmData,
      );
      setAfterEval(afterEvaluation);
    }
  }, [getDepartureAdvisorDataResult.isSuccess, hour]);

  useEffect(() => {
    if (activeRoute && getDepartureAdvisorDataResult.isSuccess) {
      const queryPoints = interpolateRoute(activeRoute, getSegmentsCount(activeRoute) * flightCategoryDivide, true);
      const currentHour = new Date();
      currentHour.setMinutes(0, 0, 0);
      const evalByTimes: string[] = Array.from({ length: 8 }, (_value, index) => {
        const time = new Date(settingsState.observation_time);
        time.setUTCHours((index + 1) * 3);
        if (currentHour > time) {
          return personalMinValueToColor[10];
        } else {
          const evalByTime = getWheatherMinimumsAlongRoute(
            queryPoints,
            settingsState,
            time.getTime(),
            activeRoute.useForecastWinds,
            activeRoute.altitude,
            settingsState.true_airspeed,
            getDepartureAdvisorDataResult,
            queryGfsWindSpeedDataResult,
            queryGfsWindDirectionDataResult,
            activeRoute.departure.key,
            activeRoute.destination.key,
            airportNbmData,
          );
          const evalByTimeBefore = getWheatherMinimumsAlongRoute(
            queryPoints,
            settingsState,
            time.getTime() - 3600 * 1000,
            activeRoute.useForecastWinds,
            activeRoute.altitude,
            settingsState.true_airspeed,
            getDepartureAdvisorDataResult,
            queryGfsWindSpeedDataResult,
            queryGfsWindDirectionDataResult,
            activeRoute.departure.key,
            activeRoute.destination.key,
            airportNbmData,
          );
          const evalByTimeAfter = getWheatherMinimumsAlongRoute(
            queryPoints,
            settingsState,
            time.getTime() + 3600 * 1000,
            activeRoute.useForecastWinds,
            activeRoute.altitude,
            settingsState.true_airspeed,
            getDepartureAdvisorDataResult,
            queryGfsWindSpeedDataResult,
            queryGfsWindDirectionDataResult,
            activeRoute.departure.key,
            activeRoute.destination.key,
            airportNbmData,
          );
          const minValue = Math.min(
            ...Object.values(evalByTime).map((item) => item.value),
            ...Object.values(evalByTimeBefore).map((item) => item.value),
            ...Object.values(evalByTimeAfter).map((item) => item.value),
          );
          return personalMinValueToColor[minValue];
        }
      });
      setColorByTimes(evalByTimes);
    }
  }, [getDepartureAdvisorDataResult.isSuccess, day]);

  useEffect(() => {
    if (!hideDotsBars) {
      setHideDotsBars(true);
    }
  }, [settingsState.observation_time, hideDotsBars]);

  const valueToTime = (value: number): Date => {
    const origin = getTimeRangeStart(props.showPast);
    origin.setMinutes(value * 5);
    return origin;
  };

  const timeToValue = (time: Date): number => {
    const origin = getTimeRangeStart(props.showPast);
    const diff = diffMinutes(time, origin);
    return Math.floor(diff / 5);
  };

  function valuetext(value: number) {
    return (
      <div className="slider-label-container">
        <div className={'bars-container' + (hideDotsBars ? ' fade-out' : '')}>
          <div className="bar">
            <i
              className={`dot ${beforeEval.departureCeiling.color} ${
                personalMinValueToShape[beforeEval.departureCeiling.value]
              }`}
            ></i>
            <i
              className={`dot ${beforeEval.departureVisibility.color} ${
                personalMinValueToShape[beforeEval.departureVisibility.value]
              }`}
            ></i>
            <i
              className={`dot ${beforeEval.departureCrosswind.color} ${
                personalMinValueToShape[beforeEval.departureCrosswind.value]
              }`}
            ></i>
            <i
              className={`dot ${beforeEval.alongRouteCeiling.color} ${
                personalMinValueToShape[beforeEval.alongRouteCeiling.value]
              }`}
            ></i>
            <i
              className={`dot ${beforeEval.alongRouteVisibility.color} ${
                personalMinValueToShape[beforeEval.alongRouteVisibility.value]
              }`}
            ></i>
            <i
              className={`dot ${beforeEval.alongRouteProb.color} ${
                personalMinValueToShape[beforeEval.alongRouteProb.value]
              }`}
            ></i>
            <i
              className={`dot ${beforeEval.alongRouteSeverity.color} ${
                personalMinValueToShape[beforeEval.alongRouteSeverity.value]
              }`}
            ></i>
            <i
              className={`dot ${beforeEval.alongRouteTurbulence.color} ${
                personalMinValueToShape[beforeEval.alongRouteTurbulence.value]
              }`}
            ></i>
            <i
              className={`dot ${beforeEval.alongRouteConvection.color} ${
                personalMinValueToShape[beforeEval.alongRouteConvection.value]
              }`}
            ></i>
            <i
              className={`dot ${beforeEval.destinationCeiling.color} ${
                personalMinValueToShape[beforeEval.destinationCeiling.value]
              }`}
            ></i>
            <i
              className={`dot ${beforeEval.destinationVisibility.color} ${
                personalMinValueToShape[beforeEval.destinationVisibility.value]
              }`}
            ></i>
            <i
              className={`dot ${beforeEval.destinationCrosswind.color} ${
                personalMinValueToShape[beforeEval.destinationCrosswind.value]
              }`}
            ></i>
          </div>
          <div className="bar">
            <i
              className={`dot ${currEval.departureCeiling.color} ${
                personalMinValueToShape[currEval.departureCeiling.value]
              }`}
            ></i>
            <i
              className={`dot ${currEval.departureVisibility.color} ${
                personalMinValueToShape[currEval.departureVisibility.value]
              }`}
            ></i>
            <i
              className={`dot ${currEval.departureCrosswind.color} ${
                personalMinValueToShape[currEval.departureCrosswind.value]
              }`}
            ></i>
            <i
              className={`dot ${currEval.alongRouteCeiling.color} ${
                personalMinValueToShape[currEval.alongRouteCeiling.value]
              }`}
            ></i>
            <i
              className={`dot ${currEval.alongRouteVisibility.color} ${
                personalMinValueToShape[currEval.alongRouteVisibility.value]
              }`}
            ></i>
            <i
              className={`dot ${currEval.alongRouteProb.color} ${
                personalMinValueToShape[currEval.alongRouteProb.value]
              }`}
            ></i>
            <i
              className={`dot ${currEval.alongRouteSeverity.color} ${
                personalMinValueToShape[currEval.alongRouteSeverity.value]
              }`}
            ></i>
            <i
              className={`dot ${currEval.alongRouteTurbulence.color} ${
                personalMinValueToShape[currEval.alongRouteTurbulence.value]
              }`}
            ></i>
            <i
              className={`dot ${currEval.alongRouteConvection.color} ${
                personalMinValueToShape[currEval.alongRouteConvection.value]
              }`}
            ></i>
            <i
              className={`dot ${currEval.destinationCeiling.color} ${
                personalMinValueToShape[currEval.destinationCeiling.value]
              }`}
            ></i>
            <i
              className={`dot ${currEval.destinationVisibility.color} ${
                personalMinValueToShape[currEval.destinationVisibility.value]
              }`}
            ></i>
            <i
              className={`dot ${currEval.destinationCrosswind.color} ${
                personalMinValueToShape[currEval.destinationCrosswind.value]
              }`}
            ></i>
          </div>
          <div className="bar">
            <i
              className={`dot ${afterEval.departureCeiling.color} ${
                personalMinValueToShape[afterEval.departureCeiling.value]
              }`}
            ></i>
            <i
              className={`dot ${afterEval.departureVisibility.color} ${
                personalMinValueToShape[afterEval.departureVisibility.value]
              }`}
            ></i>
            <i
              className={`dot ${afterEval.departureCrosswind.color} ${
                personalMinValueToShape[afterEval.departureCrosswind.value]
              }`}
            ></i>
            <i
              className={`dot ${afterEval.alongRouteCeiling.color} ${
                personalMinValueToShape[afterEval.alongRouteCeiling.value]
              }`}
            ></i>
            <i
              className={`dot ${afterEval.alongRouteVisibility.color} ${
                personalMinValueToShape[afterEval.alongRouteVisibility.value]
              }`}
            ></i>
            <i
              className={`dot ${afterEval.alongRouteProb.color} ${
                personalMinValueToShape[afterEval.alongRouteProb.value]
              }`}
            ></i>
            <i
              className={`dot ${afterEval.alongRouteSeverity.color} ${
                personalMinValueToShape[afterEval.alongRouteSeverity.value]
              }`}
            ></i>
            <i
              className={`dot ${afterEval.alongRouteTurbulence.color} ${
                personalMinValueToShape[afterEval.alongRouteTurbulence.value]
              }`}
            ></i>
            <i
              className={`dot ${afterEval.alongRouteConvection.color} ${
                personalMinValueToShape[afterEval.alongRouteConvection.value]
              }`}
            ></i>
            <i
              className={`dot ${afterEval.destinationCeiling.color} ${
                personalMinValueToShape[afterEval.destinationCeiling.value]
              }`}
            ></i>
            <i
              className={`dot ${afterEval.destinationVisibility.color} ${
                personalMinValueToShape[afterEval.destinationVisibility.value]
              }`}
            ></i>
            <i
              className={`dot ${afterEval.destinationCrosswind.color} ${
                personalMinValueToShape[afterEval.destinationCrosswind.value]
              }`}
            ></i>
          </div>
        </div>
        <div className="label">{simpleTimeOnlyFormat(valueToTime(value), settingsState.default_time_display_unit)}</div>
      </div>
    );
  }

  const handleTimeChange = (time: Date, commit = true) => {
    const timespan = time.getTime();
    const newSettings = { ...settingsState, observation_time: timespan };
    if (commit && auth.id) updateUserSettingsAPI(newSettings);
    dispatch(setUserSettings(newSettings));
  };

  if (
    settingsState.observation_time >= getTimeRangeStart(props.showPast).getTime() &&
    settingsState.observation_time <= valueToTime(84 * 12).getTime()
  ) {
    defaultTime = new Date(settingsState.observation_time);
  } else {
    defaultTime = new Date();
    handleTimeChange(defaultTime, true);
  }

  function handleClick3h(isForward) {
    const newTime = settingsState.observation_time + (isForward ? 1 : -1) * 3 * 3600 * 1000;
    handleTimeChange(new Date(newTime), true);
  }

  function handleClickHour(hour: number) {
    const oldTime = new Date(settingsState.observation_time);
    settingsState.default_time_display_unit ? oldTime.setHours(hour, 0, 0, 0) : oldTime.setUTCHours(hour, 0, 0, 0);
    handleTimeChange(oldTime, true);
  }

  return (
    <div className="departure-advisor">
      <div className="blocks-container">
        <div className="move-left" onClick={() => handleClick3h(false)}>
          -3h
        </div>
        <div className="blocks-date">
          <div className="horizental-blocks">
            <div className={`block ${colorByTimes[0]}`} onClick={() => handleClickHour(3)}>
              3z
            </div>
            <div className={`block ${colorByTimes[1]}`} onClick={() => handleClickHour(6)}>
              6z
            </div>
            <div className={`block ${colorByTimes[2]}`} onClick={() => handleClickHour(9)}>
              9z
            </div>
            <div className={`block ${colorByTimes[3]}`} onClick={() => handleClickHour(12)}>
              12z
            </div>
            <div className={`block ${colorByTimes[4]}`} onClick={() => handleClickHour(15)}>
              15z
            </div>
            <div className={`block ${colorByTimes[5]}`} onClick={() => handleClickHour(18)}>
              18z
            </div>
            <div className={`block ${colorByTimes[6]}`} onClick={() => handleClickHour(21)}>
              21z
            </div>
            <div className={`block ${colorByTimes[7]}`} onClick={() => handleClickHour(24)}>
              24z
            </div>
          </div>
          <div className="date">
            {simpleTimeFormat(new Date(settingsState.observation_time), settingsState.default_time_display_unit)}
          </div>
        </div>
        <div className="move-right" onClick={() => handleClick3h(true)}>
          +3h
        </div>
      </div>
      <Slider
        className="time-slider"
        key={`time-range-slider`}
        aria-label="Time Slider"
        // defaultValue={timeToValue(defaultTime)}
        value={timeToValue(defaultTime)}
        max={props.showPast ? 84 * 12 : 72 * 12}
        valueLabelFormat={valuetext}
        step={1}
        valueLabelDisplay="on"
        onChange={(_e, newValue: number) => {
          handleTimeChange(valueToTime(newValue), false);
        }}
        onChangeCommitted={(_e, newValue: number) => {
          handleTimeChange(valueToTime(newValue));
        }}
      />
    </div>
  );
}

export default DepartureAdvisor;
