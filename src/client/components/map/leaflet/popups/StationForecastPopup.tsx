import { Divider } from '@material-ui/core';
import Image from 'next/image';
import { PersonalMinimums } from '../../../../store/user/UserSettings';
import { MetarSkyValuesToString } from '../../common/AreoConstants';
import {
  addLeadingZeroes,
  calcRelativeHumidity,
  celsiusToFahrenheit,
  convertTimeFormat,
  getAirportNameById,
  getMetarCeilingCategory,
  getMetarVisibilityCategory,
  knotsToMph,
  toTitleCase,
  visibilityMileToFraction,
  visibilityMileToMeter,
} from '../../common/AreoFunctions';
import { getNbmFlightCategoryIconUrl } from '../layers/StationMarkersLayer';
import { makeSkyConditions } from '../../../route-profile/RouteProfileChart';

const probStrings = {
  1: 'Slight chance',
  2: 'Chance',
  3: 'Likely chance',
  4: 'Definite chance',
  5: 'Isolated',
  6: 'Scattered',
  7: 'Numerous',
};

const wxStrings = {
  1: 'rain',
  2: 'freezing rain',
  3: 'snow',
  4: 'thunderstorms',
  5: 'rain showers',
  6: 'ice pellets',
  7: 'snow showers',
  8: 'fog',
};

const intenStrings = {
  1: 'light',
  2: 'moderate',
  3: 'heavy',
};

export const makeWeatherString = (
  wx: number,
  prob: number,
  inten: number,
  skyCov: number,
  w_speed: number,
  w_gust: number,
  addCloudCover: boolean,
): string => {
  if (!wx) {
    if (w_speed > 20 && w_gust > 25) {
      return 'Wind over 20 knots and/or wind gust over 25 knots';
    } else {
      if (skyCov < 6) {
        return 'Fair/clear';
      } else if (skyCov < 31) {
        return 'Mostly clear';
      } else if (skyCov < 58) {
        return 'Partly cloudy';
      } else if (skyCov < 88) {
        return 'Mostly cloudy';
      } else {
        return 'Cloudy';
      }
    }
  } else if (wx === 4) {
    let skyString = 'Cloudy';
    if (skyCov < 6) {
      skyString = 'Fair/clear';
    } else if (skyCov < 31) {
      skyString = 'Mostly clear';
    } else if (skyCov < 58) {
      skyString = 'Partly cloudy';
    } else if (skyCov < 88) {
      skyString = 'Mostly cloudy';
    } else {
      skyString = 'Cloudy';
    }
    return addCloudCover
      ? `${skyString} with ${probStrings[prob].toLowerCase()} ${wxStrings[wx]}`
      : `${probStrings[prob]} ${wxStrings[wx]}`;
  } else if (wx === 5) {
    let skyString = 'Cloudy';
    if (skyCov < 6) {
      skyString = 'Fair/clear';
    } else if (skyCov < 31) {
      skyString = 'Mostly clear';
    } else if (skyCov < 58) {
      skyString = 'Partly cloudy';
    } else if (skyCov < 88) {
      skyString = 'Mostly cloudy';
    } else {
      skyString = 'Cloudy';
    }
    return addCloudCover
      ? `${skyString} with a ${probStrings[prob].toLowerCase()} of ${intenStrings[inten]} ${wxStrings[wx]}`
      : `${probStrings[prob]} of ${intenStrings[inten]} ${wxStrings[wx]}`;
  } else {
    if (wx in wxStrings && prob in probStrings && inten in intenStrings) {
      return `${probStrings[prob]} of ${intenStrings[inten]} ${wxStrings[wx]}`;
    }
  }
};

