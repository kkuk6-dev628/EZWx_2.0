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
  LineMarkSeries,
} from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import {
  SegmentPoint,
  cacheKeys,
  calcEndMargin,
  calcHighResolution,
  extendLine,
  flightCategoryDivide,
  getIndexByElevation,
  getLineLength,
  getMinMaxValueByElevation,
  getRouteLength,
  getSegmentInterval,
  getSegmentsCount,
  getTimeGradientStops,
  getValueFromDatasetByElevation,
  interpolateRouteByInterval,
  totalNumberOfElevations,
} from './RouteProfileDataLoader';
import { initialUserSettingsState, selectSettings } from '../../store/user/UserSettings';
import {
  useQueryAirportNbmMutation,
  useGetRouteProfileStateQuery,
  useQueryDepartureAdvisorDataMutation,
  useQueryGfsDataMutation,
  useQueryNbmAllMutation,
} from '../../store/route-profile/routeProfileApi';
import { useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import { selectFetchedDate, selectRouteSegments } from '../../store/route-profile/RouteProfile';
import {
  addLeadingZeroes,
  celsiusToFahrenheit,
  convertTimeFormat,
  degree2radian,
  getMetarCeilingCategory,
  getMetarVisibilityCategory,
  knotsToMph,
  meterToFeet,
  round,
  roundCloudHeight,
  simpleTimeOnlyFormat,
  visibilityMileToFraction,
  visibilityMileToMeter,
} from '../map/common/AreoFunctions';
import fly, * as flyjs from '../../fly-js/fly';
import {
  flightCategoryToColor,
  getNbmFlightCategory,
  getNbmWeatherMarkerIcon,
} from '../map/leaflet/layers/StationMarkersLayer';
import { MetarSkyValuesToString } from '../map/common/AreoConstants';
import { Conrec } from '../../conrec-js/conrec';
import { AirportNbmData, RouteProfileDataset, RouteSegment } from '../../interfaces/route-profile';
import Route from '../shared/Route';
import { LatLng } from 'leaflet';
import { makeWeatherString } from '../map/leaflet/popups/StationForecastPopup';
import { hourInMili } from '../shared/DepartureAdvisor';

export const calcChartWidth = (viewWidth: number, _viewHeight: number) => {
  if (viewWidth < iPadPortraitWidth) {
    return 900;
  } else {
    return viewWidth - 140;
  }
};
export const calcChartHeight = (_viewWidth: number, viewHeight: number) => {
  if (viewHeight < mobileLandscapeHeight) {
    return viewHeight - 200;
  } else {
    if (_viewWidth < iPadPortraitWidth) {
      return viewHeight - 270;
    }
    return viewHeight - 220;
  }
};

export const mobileLandscapeHeight = 680;

export const iPadPortraitWidth = 840;

export const temperatureContourColors = {
  positive: '#FBF209',
  negative: '#09FDC6',
};

export function getAirportNbmData(
  data: { time: string; data: AirportNbmData[] }[],
  time: number,
  airportid: string,
): { time: Date; data: AirportNbmData } {
  const nullResult = { time: null, data: null };
  const hours3 = 3 * 3600 * 1000;
  if (!airportid) {
    return nullResult;
  }
  const timeData = data.reduce((prev, curr) => {
    const prevDiff = time - new Date(prev.time).getTime();
    const currDiff = time - new Date(curr.time).getTime();
    if (currDiff >= 0 && currDiff <= hours3 && currDiff < prevDiff) {
      return curr;
    }
    return prev;
  });
  const resultDiff = time - new Date(timeData.time).getTime();
  if (resultDiff < 0 || resultDiff > hours3) {
    return nullResult;
  }
  const airportData = timeData.data.filter((timeD) => {
    return timeD.icaoid === airportid || timeD.faaid === airportid;
  });
  if (airportData.length > 0) {
    return { time: new Date(timeData.time), data: airportData[0] };
  }
  return nullResult;
}

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
    if (lowestCloud > 0 && roundCloudHeight(lowestCloud) !== roundCloudHeight(ceiling)) {
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
      // filter: 'url(#solid)',
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

const RouteProfileChart = (props: {
  children: ReactNode;
  showDayNightBackground: boolean;
  noDataMessage: string;
  setValue2PixelRate?: (
    dx: number,
    dy: number,
    marginX: number,
    marginY: number,
    width: number,
    height: number,
  ) => void;
}) => {
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
  const [segmentInterval, setSegmentInterval] = useState(0);
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
  const [contourLabelData, setContourLabelData] = useState(null);
  const [temperatureContures, setTemperatureContours] = useState(null);
  const [weatherIconData, setWeatherIconData] = useState(null);
  const [weatherHint, setWeatherHint] = useState(null);
  const [flightCategorySeries, setFlightCategorySeries] = useState(null);
  const [flightCatHint, setFlightCatHint] = useState(null);
  const [, queryGfsDataResult] = useQueryGfsDataMutation({
    fixedCacheKey: cacheKeys.gData,
  });
  const [, queryNbmAllResult] = useQueryNbmAllMutation({
    fixedCacheKey: cacheKeys.nbm,
  });
  const [, getDepartureAdvisorDataResult] = useQueryDepartureAdvisorDataMutation({
    fixedCacheKey: cacheKeys.departureAdvisor,
  });

  const [, queryAirportNbmResult] = useQueryAirportNbmMutation({
    fixedCacheKey: cacheKeys.nbmAllAirport,
  });

  const isMobile = viewH < mobileLandscapeHeight || viewW < mobileLandscapeHeight;
  const windIconScale = isMobile ? 1 : 2;

  function buildTemperatureContourSeries() {
    if (queryGfsDataResult.isSuccess && segments.length > 0) {
      if (routeProfileApiState.showTemperature) {
        const { contours, contourLabels } = buildContour(
          activeRoute,
          queryGfsDataResult.data?.temperature,
          segments,
          routeProfileApiState.maxAltitude,
          !userSettings.default_temperature_unit,
        );
        setContourLabelData(contourLabels);
        setTemperatureContours(contours);
      } else {
        setContourLabelData(null);
        setTemperatureContours(null);
      }
    }
  }

  useEffect(() => {
    buildTemperatureContourSeries();
  }, [
    queryGfsDataResult.isSuccess,
    segments,
    userSettings.default_temperature_unit,
    routeProfileApiState.maxAltitude,
    routeProfileApiState.showTemperature,
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
      const count = getSegmentsCount(activeRoute);
      const interval = getSegmentInterval(activeRoute, count);
      setSegmentInterval(interval);
      setSegmentsCount(count);
      const start = calcEndMargin(activeRoute);
      const end = calcEndMargin(activeRoute);
      setStartMargin(start);
      setEndMargin(end);
      const stops = getTimeGradientStops(times);
      setGradientStops(stops);
    }
  }, [segments, routeProfileApiState.maxAltitude]);

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  const handleWindowSizeChange = () => {
    setViewW(document.documentElement.clientWidth);
    setViewH(document.documentElement.clientHeight);
  };

  function buildWeatherSeries(segment: RouteSegment, segmentIndex: number, segmentInterval: number) {
    if (segment) {
      const { value: cloudceiling, time: forecastTime } = getValueFromDatasetByElevation(
        getDepartureAdvisorDataResult.data?.cloudceiling,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: visibility } = getValueFromDatasetByElevation(
        getDepartureAdvisorDataResult.data?.visibility,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: skycover } = getValueFromDatasetByElevation(
        queryNbmAllResult.data?.skycover,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: cloudbase } = getValueFromDatasetByElevation(
        queryNbmAllResult.data?.cloudbase,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: wx_1 } = getValueFromDatasetByElevation(
        getDepartureAdvisorDataResult.data?.wx_1,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: wx_2 } = getValueFromDatasetByElevation(
        getDepartureAdvisorDataResult.data?.wx_2,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: wxInten1 } = getValueFromDatasetByElevation(
        getDepartureAdvisorDataResult.data?.wxInten1,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: wxInten2 } = getValueFromDatasetByElevation(
        getDepartureAdvisorDataResult.data?.wxInten2,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: wxProbCov1 } = getValueFromDatasetByElevation(
        getDepartureAdvisorDataResult.data?.wxProbCov1,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: wxProbCov2 } = getValueFromDatasetByElevation(
        getDepartureAdvisorDataResult.data?.wxProbCov2,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const weather1 = makeWeatherString(
        wx_1,
        wxProbCov1,
        wxInten1,
        skycover,
        segment.segmentNbmProps.w_speed,
        segment.segmentNbmProps.w_gust,
        false,
      );
      const weathers = [weather1];
      if (wx_2 && wx_2 !== -9999) {
        const weather2 = makeWeatherString(
          wx_2,
          wxProbCov2,
          wxInten2,
          skycover,
          segment.segmentNbmProps.w_speed,
          segment.segmentNbmProps.w_gust,
          false,
        );
        weathers.push(weather2);
      }
      const color = getFlightCategoryColor(visibility, cloudceiling);
      const icon = getNbmWeatherMarkerIcon(
        wx_1,
        segment.segmentNbmProps.w_speed,
        segment.segmentNbmProps.w_gust,
        skycover,
        segment.position,
        segment.arriveTime,
      );
      return {
        x: segmentIndex * segmentInterval,
        y: routeProfileApiState.maxAltitude * 100,
        tooltip: {
          time: forecastTime,
          clouds: makeSkyConditions(cloudbase, cloudceiling, skycover),
          ceiling: cloudceiling,
          lowestCloud: cloudbase,
          skycover,
          weathers: weathers,
          position: segment.position,
        },
        customComponent: () => {
          return (
            <text x={0} y={0}>
              <tspan
                x="0"
                y={-8 * windIconScale}
                fill={color}
                dominantBaseline="middle"
                textAnchor="middle"
                className={icon + ' fa-' + windIconScale + 'x'}
              >
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
      const weatherSeries = [];
      const segmentsCount = getSegmentsCount(activeRoute);
      const interval = getSegmentInterval(activeRoute, segmentsCount);
      const airportLabels = segments.map((seg, segmentIndex) => {
        const labelStyle = {
          fill: 'green',
          dominantBaseline: 'text-after-edge',
          textAnchor: 'middle',
          fontSize: 11,
          fontWeight: 600,
        };
        const weatherData = buildWeatherSeries(seg, segmentIndex, interval);
        weatherSeries.push(weatherData);
        if (segmentIndex === 0 || segmentIndex === segments.length - 1) {
          return;
        }
        let nbmData: AirportNbmData = null;
        let nbmTime: number = seg.arriveTime;
        if (seg.airport) {
          const airportNbm = getAirportNbmData(queryAirportNbmResult.data, seg.arriveTime, seg.airport.key);
          if (airportNbm.data) {
            nbmData = airportNbm.data;
            nbmTime = airportNbm.time.getTime();
          } else {
            nbmData = seg.segmentNbmProps;
            nbmTime = Math.floor(seg.arriveTime / hourInMili) * hourInMili;
          }
        } else {
          nbmData = seg.segmentNbmProps;
          nbmTime = Math.floor(seg.arriveTime / hourInMili) * hourInMili;
        }
        labelStyle.fill = getFlightCategoryColor(nbmData.vis, nbmData.ceil);
        const lowestCloud = nbmData.l_cloud;
        const ceiling = nbmData.ceil;
        const skyCover = nbmData.skycov;
        const skyConditionsAsc = makeSkyConditions(lowestCloud, ceiling, skyCover);
        const tooltip = {
          time: nbmTime,
          isAirport: seg.airport && seg.airport.type !== 'waypoint',
          clouds: skyConditionsAsc,
          ceiling: ceiling,
          lowestCloud,
          visibility: nbmData.vis,
          windspeed: nbmData.w_speed,
          winddir: nbmData.w_dir,
          windgust: nbmData.w_gust,
          temperature: nbmData.temp_c,
          dewpoint: nbmData.dewp_c,
        };
        let airportDist = 0;
        if (seg.airport) {
          const airportDelta =
            flyjs.distanceTo(
              seg.position.lat,
              seg.position.lng,
              seg.airport.position.coordinates[1],
              seg.airport.position.coordinates[0],
              2,
            ) | 0;
          const airportCourse =
            flyjs.trueCourse(
              seg.position.lat,
              seg.position.lng,
              seg.airport.position.coordinates[1],
              seg.airport.position.coordinates[0],
              2,
            ) | 0;
          airportDist = Math.cos(degree2radian(airportCourse - seg.course)) * airportDelta;
        }

        return {
          x: seg.accDistance + airportDist,
          y: 0,
          yOffset: isMobile ? 36 : 44,
          label: seg.airport?.key || seg.position.lat.toFixed(2) + '/' + seg.position.lng.toFixed(2),
          style: labelStyle,
          tooltip: tooltip,
        };
      });
      const routePoints = [
        activeRoute.departure,
        ...activeRoute.routeOfFlight.map((rf) => rf.routePoint),
        activeRoute.destination,
      ];
      let accDistance = 0;
      const routePointsLabels = routePoints.map((rp, index) => {
        const labelStyle = {
          fill: 'green',
          dominantBaseline: 'text-after-edge',
          textAnchor: 'middle',
          fontSize: 11,
          fontWeight: 600,
        };
        const dataIndex = getIndexByElevation(
          getDepartureAdvisorDataResult.data?.cloudceiling,
          rp.position.coordinates,
        );
        const distance =
          index === 0
            ? 0
            : fly.distanceTo(
                routePoints[index - 1].position.coordinates[1],
                routePoints[index - 1].position.coordinates[0],
                rp.position.coordinates[1],
                rp.position.coordinates[0],
                6,
              );
        accDistance += distance;
        const speed = userSettings.true_airspeed;
        let arriveTime = observationTime + (hourInMili * distance) / speed;
        if (index === routePoints.length - 1) {
          arriveTime = segments[segments.length - 1].arriveTime;
        }
        const { value: cloudceiling, time: forecastTime } = getValueFromDatasetByElevation(
          getDepartureAdvisorDataResult.data?.cloudceiling,
          new Date(arriveTime),
          null,
          dataIndex,
        );
        const { value: visibility } = getValueFromDatasetByElevation(
          getDepartureAdvisorDataResult.data?.visibility,
          new Date(arriveTime),
          null,
          dataIndex,
        );

        const nbmDataIndex = getIndexByElevation(queryNbmAllResult.data?.windspeed, rp.position.coordinates);
        const { value: skycover } = getValueFromDatasetByElevation(
          queryNbmAllResult.data?.skycover,
          new Date(arriveTime),
          null,
          nbmDataIndex,
        );
        const { value: cloudbase } = getValueFromDatasetByElevation(
          queryNbmAllResult.data?.cloudbase,
          new Date(arriveTime),
          null,
          nbmDataIndex,
        );
        const { value: windspeed } = getValueFromDatasetByElevation(
          queryNbmAllResult.data?.windspeed,
          new Date(arriveTime),
          null,
          nbmDataIndex,
        );
        const { value: winddir } = getValueFromDatasetByElevation(
          queryNbmAllResult.data?.winddir,
          new Date(arriveTime),
          null,
          nbmDataIndex,
        );
        const { value: gust } = getValueFromDatasetByElevation(
          queryNbmAllResult.data?.gust,
          new Date(arriveTime),
          null,
          nbmDataIndex,
        );
        const { value: temperature } = getValueFromDatasetByElevation(
          queryNbmAllResult.data?.temperature,
          new Date(arriveTime),
          null,
          nbmDataIndex,
        );
        const { value: dewpoint } = getValueFromDatasetByElevation(
          queryNbmAllResult.data?.dewpoint,
          new Date(arriveTime),
          null,
          nbmDataIndex,
        );
        labelStyle.fill = getFlightCategoryColor(visibility, cloudceiling);
        const tooltip: any = {
          time: forecastTime,
          isAirport: rp.type !== 'waypoint',
          clouds: makeSkyConditions(cloudbase, cloudceiling, skycover),
          ceiling: cloudceiling,
          lowestCloud: cloudbase,
          visibility: visibility,
          windspeed: windspeed,
          winddir: winddir,
          windgust: gust,
          temperature: temperature,
          dewpoint: dewpoint,
        };
        if (index === 0 || index === routePoints.length - 1) {
          const { data: forCrosswind } = getAirportNbmData(queryAirportNbmResult.data, arriveTime, rp.key);
          tooltip.crosscom = forCrosswind?.cross_com;
          tooltip.crossRunwayId = forCrosswind?.cross_r_id;
        }
        return {
          x: accDistance,
          y: 0,
          yOffset: isMobile ? 26 : 34,
          label: rp.key,
          style: { ...labelStyle, fontSize: index === 0 || index === routePoints.length - 1 ? 14 : 11 },
          tooltip: tooltip,
        };
      });
      setAirportLabelSeries([...airportLabels.filter((el) => el), ...routePointsLabels]);
      setWeatherIconData(weatherSeries);
    }
  }

  useEffect(() => {
    if (
      segments.length > 0 &&
      queryAirportNbmResult.isSuccess &&
      queryNbmAllResult.isSuccess &&
      getDepartureAdvisorDataResult.isSuccess
    ) {
      buildAirportLabelSeries();
    }
  }, [
    queryAirportNbmResult.isSuccess,
    segments,
    routeProfileApiState.maxAltitude,
    viewH,
    queryNbmAllResult.isSuccess,
    getDepartureAdvisorDataResult.isSuccess,
  ]);

  useEffect(() => {
    if (activeRoute && !queryElevationsResult.isSuccess && !queryElevationsResult.isLoading && startMargin) {
      const elevationPoints = interpolateRouteByInterval(activeRoute, totalNumberOfElevations);
      const extended = extendLine(
        elevationPoints.map((p) => p.point),
        startMargin,
      );
      queryElevations({ queryPoints: extended.map((pt) => L.GeoJSON.latLngToCoords(pt)) });
    }
  }, [fetchedDate, startMargin]);

  useEffect(() => {
    if (queryElevationsResult.isSuccess && queryElevationsResult.data && routeLength) {
      const elevationApiResults = queryElevationsResult.data.geoPoints;
      const elevations = [];
      const segmentPoints = interpolateRouteByInterval(activeRoute, totalNumberOfElevations);
      const elevationPoints = extendLine(
        segmentPoints.map((p) => p.point),
        startMargin,
      );

      let distance = 0;
      const step = routeLength / totalNumberOfElevations;
      let previousPos: L.LatLng = null;
      let lastPoint = null;
      for (let j = 0; j < elevationPoints.length; j++) {
        for (let i = 0; i < elevationApiResults.length; i++) {
          if (
            Math.abs(elevationPoints[j].lat - elevationApiResults[i].latitude) < 0.000001 &&
            Math.abs(elevationPoints[j].lng - elevationApiResults[i].longitude) < 0.000001
          ) {
            if (previousPos) {
              distance += step;
            }
            if (routeLength + endMargin + startMargin - distance < -0.1 * step) {
              break;
            }
            previousPos = elevationPoints[j];
            lastPoint = elevationApiResults[i];
            elevations.push({
              x: distance - startMargin,
              y: meterToFeet(elevationApiResults[i].elevation),
            });
            break;
          }
        }
      }
      if (elevations.length === 0) return;
      elevations.push({
        x: routeLength + endMargin,
        y: meterToFeet(lastPoint.elevation),
      });
      setElevationSeries(elevations);
    }
  }, [queryElevationsResult.isSuccess, routeLength]);

  function buildFlightCategorySeries() {
    if (activeRoute && queryNbmAllResult.isSuccess && getDepartureAdvisorDataResult.isSuccess) {
      const positions = interpolateRouteByInterval(
        activeRoute,
        getSegmentsCount(activeRoute) * flightCategoryDivide,
      ).map((pt) => pt.point);
      const interval = calcHighResolution(activeRoute);
      const flightCategoryData = [];
      // let accDistance = 0;
      let arriveTime = observationTime;
      // let dist = 0;
      let course = 0;
      positions.forEach((curr: L.LatLng, index) => {
        try {
          const nextPos = index < positions.length - 1 ? positions[index + 1] : null;
          // dist = index < positions.length - 1 ? fly.distanceTo(curr.lat, curr.lng, nextPos.lat, nextPos.lng, 2) : dist;
          course =
            index < positions.length - 1 ? fly.trueCourse(curr.lat, curr.lng, nextPos.lat, nextPos.lng, 2) : course;
          // if (index < positions.length - 1 && !dist) return;
          let speed: number;
          if (activeRoute.useForecastWinds) {
            if (getDepartureAdvisorDataResult.isSuccess) {
              const { value: speedValue } = getValueFromDatasetByElevation(
                getDepartureAdvisorDataResult.data?.windSpeed,
                new Date(arriveTime),
                activeRoute.altitude,
                index,
              );
              const { value: dirValue } = getValueFromDatasetByElevation(
                getDepartureAdvisorDataResult.data?.windDirection,
                new Date(arriveTime),
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
          const newTime = arriveTime + (hourInMili * interval) / speed;
          const { value: cloudceiling, time: forecastTime } = getValueFromDatasetByElevation(
            getDepartureAdvisorDataResult.data?.cloudceiling,
            new Date(arriveTime),
            null,
            index,
          );
          const { value: visibility } = getValueFromDatasetByElevation(
            getDepartureAdvisorDataResult.data?.visibility,
            new Date(arriveTime),
            null,
            index,
          );
          const { value: skycover } = getValueFromDatasetByElevation(
            queryNbmAllResult.data?.skycover,
            new Date(arriveTime),
            null,
            index,
          );
          const { value: cloudbase } = getValueFromDatasetByElevation(
            queryNbmAllResult.data?.cloudbase,
            new Date(arriveTime),
            null,
            index,
          );
          const skyConditions = makeSkyConditions(cloudbase, cloudceiling, skycover);
          const flightCategoryColor = getFlightCategoryColor(visibility, cloudceiling);
          flightCategoryData.push({
            x0: interval * index - interval / 2,
            x: interval * index + interval / 2,
            y0: (-routeProfileApiState.maxAltitude * 100) / 50,
            y: -routeProfileApiState.maxAltitude / 5,
            color: flightCategoryColor,
            tooltip: {
              time: forecastTime,
              clouds: skyConditions,
              visibility: visibility,
              position: curr,
            },
          });
          // accDistance += dist;
          arriveTime = newTime;
        } catch (err) {
          console.warn(err);
        }
      });
      setFlightCategorySeries(flightCategoryData);
    }
  }

  useEffect(() => {
    buildFlightCategorySeries();
  }, [
    segments,
    queryNbmAllResult.isSuccess,
    getDepartureAdvisorDataResult.isSuccess,
    routeProfileApiState.maxAltitude,
  ]);

  useEffect(() => {
    const dx = (calcChartWidth(viewW, viewH) - 40) / (routeLength + startMargin + endMargin);
    const dy =
      (calcChartHeight(viewW, viewH) - (isMobile ? 64 : 72) - (16 * windIconScale + 4)) /
      (routeProfileApiState.maxAltitude * 100);
    if (props.setValue2PixelRate)
      props.setValue2PixelRate(
        dx,
        dy,
        40 + dx * startMargin + 4,
        16 * windIconScale + 4 + 36,
        calcChartWidth(viewW, viewH),
        calcChartHeight(viewW, viewH),
      );
  }, [routeProfileApiState.maxAltitude, viewW, viewH, routeLength, startMargin, windIconScale, isMobile]);

  return (
    <div
      className="scrollable-chart-content"
      style={{ width: calcChartWidth(viewW, viewH), height: calcChartHeight(viewW, viewH) }}
    >
      {segmentsCount && (
        <XYPlot
          key={viewH}
          height={calcChartHeight(viewW, viewH)}
          width={calcChartWidth(viewW, viewH)}
          color="white"
          yDomain={[0, routeProfileApiState.maxAltitude * 100]}
          xDomain={[-startMargin, routeLength + endMargin]}
          margin={{ left: 0, right: 0, bottom: isMobile ? 64 : 72, top: 16 * windIconScale + 4 }}
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
            tickValues={Array.from({ length: segmentsCount * 2 + 1 }, (_value, index) =>
              Math.round((index * segmentInterval) / 2),
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
            tickValues={segments.map((segment, index) => index * segmentInterval)}
            tickFormat={(v, index) => {
              if (segmentsCount > 0 && segments[index]) {
                const distInMile = index * segmentInterval;
                const dist = Math.round(
                  userSettings.default_distance_unit ? flyjs.nauticalMilesTo('Kilometers', distInMile, 0) : distInMile,
                );
                const offset = isMobile ? '2.7em' : '3.6em';
                return (
                  <tspan dy={offset} className="chart-label">
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
          {segments && segments.length > 4 ? (
            <LabelSeries
              onValueMouseOver={(value) => {
                setTimeHint(value);
              }}
              onValueClick={(value) => setTimeHint(value)}
              onValueMouseOut={() => setTimeHint(null)}
              data={segments.map((segment, index) => {
                return {
                  x: index * segmentInterval,
                  y: 0,
                  yOffset: isMobile ? 58 : 68,
                  segment: segment,
                  label: userSettings.default_time_display_unit
                    ? segment.departureTime.time
                    : simpleTimeOnlyFormat(new Date(segment.arriveTime), false),
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
            routeProfileApiState.showTemperature &&
            temperatureContures &&
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
          {routeProfileApiState.chartType !== 'Turb' && routeProfileApiState.showTemperature && contourLabelData && (
            <LabelSeries animation allowOffsetToBeReversed data={contourLabelData}></LabelSeries>
          )}
          {routeProfileApiState.chartType === 'Wind' && activeRoute ? props.children : null}
          {elevationSeries.length > 0 && (
            <AreaSeries
              data={elevationSeries}
              color="#9e8f85"
              curve={'curveMonotoneX'}
              strokeWidth={1}
              stroke="#443322"
              onNearestXY={(datapoint) => setElevationHint(datapoint)}
              onSeriesMouseOut={() => setShowElevationHint(false)}
              onSeriesMouseOver={() => setShowElevationHint(true)}
            />
          )}
          {/* {elevationSeries.length > 0 && (
            <LineSeries color="#443322" curve={'curveMonotoneX'} data={elevationSeries} strokeWidth={1}></LineSeries>
          )} */}
          <CustomSVGSeries
            color="white"
            data={[
              {
                x: -startMargin,
                y: routeProfileApiState.maxAltitude * 100,
                customComponent: () => {
                  return (
                    <rect
                      x="0"
                      y={-16 * windIconScale - 2}
                      width={calcChartWidth(viewW, viewH)}
                      height={16 * windIconScale + 4}
                      fill="white"
                    />
                  );
                },
              },
            ]}
          ></CustomSVGSeries>
          {weatherIconData && (
            <CustomSVGSeries
              customComponent="square"
              data={weatherIconData}
              onValueMouseOver={(value) => setWeatherHint(value)}
              onValueClick={(value) => setWeatherHint(value)}
              onValueMouseOut={() => setWeatherHint(null)}
            />
          )}
          {flightCategorySeries && (
            <VerticalRectSeries
              colorType="literal"
              data={flightCategorySeries}
              onValueMouseOver={(value) => setFlightCatHint(value)}
              onValueClick={(value) => setFlightCatHint(value)}
              onValueMouseOut={() => setFlightCatHint(null)}
            ></VerticalRectSeries>
          )}
          {props.noDataMessage && (
            <CustomSVGSeries
              data={[
                {
                  x: getRouteLength(activeRoute, !userSettings.default_distance_unit) / 2,
                  y: (routeProfileApiState.maxAltitude * 100) / 2,
                  customComponent: (_row, _positionInPixels) => {
                    return (
                      <switch>
                        <foreignObject x="-150" y="-60" width="300" height="200">
                          <p className="nodata-msg">{props.noDataMessage}</p>
                        </foreignObject>

                        <text x="20" y="20">
                          {props.noDataMessage}
                        </text>
                      </switch>
                    );
                  },
                  style: {
                    textAnchor: 'middle',
                  },
                },
              ]}
            />
          )}
          {showElevationHint && elevationHint ? (
            <Hint value={elevationHint}>
              <div style={{ background: 'white', color: 'black', padding: 4, borderRadius: 4 }}>{elevationHint.y}</div>
            </Hint>
          ) : null}
          {timeHint ? (
            <Hint value={timeHint} className="time-tooltip" align={{ horizontal: 'auto', vertical: 'top' }}>
              {-timeHint.segment.departureTime.offset !== new Date().getTimezoneOffset() && (
                <span>{timeHint.segment.departureTime.full}</span>
              )}
              <span>{convertTimeFormat(timeHint.segment.arriveTime, true)}</span>
              <span>{convertTimeFormat(timeHint.segment.arriveTime, false)}</span>
            </Hint>
          ) : null}
          {weatherHint && (
            <Hint value={weatherHint} className="time-tooltip" align={{ horizontal: 'auto', vertical: 'bottom' }}>
              <span>
                <b>Time:</b>&nbsp;{convertTimeFormat(weatherHint.tooltip.time, userSettings.default_time_display_unit)}
              </span>
              <div style={{ display: 'flex', lineHeight: 1, color: 'black' }}>
                <div>
                  <p style={{ marginTop: 3 }}>
                    <b>Clouds: </b>
                  </p>
                </div>
                <div style={{ margin: 3, marginTop: -3 }}>
                  {weatherHint.tooltip.clouds.map((skyCondition) => {
                    return (
                      <div
                        key={`${skyCondition.skyCover}-${skyCondition.cloudBase}`}
                        style={{ marginTop: 6, marginBottom: 2 }}
                      >
                        {MetarSkyValuesToString[skyCondition.skyCover]}
                        {['CLR', 'SKC', 'CAVOK'].includes(skyCondition.skyCover) === false &&
                          ' at ' + roundCloudHeight(skyCondition.cloudBase) + ' feet'}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', lineHeight: 1, color: 'black' }}>
                <div>
                  <p style={{ marginTop: 3 }}>
                    <b>Weather: </b>
                  </p>
                </div>
                <div style={{ margin: 3, marginTop: -3 }}>
                  {weatherHint.tooltip.weathers.map((weather, index) => {
                    return (
                      <div key={`weather-${index}`} style={{ marginTop: 6, marginBottom: 2 }}>
                        {weather}
                      </div>
                    );
                  })}
                </div>
              </div>
              <span>
                <b>Latitude:</b>&nbsp;{weatherHint.tooltip.position.lat}
              </span>
              <span>
                <b>Longitude:</b>&nbsp;{weatherHint.tooltip.position.lng}
              </span>
            </Hint>
          )}
          {flightCatHint && (
            <Hint value={flightCatHint} className="time-tooltip" align={{ horizontal: 'auto', vertical: 'top' }}>
              <span>
                <b>Time:</b>&nbsp;
                {convertTimeFormat(flightCatHint.tooltip.time, userSettings.default_time_display_unit)}
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
                        {MetarSkyValuesToString[skyCondition.skyCover]}
                        {['CLR', 'SKC', 'CAVOK'].includes(skyCondition.skyCover) === false &&
                          ' at ' + roundCloudHeight(skyCondition.cloudBase) + ' feet'}
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
              <span>
                <b>Latitude:</b>&nbsp;{flightCatHint.tooltip.position.lat}
              </span>
              <span>
                <b>Longitude:</b>&nbsp;{flightCatHint.tooltip.position.lng}
              </span>
            </Hint>
          )}
          {airportHint && airportHint.tooltip ? (
            <Hint value={airportHint} className="time-tooltip" align={{ horizontal: 'auto', vertical: 'top' }}>
              <span>
                <b>Time:</b>&nbsp;{convertTimeFormat(airportHint.tooltip.time, userSettings.default_time_display_unit)}
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
                          ' at ' + roundCloudHeight(skyCondition.cloudBase) + ' feet'}
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
              {airportHint.tooltip.isAirport && (
                <span>
                  <b>Wind speed:</b>&nbsp;
                  {!userSettings.default_wind_speed_unit
                    ? Math.round(airportHint.tooltip.windspeed) +
                      (Math.round(airportHint.tooltip.windspeed) <= 1 ? ' knot' : ' knots')
                    : Math.round(knotsToMph(airportHint.tooltip.windspeed)) + ' mph'}
                </span>
              )}
              {airportHint.tooltip.isAirport && (
                <span>
                  <b>Wind direction:</b>&nbsp;{addLeadingZeroes(Math.round(airportHint.tooltip.winddir), 3) + ' \u00B0'}
                </span>
              )}
              {airportHint.tooltip.isAirport &&
                airportHint.tooltip.windgust > 10 &&
                Math.abs(airportHint.tooltip.windgust - airportHint.tooltip.windspeed) > 4 && (
                  <span>
                    <b>Wind gust:</b>&nbsp;
                    {!userSettings.default_wind_speed_unit
                      ? Math.round(airportHint.tooltip.windgust) +
                        (Math.round(airportHint.tooltip.windgust) <= 1 ? ' knot' : ' knots')
                      : Math.round(knotsToMph(airportHint.tooltip.windgust)) + ' mph'}
                  </span>
                )}
              {airportHint.tooltip.crosscom > 0 && (
                <span>
                  <b>Crosswind component:</b>&nbsp;
                  {!userSettings.default_wind_speed_unit
                    ? Math.round(airportHint.tooltip.crosscom) +
                      (Math.round(airportHint.tooltip.crosscom) <= 1 ? ' knot' : ' knots')
                    : Math.round(knotsToMph(airportHint.tooltip.crosscom)) + ' mph'}
                </span>
              )}
              {airportHint.tooltip.crossRunwayId && (
                <span>
                  <b>Crosswind runway:</b>&nbsp;{airportHint.tooltip.crossRunwayId}
                </span>
              )}
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
    </div>
  );
};
export default RouteProfileChart;
