import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VerticalRectSeries, CustomSVGSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import { getTimeGradientStops } from '../../utils/utils';
import {
  getIndexByElevation,
  getMaxForecastElevation,
  getMaxForecastTime,
  getMinMaxValueByElevation,
  getValueFromDataset,
  getValueFromDatasetByElevation,
} from '../../utils/utils';
import { cacheKeys, flightCategoryDivide, totalNumberOfElevations } from '../../utils/constants';
import { selectSettings } from '../../store/user/UserSettings';
import {
  useGetRouteProfileStateQuery,
  useQueryDepartureAdvisorDataMutation,
  useQueryIcingTurbDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import { hatchOpacity, visibleOpacity } from '../../utils/constants';
import { Conrec } from '../../conrec-js/conrec';
import { celsiusToFahrenheit, convertTimeFormat, round } from '../map/common/AreoFunctions';
import { Route } from '../../interfaces/route';
import { RouteProfileDataset, RouteSegment } from '../../interfaces/route-profile';
import flyjs from '../../fly-js/fly';
import { hourInMili } from '../../utils/constants';
import fly from '../../fly-js/fly';
import MeteogramChart, { getXAxisValues } from './MeteogramChart';
import { colorsByEdr } from './MTurbChart';
import { selectCurrentAirportPos } from '../../store/airportwx/airportwx';
import { useGetMeteogramDataQuery, useGetAirportwxStateQuery } from '../../store/airportwx/airportwxApi';

export const icingSevLegend = [
  { value: 0, color: '#F6F6F6', label: 'None' },
  { value: 4, color: '#CEFFFC', label: 'Trace' },
  { value: 1, color: '#99CEFF', label: 'Light' },
  { value: 2, color: '#0096FF', label: 'Moderate' },
  { value: 5, color: '#3031FF', label: 'Heavy' },
];

const icingProbLegend = [
  { value: 10, color: '#FFFFFF00', label: '10' },
  { value: 20, color: '#9AFFCD', label: '20' },
  { value: 30, color: '#9AFF66', label: '30' },
  { value: 40, color: '#CDFF66', label: '40' },
  { value: 50, color: '#FFFF00', label: '50' },
  { value: 60, color: '#FFCD00', label: '60' },
  { value: 70, color: '#FF9A00', label: '70' },
  { value: 80, color: '#FF6600', label: '80' },
  { value: 85, color: '#FF3000', label: '85' },
];

const icingSldLegend = [
  { value: 10, color: '#FFFFFF00', label: '10' },
  { value: 20, color: '#9AFFCD', label: '20' },
  { value: 30, color: '#9AFF66', label: '30' },
  { value: 40, color: '#CDFF66', label: '40' },
  { value: 50, color: '#FFFF00', label: '50' },
  { value: 60, color: '#FFCD00', label: '60' },
  { value: 70, color: '#FF9A00', label: '70' },
  { value: 80, color: '#FF6600', label: '80' },
  { value: 90, color: '#FF3000', label: '90' },
  { value: 100, color: '#CD0000', label: '100' },
];

const noIcingAbove30000Msg = 'No icing forecast available above 30,000 feet';

const MIcingChart = (props) => {
  const currentAirportPos = useSelector(selectCurrentAirportPos);
  const { isSuccess: isLoadedMGramData, data: meteogramData } = useGetMeteogramDataQuery(currentAirportPos, {
    skip: currentAirportPos === null,
  });
  const userSettings = useSelector(selectSettings);
  const { data: airportwxState, isSuccess: isAirportwxStateLoaded } = useGetAirportwxStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const chartWidth = 24 * airportwxState.chartDays;
  const interval = 1;
  const [noForecast, setNoForecast] = useState(false);
  const [noDepicted, setNoDepicted] = useState(false);

  const [icingSeries, setIcingSeries] = useState(null);
  const [icingHint, setIcingHint] = useState(null);

  function buildIcingSeries() {
    if (isLoadedMGramData && meteogramData.prob) {
      const icingData = [];
      const maxForecastTime = getMaxForecastTime(meteogramData.prob);
      const maxForecastElevation = getMaxForecastElevation(meteogramData.prob);
      if (Date.now() > maxForecastTime.getTime() + hourInMili) {
        setNoForecast(true);
        setNoDepicted(false);
        setIcingSeries(null);
        return;
      }
      setNoForecast(false);
      setNoDepicted(true);
      const accDistance = 0;
      const maxElevation = Math.min(airportwxState.maxAltitude * 100, maxForecastElevation);
      const times = getXAxisValues(chartWidth, interval);
      times.forEach(({ time, index }) => {
        for (let elevation = 1000; elevation <= maxElevation; elevation += 1000) {
          let color = colorsByEdr.none;
          let opacity = visibleOpacity;
          let hint;
          if (time.getTime() > maxForecastTime.getTime() + hourInMili) {
            color = '#666';
            opacity = hatchOpacity;
            hint = {
              time: time,
              altitude: elevation,
              prob: 'None',
              sev: 'None',
              sld: 'None',
            };
          } else {
            let { value: prob, time: provTime } = getValueFromDatasetByElevation(
              meteogramData.prob,
              time,
              elevation,
              0,
            );
            prob = Math.round(prob);
            provTime = provTime ?? time;
            let { value: sld } = getValueFromDatasetByElevation(meteogramData.sld, time, elevation, 0);
            sld = Math.round(sld);
            let { value: sev } = getValueFromDatasetByElevation(meteogramData.sev, time, elevation, 0);
            sev = Math.round(sev);

            let sevData;
            for (const sevItem of icingSevLegend) {
              if (sevItem.value === sev) {
                sevData = sevItem;
                break;
              }
            }
            if (!sevData) {
              sevData = icingSevLegend[0];
            }

            if (airportwxState.icingLayers.includes('Prob')) {
              const probItem = icingProbLegend.reduce((prev, curr) => {
                const prevDiff = prev.value - prob;
                const currDiff = curr.value - prob;
                if (currDiff > 0 && (prevDiff < 0 || currDiff < prevDiff)) {
                  return curr;
                }
                return prev;
              });
              color = probItem.color;
              opacity = prob < 10 ? 0 : visibleOpacity;
              if (prob >= 10) {
                setNoDepicted(false);
              }
            } else if (airportwxState.icingLayers.includes('SLD')) {
              const sldItem = icingSldLegend.reduce((prev, curr) => {
                const prevDiff = prev.value - sld;
                const currDiff = curr.value - sld;
                if (currDiff >= 0 && (prevDiff < 0 || currDiff < prevDiff)) {
                  return curr;
                }
                return prev;
              });
              color = sldItem.color;
              opacity = sld < 10 ? 0 : visibleOpacity;
              if (sld >= 10) {
                setNoDepicted(false);
              }
              if (sld < 10 && airportwxState.icingLayers.includes('Sev')) {
                opacity = sev === 0 ? 0 : visibleOpacity;
                color = sevData.color;
                if (sev > 0) {
                  setNoDepicted(false);
                }
              }
            } else if (airportwxState.icingLayers.includes('Sev')) {
              opacity = sev === 0 ? 0 : visibleOpacity;
              color = sevData.color;
              if (sev > 0) {
                setNoDepicted(false);
              }
            }
            hint = {
              time: provTime,
              altitude: elevation,
              prob: prob !== null ? prob + ' %' : 'None',
              sev: sevData.label,
              sld: sld ? sld + ' %' : 'None',
            };
          }
          icingData.push({
            x0: index - interval / 2,
            y0: elevation - 500,
            x: index + interval / 2,
            y: elevation + 500,
            color: color,
            opacity: opacity,
            hint,
          });
        }
      });
      setIcingSeries(icingData);
    }
  }

  useEffect(() => {
    buildIcingSeries();
  }, [isLoadedMGramData, airportwxState]);

  return (
    <MeteogramChart
      showDayNightBackground={true}
      noDataMessage={
        noDepicted
          ? 'No icing forecast depicted for this departure time'
          : noForecast
          ? 'No icing forecast available for this departure time'
          : null
      }
      noIcingAbove30000={noForecast || airportwxState.maxAltitude !== 500 ? null : noIcingAbove30000Msg}
    >
      {icingSeries && (
        <VerticalRectSeries
          colorType="literal"
          stroke="transparent"
          data={icingSeries}
          style={{ strokeWidth: 0 }}
          onValueMouseOut={() => setIcingHint(null)}
          onValueMouseOver={(value) =>
            setIcingHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })
          }
          onValueClick={(value) => setIcingHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })}
        ></VerticalRectSeries>
      )}

      {icingHint && icingHint.color !== '#666' ? (
        <Hint value={icingHint} className="icing-tooltip">
          <span>
            <b>Time:</b> {convertTimeFormat(icingHint.hint.time, userSettings.default_time_display_unit)}
          </span>
          <span>
            <b>Altitude:</b> {icingHint.hint.altitude} feet MSL
          </span>
          <span>
            <b>Probability:</b> {icingHint.hint.prob}
          </span>
          <span>
            <b>Severity:</b> {icingHint.hint.sev}
          </span>
          <span>
            <b>SLD Potential:</b> {icingHint.hint.sld}
          </span>
        </Hint>
      ) : null}
    </MeteogramChart>
  );
};
export default MIcingChart;
