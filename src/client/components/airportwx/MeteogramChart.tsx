import { useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import {
  XYPlot,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  LineSeries,
  AreaSeries,
  Hint,
  LabelSeries,
  GradientDefs,
  VerticalRectSeries,
  CustomSVGSeries,
} from 'react-vis';
import { getFuzzyLocalTimeFromPoint } from '@mapbox/timespace';
import { initialUserSettingsState, selectSettings } from '../../store/user/UserSettings';
import { useQueryAirportNbmMutation, useQueryNbmAllMutation } from '../../store/route-profile/routeProfileApi';
import { useGetSingleElevationQuery, useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import { selectFetchedDate, selectRouteSegments } from '../../store/route-profile/RouteProfile';
import {
  addLeadingZeroes,
  celsiusToFahrenheit,
  convertTimeFormat,
  getMetarCeilingCategory,
  getMetarVisibilityCategory,
  knotsToMph,
  meterToFeet,
  round,
  roundCloudHeight,
  visibilityMileToFraction,
  visibilityMileToMeter,
} from '../map/common/AreoFunctions';
import { MetarSkyValuesToString } from '../map/common/AreoConstants';
import { Conrec } from '../../conrec-js/conrec';
import { RouteProfileDataset, RouteSegment } from '../../interfaces/route-profile';
import {
  getForecastTimes,
  getMinMaxValueByElevation,
  getValueFromDatasetByElevation,
  getTimeGradientStops,
  makeWeatherString,
  getNbmWeatherMarkerIcon,
  flightCategoryToColor,
  makeSkyConditions,
  getAirportNbmData,
} from '../../utils/utils';
import {
  cacheKeys,
  flightCategoryDivide,
  hourInMili,
  iPadPortraitWidth,
  mobileLandscapeHeight,
  temperatureContourColors,
} from '../../utils/constants';
import {
  selectCurrentAirport,
  selectCurrentAirportPos,
  selectViewHeight,
  selectViewWidth,
} from '../../store/airportwx/airportwx';
import {
  initialAirportWxState,
  useGetAirportwxStateQuery,
  useGetMeteogramDataQuery,
  useUpdateAirportwxStateMutation,
} from '../../store/airportwx/airportwxApi';
import { getCurrentHour } from '../../utils/utils';
import { weatherFontContents } from '../../utils/utils';
import { ToggleButton } from '@mui/material';

export function getXAxisValues(chartWidth, interval): { index: number; hour: number; time: Date }[] {
  const currentHour = Math.floor(Date.now() / hourInMili);
  const times = [];
  for (let i = 0; i <= chartWidth; i += interval) {
    const hour = (currentHour + i) * hourInMili;
    const time = new Date(hour);
    times.push({
      index: i,
      hour,
      time,
    });
  }
  return times;
}

function getTimesToShow(dataset: RouteProfileDataset[]) {
  const currentHour = Math.floor(Date.now() / hourInMili);
  const times = getForecastTimes(dataset);
  const indexAndHours = times.map((time, index) => ({
    index: index,
    hour: Math.floor(time.getTime() / hourInMili) - currentHour,
    time: time,
  }));
  const indexHoursToShow = indexAndHours.filter(({ hour }) => hour >= 0);
  return indexHoursToShow;
}

function buildContour(dataset: RouteProfileDataset[], times, maxAltitude: number, showInCelsius: boolean) {
  const matrixData: number[][] = [];
  const margin = times.length > 30 ? 1 : 0.5;
  const xs = [-margin, ...times.map((x) => x.index), times[times.length - 1].index + margin];
  // const xs = segments.map((segment) => segment.accDistance);
  const elevations = Array.from({ length: 50 }, (_value, index) => index * 1000);
  let { min: min, max: max } = getMinMaxValueByElevation(dataset, maxAltitude * 100);
  const step = maxAltitude === 500 ? 5 : maxAltitude === 300 ? 2 : 1;
  min = Math.round(min / step) * step;
  max = Math.round(max / step) * step;
  const count = (max - min) / step + 1;

  const zs = Array.from({ length: count }, (x, i) => i * step + min);
  times.forEach(({ time }, index) => {
    const row = [];
    elevations.forEach((elevation) => {
      const { value: temperature } = getValueFromDatasetByElevation(dataset, time, elevation, 0);
      if (!temperature) return;
      row.push(temperature);
    });
    matrixData.push(row);
    if (index === 0) {
      matrixData.push(row);
    } else if (index === times.length - 1) {
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
      ? celsiusToFahrenheit(contour.temperature) + ' \u00B0'
      : round(contour.temperature, 1) + ' \u00B0';
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
  const finalCat = indexFinalCat > -1 ? categories[indexFinalCat] : 'lightslategrey';
  return flightCategoryToColor(finalCat);
}

function calcChartWidth(viewWidth: number, _viewHeight: number) {
  if (viewWidth < 1500) {
    return 1500;
  } else {
    return viewWidth - 140;
  }
}

function calcChartHeight(_viewWidth: number, viewHeight: number) {
  if (viewHeight < mobileLandscapeHeight) {
    return viewHeight - 200;
  } else {
    if (_viewWidth < iPadPortraitWidth) {
      return viewHeight - 270;
    }
    return viewHeight - 220;
  }
}

const MeteogramChart = (props: {
  children: ReactNode;
  showDayNightBackground: boolean;
  noDataMessage: string;
  noIcingAbove30000?: string;
  setValue2PixelRate?: (
    dx: number,
    dy: number,
    marginX: number,
    marginY: number,
    width: number,
    height: number,
  ) => void;
}) => {
  const currentAirport = useSelector(selectCurrentAirport);
  const currentAirportPos = useSelector(selectCurrentAirportPos);
  const { isSuccess: isLoadedMGramData, data: meteogramData } = useGetMeteogramDataQuery(currentAirportPos, {
    skip: currentAirportPos === null,
  });
  const userSettings = useSelector(selectSettings);
  const { data: airportwxDbState, isSuccess: isAirportwxStateLoaded } = useGetAirportwxStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const fetchedDate = useSelector(selectFetchedDate);
  const chartWidth = 24 * airportwxDbState.chartDays;
  const interval = airportwxDbState.chartDays;

  const { data: airportElevation, isSuccess: isElevationLoaded } = useGetSingleElevationQuery(currentAirportPos, {
    skip: currentAirportPos === null,
  });
  const [elevationSeries, setElevationSeries] = useState([]);
  const startMargin = airportwxDbState.chartDays === 1 ? 1 : 3;
  const endMargin = airportwxDbState.chartDays === 1 ? 1 : 3;
  const viewW = useSelector(selectViewWidth);
  const viewH = useSelector(selectViewHeight);

  const [elevationHint, setElevationHint] = useState(null);
  const [elevationHintX, setElevationHintX] = useState(0);
  const [showElevationHint, setShowElevationHint] = useState(false);

  const [gradientStops, setGradientStops] = useState([]);
  const [contourLabelData, setContourLabelData] = useState(null);
  const [temperatureContures, setTemperatureContours] = useState(null);
  const [weatherIconData, setWeatherIconData] = useState(null);
  const [weatherHint, setWeatherHint] = useState(null);
  const [flightCategorySeries, setFlightCategorySeries] = useState(null);
  const [flightCatHint, setFlightCatHint] = useState(null);
  const [timeHint, setTimeHint] = useState(null);

  const [queryNbmAll, queryNbmAllResult] = useQueryNbmAllMutation({
    fixedCacheKey: cacheKeys.nbm,
  });
  const [queryAirportNbm, queryAirportNbmResult] = useQueryAirportNbmMutation();
  const [dateBlocksWidth, setDateBlocksWidth] = useState(viewW);
  const [dateBlocksMargin, setDateBlockMargin] = useState(0);
  const [blockDates, setBlockDates] = useState([]);
  const [airportwxState, setAirportwxState] = useState(initialAirportWxState);
  const [updateAirportwxState] = useUpdateAirportwxStateMutation();

  const isMobile = viewH < mobileLandscapeHeight || viewW < mobileLandscapeHeight;
  const windIconScale = isMobile ? 1 : 2;

  useEffect(() => {
    const chartWidth = calcChartWidth(viewW, viewH);
    const chartAxisCount = airportwxDbState.chartDays * 24 + 2;
    const dx = chartWidth / chartAxisCount;
    const w = chartWidth - startMargin * dx - endMargin * dx;
    setDateBlocksWidth(w);
    setDateBlockMargin(startMargin * dx - 44);
  }, [viewW, airportwxDbState]);

  useEffect(() => {
    const blockDays = calcBlockDays();
    setBlockDates(blockDays);
  }, [airportwxDbState, userSettings.default_time_display_unit]);

  function calcBlockDays() {
    const times = getXAxisValues(airportwxDbState.chartDays * 24, 1).map((x) => x.time);
    const blockCount = 24 * airportwxDbState.chartDays;
    let date = times[0];
    let width = 0;
    let blockCountInDate = 0;
    const dateBlocks = [];
    for (const blockTime of times) {
      if (
        userSettings.default_time_display_unit
          ? date.getDate() === blockTime.getDate()
          : date.getUTCDate() === blockTime.getUTCDate()
      ) {
        blockCountInDate++;
      } else {
        width = blockCountInDate / blockCount;
        dateBlocks.push({ date: date, width: width * 100 });
        blockCountInDate = 1;
        date = blockTime;
      }
    }
    width = (blockCountInDate - 1) / blockCount;
    dateBlocks.push({ date: date, width: width * 100 });
    return dateBlocks;
  }

  function buildTemperatureContourSeries() {
    if (isLoadedMGramData) {
      if (airportwxDbState.showTemperature) {
        const times = getXAxisValues(chartWidth, 1);
        const { contours, contourLabels } = buildContour(
          meteogramData.temperature,
          times,
          airportwxDbState.maxAltitude,
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
    if (currentAirport) {
      queryAirportNbm([currentAirport]);
    }
  }, [currentAirport]);

  useEffect(() => {
    if (currentAirportPos && !queryAirportNbmResult.isLoading) {
      queryNbmAll({ queryPoints: [[currentAirportPos.lng, currentAirportPos.lat]] });
    }
  }, [currentAirportPos, queryAirportNbmResult.isLoading]);

  useEffect(() => {
    buildTemperatureContourSeries();
  }, [isLoadedMGramData, userSettings.default_temperature_unit, airportwxDbState]);

  useEffect(() => {
    const times = getXAxisValues(chartWidth, interval);
    const stops = getTimeGradientStops(
      times.map((x) => ({
        time: x.time,
        hour: userSettings.default_time_display_unit ? x.time.getHours() : x.time.getUTCHours(),
        minute: x.time.getMinutes(),
      })),
    );
    setGradientStops(stops);
  }, [isLoadedMGramData, airportwxDbState]);

  function getWeatherMarker(time: Date, index) {
    const { value: cloudceiling, time: forecastTime } = getValueFromDatasetByElevation(
      meteogramData.cloudceiling,
      time,
      null,
      0,
    );
    const { value: visibility } = getValueFromDatasetByElevation(meteogramData.visibility, time, null, 0);
    const { value: skycover } = getValueFromDatasetByElevation(queryNbmAllResult.data?.skycover, time, null, 0);
    const { value: cloudbase } = getValueFromDatasetByElevation(queryNbmAllResult.data?.cloudbase, time, null, 0);
    const { value: wx_1 } = getValueFromDatasetByElevation(meteogramData.wx_1, time, null, 0);
    const { value: wx_2 } = getValueFromDatasetByElevation(meteogramData.wx_2, time, null, 0);
    const { value: wxInten1 } = getValueFromDatasetByElevation(meteogramData.wxInten1, time, null, 0);
    const { value: wxInten2 } = getValueFromDatasetByElevation(meteogramData.wxInten2, time, null, 0);
    const { value: wxProbCov1 } = getValueFromDatasetByElevation(meteogramData.wxProbCov1, time, null, 0);
    const { value: wxProbCov2 } = getValueFromDatasetByElevation(meteogramData.wxProbCov2, time, null, 0);
    const { value: w_speed } = getValueFromDatasetByElevation(queryNbmAllResult.data?.windspeed, time, null, 0);
    const { value: w_gust } = getValueFromDatasetByElevation(queryNbmAllResult.data?.gust, time, null, 0);
    const weather1 = makeWeatherString(wx_1, wxProbCov1, wxInten1, skycover, w_speed, w_gust, false);
    const weathers = [weather1];
    if (wx_2 && wx_2 !== -9999) {
      const weather2 = makeWeatherString(wx_2, wxProbCov2, wxInten2, skycover, w_speed, w_gust, false);
      weathers.push(weather2);
    }
    const color = getFlightCategoryColor(visibility, cloudceiling);
    const icon = getNbmWeatherMarkerIcon(wx_1, w_speed, w_gust, skycover, currentAirportPos, time.getTime());
    return {
      x: index,
      y: airportwxDbState.maxAltitude * 100,
      tooltip: {
        time: forecastTime,
        clouds: makeSkyConditions(cloudbase, cloudceiling, skycover),
        ceiling: cloudceiling,
        lowestCloud: cloudbase,
        skycover,
        weathers: weathers,
        position: currentAirportPos,
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

  useEffect(() => {
    if (isElevationLoaded) {
      const elevationApiResults = airportElevation.geoPoints;
      const elevations = [
        {
          x: -startMargin,
          y: meterToFeet(elevationApiResults[0].elevation),
        },
        {
          x: chartWidth + endMargin,
          y: meterToFeet(elevationApiResults[0].elevation),
        },
      ];
      setElevationSeries(elevations);
    }
  }, [isElevationLoaded, airportElevation, airportwxDbState]);

  function buildFlightCategorySeries() {
    if (queryNbmAllResult.isSuccess && queryAirportNbmResult.data && isLoadedMGramData) {
      const timesToShow = getXAxisValues(chartWidth, 1);
      const flightCategoryData = [];
      const weatherSeries = [];
      timesToShow.forEach((curr) => {
        try {
          const { value: cloudceiling, time: forecastTime } = getValueFromDatasetByElevation(
            meteogramData.cloudceiling,
            curr.time,
            null,
            0,
          );
          const { value: visibility } = getValueFromDatasetByElevation(meteogramData.visibility, curr.time, null, 0);
          const { value: skycover } = getValueFromDatasetByElevation(
            queryNbmAllResult.data?.skycover,
            curr.time,
            null,
            0,
          );
          const { value: cloudbase } = getValueFromDatasetByElevation(
            queryNbmAllResult.data?.cloudbase,
            curr.time,
            null,
            0,
          );
          const skyConditions = makeSkyConditions(cloudbase, cloudceiling, skycover);
          const flightCategoryColor = getFlightCategoryColor(visibility, cloudceiling);
          const { value: w_speed } = getValueFromDatasetByElevation(
            queryNbmAllResult.data?.windspeed,
            curr.time,
            null,
            0,
          );
          const { value: w_gust } = getValueFromDatasetByElevation(queryNbmAllResult.data?.gust, curr.time, null, 0);
          const { value: w_direction } = getValueFromDatasetByElevation(
            queryNbmAllResult.data?.winddir,
            curr.time,
            null,
            0,
          );
          const { value: temperature } = getValueFromDatasetByElevation(
            queryNbmAllResult.data?.temperature,
            curr.time,
            null,
            0,
          );
          const { value: dewpoint } = getValueFromDatasetByElevation(
            queryNbmAllResult.data?.dewpoint,
            curr.time,
            null,
            0,
          );

          const { data: forCrosswind } = getAirportNbmData(
            queryAirportNbmResult.data,
            curr.time.getTime(),
            currentAirport,
          );
          const crosscom = forCrosswind?.cross_com;
          const crossRunwayId = forCrosswind?.cross_r_id;

          flightCategoryData.push({
            x0: curr.index - 0.5,
            x: curr.index + 0.5,
            y0:
              (-airportwxDbState.maxAltitude * 100) / 50 -
              (viewH < mobileLandscapeHeight ? airportwxDbState.maxAltitude * 2 : 0),
            y: -airportwxDbState.maxAltitude / 5,
            color: flightCategoryColor,
            tooltip: {
              time: forecastTime,
              clouds: skyConditions,
              cloudbase,
              cloudceiling,
              visibility: visibility,
              windspeed: w_speed,
              winddirection: w_direction,
              windgust: w_gust,
              temperature,
              dewpoint,
              crosscom,
              crossrunway: crossRunwayId,
              position: currentAirportPos,
            },
          });
          const weatherData = getWeatherMarker(curr.time, curr.index);
          weatherSeries.push(weatherData);
        } catch (err) {
          console.warn(err);
        }
      });
      setFlightCategorySeries(flightCategoryData);
      setWeatherIconData(weatherSeries);
    }
  }

  function buildWeatherSeries() {
    if (queryNbmAllResult.isSuccess && isLoadedMGramData) {
      const timesToShow = getXAxisValues(chartWidth, interval);
      const weatherSeries = [];
      timesToShow.forEach((curr) => {
        try {
          const weatherData = getWeatherMarker(curr.time, curr.index);
          weatherSeries.push(weatherData);
        } catch (err) {
          console.warn(err);
        }
      });
      setWeatherIconData(weatherSeries);
    }
  }
  useEffect(() => {
    buildFlightCategorySeries();
    buildWeatherSeries();
  }, [queryNbmAllResult.isSuccess, queryAirportNbmResult.data, isLoadedMGramData, airportwxDbState, viewH]);

  useEffect(() => {
    if (airportwxDbState) {
      const dx = (calcChartWidth(viewW, viewH) - 40) / (chartWidth + startMargin + endMargin);
      const dy =
        (calcChartHeight(viewW, viewH) - (isMobile ? 64 : 72) - (16 * windIconScale + 4)) /
        (airportwxDbState.maxAltitude * 100);
      if (props.setValue2PixelRate)
        props.setValue2PixelRate(
          dx,
          dy,
          40 + dx * startMargin + 4,
          16 * windIconScale + 4 + 36,
          calcChartWidth(viewW, viewH),
          calcChartHeight(viewW, viewH),
        );
    }
  }, [airportwxDbState, viewW, viewH, startMargin, windIconScale, isMobile]);

  return (
    <div
      className="scrollable-chart-content"
      style={{ width: calcChartWidth(viewW, viewH), height: calcChartHeight(viewW, viewH) + 40, position: 'relative' }}
    >
      {airportwxDbState && currentAirportPos && (
        <XYPlot
          key={viewH}
          height={calcChartHeight(viewW, viewH)}
          width={calcChartWidth(viewW, viewH)}
          color="white"
          yDomain={[0, airportwxDbState.maxAltitude * 100]}
          xDomain={[-startMargin, chartWidth + endMargin]}
          margin={{ left: 0, right: 0, bottom: isMobile ? 32 : 42, top: 16 * windIconScale + 4 }}
          style={{ position: 'relative' }}
        >
          <GradientDefs>
            <linearGradient id="linear-gradient">
              {gradientStops.map(({ level, stopColor }, index) => (
                <stop key={'gradient-' + index} offset={level + '%'} stopColor={stopColor} />
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
                { x: -startMargin, y: airportwxDbState.maxAltitude * 100 },
                { x: chartWidth + endMargin, y: airportwxDbState.maxAltitude * 100 },
              ]}
              color={'url(#linear-gradient)'}
            />
          )}
          {!props.showDayNightBackground && (
            <AreaSeries
              data={[
                { x: -startMargin, y: airportwxDbState.maxAltitude * 100 },
                { x: chartWidth + endMargin, y: airportwxDbState.maxAltitude * 100 },
              ]}
              color="#F2F0F0"
            />
          )}
          <VerticalGridLines
            tickValues={getXAxisValues(chartWidth, interval).map((x) => x.index)}
            style={{
              stroke: 'grey',
              strokeWidth: 0.2,
            }}
          />
          {airportwxDbState.chartType === 'Wind' && (
            <HorizontalGridLines
              tickValues={Array.from({ length: 5 - 1 }, (_value, index) =>
                Math.round(((index + 1) * airportwxDbState.maxAltitude * 100) / 5),
              )}
              style={{
                stroke: 'grey',
                strokeWidth: 2,
              }}
            />
          )}
          <HorizontalGridLines
            tickValues={Array.from({ length: 5 }, (_value, index) =>
              Math.round(((index + 0.5) * airportwxDbState.maxAltitude * 100) / 5),
            )}
            style={{
              stroke: 'grey',
              strokeWidth: 0.2,
            }}
          />
          <LabelSeries
            onValueMouseOver={(value) => {
              setTimeHint(value);
            }}
            onValueClick={(value) => setTimeHint(value)}
            onValueMouseOut={() => setTimeHint(null)}
            data={getXAxisValues(chartWidth, interval).map((x) => {
              const localTime = getFuzzyLocalTimeFromPoint(x.time, [currentAirportPos.lng, currentAirportPos.lat]);
              return {
                x: x.index,
                y: 0,
                yOffset: isMobile ? 32 : 36,
                label: userSettings.default_time_display_unit
                  ? addLeadingZeroes(x.time.getHours(), 2)
                  : addLeadingZeroes(x.time.getUTCHours(), 2) + 'Z',
                time: x.time,
                localtime: localTime,
                style: {
                  fill: 'white',
                  dominantBaseline: 'text-after-edge',
                  textAnchor: 'start',
                  fontSize: 12,
                  fontWeight: 500,
                },
              };
            })}
          />
          {airportwxDbState.chartType !== 'Wind' ? props.children : null}
          {airportwxDbState.chartType !== 'Wind' && (
            <HorizontalGridLines
              tickValues={Array.from({ length: 5 - 1 }, (_value, index) =>
                Math.round(((index + 1) * airportwxDbState.maxAltitude * 100) / 5),
              )}
              style={{
                stroke: 'grey',
                strokeWidth: 2,
              }}
            />
          )}
          {airportwxDbState.chartType !== 'Turb' &&
            airportwxDbState.showTemperature &&
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
                  style={{ pointerEvents: 'none', fill: 'transparent' }}
                />
              );
            })}
          {airportwxDbState.chartType !== 'Turb' && airportwxDbState.showTemperature && contourLabelData && (
            <LabelSeries animation allowOffsetToBeReversed data={contourLabelData}></LabelSeries>
          )}
          {airportwxDbState.chartType === 'Wind' ? props.children : null}
          {elevationSeries.length > 0 && (
            <AreaSeries
              data={elevationSeries}
              color="#9e8f85"
              curve={'curveMonotoneX'}
              strokeWidth={1}
              stroke="#443322"
              onNearestXY={(datapoint) => setElevationHint(datapoint)}
              // onSeriesMouseOut={() => setShowElevationHint(false)}
              onSeriesMouseOver={(event) => {
                setElevationHintX(event.event.clientX);
                setShowElevationHint(true);
              }}
            />
          )}
          <CustomSVGSeries
            color="white"
            data={[
              {
                x: -startMargin,
                y: airportwxDbState.maxAltitude * 100,
                customComponent: () => {
                  return (
                    <rect
                      x="0"
                      y={-16 * windIconScale - 6}
                      width={calcChartWidth(viewW, viewH)}
                      height={16 * windIconScale + 6}
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
                  x: chartWidth / 2,
                  y: (airportwxDbState.maxAltitude * 100) / 2,
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
          {!props.noDataMessage && props.noIcingAbove30000 && (
            <CustomSVGSeries
              data={[
                {
                  x: chartWidth / 2,
                  y: 35000,
                  customComponent: (_row, _positionInPixels) => {
                    return (
                      <switch>
                        <foreignObject x="-150" y="-10" width="300" height="200">
                          <p className="nodata-msg">{props.noIcingAbove30000}</p>
                        </foreignObject>

                        <text x="20" y="20">
                          {props.noIcingAbove30000}
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
            <Hint value={elevationHint} className="elevation-tooltip">
              <div style={{ background: 'white', color: 'black', padding: 4, borderRadius: 4 }}>{elevationHint.y}</div>
            </Hint>
          ) : null}
          {timeHint ? (
            <Hint value={timeHint} className="time-tooltip" align={{ horizontal: 'auto', vertical: 'top' }}>
              {-timeHint.localtime.utcOffset() !== new Date().getTimezoneOffset() && (
                <span>{timeHint.localtime.format('ddd, MMM DD, YYYY kk:mm z')}</span>
              )}
              <span>{convertTimeFormat(timeHint.time, true)}</span>
              <span>{convertTimeFormat(timeHint.time, false)}</span>
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
                <b>Lowest Cloud:</b>&nbsp;{Math.round(flightCatHint.tooltip.cloudbase)}
              </span>
              <span>
                <b>Ceiling:</b>&nbsp;{Math.round(flightCatHint.tooltip.cloudceiling)}
              </span>

              <span>
                <b>Visibility:</b>&nbsp;
                {!userSettings.default_visibility_unit
                  ? visibilityMileToFraction(flightCatHint.tooltip.visibility)
                  : visibilityMileToMeter(flightCatHint.tooltip.visibility)}
              </span>
              <span>
                <b>Wind speed:</b>&nbsp;
                {!userSettings.default_wind_speed_unit
                  ? Math.round(flightCatHint.tooltip.windspeed) +
                    (Math.round(flightCatHint.tooltip.windspeed) <= 1 ? ' knot' : ' knots')
                  : Math.round(knotsToMph(flightCatHint.tooltip.windspeed)) + ' mph'}
              </span>
              <span>
                <b>Wind direction:</b>&nbsp;
                {addLeadingZeroes(Math.round(flightCatHint.tooltip.winddirection), 3) + ' \u00B0'}
              </span>
              {flightCatHint.tooltip.windgust > 10 &&
                Math.abs(flightCatHint.tooltip.windgust - flightCatHint.tooltip.windspeed) > 4 && (
                  <span>
                    <b>Wind gust:</b>&nbsp;
                    {!userSettings.default_wind_speed_unit
                      ? Math.round(flightCatHint.tooltip.windgust) +
                        (Math.round(flightCatHint.tooltip.windgust) <= 1 ? ' knot' : ' knots')
                      : Math.round(knotsToMph(flightCatHint.tooltip.windgust)) + ' mph'}
                  </span>
                )}
              {flightCatHint.tooltip.crosscom > 0 && (
                <span>
                  <b>Crosswind component:</b>&nbsp;
                  {!userSettings.default_wind_speed_unit
                    ? Math.round(flightCatHint.tooltip.crosscom) +
                      (Math.round(flightCatHint.tooltip.crosscom) <= 1 ? ' knot' : ' knots')
                    : Math.round(knotsToMph(flightCatHint.tooltip.crosscom)) + ' mph'}
                </span>
              )}
              {flightCatHint.tooltip.crossrunway && (
                <span>
                  <b>Crosswind runway:</b>&nbsp;{flightCatHint.tooltip.crossrunway}
                </span>
              )}
              <span>
                <b>Temperature:</b>&nbsp;
                {!userSettings.default_temperature_unit
                  ? Math.round(flightCatHint.tooltip.temperature) + ' \u00B0C'
                  : celsiusToFahrenheit(flightCatHint.tooltip.temperature, 0) + ' \u00B0F'}
              </span>
              <span>
                <b>Dewpoint:</b>&nbsp;{' '}
                {!userSettings.default_temperature_unit
                  ? Math.round(flightCatHint.tooltip.dewpoint) + ' \u00B0C'
                  : celsiusToFahrenheit(flightCatHint.tooltip.dewpoint, 0) + ' \u00B0F'}
              </span>
            </Hint>
          )}
        </XYPlot>
      )}
      <div className="days">
        <div
          className="select-chart-width-days"
          onClick={() => {
            const newState = { ...airportwxDbState, chartDays: airportwxDbState.chartDays === 1 ? 3 : 1 };
            setAirportwxState(newState);
            updateAirportwxState(newState);
          }}
        >
          {airportwxState.chartDays === 1 ? 3 : 1}-Day
        </div>
        <div className="date-block-container" style={{ width: dateBlocksWidth, marginLeft: dateBlocksMargin }}>
          {blockDates.map((item, index) => (
            <div key={'date' + index} className="date" style={{ width: item.width + '%' }}>
              {item.width > 5
                ? item.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'numeric',
                    timeZone: userSettings.default_time_display_unit ? undefined : 'UTC',
                  })
                : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default MeteogramChart;
