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
  VerticalRectSeries,
  CustomSVGSeries,
} from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  cacheKeys,
  getMinMaxValueByElevation,
  getRouteLength,
  getSegmentsCount,
  getTimeGradientStops,
  getValueFromDatasetByElevation,
  interpolateRoute,
  interpolateRouteWithStation,
  totalNumberOfElevations,
} from './RouteProfileDataLoader';
import { initialUserSettingsState, selectSettings } from '../../store/user/UserSettings';
import {
  useGetRouteProfileStateQuery,
  useQueryNbmFlightCategoryMutation,
  useQueryGfsWindDirectionDataMutation,
  useQueryGfsWindSpeedDataMutation,
  useQueryTemperatureDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import { selectFetchedDate, selectRouteSegments } from '../../store/route-profile/RouteProfile';
import {
  celsiusToFahrenheit,
  convertTimeFormat,
  degree2radian,
  getMetarCeilingCategory,
  getMetarVisibilityCategory,
  meterToFeet,
  round,
  roundCloudHeight,
  simpleTimeOnlyFormat,
  visibilityMileToFraction,
  visibilityMileToMeter,
} from '../map/common/AreoFunctions';
import fly, * as flyjs from '../../fly-js/fly';
import { flightCategoryToColor, getNbmWeatherMarkerIcon } from '../map/leaflet/layers/StationMarkersLayer';
import { MetarSkyValuesToString } from '../map/common/AreoConstants';
import { Conrec } from '../../conrec-js/conrec';
import { RouteProfileDataset, RouteSegment } from '../../interfaces/route-profile';
import Route from '../shared/Route';
import { LatLng } from 'leaflet';

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
  positive: '#FBF209',
  negative: '#09FDC6',
};

