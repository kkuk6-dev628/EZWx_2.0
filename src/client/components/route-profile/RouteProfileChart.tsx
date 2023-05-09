import { useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import {
  XYPlot,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  LineSeries,
  AreaSeries,
  Hint,
  LabelSeries,
  GradientDefs,
} from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  getRouteLength,
  getSegmentsCount,
  getTimeGradientStops,
  interpolateRoute,
  interpolateRouteWithStation,
  totalNumberOfElevations,
} from './RouteProfileDataLoader';
import { initialUserSettingsState, selectSettings } from '../../store/user/UserSettings';
import { useGetRouteProfileStateQuery } from '../../store/route-profile/routeProfileApi';
import { useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import {
  celsiusToFahrenheit,
  convertTimeFormat,
  degree2radian,
  getMetarCeilingCategory,
  getMetarVisibilityCategory,
  meterToFeet,
  round,
  simpleTimeOnlyFormat,
} from '../map/common/AreoFunctions';
import { nauticalMilesToKilometers } from '../../fly-js/src/helpers/converters/DistanceConverter';
import * as flyjs from '../../fly-js/fly';
import { useGetAirportQuery } from '../../store/route/airportApi';
import { flightCategoryToColor, getNbmFlightCategory } from '../map/leaflet/layers/StationMarkersLayer';
import { MetarSkyValuesToString } from '../map/common/AreoConstants';

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

function getFlightCategoryColor(visibility, ceiling): string {
  const [catVis] = getMetarVisibilityCategory(visibility, initialUserSettingsState.personalMinimumsState);
  const [catCeiling] = getMetarCeilingCategory(ceiling, initialUserSettingsState.personalMinimumsState);
  const categories = Object.keys(initialUserSettingsState.personalMinimumsState);
  const indexVis = categories.indexOf(catVis);
  const indexCeiling = categories.indexOf(catCeiling);
  let indexFinalCat: number;
  if (indexCeiling > -1 && indexVis > -1) {
    indexFinalCat = Math.min(indexCeiling, indexVis);
  } else if (indexCeiling > -1) {
    indexFinalCat = -1;
  } else if (indexVis > -1) {
    indexFinalCat = indexVis;
  } else {
    indexFinalCat = -1;
  }
  const finalCat = indexFinalCat > -1 ? categories[indexFinalCat] : 'Black';
  return flightCategoryToColor(finalCat);
}

const RouteProfileChart = (props: { children: ReactNode; showDayNightBackground: boolean }) => {
  const activeRoute = useSelector(selectActiveRoute);
  const userSettings = useSelector(selectSettings);
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null, {
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
  const [airportLabelSeries, setAirportLabelSeries] = useState(null);

  const [elevationHint, setElevationHint] = useState(null);
  const [showElevationHint, setShowElevationHint] = useState(false);
  const [timeHint, setTimeHint] = useState(null);
  const [airportHint, setAirportHint] = useState(null);

  const [gradientStops, setGradientStops] = useState([]);

  useEffect(() => {
    if (segments.length > 0) {
      const times = segments.map((segment) => ({
        time: new Date(segment.arriveTime),
        hour: segment.departureTime.hour,
        minute: segment.departureTime.minute,
      }));
      const stops = getTimeGradientStops(times);
      setGradientStops(stops);
      buildAirportLabelSeries();
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

  function buildAirportLabelSeries() {
    if (segments.length > 0) {
      let tooltip = null;
      const airportLabels = segments.map((seg, segmentIndex) => {
        const labelStyle = {
          fill: 'green',
          dominantBaseline: 'text-after-edge',
          textAnchor: 'middle',
          fontSize: seg.isRoutePoint ? 14 : 11,
          fontWeight: 600,
        };
        if (seg.airportNbmProps) {
          labelStyle.fill = getFlightCategoryColor(seg.airportNbmProps.visibility, seg.airportNbmProps.cloudceiling);
          const lowestCloud = seg.airportNbmProps.cloudbase;
          const ceiling = seg.airportNbmProps.cloudceiling;
          const skyCover = seg.airportNbmProps.skycover;
          const skyConditions = [];
          if (ceiling) {
            skyConditions.push({
              skyCover: skyCover >= 88 ? 'OVC' : 'BKN',
              cloudBase: ceiling,
            });
            if (lowestCloud) {
              skyConditions.push({
                skyCover: 'SCT',
                cloudBase: lowestCloud,
              });
            }
          } else if (lowestCloud) {
            let skyCondition: string;
            if (skyCover < 6) {
              skyCondition = 'SKC';
            } else if (skyCover < 31) {
              skyCondition = 'FEW';
            } else {
              skyCondition = 'SCT';
            }
            skyConditions.push({
              skyCover: skyCondition,
              cloudBase: lowestCloud,
            });
          } else {
            skyConditions.push({
              skyCover: 'SKC',
              cloudBase: 0,
            });
          }

          const skyConditionsAsc = skyConditions.sort((a, b) => {
            return a.cloudBase > b.cloudBase ? 1 : -1;
          });

          const clouds = skyConditionsAsc.map((skyCondition) => {
            return MetarSkyValuesToString[skyCondition.skyCover] +
              ' ' +
              (['CLR', 'SKC', 'CAVOK'].includes(skyCondition.skyCover) === false)
              ? skyCondition.cloudBase + ' feet'
              : null;
          });

          tooltip = {
            time: seg.arriveTime,
            clouds: skyConditionsAsc,
            visibility: seg.airportNbmProps.visibility,
            windspeed: seg.airportNbmProps.windspeed,
            winddir: seg.airportNbmProps.winddir,
            temperature: seg.airportNbmProps.temperature,
            dewpoint: seg.airportNbmProps.dewpoint,
          };
        }
        let airportDist = 0;
        if (segmentIndex > 0 && seg.airport) {
          const airportDelta = flyjs.distanceTo(
            seg.position.lat,
            seg.position.lng,
            seg.airport.position.coordinates[1],
            seg.airport.position.coordinates[0],
            2,
          );
          const airportCourse = flyjs.trueCourse(
            seg.position.lat,
            seg.position.lng,
            seg.airport.position.coordinates[1],
            seg.airport.position.coordinates[0],
            2,
          );
          airportDist = Math.cos(degree2radian(airportCourse - seg.course)) * airportDelta;
        }
        return {
          x: seg.accDistance + airportDist,
          y: 0,
          yOffset: seg.isRoutePoint ? 24 : 36,
          label: seg.airport ? seg.airport.key : round(seg.position.lat, 2) + '/' + round(seg.position.lng, 2),
          style: labelStyle,
          tooltip: tooltip,
        };
      });
      setAirportLabelSeries(airportLabels);
    }
  }

  useEffect(() => {
    if (activeRoute) {
      // userSettings.default_distance_unit == true then km, or nm
      const elevationPoints = interpolateRoute(activeRoute, totalNumberOfElevations);
      if (!queryElevationsResult.isSuccess) queryElevations({ queryPoints: elevationPoints });
      const count = getSegmentsCount(activeRoute);
      const length = getRouteLength(activeRoute, true);
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
      margin={{ right: 40, bottom: 80 }}
    >
      {props.showDayNightBackground && (
        <GradientDefs>
          <linearGradient id="linear-gradient">
            {gradientStops.map(({ level, stopColor }, index) => (
              <stop key={'gradient-' + index} offset={level} stopColor={stopColor} />
            ))}
          </linearGradient>
        </GradientDefs>
      )}
      {props.showDayNightBackground && (
        <AreaSeries
          data={[
            { x: -startMargin, y: 50000 },
            { x: routeLength + endMargin, y: 50000 },
          ]}
          color={'url(#linear-gradient)'}
        />
      )}
      {!props.showDayNightBackground && (
        <AreaSeries
          data={[
            { x: -startMargin, y: 50000 },
            { x: routeLength + endMargin, y: 50000 },
          ]}
          color="#DDD"
        />
      )}
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
            const distInMile = segments[index].accDistance;
            const dist = Math.round(
              userSettings.default_distance_unit ? flyjs.nauticalMilesTo('Kilometers', distInMile, 0) : distInMile,
            );
            return (
              <tspan dy="3.6em" className="chart-label">
                <tspan className="chart-label-dist">{dist}</tspan>
              </tspan>
            );
          }
          return v;
        }}
        style={{
          line: { stroke: '#ADDDE100' },
          ticks: { stroke: '#ADDDE100' },
          text: { stroke: 'none', fill: 'white', fontWeight: 600, marginTop: 36 },
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
          onValueClick={(value) => setTimeHint(value)}
          onValueMouseOut={() => setTimeHint(null)}
          data={Array.from({ length: segmentsCount + 1 }, (_value, index) => {
            if (segments[index])
              return {
                x: Math.round((index * routeLength) / segmentsCount),
                y: 0,
                yOffset: 72,
                segment: segments[index],
                label: userSettings.default_time_display_unit
                  ? segments[index].departureTime.time
                  : simpleTimeOnlyFormat(new Date(segments[index].arriveTime), false),
                style: {
                  fill: 'white',
                  dominantBaseline: 'text-after-edge',
                  textAnchor: 'start',
                  fontSize: 11,
                  fontWeight: 600,
                },
              };
          })}
        />
      ) : null}
      {airportLabelSeries && (
        <LabelSeries
          data={airportLabelSeries}
          onValueMouseOver={(value) => setAirportHint(value)}
          onValueClick={(value) => setAirportHint(value)}
          onValueMouseOut={() => setAirportHint(null)}
        />
      )}
      {routeProfileApiState.chartType === 'Wind' && activeRoute ? (
        <LineSeries
          data={[
            { x: 0, y: activeRoute.altitude },
            { x: routeLength, y: activeRoute.altitude },
          ]}
          color="white"
          strokeWidth={4}
        />
      ) : null}
      {routeProfileApiState.chartType === 'Wind' && activeRoute ? (
        <LineSeries
          data={[
            { x: 0, y: activeRoute.altitude },
            { x: routeLength, y: activeRoute.altitude },
          ]}
          color="magenta"
        />
      ) : null}
      {props.children}
      {routeProfileApiState.chartType !== 'Wind' && activeRoute ? (
        <LineSeries
          data={[
            { x: 0, y: activeRoute.altitude },
            { x: routeLength, y: activeRoute.altitude },
          ]}
          color="white"
          strokeWidth={4}
        />
      ) : null}
      {routeProfileApiState.chartType !== 'Wind' && activeRoute ? (
        <LineSeries
          data={[
            { x: 0, y: activeRoute.altitude },
            { x: routeLength, y: activeRoute.altitude },
          ]}
          color="magenta"
        />
      ) : null}
      {elevationSeries.length > 0 ? (
        <AreaSeries
          data={elevationSeries}
          color="#9e8f85"
          curve={'curveMonotoneX'}
          stroke="#908177"
          onNearestXY={(datapoint) => setElevationHint(datapoint)}
          onSeriesMouseOut={() => setShowElevationHint(false)}
          onSeriesMouseOver={() => setShowElevationHint(true)}
        />
      ) : null}
      {showElevationHint ? (
        <Hint value={elevationHint}>
          <div style={{ background: 'white', color: 'black', padding: 4, borderRadius: 4 }}>{elevationHint.y}</div>
        </Hint>
      ) : null}
      {timeHint ? (
        <Hint value={timeHint} className="time-tooltip" align={{ horizontal: 'auto', vertical: 'top' }}>
          <span>{timeHint.segment.departureTime.full}</span>
          <span>{convertTimeFormat(timeHint.segment.arriveTime, true)}</span>
          <span>{convertTimeFormat(timeHint.segment.arriveTime, false)}</span>
        </Hint>
      ) : null}
      {airportHint && airportHint.tooltip ? (
        <Hint value={airportHint} className="time-tooltip" align={{ horizontal: 'auto', vertical: 'top' }}>
          <span>
            <b>Time:</b>&nbsp;{convertTimeFormat(airportHint.tooltip.time, false)}
          </span>
          <div style={{ display: 'flex', lineHeight: 1, color: 'black' }}>
            <div>
              <p style={{ marginTop: 3 }}>
                <b>Clouds: </b>
              </p>
            </div>
            <div style={{ margin: 3, marginTop: -3 }}>
              {airportHint.tooltip.clouds.map((skyCondition) => {
                return (
                  <div
                    key={`${skyCondition.skyCover}-${skyCondition.cloudBase}`}
                    style={{ marginTop: 6, marginBottom: 2 }}
                  >
                    {MetarSkyValuesToString[skyCondition.skyCover]}{' '}
                    {['CLR', 'SKC', 'CAVOK'].includes(skyCondition.skyCover) === false &&
                      Math.round(skyCondition.cloudBase) + ' feet'}
                  </div>
                );
              })}
            </div>
          </div>

          <span>
            <b>Visibility:</b>&nbsp;{Math.round(airportHint.tooltip.visibility)} statute miles
          </span>
          <span>
            <b>Wind speed:</b>&nbsp;{Math.round(airportHint.tooltip.windspeed)} knots
          </span>
          <span>
            <b>Wind direction:</b>&nbsp;{Math.round(airportHint.tooltip.winddir) + ' \u00B0'}
          </span>
          <span>
            <b>temperature:</b>&nbsp;
            {!userSettings.default_temperature_unit
              ? Math.round(airportHint.tooltip.temperature) + ' \u00B0C'
              : celsiusToFahrenheit(airportHint.tooltip.temperature, 0) + ' \u00B0F'}
          </span>
          <span>
            <b>Dewpoint:</b>&nbsp;{' '}
            {!userSettings.default_temperature_unit
              ? Math.round(airportHint.tooltip.dewpoint) + ' \u00B0C'
              : celsiusToFahrenheit(airportHint.tooltip.dewpoint, 0) + ' \u00B0F'}
          </span>
        </Hint>
      ) : null}
    </XYPlot>
  );
};
export default RouteProfileChart;
