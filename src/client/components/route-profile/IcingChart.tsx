import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VerticalRectSeries, LineSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  cacheKeys,
  flightCategoryDivide,
  getMaxForecastElevation,
  getMaxForecastTime,
  getMinMaxValueByElevation,
  getRouteLength,
  getSegmentsCount,
  getTimeGradientStops,
  getValueFromDataset,
  getValueFromDatasetByElevation,
  interpolateRouteByInterval,
  totalNumberOfElevations,
} from './RouteProfileDataLoader';
import { selectSettings } from '../../store/user/UserSettings';
import {
  useGetRouteProfileStateQuery,
  useQueryIcingProbDataMutation,
  useQueryIcingSevDataMutation,
  useQueryIcingSldDataMutation,
  useQueryTemperatureDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import RouteProfileChart from './RouteProfileChart';
import { Conrec } from '../../conrec-js/conrec';
import { celsiusToFahrenheit, convertTimeFormat, round } from '../map/common/AreoFunctions';
import { colorsByEdr, takeoffEdrTable } from './TurbChart';
import { Route } from '../../interfaces/route';
import { RouteProfileDataset, RouteSegment } from '../../interfaces/route-profile';
import flyjs from '../../fly-js/fly';
import { hourInMili } from '../shared/DepartureAdvisor';

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

const IcingChart = (props) => {
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);
  const observationTime = userSettings.observation_time;
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const [noForecast, setNoForecast] = useState(false);
  const [noDepicted, setNoDepicted] = useState(false);

  const [queryIcingProbData, queryIcingProbDataResult] = useQueryIcingProbDataMutation({
    fixedCacheKey: cacheKeys.icingProb,
  });
  const [queryIcingSevData, queryIcingSevDataResult] = useQueryIcingSevDataMutation({
    fixedCacheKey: cacheKeys.icingSev,
  });
  const [queryIcingSldData, queryIcingSldDataResult] = useQueryIcingSldDataMutation({
    fixedCacheKey: cacheKeys.icingSld,
  });

  const [icingSeries, setIcingSeries] = useState(null);
  const [icingHint, setIcingHint] = useState(null);

  const segments = useSelector(selectRouteSegments);

  function buildIcingSeries() {
    if (
      segments &&
      segments.length > 0 &&
      queryIcingProbDataResult.isSuccess &&
      queryIcingSevDataResult.isSuccess &&
      queryIcingSldDataResult.isSuccess
    ) {
      const routeLength = getRouteLength(activeRoute, true);
      const segmentCount = getSegmentsCount(activeRoute);
      const segmentLength = routeLength / segmentCount;
      const icingData = [];
      const queryPoints = interpolateRouteByInterval(
        activeRoute,
        getSegmentsCount(activeRoute) * flightCategoryDivide,
      ).map((pt) => pt.point);
      const existIcing = false;
      const maxForecastTime = getMaxForecastTime(queryIcingProbDataResult.data);
      const maxForecastElevation = getMaxForecastElevation(queryIcingProbDataResult.data);
      if (observationTime > maxForecastTime.getTime()) {
        setNoForecast(true);
        setNoDepicted(false);
        setIcingSeries(null);
        return;
      }
      setNoForecast(false);
      setNoDepicted(true);
      let accDistance = 0;
      let distance = 0;

      queryPoints.forEach((segment, index) => {
        if (accDistance > routeLength) {
          return;
        }
        const maxElevation = Math.min(routeProfileApiState.maxAltitude * 100, maxForecastElevation);
        if (index > 0) {
          distance = flyjs.distanceTo(
            queryPoints[index - 1].lat,
            queryPoints[index - 1].lng,
            segment.lat,
            segment.lng,
            6,
          );
          accDistance += distance;
        }
        const arriveTime = observationTime + (hourInMili * accDistance) / userSettings.true_airspeed;
        for (let elevation = 1000; elevation <= maxElevation; elevation += 1000) {
          let time;
          let color = colorsByEdr.none;
          const visibleOpacity = 1;
          let opacity = visibleOpacity;
          const severity = 'None';
          let hint;
          if (arriveTime > maxForecastTime.getTime()) {
            color = '#666';
            opacity = 0.8;
            hint = {
              time: new Date(arriveTime),
              altitude: elevation,
              prob: 'None',
              sev: 'None',
              sld: 'None',
            };
          } else {
            let { value: prob, time: provTime } = getValueFromDatasetByElevation(
              queryIcingProbDataResult.data,
              new Date(arriveTime),
              elevation,
              index,
            );
            prob = Math.round(prob);
            provTime = provTime ?? new Date(arriveTime);
            let { value: sld } = getValueFromDatasetByElevation(
              queryIcingSldDataResult.data,
              new Date(arriveTime),
              elevation,
              index,
            );
            sld = Math.round(sld);
            let { value: sev } = getValueFromDatasetByElevation(
              queryIcingSevDataResult.data,
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
          }
          icingData.push({
            x0: Math.round(accDistance - distance),
            y0: elevation - 500,
            x: Math.round(accDistance),
            y: elevation + 500,
            color: color,
            opacity: opacity,
            hint,
          });
        }
      });
      // setNoDepicted(!existTurbulence);
      setIcingSeries(icingData);
    }
  }

  useEffect(() => {
    buildIcingSeries();
  }, [
    queryIcingProbDataResult.isSuccess,
    queryIcingSevDataResult.isSuccess,
    queryIcingSldDataResult.isSuccess,
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
    >
      {icingSeries && (
        <VerticalRectSeries
          colorType="literal"
          stroke="#33333500"
          data={icingSeries}
          style={{ strokeWidth: 0 }}
          onValueMouseOut={() => setIcingHint(null)}
          onValueMouseOver={(value) =>
            setIcingHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })
          }
          onValueClick={(value) => setIcingHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })}
        ></VerticalRectSeries>
      )}
      {noForecast
        ? [1].map((_) => {
            const routeLength = getRouteLength(activeRoute, true);
            const segmentCount = getSegmentsCount(activeRoute);
            const segmentLength = routeLength / segmentCount;

            return (
              <VerticalRectSeries
                key="noForecast-message"
                colorType="literal"
                data={[
                  {
                    x0: -segmentLength / 2,
                    x: routeLength + segmentLength / 2,
                    y0: 1000,
                    y:
                      routeProfileApiState.maxAltitude === 500
                        ? 45000
                        : routeProfileApiState.maxAltitude === 300
                        ? 27000
                        : 18000,
                    color: '#333',
                    opacity: 0.5,
                  },
                ]}
              />
            );
          })
        : null}

      {icingHint ? (
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
