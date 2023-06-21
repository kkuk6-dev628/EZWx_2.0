import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LineSeries, CustomSVGSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import { cacheKeys, getRouteLength, getSegmentsCount, getValueFromDatasetByElevation } from './RouteProfileDataLoader';
import { selectSettings } from '../../store/user/UserSettings';
import {
  useGetRouteProfileStateQuery,
  useQueryGfsWindDirectionDataMutation,
  useQueryGfsWindSpeedDataMutation,
  useQueryTemperatureDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import { celsiusToFahrenheit, convertTimeFormat, getStandardTemp, round } from '../map/common/AreoFunctions';
import flyjs from '../../fly-js/fly';
import RouteProfileChart from './RouteProfileChart';
import { addLeadingZeroes } from '../map/common/AreoFunctions';

export const windDataElevations = {
  500: [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000],
  300: [3000, 6000, 9000, 12000, 15000, 18000, 21000, 24000, 27000],
  200: [2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000],
};

export const windQueryElevations = [
  2000, 3000, 4000, 5000, 6000, 8000, 9000, 10000, 12000, 14000, 15000, 16000, 18000, 20000, 21000, 24000, 25000, 27000,
  30000, 35000, 40000, 45000,
];

export const calcChartWidth = (viewWidth: number, _viewHeight: number) => {
  if (viewWidth < 900) {
    return 900;
  } else {
    return viewWidth - 106;
  }
};
export const calcChartHeight = (_viewWidth: number, viewHeight: number) => {
  if (viewHeight < 680) {
    return 320;
  } else {
    return viewHeight - 240;
  }
};

const WindChart = () => {
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const segments = useSelector(selectRouteSegments);

  const [windSpeedSeries, setWindSpeedSeries] = useState(null);
  const [windHintValue, setWindHintValue] = useState(null);

  const [, queryTemperatureDataResult] = useQueryTemperatureDataMutation({
    fixedCacheKey: cacheKeys.gfsTemperature,
  });
  const [, queryGfsWindDirectionDataResult] = useQueryGfsWindDirectionDataMutation({
    fixedCacheKey: cacheKeys.gfsWinddirection,
  });
  const [, queryGfsWindSpeedDataResult] = useQueryGfsWindSpeedDataMutation({
    fixedCacheKey: cacheKeys.gfsWindspeed,
  });

  function buildWindSeries() {
    if (queryGfsWindSpeedDataResult.isSuccess && queryGfsWindDirectionDataResult.isSuccess && segments.length > 0) {
      const windSpeedData = [];
      const dataset = queryGfsWindSpeedDataResult.data;
      const routeLength = getRouteLength(activeRoute, true);
      const segmentInterval = routeLength / getSegmentsCount(activeRoute);
      segments.forEach((segment, index) => {
        const x = index * segmentInterval;
        const elevations = windDataElevations[routeProfileApiState.maxAltitude];
        if (!elevations) {
          return;
        }
        for (const el of elevations) {
          const { value: windSpeed, time: windspeedTime } = getValueFromDatasetByElevation(
            dataset,
            new Date(segment.arriveTime),
            el,
            index,
          );
          if (!windspeedTime) {
            continue;
          }
          const { value: windDir } = getValueFromDatasetByElevation(
            queryGfsWindDirectionDataResult.data,
            new Date(segment.arriveTime),
            el,
            index,
          );
          const { value: temperature } = getValueFromDatasetByElevation(
            queryTemperatureDataResult.data,
            new Date(segment.arriveTime),
            el,
            index,
          );
          const headwind = flyjs.HeadWindCalculator(windSpeed, windDir, segment.course, 2);
          let backgroundColor = 'blue';
          if (routeProfileApiState.windLayer === 'Head/tailwind') {
            if (headwind <= -0.5) {
              backgroundColor = 'green';
            } else if (headwind < 0.5) {
              backgroundColor = 'black';
            } else {
              backgroundColor = 'red';
            }
          }
          const windText =
            routeProfileApiState.windLayer === 'Windspeed' ? Math.round(windSpeed) : Math.abs(Math.round(headwind));
          const ry = 10;
          const rx = windText > 99 ? ry + 4 : ry;
          windSpeedData.push({
            x,
            y: el,
            tooltip: {
              position: segment.position,
              time: windspeedTime,
              windSpeed: Math.round(windSpeed),
              windDir: Math.round(windDir),
              course: Math.round(segment.course),
              temp: temperature,
            },
            customComponent: (_row, _positionInPixels) => {
              return (
                <g className="inner-inner-component">
                  <ellipse cx="0" cy="0" rx={rx} ry={ry} fill={backgroundColor} stroke="white" strokeWidth={2} />
                  <marker
                    id="wind-arrow"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="4"
                    markerHeight="4"
                    orient="auto-start-reverse"
                    stroke="white"
                    fill="white"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                  <marker
                    id="course-arrow"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="4"
                    markerHeight="4"
                    orient="auto-start-reverse"
                    stroke="magenta"
                    fill="magenta"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                  <line
                    x1="0"
                    y1="-12"
                    x2="0"
                    y2="-32"
                    stroke="magenta"
                    markerEnd="url(#course-arrow)"
                    strokeWidth="3"
                    transform={`rotate(${segment.course})`}
                  />
                  <line
                    x1="0"
                    y1="-38"
                    x2="0"
                    y2="-18"
                    stroke="white"
                    markerEnd="url(#wind-arrow)"
                    strokeWidth="3"
                    transform={`rotate(${windDir})`}
                  />
                  <text x={0} y={0}>
                    <tspan x="0" y="1" dominantBaseline="middle" textAnchor="middle" className="windspeed-text">
                      {windText}
                    </tspan>
                  </text>
                </g>
              );
            },
          });
        }
        setWindSpeedSeries(windSpeedData);
      });
    }
  }

  useEffect(() => {
    buildWindSeries();
  }, [
    queryGfsWindSpeedDataResult.isSuccess,
    queryGfsWindDirectionDataResult.isSuccess,
    queryTemperatureDataResult.isSuccess,
    segments,
    routeProfileApiState.maxAltitude,
    routeProfileApiState.windLayer,
  ]);

  return (
    <RouteProfileChart showDayNightBackground={true} noDataMessage={null}>
      {windSpeedSeries && (
        <CustomSVGSeries
          customComponent="square"
          data={windSpeedSeries}
          onValueMouseOver={(value) => {
            const gfsTemp = userSettings.default_temperature_unit
              ? celsiusToFahrenheit(value.tooltip.temp, 1)
              : value.tooltip.temp;
            const stdTemp = getStandardTemp(value.y, userSettings.default_temperature_unit);
            value.tooltip.departureTemp = round(gfsTemp - stdTemp, 1);
            setWindHintValue(value);
          }}
          onValueMouseOut={() => setWindHintValue(null)}
        ></CustomSVGSeries>
      )}
      {windHintValue && (
        <Hint value={windHintValue}>
          <div className="chart-tooltip">
            <span>
              <b>Time:</b>&nbsp;
              {convertTimeFormat(windHintValue.tooltip.time, userSettings.default_time_display_unit)}
            </span>
            <span>
              <b>Latitude:</b>&nbsp;{windHintValue.tooltip.position.lat}
            </span>
            <span>
              <b>Longitude:</b>&nbsp;{windHintValue.tooltip.position.lng}
            </span>
            <span>
              <b>Wind speed:</b>&nbsp;{windHintValue.tooltip.windSpeed}&nbsp;knots
            </span>
            <span>
              <b>Wind direction:</b>&nbsp;{addLeadingZeroes(windHintValue.tooltip.windDir, 3)}&deg;
            </span>
            <span>
              <b>Course:</b>&nbsp;{addLeadingZeroes(windHintValue.tooltip.course, 3)}&deg;
            </span>
            <span>
              <b>Altitude:</b>&nbsp;{windHintValue.y} feet MSL
            </span>
            <span>
              <b>Temperature:</b>&nbsp;
              {userSettings.default_temperature_unit
                ? celsiusToFahrenheit(windHintValue.tooltip.temp, 1) + ' \u00B0F'
                : round(windHintValue.tooltip.temp, 1) + ' \u00B0C'}
            </span>
            <span>
              <b>Departure from standard:</b>&nbsp;
              <span style={{ color: windHintValue.tooltip.departureTemp >= 0 ? 'red' : 'blue' }}>
                {windHintValue.tooltip.departureTemp > 0 && '+'}
                {windHintValue.tooltip.departureTemp +
                  (userSettings.default_temperature_unit ? ' \u00B0F' : ' \u00B0C')}
              </span>
            </span>
          </div>
        </Hint>
      )}
    </RouteProfileChart>
  );
};
export default WindChart;
