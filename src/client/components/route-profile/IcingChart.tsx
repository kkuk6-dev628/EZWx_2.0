import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VerticalRectSeries, CustomSVGSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import { calcEndMargin, calcHighResolution, interpolateRouteByInterval } from './RouteProfileDataLoader';
import { getSegmentsCount } from './RouteProfileDataLoader';
import { getTimeGradientStops } from '../../utils/utils';
import {
  getIndexByElevation,
  getMaxForecastElevation,
  getMaxForecastTime,
  getMinMaxValueByElevation,
  getValueFromDataset,
  getValueFromDatasetByElevation,
} from '../../utils/utils';
import { getSegmentInterval } from './RouteProfileDataLoader';
import { getRouteLength } from './RouteProfileDataLoader';
import { cacheKeys, flightCategoryDivide, totalNumberOfElevations } from '../../utils/constants';
import { selectSettings } from '../../store/user/UserSettings';
import {
  useGetRouteProfileStateQuery,
  useQueryDepartureAdvisorDataMutation,
  useQueryIcingTurbDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import RouteProfileChart from './RouteProfileChart';
import { hatchOpacity, visibleOpacity } from '../../utils/constants';
import { Conrec } from '../../conrec-js/conrec';
import { celsiusToFahrenheit, convertTimeFormat, round } from '../map/common/AreoFunctions';
import { colorsByEdr, takeoffEdrTable } from './TurbChart';
import { Route } from '../../interfaces/route';
import { RouteProfileDataset, RouteSegment } from '../../interfaces/route-profile';
import flyjs from '../../fly-js/fly';
import { hourInMili } from '../../utils/constants';
import fly from '../../fly-js/fly';

export const icingSevLegend = [
  { value: 0, color: '#F6F6F6', label: 'None' },
  { value: 4, color: '#CEFFFC', label: 'Trace' },
  { value: 1, color: '#99CEFF', label: 'Light' },
  { value: 2, color: '#0096FF', label: 'Moderate' },
  { value: 5, color: '#3031FF', label: 'Heavy' },
];

const icingProbLegend = [
  { value: 10, color: '#FFFFFF00', label: '10' },
  { value: 20, color: '#9AFFCD', label: '20' },
  { value: 30, color: '#9AFF66', label: '30' },
  { value: 40, color: '#CDFF66', label: '40' },
  { value: 50, color: '#FFFF00', label: '50' },
  { value: 60, color: '#FFCD00', label: '60' },
  { value: 70, color: '#FF9A00', label: '70' },
  { value: 80, color: '#FF6600', label: '80' },
  { value: 85, color: '#FF3000', label: '85' },
];

const icingSldLegend = [
  { value: 10, color: '#FFFFFF00', label: '10' },
  { value: 20, color: '#9AFFCD', label: '20' },
  { value: 30, color: '#9AFF66', label: '30' },
  { value: 40, color: '#CDFF66', label: '40' },
  { value: 50, color: '#FFFF00', label: '50' },
  { value: 60, color: '#FFCD00', label: '60' },
  { value: 70, color: '#FF9A00', label: '70' },
  { value: 80, color: '#FF6600', label: '80' },
  { value: 90, color: '#FF3000', label: '90' },
  { value: 100, color: '#CD0000', label: '100' },
];

const noIcingAbove30000Msg = 'No icing forecast available above 30,000 feet';

const IcingChart = (props) => {
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);
  const observationTime = userSettings.observation_time;
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const [noForecast, setNoForecast] = useState(false);
  const [noDepicted, setNoDepicted] = useState(false);

  const [, queryDepartureAdvisorDataResult] = useQueryDepartureAdvisorDataMutation({
    fixedCacheKey: cacheKeys.departureAdvisor,
  });
  const [, queryIcingTurbDataResult] = useQueryIcingTurbDataMutation({
    fixedCacheKey: cacheKeys.icingTurb,
  });

  const [icingSeries, setIcingSeries] = useState(null);
  const [icingHint, setIcingHint] = useState(null);

  const segments = useSelector(selectRouteSegments);
  function buildIcingSeries() {
    if (segments && segments.length > 0 && queryIcingTurbDataResult.isSuccess) {
      const routeLength = getRouteLength(activeRoute, true);
      const segmentCount = getSegmentsCount(activeRoute);
      const icingData = [];
      const queryPoints = interpolateRouteByInterval(
        activeRoute,
        getSegmentsCount(activeRoute) * flightCategoryDivide,
      ).map((pt) => pt.point);
      const maxForecastTime = getMaxForecastTime(queryIcingTurbDataResult.data?.prob);
      const maxForecastElevation = getMaxForecastElevation(queryIcingTurbDataResult.data?.prob);
      if (observationTime > maxForecastTime.getTime() + hourInMili) {
        setNoForecast(true);
        setNoDepicted(false);
        setIcingSeries(null);
        return;
      }
      setNoForecast(false);
      setNoDepicted(true);
      let accDistance = 0;
      const distance = calcHighResolution(activeRoute);
      const maxElevation = Math.min(routeProfileApiState.maxAltitude * 100, maxForecastElevation);
      let arriveTime = observationTime;
      let course = 0;

      queryPoints.forEach((segment, index) => {
        if (accDistance > routeLength) {
          return;
        }
        if (index > 0) {
          accDistance += distance;
        }
        let speed = userSettings.true_airspeed;
        if (activeRoute.useForecastWinds) {
          const nextPos = index < queryPoints.length - 1 ? queryPoints[index + 1] : null;
          course =
            index < queryPoints.length - 1
              ? fly.trueCourse(segment.lat, segment.lng, nextPos.lat, nextPos.lng, 2)
              : course;
          const { value: windSpeed } = getValueFromDatasetByElevation(
            queryDepartureAdvisorDataResult.data?.windSpeed,
            new Date(arriveTime),
            activeRoute.altitude,
            index,
          );
          const { value: windDirection } = getValueFromDatasetByElevation(
            queryDepartureAdvisorDataResult.data?.windDirection,
            new Date(arriveTime),
            activeRoute.altitude,
            index,
          );
          const { groundSpeed } = fly.calculateHeadingAndGroundSpeed(
            userSettings.true_airspeed,
            course,
            windSpeed,
            windDirection,
            2,
          );
          speed = groundSpeed;
        }
        for (let elevation = 1000; elevation <= routeProfileApiState.maxAltitude * 100; elevation += 1000) {
          let time;
          let color = colorsByEdr.none;
          let opacity = visibleOpacity;
          let hint;
          if (arriveTime > maxForecastTime.getTime() + hourInMili) {
            color = '#666';
            opacity = hatchOpacity;
            hint = {
              time: new Date(arriveTime),
              altitude: elevation,
              prob: 'None',
              sev: 'None',
              sld: 'None',
            };
            icingData.push({
              x0: accDistance - distance,
              y0: elevation - 500,
              x: accDistance,
              y: elevation + 500,
              color: color,
              opacity: opacity,
              hint,
            });
          } else if (elevation <= maxForecastElevation) {
            let { value: prob, time: provTime } = getValueFromDatasetByElevation(
              queryIcingTurbDataResult.data?.prob,
              new Date(arriveTime),
              elevation,
              index,
            );
            prob = Math.round(prob);
            provTime = provTime ?? new Date(arriveTime);
            let { value: sld } = getValueFromDatasetByElevation(
              queryIcingTurbDataResult.data?.sld,
              new Date(arriveTime),
              elevation,
              index,
            );
            sld = Math.round(sld);
            let { value: sev } = getValueFromDatasetByElevation(
              queryIcingTurbDataResult.data?.sev,
              new Date(arriveTime),
              elevation,
              index,
            );
            sev = Math.round(sev);

            let sevData;
            for (const sevItem of icingSevLegend) {
              if (sevItem.value === sev) {
                sevData = sevItem;
                break;
              }
            }
            if (!sevData) {
              sevData = icingSevLegend[0];
            }

            if (routeProfileApiState.icingLayers.includes('Prob')) {
              const probItem = icingProbLegend.reduce((prev, curr) => {
                const prevDiff = prev.value - prob;
                const currDiff = curr.value - prob;
                if (currDiff > 0 && (prevDiff < 0 || currDiff < prevDiff)) {
                  return curr;
                }
                return prev;
              });
              color = probItem.color;
              opacity = prob < 10 ? 0 : visibleOpacity;
              if (prob >= 10) {
                setNoDepicted(false);
              }
            } else if (routeProfileApiState.icingLayers.includes('SLD')) {
              const sldItem = icingSldLegend.reduce((prev, curr) => {
                const prevDiff = prev.value - sld;
                const currDiff = curr.value - sld;
                if (currDiff >= 0 && (prevDiff < 0 || currDiff < prevDiff)) {
                  return curr;
                }
                return prev;
              });
              color = sldItem.color;
              opacity = sld < 10 ? 0 : visibleOpacity;
              if (sld >= 10) {
                setNoDepicted(false);
              }
              if (sld < 10 && routeProfileApiState.icingLayers.includes('Sev')) {
                opacity = sev === 0 ? 0 : visibleOpacity;
                color = sevData.color;
                if (sev > 0) {
                  setNoDepicted(false);
                }
              }
            } else if (routeProfileApiState.icingLayers.includes('Sev')) {
              opacity = sev === 0 ? 0 : visibleOpacity;
              color = sevData.color;
              if (sev > 0) {
                setNoDepicted(false);
              }
            }
            hint = {
              time: provTime,
              altitude: elevation,
              prob: prob !== null ? prob + ' %' : 'None',
              sev: sevData.label,
              sld: sld ? sld + ' %' : 'None',
            };
            icingData.push({
              x0: accDistance - distance,
              y0: elevation - 500,
              x: accDistance,
              y: elevation + 500,
              color: color,
              opacity: opacity,
              hint,
            });
          }
        }
        arriveTime = arriveTime + (hourInMili * distance) / speed;
      });
      // setNoDepicted(!existTurbulence);
      if (icingData[icingData.length - 1].color === '#666') {
        const end = accDistance + calcEndMargin(activeRoute);
        const hint = icingData[icingData.length - 1].hint;
        while (end - (accDistance + distance) > -0.1 * distance) {
          for (let elevation = 1000; elevation <= routeProfileApiState.maxAltitude * 100; elevation += 1000) {
            icingData.push({
              x0: accDistance,
              y0: elevation - 500,
              x: accDistance + distance,
              y: elevation + 500,
              color: '#666',
              opacity: hatchOpacity,
              hint: hint,
            });
          }
          accDistance += distance;
        }
      }
      setIcingSeries(icingData);
    }
  }

  useEffect(() => {
    buildIcingSeries();
  }, [
    queryDepartureAdvisorDataResult.isSuccess,
    queryIcingTurbDataResult.isSuccess,
    segments,
    routeProfileApiState.icingLayers,
    routeProfileApiState.maxAltitude,
    routeProfileApiState.icingLayers,
  ]);

  return (
    <RouteProfileChart
      showDayNightBackground={true}
      noDataMessage={
        noDepicted
          ? 'No icing forecast depicted for this departure time'
          : noForecast
          ? 'No icing forecast available for this departure time'
          : null
      }
      noIcingAbove30000={noForecast || routeProfileApiState.maxAltitude !== 500 ? null : noIcingAbove30000Msg}
    >
      {icingSeries && (
        <VerticalRectSeries
          colorType="literal"
          stroke="transparent"
          data={icingSeries}
          style={{ strokeWidth: 0 }}
          onValueMouseOut={() => setIcingHint(null)}
          onValueMouseOver={(value) =>
            setIcingHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })
          }
          onValueClick={(value) => setIcingHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })}
        ></VerticalRectSeries>
      )}

      {icingHint && icingHint.color !== '#666' ? (
        <Hint value={icingHint} className="icing-tooltip">
          <span>
            <b>Time:</b> {convertTimeFormat(icingHint.hint.time, userSettings.default_time_display_unit)}
          </span>
          <span>
            <b>Altitude:</b> {icingHint.hint.altitude} feet MSL
          </span>
          <span>
            <b>Probability:</b> {icingHint.hint.prob}
          </span>
          <span>
            <b>Severity:</b> {icingHint.hint.sev}
          </span>
          <span>
            <b>SLD Potential:</b> {icingHint.hint.sld}
          </span>
        </Hint>
      ) : null}
    </RouteProfileChart>
  );
};
export default IcingChart;
