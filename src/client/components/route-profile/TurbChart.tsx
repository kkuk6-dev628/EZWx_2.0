import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VerticalRectSeries, LineSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  cacheKeys,
  getMaxForecastTime,
  getRouteLength,
  getSegmentsCount,
  getTimeGradientStops,
  getValueFromDataset,
  interpolateRoute,
  totalNumberOfElevations,
} from './RouteProfileDataLoader';
import { selectSettings } from '../../store/user/UserSettings';
import {
  useGetRouteProfileStateQuery,
  useQueryCaturbDataMutation,
  useQueryMwturbDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import RouteProfileChart from './RouteProfileChart';
import { convertTimeFormat } from '../map/common/AreoFunctions';

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
  const [, queryCaturbDataResult] = useQueryCaturbDataMutation({ fixedCacheKey: cacheKeys.caturb });
  const [, queryMwturbDataResult] = useQueryMwturbDataMutation({ fixedCacheKey: cacheKeys.mwturb });
  const [turbSeries, setTurbSeries] = useState([]);
  const [turbHint, setTurbHint] = useState(null);
  const [noForecast, setNoForecast] = useState(false);
  const [noDepicted, setNoDepicted] = useState(false);

  function buildTurbSeries() {
    if (queryCaturbDataResult.isSuccess && queryMwturbDataResult.isSuccess) {
      const routeLength = getRouteLength(activeRoute, true);
      const segmentCount = getSegmentsCount(activeRoute);
      const segmentLength = routeLength / segmentCount;
      const maxForecastTime = getMaxForecastTime(queryCaturbDataResult.data);
      const turbData = [];
      let existTurbulence = false;
      if (observationTime > maxForecastTime.getTime()) {
        setNoForecast(true);
        setNoDepicted(false);
        setTurbSeries([]);
        return;
      }
      setNoForecast(false);
      segments.forEach((segment, index) => {
        const maxElevation = routeProfileApiState.maxAltitude * 100;
        for (let elevation = 1000; elevation <= maxElevation; elevation += 1000) {
          let edr = 0;
          let edrTime;
          let edrType = 'Combined EDR';
          let color = colorsByEdr.none;
          let category = 'None';
          let opacity = 0.8;
          if (segment.arriveTime > maxForecastTime.getTime()) {
            category = 'N/A';
            color = colorsByEdr.na;
            edr = null;
            edrTime = segment.arriveTime;
            if (routeProfileApiState.turbLayers.includes('CAT') && routeProfileApiState.turbLayers.includes('MWT')) {
              edrType = 'Combined EDR';
            } else if (routeProfileApiState.turbLayers.includes('CAT')) {
              edrType = 'Clear Air EDR';
            } else if (routeProfileApiState.turbLayers.includes('MWT')) {
              edrType = 'Mountain Wave EDR';
            }
          } else {
            if (routeProfileApiState.turbLayers.includes('CAT') && routeProfileApiState.turbLayers.includes('MWT')) {
              const caturb = getValueFromDataset(
                queryCaturbDataResult.data,
                new Date(segment.arriveTime),
                elevation,
                index,
              );
              const mwturb = getValueFromDataset(
                queryMwturbDataResult.data,
                new Date(segment.arriveTime),
                elevation,
                index,
              );
              edr = Math.max(caturb.value, mwturb.value);
              edrTime = caturb.time;
              edrType = 'Combined EDR';
            } else if (routeProfileApiState.turbLayers.includes('CAT')) {
              const data = getValueFromDataset(
                queryCaturbDataResult.data,
                new Date(segment.arriveTime),
                elevation,
                index,
              );
              edr = data.value;
              edrTime = data.time;
              edrType = 'Clear Air EDR';
            } else if (routeProfileApiState.turbLayers.includes('MWT')) {
              ({ value: edr, time: edrTime } = getValueFromDataset(
                queryMwturbDataResult.data,
                new Date(segment.arriveTime),
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
              edrTime = segment.arriveTime;
              color = colorsByEdr.na;
              category = 'N/A';
            }
          }
          turbData.push({
            x0: Math.round(index * segmentLength - segmentLength / 2),
            y0: elevation - 500,
            x: Math.round(index * segmentLength + segmentLength / 2),
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
    queryCaturbDataResult.isSuccess,
    queryMwturbDataResult.isSuccess,
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
