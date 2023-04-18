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
} from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import { getRouteLength, getSegmentsCount, interpolateRoute, totalNumberOfElevations } from './RouteProfileDataLoader';
import { selectSettings } from '../../store/user/UserSettings';
import { useGetRouteProfileStateQuery } from '../../store/route-profile/routeProfileApi';
import { useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import { meterToFeet, simpleTimeOnlyFormat } from '../map/common/AreoFunctions';

export const calcChartWidth = (viewWidth: number, viewHeight: number) => {
  if (viewWidth < 900) {
    return 900;
  } else {
    return viewWidth - 128;
  }
};
export const calcChartHeight = (viewWidth: number, viewHeight: number) => {
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
  const [viewW, setViewW] = useState<number>(window.innerWidth);
  const [viewH, setViewH] = useState<number>(window.innerHeight);

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
      xDomain={[-startMargin, routeLength]}
    >
      <AreaSeries
        data={[
          { x: -startMargin, y: 50000 },
          { x: routeLength, y: 50000 },
        ]}
        color="skyblue"
      />
      <VerticalGridLines
        tickValues={Array.from({ length: segmentsCount * 2 + 1 }, (value, index) =>
          Math.round((index * routeLength) / (segmentsCount * 2)),
        )}
        style={{
          stroke: '#22222222',
        }}
      />
      <HorizontalGridLines
        style={{
          stroke: '#22222222',
        }}
      />
      <XAxis
        tickValues={Array.from({ length: segmentsCount + 1 }, (value, index) =>
          Math.round((index * routeLength) / segmentsCount),
        )}
        tickFormat={(v, index) => {
          if (segments) {
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
        tickValues={[0, 10000, 20000, 30000, 40000, 50000]}
        tickFormat={(v) => v / 100}
        style={{
          line: { stroke: '#ADDDE100' },
          ticks: { stroke: '#ADDDE100' },
          text: { stroke: 'none', fill: 'white', fontWeight: 600 },
        }}
      />
      {routeProfileApiState.chartType === 'Wind' && (
        <ContourSeries
          data={elevationSeries.map((row) => ({ ...row, z: Math.round(Math.random() * 10) }))}
          style={{
            stroke: '#125C7788',
            strokeLinejoin: 'round',
          }}
          colorRange={['#79C7E300', '#FF983300']}
        ></ContourSeries>
      )}
      <AreaSeries data={elevationSeries} color="#9e8f85" curve={'curveMonotoneX'} />
      <CustomSVGSeries
        customComponent="square"
        data={Array.from({ length: segmentsCount * 4 }, (value, index) => {
          const x = Math.round((Math.round(index / 4) * routeLength) / segmentsCount);
          const y = (index % 4) * 10000;
          return {
            x,
            y,
            customComponent: (row, positionInPixels) => {
              return (
                <g className="inner-inner-component">
                  <circle cx="0" cy="0" r={10} fill="red" stroke="white" />
                  <marker
                    id="arrow"
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
                  <line x1="0" y1="0" x2="0" y2="-20" stroke="white" marker-end="url(#arrow)" stroke-width="3" />
                  <text x={0} y={0}>
                    <tspan x="0" y="0">{`x: ${x}`}</tspan>
                    <tspan x="0" y="1em">{`y: ${y}`}</tspan>
                  </text>
                </g>
              );
            },
          };
        })}
      />
    </XYPlot>
  );
};
export default WindChart;
