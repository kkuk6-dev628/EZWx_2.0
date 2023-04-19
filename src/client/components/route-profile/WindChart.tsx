import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  XYPlot,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  AreaSeries,
  ContourSeries,
  CustomSVGSeries,
  Hint,
} from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  cacheKeys,
  getRouteLength,
  getSegmentsCount,
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
import { convertTimeFormat, meterToFeet, simpleTimeOnlyFormat } from '../map/common/AreoFunctions';
import flyjs from '../../fly-js/fly';

export const windDataElevations = {
  500: [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000],
  300: [3000, 6000, 9000, 12000, 15000, 18000, 21000, 23000, 25000, 28000],
  200: [2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000],
};

export const calcChartWidth = (viewWidth: number, _viewHeight: number) => {
  if (viewWidth < 900) {
    return 900;
  } else {
    return viewWidth - 128;
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
  const { data: routeProfileApiState, isLoading } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const segments = useSelector(selectRouteSegments);
  const [queryElevations, queryElevationsResult] = useQueryElevationApiMutation({ fixedCacheKey: 'elevation-api' });
  const [elevationSeries, setElevationSeries] = useState([]);
  const [segmentsCount, setSegmentsCount] = useState(1);
  const [routeLength, setRouteLength] = useState(0);
  const startMargin = segmentsCount ? routeLength / segmentsCount / 2 : 0;
  const endMargin = segmentsCount ? routeLength / segmentsCount / 4 : 0;
  const [viewW, setViewW] = useState<number>(window.innerWidth);
  const [viewH, setViewH] = useState<number>(window.innerHeight);
  const [windHintValue, setWindHintValue] = useState(null);

  const [windSpeedSeries, setWindSpeedSeries] = useState([]);
  const [queryTemperatureData, queryTemperatureDataResult] = useQueryTemperatureDataMutation({
    fixedCacheKey: cacheKeys.gfsTemperature,
  });
  const [queryGfsWindDirectionData, queryGfsWindDirectionDataResult] = useQueryGfsWindDirectionDataMutation({
    fixedCacheKey: cacheKeys.gfsWinddirection,
  });
  const [queryGfsWindSpeedData, queryGfsWindSpeedDataResult] = useQueryGfsWindSpeedDataMutation({
    fixedCacheKey: cacheKeys.gfsWindspeed,
  });

  useEffect(() => {
    if (queryGfsWindSpeedDataResult.isSuccess && queryGfsWindDirectionDataResult.isSuccess && segments.length > 0) {
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
          const { value: windDir } = getValueFromDataset(
            queryGfsWindDirectionDataResult.data,
            new Date(segment.arriveTime),
            el,
            index,
          );
          const headwind = flyjs.HeadWindCalculator(windSpeed, windDir, segment.course, 2);
          windSpeedData.push({
            x,
            y: el,
            tooltip: {
              time: convertTimeFormat(windspeedTime, false),
              windSpeed: Math.round(windSpeed),
              windDir: Math.round(windDir),
              course: Math.round(segment.course),
            },
            customComponent: (_row, _positionInPixels) => {
              return (
                <g className="inner-inner-component">
                  <circle cx="0" cy="0" r={10} fill="red" stroke="white" />
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
                    y1="-34"
                    x2="0"
                    y2="-14"
                    stroke="white"
                    markerEnd="url(#wind-arrow)"
                    strokeWidth="3"
                    transform={`rotate(${windDir})`}
                  />
                  <line
                    x1="0"
                    y1="-10"
                    x2="0"
                    y2="-30"
                    stroke="magenta"
                    markerEnd="url(#course-arrow)"
                    strokeWidth="3"
                    transform={`rotate(${segment.course})`}
                  />
                  <text x={0} y={0}>
                    <tspan x="0" y="0" dominantBaseline="middle" textAnchor="middle" className="windspeed-text">
                      {Math.round(headwind)}
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
  }, [
    queryGfsWindSpeedDataResult.isSuccess,
    queryGfsWindDirectionDataResult.isSuccess,
    segments,
    routeProfileApiState.maxAltitude,
    routeProfileApiState.windLayer,
  ]);

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
      setRouteLength(getRouteLength(activeRoute, !userSettings.default_distance_unit));
      setSegmentsCount(getSegmentsCount(activeRoute));
    }
  }, [activeRoute]);

  useEffect(() => {
    if (queryElevationsResult.isSuccess && queryElevationsResult.data && routeLength) {
      const elevations = [];
      const elevationApiResults = queryElevationsResult.data.results;
      const elSegmentLength = routeLength / totalNumberOfElevations;
      for (let i = 0; i < elevationApiResults.length; i++) {
        elevations.push({ x: i * elSegmentLength, y: meterToFeet(elevationApiResults[i].elevation) });
      }
      setElevationSeries(elevations);
    }
  }, [queryElevationsResult.isSuccess, routeLength]);

  return (
    <XYPlot
      height={calcChartHeight(viewW, viewH)}
      width={calcChartWidth(viewW, viewH)}
      yDomain={[0, routeProfileApiState.maxAltitude * 100]}
      xDomain={[-startMargin, routeLength + endMargin]}
    >
      <AreaSeries
        data={[
          { x: -startMargin, y: 50000 },
          { x: routeLength, y: 50000 },
        ]}
        color="skyblue"
      />
      <VerticalGridLines
        tickValues={Array.from({ length: segmentsCount * 2 + 1 }, (_value, index) =>
          Math.round((index * routeLength) / (segmentsCount * 2)),
        )}
        style={{
          stroke: '#22222222',
        }}
      />
      <HorizontalGridLines
        tickValues={Array.from({ length: 10 + 1 }, (_value, index) =>
          Math.round((index * routeProfileApiState.maxAltitude * 100) / 10),
        )}
        style={{
          stroke: '#22222222',
        }}
      />
      <XAxis
        tickValues={Array.from({ length: segmentsCount + 1 }, (_value, index) =>
          Math.round((index * routeLength) / segmentsCount),
        )}
        tickFormat={(v, index) => {
          if (segments.length > 0) {
            const dist = Math.round(segments[index].accDistance / 10) * 10;
            return (
              <tspan className="chart-label">
                <tspan className="chart-label-dist">{dist}</tspan>
                <tspan className="chart-label-hours" dx={dist < 100 ? 0 : dist < 1000 ? '-1em' : '-1.6em'} dy="1.2em">
                  {simpleTimeOnlyFormat(new Date(segments[index].arriveTime), userSettings.default_time_display_unit)}
                </tspan>
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
      <CustomSVGSeries
        customComponent="square"
        data={windSpeedSeries}
        onValueMouseOver={(value) => setWindHintValue(value)}
        // onValueMouseOut={() => setWindHintValue(null)}
      ></CustomSVGSeries>
      <AreaSeries data={elevationSeries} color="#9e8f85" curve={'curveMonotoneX'} stroke="#908177" />
      {windHintValue && (
        <Hint value={windHintValue}>
          <div className="wind-tooltip">
            <span>
              <b>Time:</b>&nbsp;{windHintValue.tooltip.time}
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
          </div>
        </Hint>
      )}
    </XYPlot>
  );
};
export default WindChart;
