import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CustomSVGSeries, Hint, MarkSeries } from 'react-vis';
import { getValueFromDatasetByElevation } from '../../utils/utils';
import { selectSettings } from '../../store/user/UserSettings';
import { celsiusToFahrenheit, convertTimeFormat, getStandardTemp, round } from '../map/common/AreoFunctions';
import { addLeadingZeroes } from '../map/common/AreoFunctions';
import { windDataElevations } from '../../utils/constants';
import MeteogramChart, { getXAxisValues } from './MeteogramChart';
import { useGetAirportwxStateQuery, useGetMeteogramDataQuery } from '../../store/airportwx/airportwxApi';
import { selectCurrentAirportPos } from '../../store/airportwx/airportwx';

const MWindChart = () => {
  const currentAirportPos = useSelector(selectCurrentAirportPos);
  const { isSuccess: isLoadedMGramData, data: meteogramData } = useGetMeteogramDataQuery(currentAirportPos, {
    skip: currentAirportPos === null,
  });
  const userSettings = useSelector(selectSettings);
  const { data: airportwxState, isSuccess: isAirportwxStateLoaded } = useGetAirportwxStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const [chartWidth, setChartWidth] = useState(24);
  const [interval, setInterval] = useState(1);

  const [value2PixelRate, setValue2PixelRate] = useState({ dx: 1, dy: 1 });
  const [chartMargin, setChartMargin] = useState({ x: 0, y: 0 });
  const [chartSize, setChartSize] = useState({ x: 0, y: 0 });

  const [windSpeedSeries, setWindSpeedSeries] = useState(null);
  const [windHintValue, setWindHintValue] = useState(null);

  useEffect(() => {
    if (isAirportwxStateLoaded) {
      const chartWidth = airportwxState.chartDays === 1 ? 24 : 72;
      setChartWidth(chartWidth);
    }
  }, [isAirportwxStateLoaded, airportwxState]);

  function buildWindSeries() {
    if (isLoadedMGramData && meteogramData.windSpeed.length > 0) {
      const windSpeedData = [];
      const times = getXAxisValues(chartWidth, interval);
      times.forEach(({ index, time }) => {
        const x = index * interval;
        const elevations = windDataElevations[airportwxState.maxAltitude];
        if (!elevations) {
          return;
        }
        for (const el of elevations) {
          const { value: windSpeed, time: windspeedTime } = getValueFromDatasetByElevation(
            meteogramData.windSpeed,
            time,
            el,
            0,
          );
          if (!windspeedTime) {
            continue;
          }
          const { value: windDir } = getValueFromDatasetByElevation(meteogramData.windDirection, time, el, 0);
          const { value: temperature } = getValueFromDatasetByElevation(meteogramData.temperature, time, el, 0);
          // const headwind = flyjs.HeadWindCalculator(windSpeed, windDir, segment.course, 2);
          const backgroundColor = 'blue';
          // if (airportwxState.windLayer === 'HEAD/TAIL') {
          //   if (headwind <= -0.5) {
          //     backgroundColor = 'green';
          //   } else if (headwind < 0.5) {
          //     backgroundColor = 'black';
          //   } else {
          //     backgroundColor = 'red';
          //   }
          // }
          // const windText =
          //   airportwxState.windLayer === 'SPEED' ? Math.round(windSpeed) : Math.abs(Math.round(headwind));
          const windText = Math.round(windSpeed);
          const ry = 10;
          const rx = windText > 99 ? ry + 4 : ry;
          windSpeedData.push({
            x,
            y: el,
            tooltip: {
              position: currentAirportPos,
              time: windspeedTime,
              windSpeed: Math.round(windSpeed),
              windDir: Math.round(windDir),
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
  }, [isLoadedMGramData, meteogramData, airportwxState]);

  return (
    <MeteogramChart
      showDayNightBackground={true}
      noDataMessage={null}
      setValue2PixelRate={(dx, dy, marginX, marginY, width, height) => {
        setValue2PixelRate({ dx, dy });
        setChartMargin({ x: marginX, y: marginY });
        setChartSize({ x: width, y: height });
      }}
    >
      {windHintValue && (
        <MarkSeries
          data={[{ x: windHintValue.x, y: windHintValue.y, size: 40 }]}
          colorType="literal"
          sizeRange={[5, 13]}
        ></MarkSeries>
      )}
      {windSpeedSeries && (
        <CustomSVGSeries
          customComponent="circle"
          data={windSpeedSeries}
          onNearestXY={(value, { event }) => {
            const px = chartMargin.x + value2PixelRate.dx * value.x;
            const py = chartSize.y - value2PixelRate.dy * value.y - chartMargin.y;
            const distance = Math.pow(Math.pow(px - event.offsetX, 2) + Math.pow(py - event.offsetY, 2), 0.5);
            // console.log(px, py, event.offsetX, event.offsetY, distance);
            if (event.offsetY > chartMargin.y && distance < chartSize.y / 20) {
              const gfsTemp = userSettings.default_temperature_unit
                ? celsiusToFahrenheit(value.tooltip.temp, 1)
                : value.tooltip.temp;
              const stdTemp = getStandardTemp(value.y, userSettings.default_temperature_unit);
              value.tooltip.departureTemp = round(gfsTemp - stdTemp, 1);
              setWindHintValue(value);
            } else {
              setWindHintValue(null);
            }
          }}
          // onValueMouseOut={() => setWindHintValue(null)}
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
    </MeteogramChart>
  );
};
export default MWindChart;