export function makeSkyConditions(
  lowestCloud: number,
  ceiling: number,
  skyCover: number,
): { skyCover: string; cloudBase: number }[] {
  const skyConditions = [];
  if (ceiling > 0) {
    skyConditions.push({
      skyCover: skyCover >= 88 ? 'OVC' : 'BKN',
      cloudBase: ceiling,
    });
    if (lowestCloud > 0) {
      skyConditions.push({
        skyCover: 'SCT',
        cloudBase: lowestCloud,
      });
    }
  } else if (lowestCloud > 0) {
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
  return skyConditionsAsc;
}
export function buildContour(
  activeRoute: Route,
  routeProfileDataset: RouteProfileDataset[],
  segments: RouteSegment[],
  maxAltitude: number,
  showInCelsius: boolean,
) {
  const segmentCount = getSegmentsCount(activeRoute);
  const routeLength = getRouteLength(activeRoute, true);
  const startMargin = segmentCount ? routeLength / segmentCount / 2 : 0;
  const endMargin = segmentCount ? routeLength / segmentCount / 2 : 0;

  const matrixData: number[][] = [];
  const xs = [-startMargin / 2, ...segments.map((segment) => segment.accDistance), routeLength + endMargin / 2];
  // const xs = segments.map((segment) => segment.accDistance);
  const elevations = Array.from({ length: 50 }, (_value, index) => index * 1000);
  let { min: min, max: max } = getMinMaxValueByElevation(routeProfileDataset, maxAltitude * 100);
  const step = maxAltitude === 500 ? 5 : maxAltitude === 300 ? 2 : 1;
  min = Math.round(min / step) * step;
  max = Math.round(max / step) * step;
  const count = (max - min) / step + 1;

  const zs = Array.from({ length: count }, (x, i) => i * step + min);
  segments.forEach((segment, index) => {
    const row = [];
    elevations.forEach((elevation) => {
      const { value: temperature } = getValueFromDatasetByElevation(
        routeProfileDataset,
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
    switch (maxAltitude) {
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
    const label = !showInCelsius
      ? celsiusToFahrenheit(contour.temperature) + ' \u00B0F'
      : round(contour.temperature, 1) + ' \u00B0C';
    const style = {
      fill:
        contour.temperature > 0
          ? temperatureContourColors.positive
          : contour.temperature === 0
          ? 'red'
          : temperatureContourColors.negative,
      // stroke: 'white',
      // strokeWidth: 0.1,
      filter: 'url(#solid)',
      dominantBaseline: 'middle',
      textAnchor: 'end',
      fontWeight: 900,
    };
    if (minPos.y > 1000 && minPos.y < maxAltitude * 100 - 1000) {
      contourLabels.push({
        x: minPos.x,
        y: minPos.y,
        label,
        style,
      });
    }
    if (maxPos.y > 1000 && maxPos.y < maxAltitude * 100 - 1000) {
      contourLabels.push({
        x: maxPos.x,
        y: maxPos.y,
        label,
        style: { ...style, textAnchor: 'start' },
      });
    }
  });
  return { contours: newContours, contourLabels };
}

const weatherFontContents = {
  'fas fa-question-square': '\uf2fd',
  'fa-solid fa-wind': '\uf72e',
  'fa-solid fa-sun': '\uf185',
  'fa-solid fa-moon': '\uf186',
  'fas fa-sun-cloud': '\uf763',
  'fas fa-moon-cloud': '\uf754',
  'fa-solid fa-cloud-sun': '\uf6c4',
  'fa-solid fa-cloud-moon': '\uf6c3',
  'fas fa-clouds-sun': '\uf746',
  'fas fa-clouds-moon': '\uf745',
  'fa-solid fa-cloud': '\uf0c2',
  'fa-solid fa-cloud-rain': '\uf73d',
  'fa-solid fa-icicles': '\uf7ad',
  'fas fa-cloud-snow': '\uf742',
  'fas fa-cloud-bolt-sun': '\uf76e',
  'fas fa-cloud-bolt-moon': '\uf76d',
  'fa-solid fa-cloud-bolt': '\uf76c',
  'fa-solid fa-cloud-sun-rain': '\uf743',
  'fas fa-cloud-moon-rain': '\uf73c',
  'fa-solid fa-cloud-showers-heavy': '\uf740',
  'fas fa-cloud-sleet': '\uf741',
  'fas fa-fog': '\uf74e',
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
  const observationTime = userSettings.observation_time;
  const { data: routeProfileApiState } = useGetRouteProfileStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const fetchedDate = useSelector(selectFetchedDate);
  const segments = useSelector(selectRouteSegments);
  const [queryElevations, queryElevationsResult] = useQueryElevationApiMutation({ fixedCacheKey: cacheKeys.elevation });
  const [elevationSeries, setElevationSeries] = useState([]);
  const [segmentsCount, setSegmentsCount] = useState(0);
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
  const [, queryTemperatureDataResult] = useQueryTemperatureDataMutation({
    fixedCacheKey: cacheKeys.gfsTemperature,
  });
  const [contourLabelData, setContourLabelData] = useState([]);
  const [temperatureContures, setTemperatureContours] = useState([]);
  const [weatherIconData, setWeatherIconData] = useState(null);
  const [flightCategorySeries, setFlightCategorySeries] = useState(null);
  const [flightCatHint, setFlightCatHint] = useState(null);
  const [, queryGfsWindDirectionDataResult] = useQueryGfsWindDirectionDataMutation({
    fixedCacheKey: cacheKeys.gfsWinddirection,
  });
  const [, queryGfsWindSpeedDataResult] = useQueryGfsWindSpeedDataMutation({
    fixedCacheKey: cacheKeys.gfsWindspeed,
  });
  const [, queryNbmFlightCatResult] = useQueryNbmFlightCategoryMutation({
    fixedCacheKey: cacheKeys.nbmCloudCeiling,
  });

  function buildTemperatureContourSeries() {
    if (queryTemperatureDataResult.isSuccess && segments.length > 0) {
      const { contours, contourLabels } = buildContour(
        activeRoute,
        queryTemperatureDataResult.data,
        segments,
        routeProfileApiState.maxAltitude,
        !userSettings.default_temperature_unit,
      );
      setContourLabelData(contourLabels);
      setTemperatureContours(contours);
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
      const length = getRouteLength(activeRoute, true);
      setRouteLength(length);
      const count = segments.length;
      setSegmentsCount(count);
      const start = count ? (0.7 * length) / (count - 1) : 0;
      const end = count ? (0.7 * length) / (count - 1) : 0;
      setStartMargin(start);
      setEndMargin(end);
      const stops = getTimeGradientStops(times);
      setGradientStops(stops);
      buildAirportLabelSeries();
    }
  }, [segments, routeProfileApiState.maxAltitude]);

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

  function buildWeatherSeries(segment: RouteSegment, segmentIndex: number) {
    if (segment) {
      const color = getFlightCategoryColor(segment.segmentNbmProps.visibility, segment.segmentNbmProps.cloudceiling);
      const icon = getNbmWeatherMarkerIcon(
        segment.segmentNbmProps.wx_1,
        segment.segmentNbmProps.windspeed,
        segment.segmentNbmProps.gust,
        segment.segmentNbmProps.skycover,
        segment.position,
        segment.arriveTime,
      );
      return {
        x: segment.accDistance,
        y: routeProfileApiState.maxAltitude * 100 * 1.04,
        customComponent: () => {
          return (
            <text x={0} y={0}>
              <tspan x="0" y="0" fill={color} dominantBaseline="middle" textAnchor="middle" className={icon + ' fa-2x'}>
                {weatherFontContents[icon]}
              </tspan>
            </text>
          );
        },
      };
    }
  }

  function buildAirportLabelSeries() {
    if (segments.length > 0) {
      let tooltip = null;
      const weatherSeries = [];
      const airportLabels = segments.map((seg, segmentIndex) => {
        const labelStyle = {
          fill: 'green',
          dominantBaseline: 'text-after-edge',
          textAnchor: 'middle',
          fontSize: segmentIndex === 0 || segmentIndex === segmentsCount - 1 ? 14 : 11,
          fontWeight: 600,
        };
        weatherSeries.push(buildWeatherSeries(seg, segmentIndex));
        if (seg.airportNbmProps) {
          labelStyle.fill = getFlightCategoryColor(seg.airportNbmProps.visibility, seg.airportNbmProps.cloudceiling);
          const lowestCloud = seg.airportNbmProps.cloudbase;
          const ceiling = seg.airportNbmProps.cloudceiling;
          const skyCover = seg.airportNbmProps.skycover;
          const skyConditionsAsc = makeSkyConditions(lowestCloud, ceiling, skyCover);
          tooltip = {
            time: seg.airportNbmProps.time,
            clouds: skyConditionsAsc,
            ceiling: ceiling,
            lowestCloud,
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
          yOffset: seg.isRoutePoint ? 36 : 44,
          label: seg.airport?.key || seg.position.lat.toFixed(2) + '/' + seg.position.lng.toFixed(2),
          style: labelStyle,
          tooltip: tooltip,
        };
      });
      setAirportLabelSeries(airportLabels);
      setWeatherIconData(weatherSeries);
    }
  }

  useEffect(() => {
    if (activeRoute && !queryElevationsResult.isSuccess && !queryElevationsResult.isLoading) {
      // userSettings.default_distance_unit == true then km, or nm
      console.log(queryElevationsResult, new Date().toLocaleTimeString());
      const elevationPoints = interpolateRoute(activeRoute, totalNumberOfElevations);
      queryElevations({ queryPoints: elevationPoints });
    }
  }, [fetchedDate]);

  useEffect(() => {
    if (queryElevationsResult.isSuccess && queryElevationsResult.data && routeLength) {
      const elevationApiResults = queryElevationsResult.data.geoPoints;
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

  function buildFlightCategorySeries() {
    if (activeRoute && queryNbmFlightCatResult.isSuccess) {
      const positions = interpolateRoute(activeRoute, getSegmentsCount(activeRoute) * 10, true);
      const flightCategoryData = [];
      const initial = {
        position: { lat: positions[0].lat, lng: positions[0].lng },
        accDistance: 0,
        arriveTime: new Date(observationTime).getTime(),
      };
      positions.reduce(
        (
          acc: { position: { lat: number; lng: number }; accDistance: number; arriveTime: Date },
          curr: LatLng,
          index,
        ) => {
          try {
            const dist = fly.distanceTo(acc.position.lat, acc.position.lng, curr.lat, curr.lng, 2);
            const course = fly.trueCourse(acc.position.lat, acc.position.lng, curr.lat, curr.lng, 2);
            if (!dist) return acc;
            let speed: number;
            if (activeRoute.useForecastWinds) {
              if (queryGfsWindSpeedDataResult.isSuccess && queryGfsWindDirectionDataResult.isSuccess) {
                const { value: speedValue } = getValueFromDatasetByElevation(
                  queryGfsWindSpeedDataResult.data,
                  new Date(acc.arriveTime),
                  activeRoute.altitude,
                  index,
                );
                const { value: dirValue } = getValueFromDatasetByElevation(
                  queryGfsWindDirectionDataResult.data,
                  new Date(acc.arriveTime),
                  activeRoute.altitude,
                  index,
                );
                const { groundSpeed } = fly.calculateHeadingAndGroundSpeed(
                  userSettings.true_airspeed,
                  course,
                  speedValue,
                  dirValue,
                  2,
                );
                speed = groundSpeed;
              } else {
                speed = userSettings.true_airspeed;
              }
            } else {
              speed = userSettings.true_airspeed;
            }
            const newTime = new Date(acc.arriveTime).getTime() + (3600 * 1000 * dist) / speed;
            const { value: cloudceiling, time: forecastTime } = getValueFromDatasetByElevation(
              queryNbmFlightCatResult.data?.cloudceiling,
              new Date(acc.arriveTime),
              null,
              index,
            );
            const { value: visibility } = getValueFromDatasetByElevation(
              queryNbmFlightCatResult.data?.visibility,
              new Date(acc.arriveTime),
              null,
              index,
            );
            const { value: skycover } = getValueFromDatasetByElevation(
              queryNbmFlightCatResult.data?.skycover,
              new Date(acc.arriveTime),
              null,
              index,
            );
            const { value: cloudbase } = getValueFromDatasetByElevation(
              queryNbmFlightCatResult.data?.cloudbase,
              new Date(acc.arriveTime),
              null,
              index,
            );
            const skyConditions = makeSkyConditions(cloudbase, cloudceiling, skycover);
            const flightCategoryColor = getFlightCategoryColor(visibility, cloudceiling);
            flightCategoryData.push({
              x0: acc.accDistance,
              x: acc.accDistance + dist,
              y0: (-routeProfileApiState.maxAltitude * 100) / 50,
              y: -routeProfileApiState.maxAltitude / 5,
              color: flightCategoryColor,
              tooltip: {
                time: forecastTime,
                clouds: skyConditions,
                visibility: visibility,
              },
            });
            return {
              position: { lat: curr.lat, lng: curr.lng },
              accDistance: acc.accDistance + dist,
              arriveTime: newTime,
            };
          } catch (err) {
            console.warn(err);
            return acc;
          }
        },
        initial,
      );
      setFlightCategorySeries(flightCategoryData);
    }
  }

  useEffect(() => {
    buildFlightCategorySeries();
  }, [segments, queryNbmFlightCatResult.isSuccess, routeProfileApiState.maxAltitude]);

  return (
    <>
      {segmentsCount && (
        <XYPlot
          height={calcChartHeight(viewW, viewH)}
          width={calcChartWidth(viewW, viewH)}
          color="white"
          yDomain={[0, routeProfileApiState.maxAltitude * 100 * 1.08]}
          xDomain={[-startMargin, routeLength + endMargin]}
          margin={{ right: 40, bottom: 80, top: 0 }}
        >
          <GradientDefs>
            <linearGradient id="linear-gradient">
              {gradientStops.map(({ level, stopColor }, index) => (
                <stop key={'gradient-' + index} offset={level} stopColor={stopColor} />
              ))}
            </linearGradient>
            <filter x="0" y="0" width="1" height="1" id="solid">
              <feFlood floodColor="#9BCAEF" />
              <feComposite in="SourceGraphic" />
            </filter>
          </GradientDefs>
          {props.showDayNightBackground && (
            <AreaSeries
              data={[
                { x: -startMargin, y: routeProfileApiState.maxAltitude * 100 },
                { x: routeLength + endMargin, y: routeProfileApiState.maxAltitude * 100 },
              ]}
              color={'url(#linear-gradient)'}
            />
          )}
          {!props.showDayNightBackground && (
            <AreaSeries
              data={[
                { x: -startMargin, y: routeProfileApiState.maxAltitude * 100 },
                { x: routeLength + endMargin, y: routeProfileApiState.maxAltitude * 100 },
              ]}
              color="#F2F0F0"
            />
          )}
          <VerticalGridLines
            tickValues={Array.from({ length: segmentsCount * 2 - 1 }, (_value, index) =>
              Math.round((index * routeLength) / ((segmentsCount - 1) * 2)),
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
            tickValues={Array.from({ length: segmentsCount }, (_value, index) =>
              Math.round((index * routeLength) / (segmentsCount - 1)),
            )}
            tickFormat={(v, index) => {
              if (segmentsCount > 0 && segments[index]) {
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
              onValueMouseOver={(value) => {
                setTimeHint(value);
              }}
              onValueClick={(value) => setTimeHint(value)}
              onValueMouseOut={() => setTimeHint(null)}
              data={Array.from({ length: segmentsCount }, (_value, index) => {
                if (segments[index] && segments[index].arriveTime)
                  return {
                    x: Math.round((index * routeLength) / (segmentsCount - 1)),
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
                else {
                  return {
                    x: Math.round((index * routeLength) / (segmentsCount - 1)),
                    y: 0,
                    yOffset: 72,
                    segment: segments[index],
                    label: '',
                    style: {
                      fill: 'white',
                      dominantBaseline: 'text-after-edge',
                      textAnchor: 'start',
                      fontSize: 11,
                      fontWeight: 600,
                    },
                  };
                }
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
          {routeProfileApiState.chartType !== 'Wind' && activeRoute ? props.children : null}
          {activeRoute ? (
            <LineSeries
              data={[
                { x: 0, y: activeRoute.altitude },
                { x: routeLength, y: activeRoute.altitude },
              ]}
              color="white"
              strokeWidth={4}
            />
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
          {routeProfileApiState.chartType !== 'Turb' &&
            temperatureContures.map((contourLine, index) => {
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
          {routeProfileApiState.chartType !== 'Turb' && contourLabelData.length > 0 ? (
            <LabelSeries animation allowOffsetToBeReversed data={contourLabelData}></LabelSeries>
          ) : null}

          {routeProfileApiState.chartType === 'Wind' && activeRoute ? props.children : null}
          {elevationSeries.length > 0 && (
            <AreaSeries
              data={elevationSeries}
              color="#9e8f85"
              curve={'curveMonotoneX'}
              strokeWidth={0}
              onNearestXY={(datapoint) => setElevationHint(datapoint)}
              onSeriesMouseOut={() => setShowElevationHint(false)}
              onSeriesMouseOver={() => setShowElevationHint(true)}
            />
          )}
          {elevationSeries.length > 0 && (
            <LineSeries color="#443322" data={elevationSeries} strokeWidth={1}></LineSeries>
          )}
          <LineSeries
            color="white"
            data={[
              {
                x: -startMargin,
                y: routeProfileApiState.maxAltitude * 100 * 1.04,
              },
              {
                x: routeLength + endMargin,
                y: routeProfileApiState.maxAltitude * 100 * 1.04,
              },
            ]}
            strokeWidth={48}
          ></LineSeries>
          {weatherIconData && <CustomSVGSeries customComponent="square" data={weatherIconData}></CustomSVGSeries>}
          {flightCategorySeries && (
            <VerticalRectSeries
              colorType="literal"
              data={flightCategorySeries}
              onValueMouseOver={(value) => setFlightCatHint(value)}
              onValueClick={(value) => setFlightCatHint(value)}
              onValueMouseOut={() => setFlightCatHint(null)}
            ></VerticalRectSeries>
          )}

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
          {flightCatHint && (
            <Hint value={flightCatHint} className="time-tooltip" align={{ horizontal: 'auto', vertical: 'top' }}>
              <span>
                <b>Time:</b>&nbsp;{convertTimeFormat(flightCatHint.tooltip.time, false)}
              </span>
              <div style={{ display: 'flex', lineHeight: 1, color: 'black' }}>
                <div>
                  <p style={{ marginTop: 3 }}>
                    <b>Clouds: </b>
                  </p>
                </div>
                <div style={{ margin: 3, marginTop: -3 }}>
                  {flightCatHint.tooltip.clouds.map((skyCondition) => {
                    return (
                      <div
                        key={`${skyCondition.skyCover}-${skyCondition.cloudBase}`}
                        style={{ marginTop: 6, marginBottom: 2 }}
                      >
                        {MetarSkyValuesToString[skyCondition.skyCover]}{' '}
                        {['CLR', 'SKC', 'CAVOK'].includes(skyCondition.skyCover) === false &&
                          roundCloudHeight(skyCondition.cloudBase) + ' feet'}
                      </div>
                    );
                  })}
                </div>
              </div>

              <span>
                <b>Visibility:</b>&nbsp;
                {!userSettings.default_visibility_unit
                  ? visibilityMileToFraction(flightCatHint.tooltip.visibility)
                  : visibilityMileToMeter(flightCatHint.tooltip.visibility)}
              </span>
            </Hint>
          )}
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
                          roundCloudHeight(skyCondition.cloudBase) + ' feet'}
                      </div>
                    );
                  })}
                </div>
              </div>

              <span>
                <b>Lowest Cloud:</b>&nbsp;{Math.round(airportHint.tooltip.lowestCloud)}
              </span>
              <span>
                <b>Ceiling:</b>&nbsp;{Math.round(airportHint.tooltip.ceiling)}
              </span>

              <span>
                <b>Visibility:</b>&nbsp;
                {!userSettings.default_visibility_unit
                  ? visibilityMileToFraction(airportHint.tooltip.visibility)
                  : visibilityMileToMeter(airportHint.tooltip.visibility)}
              </span>
              <span>
                <b>Wind speed:</b>&nbsp;{Math.round(airportHint.tooltip.windspeed)} knots
              </span>
              <span>
                <b>Wind direction:</b>&nbsp;{Math.round(airportHint.tooltip.winddir) + ' \u00B0'}
              </span>
              <span>
                <b>Temperature:</b>&nbsp;
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
      )}
    </>
  );
};
export default RouteProfileChart;
function getFuzzyLocalTimeFromPoint(newTime: number, arg1: any[]) {
  throw new Error('Function not implemented.');
}