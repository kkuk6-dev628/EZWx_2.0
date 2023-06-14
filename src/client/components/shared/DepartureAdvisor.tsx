/* eslint-disable @typescript-eslint/ban-ts-comment */
import Slider from '@mui/material/Slider';
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import {
  addLeadingZeroes,
  diffMinutes,
  getTimeRangeStart,
  simpleTimeFormat,
  simpleTimeOnlyFormat,
} from '../map/common/AreoFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
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
import { DateObject } from 'react-multi-date-picker';
import DepartureAdvisorPopup, { getEvaluationByTime } from './DepartureAdvisorPopup';
import { getMaxForecastTime } from '../route-profile/RouteProfileDataLoader';
import { PaperComponent } from '../map/leaflet/Map';
import DepartureAdvisorTimeBlockComponent from './DepartureAdvisorTimeBlockComponent';

type personalMinValue = 0 | 1 | 2 | 10;
type personalMinColor = 'red' | 'yellow' | 'green' | 'grey';
type personalMinShape = 'rect' | 'circle' | 'triangle';

export interface PersonalMinsEvaluation {
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

export const personalMinValueToColor: {
  0: personalMinColor;
  1: personalMinColor;
  2: personalMinColor;
  10: personalMinColor;
} = {
  0: 'red',
  1: 'yellow',
  2: 'green',
  10: 'grey',
};
export const personalMinValueToShape: {
  0: personalMinShape;
  1: personalMinShape;
  2: personalMinShape;
  10: personalMinShape;
} = {
  0: 'triangle',
  1: 'rect',
  2: 'circle',
  10: 'rect',
};
export const hourInMili = 3600 * 1000;

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

// return values 0: None, 1: Very Low, 2: Low, 3: Mod, 4: Hi, 5: Very Hi
function evaluateConvection(wx_1: number, wx_2: number, wxInten1, wxInten2, wxProbCov1, wxProbCov2) {
  if (wx_1 === 5 && wx_2 === 4) {
    switch (wxProbCov1) {
      case 1:
        switch (wxProbCov2) {
          case 5:
            switch (wxInten1) {
              case 1:
                return 1;
                break;
              case 2:
                return 2;
                break;
              case 3:
                return 3;
                break;
            }
            break;
          case 6:
            switch (wxInten1) {
              case 1:
                return 2;
                break;
              case 2:
                return 3;
                break;
              case 3:
                return 4;
                break;
            }
            break;
          case 7:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 5;
                break;
            }
            break;
        }
        break;
      case 2:
        switch (wxProbCov2) {
          case 5:
            switch (wxInten1) {
              case 1:
                return 2;
                break;
              case 2:
                return 3;
                break;
              case 3:
                return 4;
                break;
            }
            break;
          case 6:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 5;
                break;
            }
            break;
          case 7:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 5;
                break;
            }
            break;
        }
        break;
      case 3:
        switch (wxProbCov2) {
          case 5:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 5;
                break;
            }
            break;
          case 6:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 4;
                break;
            }
            break;
          case 7:
            switch (wxInten1) {
              case 1:
                return 4;
                break;
              case 2:
                return 5;
                break;
              case 3:
                return 5;
                break;
            }
            break;
        }
        break;
      case 4:
        switch (wxProbCov2) {
          case 5:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 4;
                break;
            }
            break;
          case 6:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 5;
                break;
            }
            break;
          case 7:
            switch (wxInten1) {
              case 1:
                return 4;
                break;
              case 2:
                return 5;
                break;
              case 3:
                return 5;
                break;
            }
            break;
        }
        break;
    }
  } else if (wx_1 === 4 && wx_2 === 5) {
    switch (wxProbCov2) {
      case 1:
        switch (wxProbCov1) {
          case 5:
            switch (wxInten1) {
              case 1:
                return 1;
                break;
              case 2:
                return 2;
                break;
              case 3:
                return 3;
                break;
            }
            break;
          case 6:
            switch (wxInten1) {
              case 1:
                return 2;
                break;
              case 2:
                return 3;
                break;
              case 3:
                return 4;
                break;
            }
            break;
          case 7:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 5;
                break;
            }
            break;
        }
        break;
      case 2:
        switch (wxProbCov1) {
          case 5:
            switch (wxInten1) {
              case 1:
                return 2;
                break;
              case 2:
                return 3;
                break;
              case 3:
                return 4;
                break;
            }
            break;
          case 6:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 5;
                break;
            }
            break;
          case 7:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 5;
                break;
            }
            break;
        }
        break;
      case 3:
        switch (wxProbCov1) {
          case 5:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 5;
                break;
            }
            break;
          case 6:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 4;
                break;
            }
            break;
          case 7:
            switch (wxInten1) {
              case 1:
                return 4;
                break;
              case 2:
                return 5;
                break;
              case 3:
                return 5;
                break;
            }
            break;
        }
        break;
      case 4:
        switch (wxProbCov1) {
          case 5:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 4;
                break;
            }
            break;
          case 6:
            switch (wxInten1) {
              case 1:
                return 3;
                break;
              case 2:
                return 4;
                break;
              case 3:
                return 5;
                break;
            }
            break;
          case 7:
            switch (wxInten1) {
              case 1:
                return 4;
                break;
              case 2:
                return 5;
                break;
              case 3:
                return 5;
                break;
            }
            break;
        }
        break;
    }
  } else if (wx_1 === 5 && wx_2 !== 4) {
    switch (wxProbCov1) {
      case 1:
        switch (wxInten1) {
          case 1:
            return 1;
            break;
          case 2:
            return 2;
            break;
          case 3:
            return 3;
            break;
        }
        break;
      case 2:
        switch (wxInten1) {
          case 1:
            return 2;
            break;
          case 2:
            return 3;
            break;
          case 3:
            return 4;
            break;
        }
        break;
      case 3:
        switch (wxInten1) {
          case 1:
            return 3;
            break;
          case 2:
            return 4;
            break;
          case 3:
            return 5;
            break;
        }
        break;
      case 4:
        switch (wxInten1) {
          case 1:
            return 4;
            break;
          case 2:
            return 4;
            break;
          case 3:
            return 5;
            break;
        }
        break;
    }
  } else if (wx_2 === 5 && wx_1 !== 4) {
    switch (wxProbCov2) {
      case 1:
        switch (wxInten2) {
          case 1:
            return 1;
            break;
          case 2:
            return 2;
            break;
          case 3:
            return 3;
            break;
        }
        break;
      case 2:
        switch (wxInten2) {
          case 1:
            return 2;
            break;
          case 2:
            return 3;
            break;
          case 3:
            return 4;
            break;
        }
        break;
      case 3:
        switch (wxInten2) {
          case 1:
            return 3;
            break;
          case 2:
            return 4;
            break;
          case 3:
            return 5;
            break;
        }
        break;
      case 4:
        switch (wxInten2) {
          case 1:
            return 4;
            break;
          case 2:
            return 4;
            break;
          case 3:
            return 5;
            break;
        }
        break;
    }
  } else if (wx_1 === 4 && wx_2 !== 5) {
    switch (wxProbCov1) {
      case 5:
        return 2;
        break;
      case 6:
        return 3;
        break;
      case 7:
        return 4;
        break;
    }
  } else if (wx_2 === 4 && wx_1 !== 5) {
    switch (wxProbCov2) {
      case 5:
        return 2;
        break;
      case 6:
        return 3;
        break;
      case 7:
        return 4;
        break;
    }
  }
}

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
  const convections = [];
  let isOutTimeRange = false;
  const maxForcastTime = getMaxForecastTime(departureData.data?.prob);

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
        if (personalMins.ceiling_at_destination[1] <= cloudceiling || cloudceiling === null || cloudceiling === 0) {
          personalMinsEvaluation.destinationCeiling.value = 2;
          personalMinsEvaluation.destinationCeiling.color = personalMinValueToColor[2];
        } else if (personalMins.ceiling_at_destination[0] <= cloudceiling) {
          personalMinsEvaluation.destinationCeiling.value = 1;
          personalMinsEvaluation.destinationCeiling.color = personalMinValueToColor[1];
        } else {
          personalMinsEvaluation.destinationCeiling.value = 0;
          personalMinsEvaluation.destinationCeiling.color = personalMinValueToColor[0];
        }
        if (personalMins.surface_visibility_at_destination[1] <= visibility) {
          personalMinsEvaluation.destinationVisibility.value = 2;
          personalMinsEvaluation.destinationVisibility.color = personalMinValueToColor[2];
        } else if (personalMins.surface_visibility_at_destination[0] <= visibility) {
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
        if (arriveTime > maxForcastTime.getTime()) {
          isOutTimeRange = true;
        }
      } else {
        cloudceiling && ceilings.push(cloudceiling);
        visibility && visibilities.push(visibility);
        if (routeAltitude <= 30000 && arriveTime <= maxForcastTime.getTime()) {
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
        } else {
          isOutTimeRange = true;
        }

        const { value: wx_1 } = getValueFromDatasetByElevation(
          departureData.data?.wx_1,
          new Date(arriveTime),
          null,
          index,
        );
        const { value: wx_2 } = getValueFromDatasetByElevation(
          departureData.data?.wx_2,
          new Date(arriveTime),
          null,
          index,
        );
        const { value: wxInten1 } = getValueFromDatasetByElevation(
          departureData.data?.wxInten1,
          new Date(arriveTime),
          null,
          index,
        );
        const { value: wxInten2 } = getValueFromDatasetByElevation(
          departureData.data?.wxInten2,
          new Date(arriveTime),
          null,
          index,
        );
        const { value: wxProbCov1 } = getValueFromDatasetByElevation(
          departureData.data?.wxProbCov1,
          new Date(arriveTime),
          null,
          index,
        );
        const { value: wxProbCov2 } = getValueFromDatasetByElevation(
          departureData.data?.wxProbCov2,
          new Date(arriveTime),
          null,
          index,
        );
        const convection = evaluateConvection(wx_1, wx_2, wxInten1, wxInten2, wxProbCov1, wxProbCov2);
        convection && convections.push(convection);
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
  const alongConvection = Math.max(...convections);

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

  if (isOutTimeRange) {
    personalMinsEvaluation.alongRouteProb = { ...initialEvaluation.alongRouteProb };
  } else if (personalMins.en_route_icing_probability[0] > alongIcingProb) {
    personalMinsEvaluation.alongRouteProb.value = 2;
    personalMinsEvaluation.alongRouteProb.color = personalMinValueToColor[2];
  } else if (personalMins.en_route_icing_probability[1] > alongIcingProb) {
    personalMinsEvaluation.alongRouteProb.value = 1;
    personalMinsEvaluation.alongRouteProb.color = personalMinValueToColor[1];
  } else {
    personalMinsEvaluation.alongRouteProb.value = 0;
    personalMinsEvaluation.alongRouteProb.color = personalMinValueToColor[0];
  }

  if (isOutTimeRange) {
    personalMinsEvaluation.alongRouteSeverity = { ...initialEvaluation.alongRouteSeverity };
  } else if (personalMins.en_route_icing_intensity[0] > alongIcingSeverity) {
    personalMinsEvaluation.alongRouteSeverity.value = 2;
    personalMinsEvaluation.alongRouteSeverity.color = personalMinValueToColor[2];
  } else if (personalMins.en_route_icing_intensity[1] > alongIcingSeverity) {
    personalMinsEvaluation.alongRouteSeverity.value = 1;
    personalMinsEvaluation.alongRouteSeverity.color = personalMinValueToColor[1];
  } else {
    personalMinsEvaluation.alongRouteSeverity.value = 0;
    personalMinsEvaluation.alongRouteSeverity.color = personalMinValueToColor[0];
  }

  if (isOutTimeRange) {
    personalMinsEvaluation.alongRouteTurbulence = { ...initialEvaluation.alongRouteTurbulence };
  } else if (personalMins.en_route_turbulence_intensity[0] > alongTurbulence) {
    personalMinsEvaluation.alongRouteTurbulence.value = 2;
    personalMinsEvaluation.alongRouteTurbulence.color = personalMinValueToColor[2];
  } else if (personalMins.en_route_turbulence_intensity[1] > alongTurbulence) {
    personalMinsEvaluation.alongRouteTurbulence.value = 1;
    personalMinsEvaluation.alongRouteTurbulence.color = personalMinValueToColor[1];
  } else {
    personalMinsEvaluation.alongRouteTurbulence.value = 0;
    personalMinsEvaluation.alongRouteTurbulence.color = personalMinValueToColor[0];
  }

  if (personalMins.en_route_convective_potential[0] > alongConvection) {
    personalMinsEvaluation.alongRouteConvection.value = 2;
    personalMinsEvaluation.alongRouteConvection.color = personalMinValueToColor[2];
  } else if (personalMins.en_route_convective_potential[1] > alongConvection) {
    personalMinsEvaluation.alongRouteConvection.value = 1;
    personalMinsEvaluation.alongRouteConvection.color = personalMinValueToColor[1];
  } else {
    personalMinsEvaluation.alongRouteConvection.value = 0;
    personalMinsEvaluation.alongRouteConvection.color = personalMinValueToColor[0];
  }

  return personalMinsEvaluation;
}

