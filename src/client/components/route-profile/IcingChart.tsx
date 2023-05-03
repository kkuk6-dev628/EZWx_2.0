import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VerticalRectSeries, LineSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  cacheKeys,
  getMaxForecastElevation,
  getMaxForecastTime,
  getRouteLength,
  getSegmentsCount,
  getTimeGradientStops,
  getValueFromDataset,
  getValueFromDatasetByElevation,
  interpolateRoute,
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

const temperatureContourColors = {
  positive: '#bd8545',
  negative: '#0b7e0c',
};

const icingSevLegend = [
  { value: 0, color: '#F6F6F6', label: 'None' },
  { value: 1, color: '#CEFFFC', label: 'Trace' },
  { value: 2, color: '#99CEFF', label: 'Light' },
  { value: 3, color: '#6C9CF2', label: 'Moderate' },
  { value: 4, color: '#3031FF', label: 'Heavy' },
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
  const [contourLabelData, setContourLabelData] = useState([]);
  const [temperatureContures, setTemperatureContours] = useState([]);
  const [noForecast, setNoForecast] = useState(false);
  const [noDepicted, setNoDepicted] = useState(false);

  const [, queryTemperatureDataResult] = useQueryTemperatureDataMutation({
    fixedCacheKey: cacheKeys.gfsTemperature,
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

  const [icingSeries, setIcingSeries] = useState(null);
  const [icingHint, setIcingHint] = useState(null);

  const segments = useSelector(selectRouteSegments);

  function buildTemperatureContourSeries() {
    if (queryTemperatureDataResult.isSuccess && segments.length > 0) {
      const segmentCount = getSegmentsCount(activeRoute);
      const routeLength = getRouteLength(activeRoute, true);
      const startMargin = segmentCount ? routeLength / segmentCount / 2 : 0;
      const endMargin = segmentCount ? routeLength / segmentCount / 2 : 0;

      const matrixData: number[][] = [];
      const xs = [-startMargin, ...segments.map((segment) => segment.accDistance), routeLength + endMargin];
      const elevations = Array.from({ length: 50 }, (_value, index) => index * 1000);
      // const zs = [-40, -30, -20, -10, 0, 10, 20, 30, 40];
      const min = routeProfileApiState.maxAltitude === 500 ? -85 : routeProfileApiState.maxAltitude === 300 ? -50 : -25;
      const step = routeProfileApiState.maxAltitude === 500 ? 5 : routeProfileApiState.maxAltitude === 300 ? 2 : 1;
      const count = (20 - min) / step + 1;

      const zs = Array.from({ length: count }, (x, i) => i * step + min);
      segments.forEach((segment, index) => {
        const row = [];
        elevations.forEach((elevation) => {
          const { value: temperature } = getValueFromDatasetByElevation(
            queryTemperatureDataResult.data,
            new Date(segment.arriveTime),
            elevation,
            index,
          );
          if (!temperature) return;
          row.push(temperature);
        });
        matrixData.push(row);
        if (index === 0) {
          matrixData.push(row);
        } else if (index === segments.length - 1) {
          matrixData.push(row);
        }
      });
      const conrec = new Conrec(null);
      try {
        conrec.contour(matrixData, 0, xs.length - 1, 0, elevations.length - 1, xs, elevations, zs.length, zs);
      } catch (e) {
        console.error(e);
        console.debug(matrixData, xs, elevations, zs);
      }

      const contours = conrec.contourList();
      const newContours = contours.map((contour) => ({
        temperature: contour['level'],
        contour: [...contour],
      }));
      const contourLabels = [];
      newContours.forEach((contour) => {
        switch (routeProfileApiState.maxAltitude) {
          case 200:
            if (contour.temperature % 2 !== 0) {
              return;
            }
            break;
          case 300:
            if (contour.temperature % 4 !== 0) {
              return;
            }
            break;
        }
        const minPos = contour.contour.reduce((prev, curr) => (prev.x < curr.x ? prev : curr));
        const maxPos = contour.contour.reduce((prev, curr) => (prev.x > curr.x ? prev : curr));
        const label = userSettings.default_temperature_unit
          ? celsiusToFahrenheit(contour.temperature) + ' \u00B0F'
          : round(contour.temperature, 1) + ' \u00B0C';
        const style = {
          fill:
            contour.temperature > 0
              ? temperatureContourColors.positive
              : contour.temperature === 0
              ? 'red'
              : temperatureContourColors.negative,
          stroke: 'white',
          strokeWidth: 0.1,
          dominantBaseline: 'text-after-edge',
          fontWeight: 900,
        };
        contourLabels.push({
          x: minPos.x,
          y: minPos.y,
          label,
          style,
        });
        contourLabels.push({
          x: maxPos.x,
          y: maxPos.y,
          label,
          style,
        });
      });
      setContourLabelData(contourLabels);
      setTemperatureContours(newContours);
    }
  }

  useEffect(() => {
    buildTemperatureContourSeries();
  }, [
    queryTemperatureDataResult.isSuccess,
    segments,
    userSettings.default_temperature_unit,
    routeProfileApiState.maxAltitude,
  ]);

  function buildIcingSeries() {
    if (queryIcingProbDataResult.isSuccess && queryIcingSevDataResult.isSuccess && queryIcingSldDataResult.isSuccess) {
      const routeLength = getRouteLength(activeRoute, true);
      const segmentCount = getSegmentsCount(activeRoute);
      const segmentLength = routeLength / segmentCount;
      const icingData = [];
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
      segments.forEach((segment, index) => {
        const maxElevation = Math.min(
          routeProfileApiState.maxAltitude === 500 ? 45000 : routeProfileApiState.maxAltitude === 300 ? 27000 : 18000,
          maxForecastElevation,
        );
        for (let elevation = 1000; elevation <= maxElevation; elevation += 1000) {
          let time;
          let color = colorsByEdr.none;
          let opacity = 1;
          const severity = 'None';
          let hint;
          if (segment.arriveTime > maxForecastTime.getTime()) {
            color = '#333';
            hint = {
              time: segment.arriveTime,
              altitude: elevation,
              prob: 'None',
              sev: 'None',
              sld: 'None',
            };
          } else {
            const { value: prob, time: provTime } = getValueFromDataset(
              queryIcingProbDataResult.data,
              new Date(segment.arriveTime),
              elevation,
              index,
            );
            const { value: sld, time: sldTime } = getValueFromDataset(
              queryIcingSldDataResult.data,
              new Date(segment.arriveTime),
              elevation,
              index,
            );
            const { value: sev, time: sevTime } = getValueFromDataset(
              queryIcingSevDataResult.data,
              new Date(segment.arriveTime),
              elevation,
              index,
            );

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
              opacity = prob < 10 ? 0 : 1;
            } else if (routeProfileApiState.icingLayers.includes('SLD')) {
              const sldItem = icingSldLegend.reduce((prev, curr) => {
                const prevDiff = prev.value - sld;
                const currDiff = curr.value - sld;
                if (currDiff > 0 && (prevDiff < 0 || currDiff < prevDiff)) {
                  return curr;
                }
                return prev;
              });
              color = sldItem.color;
              opacity = sld < 10 ? 0 : 1;
            } else if (routeProfileApiState.icingLayers.includes('Sev')) {
              opacity = sev === 0 ? 0 : 1;
              color = sevData.color;
            }

            hint = {
              time: provTime ? provTime : segment.arriveTime,
              altitude: elevation,
              prob: prob !== null ? prob + ' %' : 'None',
              sev: sevData.label,
              sld: sld ? sld + ' %' : 'None',
            };
          }
          icingData.push({
            x0: Math.round(index * segmentLength - segmentLength / 2),
            y0: elevation,
            x: Math.round(index * segmentLength + segmentLength / 2),
            y: elevation + 1000,
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
    <RouteProfileChart showDayNightBackground={false}>
      {icingSeries && (
        <VerticalRectSeries
          colorType="literal"
          stroke="#333335"
          data={icingSeries}
          style={{ strokeWidth: 0.1 }}
          onValueMouseOut={() => setIcingHint(null)}
          onValueMouseOver={(value) =>
            setIcingHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })
          }
          onValueClick={(value) => setIcingHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })}
        ></VerticalRectSeries>
      )}

      {temperatureContures.map((contourLine, index) => {
        const color =
          contourLine.temperature > 0
            ? temperatureContourColors.positive
            : contourLine.temperature === 0
            ? 'red'
            : temperatureContourColors.negative;
        const strokeWidth = contourLine.temperature === 0 ? 2 : 1;
        return (
          <LineSeries
            key={'temp-' + contourLine.temperature + '-' + index}
            data={contourLine.contour}
            color={color}
            curve={'curveBasisOpen'}
            strokeWidth={strokeWidth}
            style={{ pointerEvents: 'none' }}
          />
        );
      })}
      {contourLabelData.length > 0 ? (
        <LabelSeries animation allowOffsetToBeReversed data={contourLabelData}></LabelSeries>
      ) : null}
      {noDepicted && (
        <LabelSeries
          style={{ fontSize: 22, fontWeight: 900, strokeWidth: 1, fill: 'red', stroke: 'white' }}
          data={[
            {
              x: getRouteLength(activeRoute, !userSettings.default_distance_unit) / 2,
              y: routeProfileApiState.maxAltitude * 100 - 10000,
              label: 'No icing forecast depicted for this departure time',
              style: {
                textAnchor: 'middle',
              },
            },
          ]}
        ></LabelSeries>
      )}
      {noForecast && (
        <LabelSeries
          style={{ fontSize: 22, fontWeight: 900, strokeWidth: 1, fill: 'red', stroke: 'white' }}
          data={[
            {
              x: getRouteLength(activeRoute, !userSettings.default_distance_unit) / 2,
              y: routeProfileApiState.maxAltitude * 100 - 10000,
              label: 'No icing forecast available for this departure time',
              style: {
                textAnchor: 'middle',
              },
            },
          ]}
        ></LabelSeries>
      )}
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
