import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LineSeries, CustomSVGSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import { cacheKeys, getRouteLength, getSegmentsCount, getValueFromDataset } from './RouteProfileDataLoader';
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
import { Conrec } from '../../conrec-js/conrec';
import RouteProfileChart from './RouteProfileChart';

export const windDataElevations = {
  500: [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000],
  300: [3000, 6000, 9000, 12000, 15000, 18000, 21000, 24000, 27000],
  200: [2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000],
};

export const windQueryElevations = [
  2000, 3000, 4000, 5000, 6000, 8000, 9000, 10000, 12000, 14000, 15000, 16000, 18000, 20000, 21000, 24000, 27000, 30000,
  35000, 40000, 45000,
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

export const temperatureContourColors = {
  positive: '#dfbb5f',
  negative: '#5fdf84',
};

const WindChart = () => {
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const segments = useSelector(selectRouteSegments);
  const [routeLength, setRouteLength] = useState(0);
  const [startMargin, setStartMargin] = useState(0);
  const [endMargin, setEndMargin] = useState(0);

  const [windSpeedSeries, setWindSpeedSeries] = useState([]);
  const [windHintValue, setWindHintValue] = useState(null);

  const [contourLabelData, setContourLabelData] = useState([]);
  const [temperatureContures, setTemperatureContours] = useState([]);

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
    if (
      queryGfsWindSpeedDataResult.isSuccess &&
      queryGfsWindDirectionDataResult.isSuccess &&
      queryTemperatureDataResult.isSuccess &&
      segments.length > 0
    ) {
      const windSpeedData = [];
      const dataset = queryGfsWindSpeedDataResult.data;
      segments.forEach((segment, index) => {
        const x = segment.accDistance;
        const elevations = windDataElevations[routeProfileApiState.maxAltitude];
        if (!elevations) {
          return;
        }
        for (const el of elevations) {
          const { value: windSpeed, time: windspeedTime } = getValueFromDataset(
            dataset,
            new Date(segment.arriveTime),
            el,
            index,
          );
          if (!windspeedTime) {
            continue;
          }
          const { value: windDir } = getValueFromDataset(
            queryGfsWindDirectionDataResult.data,
            new Date(segment.arriveTime),
            el,
            index,
          );
          const { value: temperature } = getValueFromDataset(
            queryTemperatureDataResult.data,
            new Date(segment.arriveTime),
            el,
            index,
          );
          const headwind = flyjs.HeadWindCalculator(windSpeed, windDir, segment.course, 2);
          let backgroundColor = 'blue';
          if (routeProfileApiState.windLayer === 'Head/tailwind') {
            if (headwind < 0) {
              backgroundColor = 'green';
            } else if (headwind < 0.5) {
              backgroundColor = 'black';
            } else {
              backgroundColor = 'red';
            }
          }
          const gfsTemp = userSettings.default_temperature_unit ? celsiusToFahrenheit(temperature, 1) : temperature;
          const stdTemp = getStandardTemp(el, userSettings.default_temperature_unit);
          const departure = round(gfsTemp - stdTemp, 1);
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
              departureTemp: departure,
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

  function buildTemperatureContourSeries() {
    if (queryTemperatureDataResult.isSuccess && segments.length > 0) {
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
          const { value: temperature } = getValueFromDataset(
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
          fill: contour.temperature > 0 ? temperatureContourColors.positive : temperatureContourColors.negative,
          stroke: 'white',
          strokeWidth: 0.1,
          dominantBaseline: 'text-after-edge',
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

  useEffect(() => {
    if (activeRoute) {
      // userSettings.default_distance_unit == true then km, or nm
      const count = getSegmentsCount(activeRoute);
      const length = getRouteLength(activeRoute, true);
      setRouteLength(length);
      const start = count ? length / count / 2 : 0;
      const end = count ? length / count / 2 : 0;
      setStartMargin(start);
      setEndMargin(end);
    }
  }, [activeRoute]);

  return (
    <RouteProfileChart showDayNightBackground={true}>
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
          />
        );
      })}
      {contourLabelData.length > 0 ? (
        <LabelSeries animation allowOffsetToBeReversed data={contourLabelData}></LabelSeries>
      ) : null}
      {windSpeedSeries.length > 0 ? (
        <CustomSVGSeries
          customComponent="square"
          data={windSpeedSeries}
          onValueMouseOver={(value) => setWindHintValue(value)}
          onValueMouseOut={() => setWindHintValue(null)}
        ></CustomSVGSeries>
      ) : null}
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
              <b>Wind direction:</b>&nbsp;{windHintValue.tooltip.windDir}&deg;
            </span>
            <span>
              <b>Course:</b>&nbsp;{windHintValue.tooltip.course}&deg;
            </span>
            <span>
              <b>Altitude:</b>&nbsp;{windHintValue.y} feet
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