const StationForecastPopup = ({
  layer,
  personalMinimums,
  airportsData,
  userSettings,
}: {
  layer: L.Marker;
  personalMinimums: PersonalMinimums;
  airportsData: any;
  userSettings: any;
}) => {
  const properties = layer.feature.properties;
  // console.log(
  //   properties.icaoid,
  //   properties.faaid,
  //   properties.wx_1,
  //   properties.wx_prob_cov_1,
  //   properties.wx_inten_1,
  //   properties.wx_2,
  //   properties.wx_prob_cov_2,
  //   properties.wx_inten_2,
  //   properties.wx_3,
  //   properties.wx_prob_cov_3,
  //   properties.wx_inten_3,
  // );
  const iconUrl = getNbmFlightCategoryIconUrl(layer.feature, personalMinimums);
  const ceiling = properties.ceil;
  const [, ceilingColor] = getMetarCeilingCategory(ceiling, personalMinimums);
  const [, visibilityColor] = getMetarVisibilityCategory(properties.vis, personalMinimums);
  const skyCover = properties.skycov;
  const lowestCloud = properties.l_cloud;
  const skyConditionsAsc = makeSkyConditions(lowestCloud, ceiling, skyCover);
  const airportName = toTitleCase(
    properties.icaoid
      ? getAirportNameById(properties.icaoid, airportsData)
      : getAirportNameById(properties.faaid, airportsData),
  );
  let vimi = properties.vis;
  if (vimi >= 4) {
    vimi = Math.ceil(vimi);
  }
  const visibility = !userSettings.default_visibility_unit
    ? visibilityMileToFraction(vimi)
    : visibilityMileToMeter(vimi);
  const windSpeed =
    properties.w_speed === 0
      ? 'Calm'
      : !userSettings.default_wind_speed_unit
      ? properties.w_speed + (properties.w_speed <= 1 ? ' knot' : ' knots')
      : knotsToMph(properties.w_speed) + ' mph';
  const windGust = !userSettings.default_wind_speed_unit
    ? properties.w_gust + (properties.w_gust <= 1 ? ' knot' : ' knots')
    : knotsToMph(properties.w_gust) + ' mph';

  const crossWind = !userSettings.default_wind_speed_unit
    ? properties.cross_com + (properties.cross_com <= 1 ? ' knot' : ' knots')
    : knotsToMph(properties.cross_com) + ' mph';

  const weatherLines = [];
  weatherLines.push(
    makeWeatherString(
      properties.wx_1,
      properties.wx_prob_cov_1,
      properties.wx_inten_1,
      skyCover,
      properties.w_speed,
      properties.w_gust,
      true,
    ),
  );
  if (properties.wx_2) {
    weatherLines.push(
      makeWeatherString(
        properties.wx_2,
        properties.wx_prob_cov_2,
        properties.wx_inten_2,
        skyCover,
        properties.w_speed,
        properties.w_gust,
        false,
      ),
    );
  }
  if (properties.wx_3) {
    weatherLines.push(
      makeWeatherString(
        properties.wx_3,
        properties.wx_prob_cov_3,
        properties.wx_inten_3,
        skyCover,
        properties.w_speed,
        properties.w_gust,
        false,
      ),
    );
  }

  return (
    <>
      <div style={{ display: 'flex' }}>
        <Image src={iconUrl} alt={''} width={16} height={16} loading="eager" />
        &nbsp;
        <b>
          {properties.icaoid ? properties.icaoid : properties.faaid}
          &nbsp;EZForecast
        </b>
      </div>
      <Divider></Divider>
      <div className="popup-content">
        {airportName && (
          <div style={{ margin: 3 }}>
            <b>Name: </b>
            <span>{airportName}</span>
          </div>
        )}
        <div style={{ margin: 3 }}>
          <b>Time: </b> {convertTimeFormat(properties.valid_date, userSettings.default_time_display_unit)}
        </div>
        {ceiling && (
          <div style={{ margin: 3 }}>
            <b>Ceiling: </b>
            <span style={{ color: ceilingColor }}>{ceiling} feet</span>
          </div>
        )}
        {skyConditionsAsc.length > 0 && (
          <div style={{ display: 'flex', lineHeight: 1, color: 'black' }}>
            <div>
              <p style={{ margin: 3 }}>
                <b>Clouds: </b>
              </p>
            </div>
            <div style={{ margin: 3, marginTop: -5 }}>
              {skyConditionsAsc.map((skyCondition) => {
                return (
                  <div key={`${skyCondition.skyCover}-${skyCondition.cloudBase}`} style={{ marginTop: 8 }}>
                    {MetarSkyValuesToString[skyCondition.skyCover]}{' '}
                    {['CLR', 'SKC', 'CAVOK'].includes(skyCondition.skyCover) === false &&
                      ' at ' + skyCondition.cloudBase + ' feet'}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {properties.vis != null && (
          <div style={{ margin: 3 }}>
            <b>Visibility: </b>
            <span style={{ color: visibilityColor }}>{visibility}</span>
          </div>
        )}
        <div style={{ display: 'flex', lineHeight: 1, color: 'black' }}>
          <div>
            <p style={{ margin: 3 }}>
              <b>Weather: </b>
            </p>
          </div>
          <div style={{ margin: 3, marginTop: -5 }}>
            {weatherLines.map((weatherLine, index) => {
              return (
                <div key={`${weatherLine}-${index}`} style={{ marginTop: 8 }}>
                  {weatherLine}
                </div>
              );
            })}
          </div>
        </div>
        {properties.w_speed != null && (
          <div style={{ margin: 3 }}>
            <b>Wind speed: </b>
            <span>{windSpeed}</span>
          </div>
        )}
        {properties.w_dir !== null &&
          properties.w_dir !== 0 &&
          properties.w_speed !== 0 &&
          properties.w_speed !== null && (
            <div style={{ margin: 3 }}>
              <b>Wind direction: </b>
              <span>{addLeadingZeroes(properties.w_dir, 3)}&deg;</span>
            </div>
          )}
        {(properties.w_dir === null || properties.w_dir === 0) &&
          properties.w_speed !== 0 &&
          properties.w_speed !== null && (
            <div style={{ margin: 3 }}>
              <b>Wind direction: </b>
              <span>Variable</span>
            </div>
          )}
        {properties.w_gust != null && (
          <div style={{ margin: 3 }}>
            <b>Wind gust: </b>
            <span>{windGust}</span>
          </div>
        )}
        {properties.cross_com != null && (
          <div style={{ margin: 3 }}>
            <b>Crosswind component: </b>
            <span>{crossWind}</span>
          </div>
        )}
        {properties.cross_com != null && (
          <div style={{ margin: 3 }}>
            <b>Crosswind runway: </b>
            <span>{properties.cross_r_id}</span>
          </div>
        )}
        {properties.temp_c != null && (
          <div style={{ margin: 3 }}>
            <b>Temperature: </b>
            <span>
              {!userSettings.default_temperature_unit
                ? properties.temp_c + ' \u00B0C'
                : celsiusToFahrenheit(properties.temp_c) + ' \u00B0F'}
            </span>
          </div>
        )}
        {properties.dewp_c != null && (
          <div style={{ margin: 3 }}>
            <b>Dewpoint: </b>
            <span>
              {!userSettings.default_temperature_unit
                ? properties.dewp_c + ' \u00B0C'
                : celsiusToFahrenheit(properties.dewp_c) + ' \u00B0F'}
            </span>
          </div>
        )}
        {properties.temp_c != null && properties.dewp_c != null && (
          <div style={{ margin: 3 }}>
            <b>Relative humidity: </b>
            <span>{Math.round(calcRelativeHumidity(properties.temp_c, properties.dewp_c))} %</span>
          </div>
        )}
      </div>
    </>
  );
};
export default StationForecastPopup;