function DepartureAdvisor(props: { showPast: boolean }) {
  const dispatch = useDispatch();
  const settingsState = useSelector(selectSettings);
  const activeRoute = useSelector(selectActiveRoute);
  let currentTime: Date;
  const [updateUserSettingsAPI] = useUpdateUserSettingsMutation();
  const auth = useSelector(selectAuth);
  const [hideDotsBars, setHideDotsBars] = useState(true);
  const [clickedDotsBars, setClickedDotsBars] = useState(false);
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

  const blockhours = 3;
  const stepsPerHour = 12;
  const timeRange = props.showPast ? 84 : 72;
  const [currEval, setCurrEval] = useState(initialEvaluation);
  const [beforeEval, setBeforeEval] = useState(null);
  const [afterEval, setAfterEval] = useState(initialEvaluation);
  const [colorByTimes, setColorByTimes] = useState<string[]>(Array.from({ length: 8 }));
  const [hour, setHour] = useState(0);
  const blockCount = timeRange / blockhours;
  const [currentHour, setCurrentHour] = useState(new Date().getUTCHours());

  const maxRange = timeRange * stepsPerHour;
  const blockInterval = blockhours * stepsPerHour;
  const startTime = getTimeRangeStart(props.showPast);
  startTime.setUTCHours(startTime.getUTCHours() + 1, 0, 0, 0);
  const [blockTimes, setBlockTimes] = useState(calcBlockTimes());
  const [blockDays, setBlockDays] = useState(calcBlockDays());
  const [showPopup, setShowPopup] = useState(false);
  const [evaluationsByTime, setEvaluationsByTime] = useState<any[]>();
  const dotElementRef = useRef(null);
  const [showBarComponent, setShowBarComponent] = useState(false);
  const [barPos, setBarPos] = useState(0);

  function calcBlockTimes() {
    return Array.from({ length: blockCount }, (_v, index) => {
      const time = new Date(startTime);
      time.setUTCHours(time.getUTCHours() + index * 3);
      return time;
    });
  }

  function calcBlockDays() {
    if (settingsState.default_time_display_unit) {
      const startDate = startTime.getDate();
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + timeRange);
      const endDate = endTime.getDate();
      return Array.from({ length: endDate - startDate + 1 }, (_, i) => {
        const date = new Date(startTime);
        date.setDate(i + startDate);
        let width = 24 / timeRange;
        if (i === 0) {
          width = (24 - startTime.getHours()) / timeRange;
        } else if (i === endDate - startDate) {
          width = endTime.getHours() / timeRange;
        }
        return {
          date: date,
          width: width * 100,
        };
      });
    } else {
      const startDate = startTime.getUTCDate();
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + timeRange);
      const endDate = endTime.getUTCDate();
      return Array.from({ length: endDate - startDate + 1 }, (_, i) => {
        const date = new Date(startTime);
        date.setUTCDate(i + startDate);
        let width = 24 / timeRange;
        if (i === 0) {
          width = (24 - startTime.getUTCHours()) / timeRange;
        } else if (i === endDate - startDate) {
          width = endTime.getUTCHours() / timeRange;
        }
        return {
          date: date,
          width: width * 100,
        };
      });
    }
  }

  useEffect(() => {
    const days = calcBlockDays();
    setBlockDays(days);
    const times = calcBlockTimes();
    setBlockTimes(times);
  }, [currentHour, settingsState.default_time_display_unit]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentHour(new Date().getHours()), 1000);
    return () => clearInterval(interval);
  }, []);
  // useEffect(() => {
  //   window.addEventListener('resize', handleWindowSizeChange);
  //   return () => {
  //     window.removeEventListener('resize', handleWindowSizeChange);
  //   };
  // }, []);

  // const handleWindowSizeChange = () => {
  //   if (window.innerWidth >= 1000) {
  //     setBlockCount(28);
  //   } else if (window.innerWidth > 720) {
  //     setBlockCount(16);
  //   }
  // };

  useEffect(() => {
    const hour = new Date(settingsState.observation_time);
    hour.setMinutes(0, 0, 0);
    setHour(hour.getTime());
    setHideDotsBars(false);
    setClickedDotsBars(false);
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
    if (activeRoute && getDepartureAdvisorDataResult.isSuccess && evaluationsByTime) {
      const currentTime = new Date();
      currentTime.setMinutes(0, 0, 0);
      const currentTimeMili = currentTime.getTime();
      const currEvaluation =
        settingsState.observation_time < currentTimeMili
          ? { ...initialEvaluation }
          : getEvaluationByTime(evaluationsByTime, settingsState.observation_time);
      setCurrEval(currEvaluation);
      const beforeEvaluation =
        settingsState.observation_time - hourInMili < currentTimeMili
          ? { ...initialEvaluation }
          : getEvaluationByTime(evaluationsByTime, settingsState.observation_time - hourInMili);
      setBeforeEval(beforeEvaluation);
      const afterEvaluation =
        settingsState.observation_time + hourInMili < currentTimeMili
          ? { ...initialEvaluation }
          : getEvaluationByTime(evaluationsByTime, settingsState.observation_time + hourInMili);
      setAfterEval(afterEvaluation);
    }
  }, [
    getDepartureAdvisorDataResult.isSuccess,
    hour,
    activeRoute,
    settingsState.ceiling_at_departure,
    settingsState.ceiling_along_route,
    settingsState.ceiling_at_destination,
    settingsState.surface_visibility_along_route,
    settingsState.surface_visibility_at_departure,
    settingsState.surface_visibility_at_destination,
    settingsState.crosswinds_at_departure_airport,
    settingsState.crosswinds_at_destination_airport,
    settingsState.en_route_icing_intensity,
    settingsState.en_route_icing_probability,
    settingsState.en_route_convective_potential,
    settingsState.en_route_turbulence_intensity,
  ]);

  useEffect(() => {
    if (activeRoute && getDepartureAdvisorDataResult.isSuccess) {
      const queryPoints = interpolateRoute(activeRoute, getSegmentsCount(activeRoute) * flightCategoryDivide, true);
      const currentHour = new Date();
      currentHour.setMinutes(0, 0, 0);
      const evaluationsByTime = [];
      const evalByTimes: string[] = blockTimes.map((time, index) => {
        if (currentHour > time) {
          return personalMinValueToColor[10];
        } else {
          const evalByTimeBefore = getWheatherMinimumsAlongRoute(
            queryPoints,
            settingsState,
            time.getTime() - hourInMili,
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
          evaluationsByTime.push({ time: time.getTime() - hourInMili, evaluation: evalByTimeBefore });
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
          evaluationsByTime.push({ time: time.getTime(), evaluation: evalByTime });
          const evalByTimeAfter = getWheatherMinimumsAlongRoute(
            queryPoints,
            settingsState,
            time.getTime() + hourInMili,
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
          evaluationsByTime.push({ time: time.getTime() + hourInMili, evaluation: evalByTimeAfter });
          const minValue = Math.min(
            ...Object.values(evalByTime).map((item) => item.value),
            ...Object.values(evalByTimeBefore).map((item) => item.value),
            ...Object.values(evalByTimeAfter).map((item) => item.value),
          );
          return personalMinValueToColor[minValue];
        }
      });
      setColorByTimes(evalByTimes);
      setEvaluationsByTime(evaluationsByTime);
    }
  }, [
    getDepartureAdvisorDataResult.isSuccess,
    queryGfsWindDirectionDataResult.isSuccess,
    activeRoute,
    // currentHour,
    settingsState.ceiling_at_departure,
    settingsState.ceiling_along_route,
    settingsState.ceiling_at_destination,
    settingsState.surface_visibility_along_route,
    settingsState.surface_visibility_at_departure,
    settingsState.surface_visibility_at_destination,
    settingsState.crosswinds_at_departure_airport,
    settingsState.crosswinds_at_destination_airport,
    settingsState.en_route_icing_intensity,
    settingsState.en_route_icing_probability,
    settingsState.en_route_convective_potential,
    settingsState.en_route_turbulence_intensity,
  ]);

  useEffect(() => {
    if (!hideDotsBars && !clickedDotsBars) {
      setHideDotsBars(true);
    }
  }, [settingsState.observation_time, hideDotsBars]);

  useEffect(() => {
    if (dotElementRef.current) {
      // dotElementRef.current.addEventListener('click', clickEvaluationBar);
    }
  }, [dotElementRef.current]);

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

  function clickEvaluationBar(e: SyntheticEvent) {
    e.nativeEvent.stopPropagation();
    setHideDotsBars(false);
    setClickedDotsBars(true);
    evaluationsByTime && setShowPopup(true);
  }

  function valuetext(value: number) {
    return (
      <div className="slider-label-container">
        {beforeEval && (
          <div
            ref={dotElementRef}
            className={'bars-container' + (hideDotsBars ? ' fade-out' : '')}
            onClick={clickEvaluationBar}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseOver={() => {
              setHideDotsBars(false);
              setClickedDotsBars(true);
            }}
            onMouseOut={() => {
              setHideDotsBars(true);
              setClickedDotsBars(false);
            }}
          >
            <div className="bar">
              <i
                title="Departure ceiling height"
                className={`dot ${beforeEval.departureCeiling.color} ${
                  personalMinValueToShape[beforeEval.departureCeiling.value]
                }`}
              ></i>
              <i
                title="Departure surface visibility"
                className={`dot ${beforeEval.departureVisibility.color} ${
                  personalMinValueToShape[beforeEval.departureVisibility.value]
                }`}
              ></i>
              <i
                title="Departure crosswinds"
                className={`dot ${beforeEval.departureCrosswind.color} ${
                  personalMinValueToShape[beforeEval.departureCrosswind.value]
                }`}
              ></i>
              <i
                title="En route ceiling height"
                className={`dot ${beforeEval.alongRouteCeiling.color} ${
                  personalMinValueToShape[beforeEval.alongRouteCeiling.value]
                }`}
              ></i>
              <i
                title="En route surface visibility"
                className={`dot ${beforeEval.alongRouteVisibility.color} ${
                  personalMinValueToShape[beforeEval.alongRouteVisibility.value]
                }`}
              ></i>
              <i
                title="En route icing probability"
                className={`dot ${beforeEval.alongRouteProb.color} ${
                  personalMinValueToShape[beforeEval.alongRouteProb.value]
                }`}
              ></i>
              <i
                title="En route icing severity"
                className={`dot ${beforeEval.alongRouteSeverity.color} ${
                  personalMinValueToShape[beforeEval.alongRouteSeverity.value]
                }`}
              ></i>
              <i
                title="En route turbulence intensity"
                className={`dot ${beforeEval.alongRouteTurbulence.color} ${
                  personalMinValueToShape[beforeEval.alongRouteTurbulence.value]
                }`}
              ></i>
              <i
                title="En route convective potential"
                className={`dot ${beforeEval.alongRouteConvection.color} ${
                  personalMinValueToShape[beforeEval.alongRouteConvection.value]
                }`}
              ></i>
              <i
                title="Destination ceiling height"
                className={`dot ${beforeEval.destinationCeiling.color} ${
                  personalMinValueToShape[beforeEval.destinationCeiling.value]
                }`}
              ></i>
              <i
                title="Destination surface visibility"
                className={`dot ${beforeEval.destinationVisibility.color} ${
                  personalMinValueToShape[beforeEval.destinationVisibility.value]
                }`}
              ></i>
              <i
                title="Destination crosswinds"
                className={`dot ${beforeEval.destinationCrosswind.color} ${
                  personalMinValueToShape[beforeEval.destinationCrosswind.value]
                }`}
              ></i>
            </div>
            <div className="bar">
              <i
                title="Departure ceiling height"
                className={`dot ${currEval.departureCeiling.color} ${
                  personalMinValueToShape[currEval.departureCeiling.value]
                }`}
              ></i>
              <i
                title="Departure surface visibility"
                className={`dot ${currEval.departureVisibility.color} ${
                  personalMinValueToShape[currEval.departureVisibility.value]
                }`}
              ></i>
              <i
                title="Departure crosswinds"
                className={`dot ${currEval.departureCrosswind.color} ${
                  personalMinValueToShape[currEval.departureCrosswind.value]
                }`}
              ></i>
              <i
                title="En route ceiling height"
                className={`dot ${currEval.alongRouteCeiling.color} ${
                  personalMinValueToShape[currEval.alongRouteCeiling.value]
                }`}
              ></i>
              <i
                title="En route surface visibility"
                className={`dot ${currEval.alongRouteVisibility.color} ${
                  personalMinValueToShape[currEval.alongRouteVisibility.value]
                }`}
              ></i>
              <i
                title="En route icing probability"
                className={`dot ${currEval.alongRouteProb.color} ${
                  personalMinValueToShape[currEval.alongRouteProb.value]
                }`}
              ></i>
              <i
                title="En route icing severity"
                className={`dot ${currEval.alongRouteSeverity.color} ${
                  personalMinValueToShape[currEval.alongRouteSeverity.value]
                }`}
              ></i>
              <i
                title="En route turbulence intensity"
                className={`dot ${currEval.alongRouteTurbulence.color} ${
                  personalMinValueToShape[currEval.alongRouteTurbulence.value]
                }`}
              ></i>
              <i
                title="En route convective potential"
                className={`dot ${currEval.alongRouteConvection.color} ${
                  personalMinValueToShape[currEval.alongRouteConvection.value]
                }`}
              ></i>
              <i
                title="Destination ceiling height"
                className={`dot ${currEval.destinationCeiling.color} ${
                  personalMinValueToShape[currEval.destinationCeiling.value]
                }`}
              ></i>
              <i
                title="Destination surface visibility"
                className={`dot ${currEval.destinationVisibility.color} ${
                  personalMinValueToShape[currEval.destinationVisibility.value]
                }`}
              ></i>
              <i
                title="Destination crosswinds"
                className={`dot ${currEval.destinationCrosswind.color} ${
                  personalMinValueToShape[currEval.destinationCrosswind.value]
                }`}
              ></i>
            </div>
            <div className="bar">
              <i
                title="Departure ceiling height"
                className={`dot ${afterEval.departureCeiling.color} ${
                  personalMinValueToShape[afterEval.departureCeiling.value]
                }`}
              ></i>
              <i
                title="Departure surface visibility"
                className={`dot ${afterEval.departureVisibility.color} ${
                  personalMinValueToShape[afterEval.departureVisibility.value]
                }`}
              ></i>
              <i
                title="Departure crosswinds"
                className={`dot ${afterEval.departureCrosswind.color} ${
                  personalMinValueToShape[afterEval.departureCrosswind.value]
                }`}
              ></i>
              <i
                title="En route ceiling height"
                className={`dot ${afterEval.alongRouteCeiling.color} ${
                  personalMinValueToShape[afterEval.alongRouteCeiling.value]
                }`}
              ></i>
              <i
                title="En route surface visibility"
                className={`dot ${afterEval.alongRouteVisibility.color} ${
                  personalMinValueToShape[afterEval.alongRouteVisibility.value]
                }`}
              ></i>
              <i
                title="En route icing probability"
                className={`dot ${afterEval.alongRouteProb.color} ${
                  personalMinValueToShape[afterEval.alongRouteProb.value]
                }`}
              ></i>
              <i
                title="En route icing severity"
                className={`dot ${afterEval.alongRouteSeverity.color} ${
                  personalMinValueToShape[afterEval.alongRouteSeverity.value]
                }`}
              ></i>
              <i
                title="En route turbulence intensity"
                className={`dot ${afterEval.alongRouteTurbulence.color} ${
                  personalMinValueToShape[afterEval.alongRouteTurbulence.value]
                }`}
              ></i>
              <i
                title="En route convective potential"
                className={`dot ${afterEval.alongRouteConvection.color} ${
                  personalMinValueToShape[afterEval.alongRouteConvection.value]
                }`}
              ></i>
              <i
                title="Destination ceiling height"
                className={`dot ${afterEval.destinationCeiling.color} ${
                  personalMinValueToShape[afterEval.destinationCeiling.value]
                }`}
              ></i>
              <i
                title="Destination surface visibility"
                className={`dot ${afterEval.destinationVisibility.color} ${
                  personalMinValueToShape[afterEval.destinationVisibility.value]
                }`}
              ></i>
              <i
                title="Destination crosswinds"
                className={`dot ${afterEval.destinationCrosswind.color} ${
                  personalMinValueToShape[afterEval.destinationCrosswind.value]
                }`}
              ></i>
            </div>
          </div>
        )}
        <div className="label">{simpleTimeOnlyFormat(valueToTime(value), settingsState.default_time_display_unit)}</div>
      </div>
    );
  }

  const handleTimeChange = (time: Date, commit = true) => {
    setHideDotsBars(false);
    const timespan = time.getTime();
    const newSettings = { ...settingsState, observation_time: timespan };
    if (commit && auth.id) updateUserSettingsAPI(newSettings);
    dispatch(setUserSettings(newSettings));
  };

  if (
    settingsState.observation_time >= getTimeRangeStart(props.showPast).getTime() &&
    settingsState.observation_time <= valueToTime(84 * 12).getTime()
  ) {
    currentTime = new Date(settingsState.observation_time);
  } else {
    currentTime = new Date();
    handleTimeChange(currentTime, true);
  }

  function handleClick3h(e, isForward) {
    e.currentTarget.disabled = true;
    const newTime = settingsState.observation_time + (isForward ? 1 : -1) * 3 * 3600 * 1000;
    handleTimeChange(new Date(newTime), true);
  }

  return (
    <div className="departure-advisor">
      <Dialog
        PaperComponent={PaperComponent}
        hideBackdrop
        disableEnforceFocus
        style={{ position: 'absolute' }}
        open={showPopup}
        onClose={() => setShowPopup(false)}
        aria-labelledby="draggable-dialog-title"
      >
        <DepartureAdvisorPopup
          setIsShowDateModal={setShowPopup}
          evaluationsByTime={evaluationsByTime}
          observationTime={settingsState.observation_time}
        />
      </Dialog>
      <div className="blocks-container">
        <div
          className={
            'prevent-select move-left' +
            (currentTime.getTime() - blockhours * 3600 * 1000 < getTimeRangeStart(props.showPast).getTime()
              ? ' disabled'
              : '')
          }
          onClick={(e) => handleClick3h(e, false)}
        >
          -3h
        </div>
        <div className="blocks-date">
          <div className="blocks-contents">
            <div className="horizental-blocks">
              {evaluationsByTime &&
                blockTimes.map((time, index) => (
                  <DepartureAdvisorTimeBlockComponent
                    key={'departure-advisor-block-' + index}
                    index={index}
                    time={time}
                    color={colorByTimes[index]}
                    isMap={blockTimes.length > 24}
                    evaluationsByTime={evaluationsByTime}
                    setShowPopup={setShowPopup}
                    handleTimeChange={handleTimeChange}
                  ></DepartureAdvisorTimeBlockComponent>
                ))}
            </div>
            <div className="date-container">
              {blockDays.map((item, index) => (
                <div key={'date' + index} className="date" style={{ width: item.width + '%' }}>
                  {item.width > 5
                    ? item.date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'numeric',
                        timeZone: settingsState.default_time_display_unit ? undefined : 'UTC',
                      })
                    : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className={
            'prevent-select move-right' +
            (currentTime.getTime() + blockhours * hourInMili > valueToTime(maxRange).getTime() ? ' disabled' : '')
          }
          onClick={(e) => handleClick3h(e, true)}
        >
          +3h
        </div>
      </div>
      <Slider
        className="time-slider"
        key={`time-range-slider`}
        aria-label="Time Slider"
        // defaultValue={timeToValue(defaultTime)}
        value={timeToValue(currentTime)}
        max={maxRange}
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
