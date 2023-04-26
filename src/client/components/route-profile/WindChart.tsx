import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  XYPlot,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  AreaSeries,
  LineSeries,
  CustomSVGSeries,
  Hint,
  LabelSeries,
  GradientDefs,
} from 'react-vis';
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
  useQueryGfsWindDirectionDataMutation,
  useQueryGfsWindSpeedDataMutation,
  useQueryTemperatureDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import {
  celsiusToFahrenheit,
  convertTimeFormat,
  getStandardTemp,
  meterToFeet,
  round,
  simpleTimeOnlyFormat,
} from '../map/common/AreoFunctions';
import flyjs from '../../fly-js/fly';
import { Conrec } from '../../conrec-js/conrec';

export const windDataElevations = {
  500: [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000],
  300: [3000, 6000, 9000, 12000, 15000, 18000, 21000, 24000, 27000],
  200: [2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000],
};

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

const temperatureContourColors = {
  positive: '#dfbb5f',
  negative: '#5fdf84',
};

const WindChart = () => {
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);
  const { data: routeProfileApiState, isLoading } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const segments = useSelector(selectRouteSegments);
  const [queryElevations, queryElevationsResult] = useQueryElevationApiMutation({ fixedCacheKey: 'elevation-api' });
  const [elevationSeries, setElevationSeries] = useState([]);
  const [segmentsCount, setSegmentsCount] = useState(1);
  const [routeLength, setRouteLength] = useState(0);
  const [startMargin, setStartMargin] = useState(0);
  const [endMargin, setEndMargin] = useState(0);
  const [viewW, setViewW] = useState<number>(window.innerWidth);
  const [viewH, setViewH] = useState<number>(window.innerHeight);

  const [contourLabelData, setContourLabelData] = useState([]);

  const [windHintValue, setWindHintValue] = useState(null);
  const [elevationHint, setElevationHint] = useState(null);
  const [showElevationHint, setShowElevationHint] = useState(false);
  const [timeHint, setTimeHint] = useState(null);

  const [windSpeedSeries, setWindSpeedSeries] = useState([]);
  const [temperatureContures, setTemperatureContours] = useState([]);
  const [gradientStops, setGradientStops] = useState([]);

  const [queryTemperatureData, queryTemperatureDataResult] = useQueryTemperatureDataMutation({
    fixedCacheKey: cacheKeys.gfsTemperature,
  });
  const [queryGfsWindDirectionData, queryGfsWindDirectionDataResult] = useQueryGfsWindDirectionDataMutation({
    fixedCacheKey: cacheKeys.gfsWinddirection,
  });
  const [queryGfsWindSpeedData, queryGfsWindSpeedDataResult] = useQueryGfsWindSpeedDataMutation({
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
              time: convertTimeFormat(windspeedTime, userSettings.default_time_display_unit),
              windSpeed: Math.round(windSpeed),
              windDir: Math.round(windDir),
              course: Math.round(segment.course),
              temp: userSettings.default_temperature_unit
                ? celsiusToFahrenheit(temperature, 1) + ' \u00B0F'
                : round(temperature, 1) + ' \u00B0C',
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
                    y1="-15"
                    x2="0"
                    y2="-35"
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
                    <tspan x="0" y="0" dominantBaseline="middle" textAnchor="middle" className="windspeed-text">
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
    userSettings.default_temperature_unit,
    userSettings.default_time_display_unit,
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
    if (segments.length > 0) {
      const times = segments.map((segment) => ({
        time: new Date(segment.arriveTime),
        hour: segment.departureTime.hour,
        minute: segment.departureTime.minute,
      }));
      const stops = getTimeGradientStops(times);
      setGradientStops(stops);
    }
  }, [segments]);

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  const handleWindowSizeChange = () => {
    setViewW(window.innerWidth);
    setViewH(window.innerHeight);
  };

  useEffect(() => {
    if (activeRoute) {
      // userSettings.default_distance_unit == true then km, or nm
      const elevationPoints = interpolateRoute(activeRoute, totalNumberOfElevations);
      if (!queryElevationsResult.isLoading) queryElevations({ queryPoints: elevationPoints });
      const count = getSegmentsCount(activeRoute);
      const length = getRouteLength(activeRoute, !userSettings.default_distance_unit);
      setRouteLength(length);
      setSegmentsCount(count);
      const start = count ? length / count / 2 : 0;
      const end = count ? length / count / 2 : 0;
      setStartMargin(start);
      setEndMargin(end);
    }
  }, [activeRoute]);

  useEffect(() => {
    if (queryElevationsResult.isSuccess && queryElevationsResult.data && routeLength) {
      const elevationApiResults = queryElevationsResult.data.results;
      const elevations = [{ x: -startMargin, y: meterToFeet(elevationApiResults[0].elevation) }];
      const elSegmentLength = routeLength / totalNumberOfElevations;
      for (let i = 1; i < elevationApiResults.length - 1; i++) {
        elevations.push({ x: (i - 1) * elSegmentLength, y: meterToFeet(elevationApiResults[i].elevation) });
      }
      elevations.push({
        x: routeLength + endMargin,
        y: meterToFeet(elevationApiResults[elevationApiResults.length - 1].elevation),
      });
      if (elevations.length === 0) return;
      setElevationSeries(elevations);
    }
  }, [queryElevationsResult.isSuccess, routeLength]);

  return (
    <XYPlot
      height={calcChartHeight(viewW, viewH)}
      width={calcChartWidth(viewW, viewH)}
      yDomain={[0, routeProfileApiState.maxAltitude * 100]}
      xDomain={[-startMargin, routeLength + endMargin]}
      margin={{ right: 40 }}
    >
      <GradientDefs>
        <linearGradient id="linear-gradient">
          {gradientStops.map(({ level, stopColor }, index) => (
            <stop key={'gradient-' + index} offset={level} stopColor={stopColor} />
          ))}
        </linearGradient>
      </GradientDefs>
      <AreaSeries
        data={[
          { x: -startMargin, y: 50000 },
          { x: routeLength + endMargin, y: 50000 },
        ]}
        color={'url(#linear-gradient)'}
      />
      <VerticalGridLines
        tickValues={Array.from({ length: segmentsCount * 2 + 1 }, (_value, index) =>
          Math.round((index * routeLength) / (segmentsCount * 2)),
        )}
        style={{
          stroke: 'grey',
          strokeWidth: 0.2,
        }}
      />
      <HorizontalGridLines
        tickValues={Array.from({ length: 5 - 1 }, (_value, index) =>
          Math.round(((index + 1) * routeProfileApiState.maxAltitude * 100) / 5),
        )}
        style={{
          stroke: 'grey',
          strokeWidth: 2,
        }}
      />
      <HorizontalGridLines
        tickValues={Array.from({ length: 5 }, (_value, index) =>
          Math.round(((index + 0.5) * routeProfileApiState.maxAltitude * 100) / 5),
        )}
        style={{
          stroke: 'grey',
          strokeWidth: 0.2,
        }}
      />
      <XAxis
        tickValues={Array.from({ length: segmentsCount + 1 }, (_value, index) =>
          Math.round((index * routeLength) / segmentsCount),
        )}
        tickFormat={(v, index) => {
          if (segments.length > 0 && segments[index]) {
            const dist = Math.round(segments[index].accDistance);
            return (
              <tspan className="chart-label">
                <tspan className="chart-label-dist">{dist}</tspan>
              </tspan>
            );
          }
          return v;
        }}
        style={{
          line: { stroke: '#ADDDE100' },
          ticks: { stroke: '#ADDDE100' },
          text: { stroke: 'none', fill: 'white', fontWeight: 600 },
        }}
      />
      <YAxis
        tickValues={Array.from({ length: 10 + 1 }, (_value, index) =>
          Math.round((index * routeProfileApiState.maxAltitude * 100) / 5),
        )}
        tickFormat={(v) => v / 100}
        style={{
          line: { stroke: '#ADDDE100' },
          ticks: { stroke: '#ADDDE100' },
          text: { stroke: 'none', fill: 'white', fontWeight: 600 },
        }}
      />
      <YAxis
        tickValues={Array.from({ length: 10 + 1 }, (_value, index) =>
          Math.round((index * routeProfileApiState.maxAltitude * 100) / 5),
        )}
        tickFormat={(v) => v / 100}
        orientation="right"
        style={{
          line: { stroke: '#ADDDE100' },
          ticks: { stroke: '#ADDDE100' },
          text: { stroke: 'none', fill: 'white', fontWeight: 600 },
        }}
      />
      {segments && segments.length > 4 ? (
        <LabelSeries
          animation
          allowOffsetToBeReversed
          onValueMouseOver={(value) => {
            setTimeHint(value);
          }}
          onValueMouseOut={() => setTimeHint(null)}
          data={Array.from({ length: segmentsCount + 1 }, (_value, index) => {
            return {
              x: Math.round((index * routeLength) / segmentsCount),
              y: 0,
              yOffset: 36,
              segment: segments[index],
              label: userSettings.default_time_display_unit
                ? segments[index].departureTime.time
                : simpleTimeOnlyFormat(new Date(segments[index].arriveTime), false),
              style: {
                fill: 'white',
                dominantBaseline: 'text-after-edge',
                textAnchor: 'start',
              },
            };
          })}
        />
      ) : null}
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
      {activeRoute ? (
        <LineSeries
          data={[
            { x: 0, y: activeRoute.altitude },
            { x: routeLength, y: activeRoute.altitude },
          ]}
          color="magenta"
        />
      ) : null}
      {windSpeedSeries.length > 0 ? (
        <CustomSVGSeries
          customComponent="square"
          data={windSpeedSeries}
          onValueMouseOver={(value) => setWindHintValue(value)}
          onValueMouseOut={() => setWindHintValue(null)}
        ></CustomSVGSeries>
      ) : null}
      {elevationSeries.length > 0 ? (
        <AreaSeries
          data={elevationSeries}
          color="#9e8f85"
          curve={'curveMonotoneX'}
          stroke="#908177"
          onNearestXY={(datapoint, event) => setElevationHint(datapoint)}
          onSeriesMouseOut={() => setShowElevationHint(false)}
          onSeriesMouseOver={() => setShowElevationHint(true)}
        />
      ) : null}
      {showElevationHint ? (
        <Hint value={elevationHint}>
          <div style={{ background: 'white', color: 'black', padding: 4, borderRadius: 4 }}>{elevationHint.y}</div>
        </Hint>
      ) : null}
      {windHintValue && (
        <Hint value={windHintValue}>
          <div className="chart-tooltip">
            <span>
              <b>Time:</b>&nbsp;{windHintValue.tooltip.time}
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
              <b>Temperature:</b>&nbsp;{windHintValue.tooltip.temp}
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
      {timeHint ? (
        <Hint value={timeHint} className="time-tooltip" align={{ horizontal: 'auto', vertical: 'top' }}>
          <span>{timeHint.segment.departureTime.full}</span>
          <span>{convertTimeFormat(timeHint.segment.arriveTime, true)}</span>
          <span>{convertTimeFormat(timeHint.segment.arriveTime, false)}</span>
        </Hint>
      ) : null}
    </XYPlot>
  );
};
export default WindChart;
