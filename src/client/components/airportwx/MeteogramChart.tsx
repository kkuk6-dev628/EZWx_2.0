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
import { selectActiveRoute } from '../../store/route/routes';
import { initialUserSettingsState, selectSettings } from '../../store/user/UserSettings';
import { useQueryNbmAllMutation } from '../../store/route-profile/routeProfileApi';
import { useGetSingleElevationQuery, useQueryElevationApiMutation } from '../../store/route-profile/elevationApi';
import { selectFetchedDate, selectRouteSegments } from '../../store/route-profile/RouteProfile';
import {
  addLeadingZeroes,
  celsiusToFahrenheit,
  convertTimeFormat,
  getMetarCeilingCategory,
  getMetarVisibilityCategory,
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
} from '../../utils/utils';
import {
  cacheKeys,
  flightCategoryDivide,
  hourInMili,
  mobileLandscapeHeight,
  temperatureContourColors,
} from '../../utils/constants';
import { selectCurrentAirportPos, selectViewHeight, selectViewWidth } from '../../store/airportwx/airportwx';
import { useGetAirportwxStateQuery, useGetMeteogramDataQuery } from '../../store/airportwx/airportwxApi';
import { getCurrentHour } from '../../utils/utils';
import { weatherFontContents } from '../../utils/utils';
import { calcChartWidth, calcChartHeight } from '../../utils/utils';

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

