import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VerticalRectSeries, LineSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  getMaxForecastTime,
  getValueFromDatasetByElevation,
  getValuesFromDatasetAllElevationByElevation,
  getIndexByElevation,
} from '../../utils/utils';
import { selectSettings } from '../../store/user/UserSettings';
import { cacheKeys, flightCategoryDivide, hatchOpacity, visibleOpacity } from '../../utils/constants';
import { useGetSingleElevationQuery, useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import flyjs from '../../fly-js/fly';
import { meterToFeet } from '../map/common/AreoFunctions';
import { cloudColor1, cloudColor2, humidityThresholds } from '../../utils/constants';
import { selectCurrentAirportPos } from '../../store/airportwx/airportwx';
import { useGetMeteogramDataQuery, useGetAirportwxStateQuery } from '../../store/airportwx/airportwxApi';
import CloudsChart from '../route-profile/CloudsChart';
import RouteProfileChart from '../route-profile/RouteProfileChart';
import { icingSevLegend } from './MIcingChart';
import { useQueryNbmAllMutation } from '../../store/route-profile/routeProfileApi';
import MeteogramChart, { getXAxisValues } from './MeteogramChart';

const MCloudsChart = (props) => {
  const currentAirportPos = useSelector(selectCurrentAirportPos);
  const { isSuccess: isLoadedMGramData, data: meteogramData } = useGetMeteogramDataQuery(currentAirportPos, {
    skip: currentAirportPos === null,
  });
  const { data: airportElevation, isSuccess: isElevationLoaded } = useGetSingleElevationQuery(currentAirportPos, {
    skip: currentAirportPos === null,
  });
  const [queryNbmAll, queryNbmAllAirportResult] = useQueryNbmAllMutation({
    fixedCacheKey: cacheKeys.nbm,
  });
  const userSettings = useSelector(selectSettings);
  const { data: airportwxState, isSuccess: isAirportwxStateLoaded } = useGetAirportwxStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const chartWidth = 24 * airportwxState.chartDays;
  const interval = 1;
  const [cloudSeries, setCloudSeries] = useState(null);
  const [cloudHint, setCloudHint] = useState(null);

  function buildCloudSeries() {
    if (isLoadedMGramData && queryNbmAllAirportResult.isSuccess) {
      const cloudData = [];
      const maxForecastTime = getMaxForecastTime(queryNbmAllAirportResult.data.skycover);
      const times = getXAxisValues(chartWidth, interval);
      times.forEach(({ time, index }) => {
        const elevation = meterToFeet(airportElevation.geoPoints[0].elevation);
        let colorFirst = cloudColor1;
        let colorSecond = cloudColor1;
        let opacity = 1;
        if (Date.now() > maxForecastTime.getTime()) {
          colorFirst = cloudColor1;
          opacity = hatchOpacity;
        } else {
          const { value: skycover } = getValueFromDatasetByElevation(
            queryNbmAllAirportResult.data?.skycover,
            time,
            null,
            0,
          );
          if (skycover <= 6) {
            return;
          }

          let { value: cloudbase } = getValueFromDatasetByElevation(
            queryNbmAllAirportResult.data?.cloudbase,
            time,
            null,
            0,
          );
          let { value: cloudceiling } = getValueFromDatasetByElevation(meteogramData.cloudceiling, time, null, 0);
          if (skycover <= 56) {
            colorFirst = colorSecond = cloudColor2;
          } else {
            if (cloudbase > 0 && cloudceiling > 0) {
              colorFirst = cloudColor2;
              colorSecond = cloudColor1;
            }
          }
          if (cloudbase > 0 && elevation + cloudbase <= airportwxState.maxAltitude * 100) {
            cloudbase = Math.round(cloudbase);
            cloudData.push({
              x0: index - interval / 2,
              y0: elevation + cloudbase,
              x: index + interval / 2,
              y: elevation + cloudbase + 2000,
              color: colorFirst,
              opacity: visibleOpacity,
              hint: {
                cloudbase,
                skycover,
              },
            });
          }
          if (cloudceiling > 0 && elevation + cloudceiling <= airportwxState.maxAltitude * 100) {
            cloudceiling = Math.round(cloudceiling);
            cloudData.push({
              x0: index - interval / 2,
              y0: elevation + cloudceiling,
              x: index + interval / 2,
              y: elevation + cloudceiling + 2000,
              color: colorSecond,
              opacity: visibleOpacity,
              hint: { cloudceiling, skycover },
            });
          }

          const humidityData = getValuesFromDatasetAllElevationByElevation(meteogramData.humidity, time, 0);
          const start = Math.max(elevation + cloudbase, elevation + cloudceiling) + 2000;
          humidityData.forEach((humidity) => {
            if (humidity.elevation > start) {
              if (
                humidityThresholds[humidity.elevation] <= humidity.value &&
                humidity.elevation <= airportwxState.maxAltitude * 100
              ) {
                cloudData.push({
                  x0: index - interval / 2,
                  y0: humidity.elevation - 500,
                  x: index + interval / 2,
                  y: humidity.elevation + 500,
                  color: colorSecond,
                  opacity: visibleOpacity,
                  hint: { humidity: humidity.value, skycover },
                });
              }
            }
          });
          const icingSevData = getValuesFromDatasetAllElevationByElevation(meteogramData.sev, time, 0);
          icingSevData.forEach((icingSev) => {
            if (icingSev.elevation > start) {
              if (icingSev.value > 0 && icingSev.elevation <= airportwxState.maxAltitude * 100) {
                let sevData;
                for (const sevItem of icingSevLegend) {
                  if (sevItem.value === icingSev.value) {
                    sevData = sevItem;
                    break;
                  }
                }
                cloudData.push({
                  x0: index - interval / 2,
                  y0: icingSev.elevation - 500,
                  x: index + interval / 2,
                  y: icingSev.elevation + 500,
                  color: colorSecond,
                  opacity: visibleOpacity,
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
  }, [isLoadedMGramData, meteogramData, queryNbmAllAirportResult.isSuccess, airportwxState]);
  return (
    <MeteogramChart showDayNightBackground={true} noDataMessage={null}>
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
    </MeteogramChart>
  );
};
export default MCloudsChart;
