import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VerticalRectSeries, LineSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  cacheKeys,
  getMaxForecastTime,
  getRouteLength,
  getSegmentsCount,
  getValueFromDatasetByElevation,
  getValuesFromDatasetAllElevationByElevation,
  flightCategoryDivide,
  getIndexByElevation,
} from './RouteProfileDataLoader';
import { selectSettings } from '../../store/user/UserSettings';
import {
  useGetRouteProfileStateQuery,
  useQueryDepartureAdvisorDataMutation,
  useQueryGfsDataMutation,
  useQueryIcingTurbDataMutation,
  useQueryNbmAllMutation,
} from '../../store/route-profile/routeProfileApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import RouteProfileChart from './RouteProfileChart';
import { useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import flyjs from '../../fly-js/fly';
import { colorsByEdr } from './TurbChart';
import { meterToFeet } from '../map/common/AreoFunctions';
import { icingSevLegend } from './IcingChart';

const humidityThresholds = {
  1000: 98,
  2000: 98,
  3000: 97,
  4000: 95,
  5000: 94,
  6000: 93,
  7000: 92,
  8000: 90,
  9000: 88,
  10000: 86,
  11000: 85,
  12000: 85,
  13000: 85,
  14000: 85,
  15000: 86,
  16000: 90,
  17000: 92,
  18000: 95,
  19000: 95,
  20000: 95,
  21000: 95,
  22000: 96,
  23000: 97,
  24000: 98,
  25000: 98,
  26000: 98,
  27000: 98,
  28000: 98,
  29000: 98,
  30000: 98,
  31000: 98,
  32000: 98,
  33000: 98,
  34000: 98,
  35000: 98,
  36000: 98,
  37000: 98,
  38000: 98,
  39000: 98,
  40000: 98,
  41000: 98,
  42000: 98,
  43000: 98,
  44000: 98,
  45000: 98,
};

const cloudColor1 = '#FFFFFF';
const cloudColor2 = '#CCCCCC';

const CloudsChart = (props) => {
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);
  const [cloudSeries, setCloudSeries] = useState(null);
  const segments = useSelector(selectRouteSegments);
  const [cloudHint, setCloudHint] = useState(null);
  const [, queryElevationsResult] = useQueryElevationApiMutation({ fixedCacheKey: 'elevation-api' });
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const [, queryGfsDataResult] = useQueryGfsDataMutation({
    fixedCacheKey: cacheKeys.gData,
  });
  const [, queryDepartureAdvisorDataResult] = useQueryDepartureAdvisorDataMutation({
    fixedCacheKey: cacheKeys.departureAdvisor,
  });
  const [, queryNbmAllAirportResult] = useQueryNbmAllMutation({
    fixedCacheKey: cacheKeys.nbm,
  });
  const [, queryIcingTurbDataResult] = useQueryIcingTurbDataMutation({
    fixedCacheKey: cacheKeys.icingTurb,
  });

  function getElevationByPosition(position: { lat: number; lng: number }, inFeet = true): number {
    if (!queryElevationsResult.data || !queryElevationsResult.data.geoPoints) {
      return 0;
    }
    const closestPosition = queryElevationsResult.data.geoPoints.reduce((prev, curr) => {
      const prevDist = flyjs.distanceTo(position.lat, position.lng, prev.latitude, prev.longitude, 4);
      const currDist = flyjs.distanceTo(position.lat, position.lng, curr.latitude, curr.longitude, 4);
      if (prevDist < currDist) {
        return prev;
      }
      return curr;
    });
    return inFeet ? meterToFeet(closestPosition.elevation) : closestPosition.elevation;
  }

  function buildCloudSeries() {
    if (
      queryDepartureAdvisorDataResult.isSuccess &&
      queryNbmAllAirportResult.isSuccess &&
      queryIcingTurbDataResult.isSuccess
    ) {
      const routeLength = getRouteLength(activeRoute, true);
      const segmentCount = getSegmentsCount(activeRoute);
      const segmentLength = routeLength / segmentCount;
      const cloudData = [];
      const existIcing = false;
      const maxForecastTime = getMaxForecastTime(queryNbmAllAirportResult.data?.skycover);
      segments.forEach((segment, index) => {
        const elevation = getElevationByPosition(segment.position);
        let colorFirst = cloudColor1;
        let colorSecond = cloudColor1;
        let opacity = 1;
        const severity = 'None';
        if (segment.arriveTime > maxForecastTime.getTime()) {
          colorFirst = cloudColor1;
          opacity = 0.5;
        } else {
          const { value: skycover } = getValueFromDatasetByElevation(
            queryNbmAllAirportResult.data?.skycover,
            new Date(segment.arriveTime),
            null,
            index * flightCategoryDivide,
          );
          if (skycover <= 6) {
            return;
          }

          let { value: cloudbase } = getValueFromDatasetByElevation(
            queryNbmAllAirportResult.data?.cloudbase,
            new Date(segment.arriveTime),
            null,
            index * flightCategoryDivide,
          );
          let { value: cloudceiling } = getValueFromDatasetByElevation(
            queryDepartureAdvisorDataResult.data?.cloudceiling,
            new Date(segment.arriveTime),
            null,
            index * flightCategoryDivide,
          );
          if (skycover <= 56) {
            colorFirst = colorSecond = cloudColor2;
          } else {
            if (cloudbase > 0 && cloudceiling > 0) {
              colorFirst = cloudColor2;
              colorSecond = cloudColor1;
            }
          }
          if (cloudbase > 0 && elevation + cloudbase <= routeProfileApiState.maxAltitude * 100) {
            cloudbase = Math.round(cloudbase);
            cloudData.push({
              x0: Math.round(index * segmentLength - segmentLength / 2),
              y0: elevation + cloudbase,
              x: Math.round(index * segmentLength + segmentLength / 2),
              y: elevation + cloudbase + 2000,
              color: colorFirst,
              opacity: opacity,
              hint: {
                cloudbase,
                skycover,
              },
            });
          }
          if (cloudceiling > 0 && elevation + cloudceiling <= routeProfileApiState.maxAltitude * 100) {
            cloudceiling = Math.round(cloudceiling);
            cloudData.push({
              x0: Math.round(index * segmentLength - segmentLength / 2),
              y0: elevation + cloudceiling,
              x: Math.round(index * segmentLength + segmentLength / 2),
              y: elevation + cloudceiling + 2000,
              color: colorSecond,
              opacity: opacity,
              hint: { cloudceiling, skycover },
            });
          }

          const humidityData = getValuesFromDatasetAllElevationByElevation(
            queryGfsDataResult.data?.humidity,
            new Date(segment.arriveTime),
            index,
          );
          const start = Math.max(elevation + cloudbase, elevation + cloudceiling) + 2000;
          humidityData.forEach((humidity) => {
            if (humidity.elevation > start) {
              if (
                humidityThresholds[humidity.elevation] <= humidity.value &&
                humidity.elevation <= routeProfileApiState.maxAltitude * 100
              ) {
                cloudData.push({
                  x0: Math.round(index * segmentLength - segmentLength / 2),
                  y0: humidity.elevation - 500,
                  x: Math.round(index * segmentLength + segmentLength / 2),
                  y: humidity.elevation + 500,
                  color: colorSecond,
                  opacity: opacity,
                  hint: { humidity: humidity.value, skycover },
                });
              }
            }
          });
          const dataIndex = getIndexByElevation(queryIcingTurbDataResult.data?.sev, [
            segment.position.lng,
            segment.position.lat,
          ]);
          const icingSevData = getValuesFromDatasetAllElevationByElevation(
            queryIcingTurbDataResult.data?.sev,
            new Date(segment.arriveTime),
            dataIndex,
          );
          icingSevData.forEach((icingSev) => {
            if (icingSev.elevation > start) {
              if (icingSev.value > 0 && icingSev.elevation <= routeProfileApiState.maxAltitude * 100) {
                let sevData;
                for (const sevItem of icingSevLegend) {
                  if (sevItem.value === icingSev.value) {
                    sevData = sevItem;
                    break;
                  }
                }
                cloudData.push({
                  x0: Math.round(index * segmentLength - segmentLength / 2),
                  y0: icingSev.elevation - 500,
                  x: Math.round(index * segmentLength + segmentLength / 2),
                  y: icingSev.elevation + 500,
                  color: colorSecond,
                  opacity: opacity,
                  hint: { severe: sevData.label, skycover },
                });
              }
            }
          });
        }
      });
      setCloudSeries(cloudData);
    }
  }

  useEffect(() => {
    buildCloudSeries();
  }, [
    segments,
    queryDepartureAdvisorDataResult.isSuccess,
    queryIcingTurbDataResult.isSuccess,
    queryNbmAllAirportResult.isSuccess,
    queryGfsDataResult.isSuccess,
    routeProfileApiState.maxAltitude,
  ]);
  return (
    <RouteProfileChart showDayNightBackground={true} noDataMessage={null}>
      {cloudSeries && (
        <VerticalRectSeries
          colorType="literal"
          stroke="#AAAAAA"
          data={cloudSeries}
          style={{ strokeWidth: 0 }}
          onValueMouseOut={() => setCloudHint(null)}
          onValueMouseOver={(value) =>
            setCloudHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })
          }
          onValueClick={(value) => setCloudHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })}
        ></VerticalRectSeries>
      )}
      {cloudHint ? (
        <Hint value={cloudHint} className="turbulence-tooltip">
          {cloudHint.hint.cloudbase && (
            <span>
              <b>cloudbase:</b> {cloudHint.hint.cloudbase}
            </span>
          )}
          {cloudHint.hint.cloudceiling && (
            <span>
              <b>cloudceiling:</b> {cloudHint.hint.cloudceiling}
            </span>
          )}
          {cloudHint.hint.severe && (
            <span>
              <b>severe:</b> {cloudHint.hint.severe}
            </span>
          )}
          {cloudHint.hint.humidity && (
            <span>
              <b>humidity:</b> {cloudHint.hint.humidity}
            </span>
          )}
          {cloudHint.hint.skycover && (
            <span>
              <b>skycover:</b> {cloudHint.hint.skycover}
            </span>
          )}
        </Hint>
      ) : null}
    </RouteProfileChart>
  );
};
export default CloudsChart;
