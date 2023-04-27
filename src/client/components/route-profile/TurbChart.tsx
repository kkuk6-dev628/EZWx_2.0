import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VerticalRectSeries, LineSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  cacheKeys,
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
};

function getMaxForecastTime(): Date {
  const now = new Date();
  now.setHours(now.getHours() + 18);
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
}

const TurbChart = (props) => {
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const segments = useSelector(selectRouteSegments);
  const [, queryCaturbDataResult] = useQueryCaturbDataMutation({ fixedCacheKey: cacheKeys.caturb });
  const [, queryMwturbDataResult] = useQueryMwturbDataMutation({ fixedCacheKey: cacheKeys.mwturb });
  const [turbSeries, setTurbSeries] = useState([]);
  const [turbHint, setTurbHint] = useState(null);

  function buildTurbSeries() {
    if (queryCaturbDataResult.isSuccess && queryMwturbDataResult.isSuccess) {
      const routeLength = getRouteLength(activeRoute, !userSettings.default_distance_unit);
      const segmentLength = Math.round(routeLength / segments.length);
      const turbData = [];
      segments.forEach((segment, index) => {
        if (segment.arriveTime > getMaxForecastTime().getTime()) {
          return;
        }
        for (let elevation = 1000; elevation <= 45000; elevation += 1000) {
          let edr = 0;
          let edrTime;
          let edrType = 'Combined EDR';
          if (routeProfileApiState.turbLayers.includes('CAT') && routeProfileApiState.turbLayers.includes('MTW')) {
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
          } else if (routeProfileApiState.turbLayers.includes('MTW')) {
            ({ value: edr, time: edrTime } = getValueFromDataset(
              queryMwturbDataResult.data,
              new Date(segment.arriveTime),
              elevation,
              index,
            ));
            edrType = 'Mountain Wave EDR';
          }

          let color = colorsByEdr.none;
          const edrCategory = takeoffEdrTable[userSettings.max_takeoff_weight_category];
          if (edr >= edrCategory.extreme) {
            color = colorsByEdr.extreme;
          } else if (edr >= edrCategory.severe) {
            color = colorsByEdr.severe;
          } else if (edr >= edrCategory.moderate) {
            color = colorsByEdr.moderate;
          } else if (edr >= edrCategory.light) {
            color = colorsByEdr.light;
          }
          const opacity = edr < edrCategory.light ? 0 : 0.5;
          turbData.push({
            x0: index * segmentLength - segmentLength / 2,
            y0: elevation,
            x: index * segmentLength + segmentLength / 2,
            y: elevation + 1000,
            color: color,
            opacity: opacity,
            hint: {
              edrValue: edr,
              edrType: edrType,
              time: edrTime,
            },
          });
        }
      });
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
    userSettings.max_takeoff_weight_category,
  ]);

  return (
    <RouteProfileChart>
      <VerticalRectSeries
        colorType="literal"
        stroke="#AAAAAA"
        data={turbSeries}
        style={{ strokeWidth: 0.1 }}
        onValueMouseOut={() => setTurbHint(null)}
        onValueMouseOver={(value) => setTurbHint(value)}
      ></VerticalRectSeries>
      {turbHint ? (
        <Hint value={turbHint} className="turbulence-tooltip">
          <span>
            <b>Time:</b> {convertTimeFormat(turbHint.hint.time, userSettings.default_time_display_unit)}
          </span>
          <span>
            <b>{turbHint.hint.edrType}:</b> {Math.round(turbHint.hint.edrValue)}
          </span>
        </Hint>
      ) : null}
    </RouteProfileChart>
  );
};
export default TurbChart;
