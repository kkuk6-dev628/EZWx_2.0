import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VerticalRectSeries, LineSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  cacheKeys,
  flightCategoryDivide,
  getMaxForecastTime,
  getRouteLength,
  getSegmentInterval,
  getSegmentsCount,
  getValueFromDatasetByElevation,
  interpolateRouteByInterval,
} from './RouteProfileDataLoader';
import { selectSettings } from '../../store/user/UserSettings';
import {
  useGetRouteProfileStateQuery,
  useQueryDepartureAdvisorDataMutation,
  useQueryIcingTurbDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import RouteProfileChart from './RouteProfileChart';
import { convertTimeFormat } from '../map/common/AreoFunctions';
import flyjs from '../../fly-js/fly';
import { hourInMili } from '../shared/DepartureAdvisor';

export const takeoffEdrTable = {
  light: { light: 13, moderate: 16, severe: 36, extreme: 64 },
  medium: { light: 15, moderate: 20, severe: 44, extreme: 79 },
  heavy: { light: 17, moderate: 24, severe: 54, extreme: 96 },
};

export const colorsByEdr = {
  none: '#00000000',
  light: '#CCFF00',
  moderate: '#FF9900',
  severe: '#FF0000',
  extreme: '#660000',
  na: '#666',
};

const TurbChart = (props) => {
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);
  const observationTime = userSettings.observation_time;
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const segments = useSelector(selectRouteSegments);
  const [, queryDepartureAdvisorDataResult] = useQueryDepartureAdvisorDataMutation({
    fixedCacheKey: cacheKeys.departureAdvisor,
  });
  const [, queryIcingTurbDataResult] = useQueryIcingTurbDataMutation({
    fixedCacheKey: cacheKeys.icingTurb,
  });
  const [turbSeries, setTurbSeries] = useState([]);
  const [turbHint, setTurbHint] = useState(null);
  const [noForecast, setNoForecast] = useState(false);
  const [noDepicted, setNoDepicted] = useState(false);

  function buildTurbSeries() {
    if (queryIcingTurbDataResult.isSuccess) {
      const maxForecastTime = getMaxForecastTime(queryIcingTurbDataResult.data?.cat);
      const queryPoints = interpolateRouteByInterval(
        activeRoute,
        getSegmentsCount(activeRoute) * flightCategoryDivide,
      ).map((pt) => pt.point);
      const turbData = [];
      let existTurbulence = false;
      if (observationTime > maxForecastTime.getTime()) {
        setNoForecast(true);
        setNoDepicted(false);
        setTurbSeries([]);
        return;
      }
      setNoForecast(false);
      let accDistance = 0;
      let distance = 0;
      queryPoints.forEach((segment, index) => {
        const maxElevation = routeProfileApiState.maxAltitude * 100;
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
        for (let elevation = 1000; elevation <= maxElevation; elevation += 1000) {
          let edr = 0;
          let edrTime;
          let edrType = 'Combined EDR';
          let color = colorsByEdr.none;
          let category = 'None';
          let opacity = 0.8;
          const arriveTime = observationTime + (hourInMili * accDistance) / userSettings.true_airspeed;
          if (arriveTime > maxForecastTime.getTime()) {
            category = 'N/A';
            color = colorsByEdr.na;
            edr = null;
            edrTime = arriveTime;
            if (routeProfileApiState.turbLayers.includes('CAT') && routeProfileApiState.turbLayers.includes('MWT')) {
              edrType = 'Combined EDR';
            } else if (routeProfileApiState.turbLayers.includes('CAT')) {
              edrType = 'Clear Air EDR';
            } else if (routeProfileApiState.turbLayers.includes('MWT')) {
              edrType = 'Mountain Wave EDR';
            }
          } else {
            if (routeProfileApiState.turbLayers.includes('CAT') && routeProfileApiState.turbLayers.includes('MWT')) {
              const caturb = getValueFromDatasetByElevation(
                queryIcingTurbDataResult.data?.cat,
                new Date(arriveTime),
                elevation,
                index,
              );
              const mwturb = getValueFromDatasetByElevation(
                queryIcingTurbDataResult.data?.mwt,
                new Date(arriveTime),
                elevation,
                index,
              );
              edr = Math.max(caturb.value, mwturb.value);
              edrTime = caturb.time;
              edrType = 'Combined EDR';
            } else if (routeProfileApiState.turbLayers.includes('CAT')) {
              const data = getValueFromDatasetByElevation(
                queryIcingTurbDataResult.data?.cat,
                new Date(arriveTime),
                elevation,
                index,
              );
              edr = data.value;
              edrTime = data.time;
              edrType = 'Clear Air EDR';
            } else if (routeProfileApiState.turbLayers.includes('MWT')) {
              ({ value: edr, time: edrTime } = getValueFromDatasetByElevation(
                queryIcingTurbDataResult.data?.mwt,
                new Date(arriveTime),
                elevation,
                index,
              ));
              edrType = 'Mountain Wave EDR';
            }

            edr = Math.round(edr);
            const edrCategory = takeoffEdrTable[userSettings.max_takeoff_weight_category];
            if (edr >= edrCategory.extreme) {
              color = colorsByEdr.extreme;
              category = 'Extreme';
              existTurbulence = true;
            } else if (edr >= edrCategory.severe) {
              color = colorsByEdr.severe;
              category = 'Severe';
              existTurbulence = true;
            } else if (edr >= edrCategory.moderate) {
              color = colorsByEdr.moderate;
              category = 'Moderate';
              existTurbulence = true;
            } else if (edr >= edrCategory.light) {
              color = colorsByEdr.light;
              category = 'Light';
              existTurbulence = true;
            }
            opacity = edr < edrCategory.light ? 0 : 0.5;
            if (edrTime === null) {
              edrTime = arriveTime;
              color = colorsByEdr.na;
              category = 'N/A';
            }
          }
          turbData.push({
            x0: Math.round(accDistance - distance),
            y0: elevation - 500,
            x: Math.round(accDistance),
            y: elevation + 500,
            color: color,
            opacity: opacity,
            hint: {
              edrValue: edr,
              edrType: edrType,
              time: edrTime,
              altitude: elevation,
              category: category,
            },
          });
        }
      });
      setNoDepicted(!existTurbulence);
      setTurbSeries(turbData);
    }
  }

  useEffect(() => {
    buildTurbSeries();
  }, [
    queryIcingTurbDataResult.isSuccess,
    segments,
    routeProfileApiState.turbLayers,
    routeProfileApiState.maxAltitude,
    userSettings.max_takeoff_weight_category,
  ]);

  return (
    <RouteProfileChart
      showDayNightBackground={true}
      noDataMessage={
        noDepicted
          ? 'No turbulence forecast depicted for this departure time'
          : noForecast
          ? 'No turbulence forecast available for this departure time'
          : null
      }
    >
      {turbSeries && (
        <VerticalRectSeries
          colorType="literal"
          stroke="#AAAAAA"
          data={turbSeries}
          style={{ strokeWidth: 0.1 }}
          onValueMouseOut={() => setTurbHint(null)}
          onValueMouseOver={(value) =>
            setTurbHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })
          }
          onValueClick={(value) => setTurbHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })}
        ></VerticalRectSeries>
      )}
      {noForecast ||
        (noDepicted &&
          [1].map((_) => {
            const routeLength = getRouteLength(activeRoute, true);
            const segmentCount = getSegmentsCount(activeRoute);
            const segmentLength = routeLength / segmentCount;

            return (
              <VerticalRectSeries
                key="noDepictArea"
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
          }))}
      {turbHint && (
        <Hint value={turbHint} className="turbulence-tooltip">
          <span>
            <b>Time:</b> {convertTimeFormat(turbHint.hint.time, userSettings.default_time_display_unit)}
          </span>
          <span>
            <b>Altitude:</b> {turbHint.hint.altitude} feet MSL
          </span>
          <span>
            <b>{turbHint.hint.edrType}:</b>{' '}
            {turbHint.hint.edrValue ? turbHint.hint.edrValue : 'No EDR forecast available for this time'}
          </span>
          <span>
            <b>Category:</b> {turbHint.hint.category}
          </span>
        </Hint>
      )}
    </RouteProfileChart>
  );
};
export default TurbChart;