function buildContour(dataset: RouteProfileDataset[], maxAltitude: number, showInCelsius: boolean) {
  const indexHoursToShow = getTimesToShow(dataset);
  const matrixData: number[][] = [];
  const xs = [-1, ...indexHoursToShow.map(({ hour }) => hour), indexHoursToShow[indexHoursToShow.length - 1].hour + 1];
  // const xs = segments.map((segment) => segment.accDistance);
  const elevations = Array.from({ length: 50 }, (_value, index) => index * 1000);
  let { min: min, max: max } = getMinMaxValueByElevation(dataset, maxAltitude * 100);
  const step = maxAltitude === 500 ? 5 : maxAltitude === 300 ? 2 : 1;
  min = Math.round(min / step) * step;
  max = Math.round(max / step) * step;
  const count = (max - min) / step + 1;

  const zs = Array.from({ length: count }, (x, i) => i * step + min);
  indexHoursToShow.forEach(({ time }, index) => {
    const row = [];
    elevations.forEach((elevation) => {
      const { value: temperature } = getValueFromDatasetByElevation(dataset, time, elevation, 0);
      if (!temperature) return;
      row.push(temperature);
    });
    matrixData.push(row);
    if (index === 0) {
      matrixData.push(row);
    } else if (index === indexHoursToShow.length - 1) {
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
  const currentAirportPos = useSelector(selectCurrentAirportPos);
  const { isSuccess: isLoadedMGramData, data: meteogramData } = useGetMeteogramDataQuery(currentAirportPos, {
    skip: currentAirportPos === null,
  });
  const userSettings = useSelector(selectSettings);
  const { data: airportwxState, isSuccess: isAirportwxStateLoaded } = useGetAirportwxStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const fetchedDate = useSelector(selectFetchedDate);
  const chartWidth = 24 * airportwxState.chartDays;
  const [interval, setInterval] = useState(1);
  const activeRoute = useSelector(selectActiveRoute);

  const segments = useSelector(selectRouteSegments);
  const { data: airportElevation, isSuccess: isElevationLoaded } = useGetSingleElevationQuery(currentAirportPos, {
    skip: currentAirportPos === null,
  });
  const [elevationSeries, setElevationSeries] = useState([]);
  const [startMargin, setStartMargin] = useState(1);
  const [endMargin, setEndMargin] = useState(1);
  const viewW = useSelector(selectViewWidth);
  const viewH = useSelector(selectViewHeight);

  const [elevationHint, setElevationHint] = useState(null);
  const [showElevationHint, setShowElevationHint] = useState(false);

  const [gradientStops, setGradientStops] = useState([]);
  const [contourLabelData, setContourLabelData] = useState(null);
  const [temperatureContures, setTemperatureContours] = useState(null);
  const [weatherIconData, setWeatherIconData] = useState(null);
  const [weatherHint, setWeatherHint] = useState(null);
  const [flightCategorySeries, setFlightCategorySeries] = useState(null);
  const [flightCatHint, setFlightCatHint] = useState(null);
  const [queryNbmAll, queryNbmAllResult] = useQueryNbmAllMutation({
    fixedCacheKey: cacheKeys.nbm,
  });

  const isMobile = viewH < mobileLandscapeHeight || viewW < mobileLandscapeHeight;
  const windIconScale = isMobile ? 1 : 2;

  function buildTemperatureContourSeries() {
    if (isLoadedMGramData) {
      if (airportwxState.showTemperature) {
        const { contours, contourLabels } = buildContour(
          meteogramData.temperature,
          airportwxState.maxAltitude,
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
    if (currentAirportPos) {
      queryNbmAll({ queryPoints: [[currentAirportPos.lng, currentAirportPos.lat]] });
    }
  }, [currentAirportPos]);

  useEffect(() => {
    buildTemperatureContourSeries();
  }, [isLoadedMGramData, userSettings.default_temperature_unit, airportwxState]);

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
  }, [isLoadedMGramData, airportwxState]);

  function buildWeatherSeries(segment: RouteSegment, segmentIndex: number, segmentInterval: number) {
    if (segment) {
      const { value: cloudceiling, time: forecastTime } = getValueFromDatasetByElevation(
        meteogramData.cloudceiling,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: visibility } = getValueFromDatasetByElevation(
        meteogramData.visibility,
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
        meteogramData.wx_1,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: wx_2 } = getValueFromDatasetByElevation(
        meteogramData.wx_2,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: wxInten1 } = getValueFromDatasetByElevation(
        meteogramData.wxInten1,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: wxInten2 } = getValueFromDatasetByElevation(
        meteogramData.wxInten2,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: wxProbCov1 } = getValueFromDatasetByElevation(
        meteogramData.wxProbCov1,
        new Date(segment.arriveTime),
        null,
        segmentIndex * flightCategoryDivide,
      );
      const { value: wxProbCov2 } = getValueFromDatasetByElevation(
        meteogramData.wxProbCov2,
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
        y: airportwxState.maxAltitude * 100,
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

  useEffect(() => {
    if (isElevationLoaded) {
      const elevationApiResults = airportElevation.geoPoints;
      const elevations = [
        {
          x: -1,
          y: meterToFeet(elevationApiResults[0].elevation),
        },
        {
          x: chartWidth + 1,
          y: meterToFeet(elevationApiResults[0].elevation),
        },
      ];
      setElevationSeries(elevations);
    }
  }, [isElevationLoaded]);

  function buildFlightCategorySeries() {
    if (queryNbmAllResult.isSuccess && isLoadedMGramData) {
      const timesToShow = getXAxisValues(chartWidth, interval);
      const flightCategoryData = [];
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
          flightCategoryData.push({
            x0: curr.index - interval / 2,
            x: interval * curr.index + interval / 2,
            y0: (-airportwxState.maxAltitude * 100) / 50,
            y: -airportwxState.maxAltitude / 5,
            color: flightCategoryColor,
            tooltip: {
              time: forecastTime,
              clouds: skyConditions,
              visibility: visibility,
              position: curr,
            },
          });
        } catch (err) {
          console.warn(err);
        }
      });
      setFlightCategorySeries(flightCategoryData);
    }
  }

  useEffect(() => {
    buildFlightCategorySeries();
  }, [queryNbmAllResult.isSuccess, isLoadedMGramData, airportwxState]);

  useEffect(() => {
    if (airportwxState) {
      const dx = (calcChartWidth(viewW, viewH) - 40) / (chartWidth + startMargin + endMargin);
      const dy =
        (calcChartHeight(viewW, viewH) - (isMobile ? 64 : 72) - (16 * windIconScale + 4)) /
        (airportwxState.maxAltitude * 100);
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
  }, [airportwxState, viewW, viewH, startMargin, windIconScale, isMobile]);

  return (
    <div
      className="scrollable-chart-content"
      style={{ width: calcChartWidth(viewW, viewH), height: calcChartHeight(viewW, viewH), position: 'relative' }}
    >
      {airportwxState && (
        <XYPlot
          key={viewH}
          height={calcChartHeight(viewW, viewH)}
          width={calcChartWidth(viewW, viewH)}
          color="white"
          yDomain={[0, airportwxState.maxAltitude * 100]}
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
                { x: -startMargin, y: airportwxState.maxAltitude * 100 },
                { x: chartWidth + endMargin, y: airportwxState.maxAltitude * 100 },
              ]}
              color={'url(#linear-gradient)'}
            />
          )}
          {!props.showDayNightBackground && (
            <AreaSeries
              data={[
                { x: -startMargin, y: airportwxState.maxAltitude * 100 },
                { x: chartWidth + endMargin, y: airportwxState.maxAltitude * 100 },
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
          {airportwxState.chartType === 'Wind' && (
            <HorizontalGridLines
              tickValues={Array.from({ length: 5 - 1 }, (_value, index) =>
                Math.round(((index + 1) * airportwxState.maxAltitude * 100) / 5),
              )}
              style={{
                stroke: 'grey',
                strokeWidth: 2,
              }}
            />
          )}
          <HorizontalGridLines
            tickValues={Array.from({ length: 5 }, (_value, index) =>
              Math.round(((index + 0.5) * airportwxState.maxAltitude * 100) / 5),
            )}
            style={{
              stroke: 'grey',
              strokeWidth: 0.2,
            }}
          />
          <XAxis
            tickValues={getXAxisValues(chartWidth, interval).map((x) => x.index)}
            tickFormat={(v, index) => {
              const currentHour = getCurrentHour();
              const time = new Date((currentHour + v) * hourInMili);
              const hour = userSettings.default_time_display_unit ? time.getHours() : time.getUTCHours();
              const offset = isMobile ? '1em' : '1.2em';
              return (
                <tspan dy={offset} className="chart-label">
                  <tspan className="chart-label-dist">
                    {addLeadingZeroes(hour, 2) + (userSettings.default_time_display_unit ? '' : 'Z')}
                  </tspan>
                </tspan>
              );
            }}
            style={{
              line: { stroke: '#ADDDE100' },
              ticks: { stroke: '#ADDDE100' },
              text: { stroke: 'none', fill: 'white', fontWeight: 600, marginTop: 36 },
            }}
          />
          {airportwxState.chartType !== 'Wind' && activeRoute ? props.children : null}
          {airportwxState.chartType !== 'Wind' && (
            <HorizontalGridLines
              tickValues={Array.from({ length: 5 - 1 }, (_value, index) =>
                Math.round(((index + 1) * airportwxState.maxAltitude * 100) / 5),
              )}
              style={{
                stroke: 'grey',
                strokeWidth: 2,
              }}
            />
          )}
          {airportwxState.chartType !== 'Turb' &&
            airportwxState.showTemperature &&
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
          {airportwxState.chartType !== 'Turb' && airportwxState.showTemperature && contourLabelData && (
            <LabelSeries animation allowOffsetToBeReversed data={contourLabelData}></LabelSeries>
          )}
          {airportwxState.chartType === 'Wind' && activeRoute ? props.children : null}
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
          <CustomSVGSeries
            color="white"
            data={[
              {
                x: -startMargin,
                y: airportwxState.maxAltitude * 100,
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
                  y: (airportwxState.maxAltitude * 100) / 2,
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
        </XYPlot>
      )}
    </div>
  );
};
export default MeteogramChart;
