import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VerticalRectSeries, LineSeries, Hint, LabelSeries } from 'react-vis';
import { selectActiveRoute } from '../../store/route/routes';
import { getIndexByElevation, getMaxForecastTime, getValueFromDatasetByElevation } from '../../utils/utils';
import { cacheKeys, flightCategoryDivide } from '../../utils/constants';
import { selectSettings } from '../../store/user/UserSettings';
import {
  useGetRouteProfileStateQuery,
  useQueryDepartureAdvisorDataMutation,
  useQueryIcingTurbDataMutation,
} from '../../store/route-profile/routeProfileApi';
import { selectRouteSegments } from '../../store/route-profile/RouteProfile';
import { convertTimeFormat } from '../map/common/AreoFunctions';
import { hourInMili } from '../../utils/constants';
import fly from '../../fly-js/fly';
import MeteogramChart, { getXAxisValues } from './MeteogramChart';
import { selectCurrentAirportPos } from '../../store/airportwx/airportwx';
import { useGetMeteogramDataQuery, useGetAirportwxStateQuery } from '../../store/airportwx/airportwxApi';
import {
  interpolateRouteByInterval,
  getSegmentsCount,
  calcHighResolution,
  calcEndMargin,
  getRouteLength,
} from '../route-profile/RouteProfileDataLoader';

export const takeoffEdrTable = {
  light: { light: 13, moderate: 16, severe: 36, extreme: 64 },
  medium: { light: 15, moderate: 20, severe: 44, extreme: 79 },
  heavy: { light: 17, moderate: 24, severe: 54, extreme: 96 },
};

export const colorsByEdr = {
  none: '#00000000',
  light: '#CCFF00',
  moderate: '#FF9900',
  severe: '#FF0000',
  extreme: '#660000',
  na: '#666',
};

const MTurbChart = (props) => {
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
  const [turbSeries, setTurbSeries] = useState([]);
  const [turbHint, setTurbHint] = useState(null);
  const [noForecast, setNoForecast] = useState(false);
  const [noDepicted, setNoDepicted] = useState(false);

  function buildTurbSeries() {
    if (isLoadedMGramData && meteogramData.cat) {
      const maxForecastTime = getMaxForecastTime(meteogramData.cat);
      const turbData = [];
      const times = getXAxisValues(chartWidth, interval);

      let existTurbulence = false;
      if (Date.now() > maxForecastTime.getTime() + hourInMili) {
        setNoForecast(true);
        setNoDepicted(false);
        setTurbSeries([]);
        return;
      }
      setNoForecast(false);
      const maxElevation = airportwxState.maxAltitude * 100;
      let hasNoData = false;
      times.forEach(({ time, index }) => {
        for (let elevation = 1000; elevation <= maxElevation; elevation += 1000) {
          let edr = 0;
          let edrTime;
          let edrType = 'Combined EDR';
          let color = colorsByEdr.none;
          let category = 'None';
          let opacity = 0.8;
          if (time.getTime() > maxForecastTime.getTime() + hourInMili) {
            category = 'N/A';
            color = colorsByEdr.na;
            edr = null;
            edrTime = time;
            hasNoData = true;
            if (airportwxState.turbLayers.includes('CAT') && airportwxState.turbLayers.includes('MWT')) {
              edrType = 'Combined EDR';
            } else if (airportwxState.turbLayers.includes('CAT')) {
              edrType = 'Clear Air EDR';
            } else if (airportwxState.turbLayers.includes('MWT')) {
              edrType = 'Mountain Wave EDR';
            }
          } else {
            if (airportwxState.turbLayers.includes('CAT') && airportwxState.turbLayers.includes('MWT')) {
              const caturb = getValueFromDatasetByElevation(meteogramData?.cat, time, elevation, 0);
              const mwturb = getValueFromDatasetByElevation(meteogramData?.mwt, time, elevation, 0);
              edr = Math.max(caturb.value, mwturb.value);
              edrTime = caturb.time;
              edrType = 'Combined EDR';
            } else if (airportwxState.turbLayers.includes('CAT')) {
              const data = getValueFromDatasetByElevation(meteogramData?.cat, time, elevation, 0);
              edr = data.value;
              edrTime = data.time;
              edrType = 'Clear Air EDR';
            } else if (airportwxState.turbLayers.includes('MWT')) {
              ({ value: edr, time: edrTime } = getValueFromDatasetByElevation(meteogramData?.mwt, time, elevation, 0));
              edrType = 'Mountain Wave EDR';
            }

            edr = Math.round(edr);
            const edrCategory = takeoffEdrTable[userSettings.max_takeoff_weight_category];
            if (edr >= edrCategory.extreme) {
              color = colorsByEdr.extreme;
              category = 'Extreme';
              existTurbulence = true;
            } else if (edr >= edrCategory.severe) {
              color = colorsByEdr.severe;
              category = 'Severe';
              existTurbulence = true;
            } else if (edr >= edrCategory.moderate) {
              color = colorsByEdr.moderate;
              category = 'Moderate';
              existTurbulence = true;
            } else if (edr >= edrCategory.light) {
              color = colorsByEdr.light;
              category = 'Light';
              existTurbulence = true;
            }
            opacity = edr < edrCategory.light ? 0 : 0.5;
            if (edrTime === null) {
              edrTime = time;
              color = colorsByEdr.na;
              category = 'N/A';
            }
          }
          turbData.push({
            x0: index - interval / 2,
            y0: elevation - 502,
            x: index + interval / 2,
            y: elevation + 502,
            color: color,
            opacity: opacity,
            hint: {
              edrValue: edr,
              edrType: edrType,
              time: edrTime,
              altitude: elevation,
              category: category,
            },
          });
        }
      });

      setNoDepicted(!existTurbulence);
      setTurbSeries(turbData);
    }
  }

  useEffect(() => {
    buildTurbSeries();
  }, [isLoadedMGramData, airportwxState, userSettings.max_takeoff_weight_category]);

  return (
    <MeteogramChart showDayNightBackground={true} noDataMessage={null}>
      {turbSeries && (
        <VerticalRectSeries
          colorType="literal"
          stroke="#AAAAAA"
          data={turbSeries}
          style={{ strokeWidth: 0.1 }}
          onValueMouseOut={() => setTurbHint(null)}
          onValueMouseOver={(value) =>
            setTurbHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })
          }
          onValueClick={(value) => setTurbHint({ ...value, x: (value.x + value.x0) / 2, y: (value.y + value.y0) / 2 })}
        ></VerticalRectSeries>
      )}
      {turbHint && turbHint.color !== colorsByEdr.na && (
        <Hint value={turbHint} className="turbulence-tooltip">
          <span>
            <b>Time:</b> {convertTimeFormat(turbHint.hint.time, userSettings.default_time_display_unit)}
          </span>
          <span>
            <b>Altitude:</b> {turbHint.hint.altitude} feet MSL
          </span>
          <span>
            <b>{turbHint.hint.edrType}:</b>{' '}
            {turbHint.hint.edrValue ? turbHint.hint.edrValue : 'No EDR forecast available for this time'}
          </span>
          <span>
            <b>Category:</b> {turbHint.hint.category}
          </span>
        </Hint>
      )}
    </MeteogramChart>
  );
};
export default MTurbChart;
