import { Divider, Typography } from '@material-ui/core';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { PersonalMinimums, selectSettings } from '../../../../store/user/UserSettings';
import { MetarSkyValuesToString } from '../../common/AreoConstants';
import {
  addLeadingZeroes,
  celsiusToFahrenheit,
  convertTimeFormat,
  getAirportNameById,
  getMetarCeilingCategory,
  getMetarDecodedWxString,
  getMetarVisibilityCategory,
  getSkyConditions,
  knotsToMph,
  toTitleCase,
  visibilityMileToFraction,
  visibilityMileToMeter,
} from '../../common/AreoFunctions';
import { getCeilingFromMetars, getFlightCategoryIconUrl } from '../layers/StationMarkersLayer';

const MetarsPopup = ({
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
  const feature = layer.feature;
  const skyConditions = getSkyConditions(layer.feature);
  const ceiling = getCeilingFromMetars(layer.feature);
  const iconUrl = getFlightCategoryIconUrl(layer.feature);
  const [, ceilingColor] = getMetarCeilingCategory(ceiling, personalMinimums);
  const [, visibilityColor] = getMetarVisibilityCategory(feature.properties.visibility_statute_mi, personalMinimums);
  const skyConditionsAsc = skyConditions.sort((a, b) => {
    return a.cloudBase > b.cloudBase ? 1 : -1;
  });
  const weatherString = getMetarDecodedWxString(feature.properties.wx_string);
  const airportName = toTitleCase(getAirportNameById(feature.properties.station_id, airportsData));
  let vimi = feature.properties.visibility_statute_mi;
  if (vimi >= 4) {
    vimi = Math.ceil(vimi);
  }
  let visibility = !userSettings.default_visibility_unit
    ? `${visibilityMileToFraction(vimi)} statute ${vimi <= 1 ? 'mile' : 'miles'}`
    : `${visibilityMileToMeter(vimi)} meters`;
  if (vimi === 0.25 && feature.properties.raw_text.indexOf('M1/4SM') > -1) {
    visibility = 'Less than ' + visibility;
  }

  const windSpeed =
    feature.properties.wind_speed_kt === 0
      ? 'Calm'
      : !userSettings.default_wind_speed_unit
      ? feature.properties.wind_speed_kt + ' knots'
      : knotsToMph(feature.properties.wind_speed_kt) + ' mph';
  const windGust = !userSettings.default_wind_speed_unit
    ? feature.properties.wind_gust_kt + ' knots'
    : knotsToMph(feature.properties.wind_gust_kt) + ' mph';
  const crossWind = !userSettings.default_wind_speed_unit
    ? feature.properties.crosswind_component_kt + ' knots'
    : knotsToMph(feature.properties.crosswind_component_kt) + ' mph';

  return (
    <>
      <div style={{ display: 'flex' }}>
        <Image src={iconUrl} alt={''} width={16} height={16} />
        &nbsp;<b>{feature.properties.station_id}&nbsp;Surface observation</b>
      </div>
      <Divider></Divider>
      {airportName && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Airport name: </b>
          <span>{airportName}</span>
        </Typography>
      )}
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Time: </b> {convertTimeFormat(feature.properties.observation_time, userSettings.default_time_display_unit)}
      </Typography>
      {isFinite(ceiling) && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Ceiling: </b>
          <span style={{ color: ceilingColor }}>{ceiling} feet</span>
        </Typography>
      )}
      {feature.properties.visibility_statute_mi != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Visibility: </b>
          <span style={{ color: visibilityColor }}>{visibility}</span>
        </Typography>
      )}
      {skyConditionsAsc.length > 0 && (
        <div style={{ display: 'flex', lineHeight: 1, color: 'black' }} className="MuiTypography-body2">
          <div>
            <p style={{ margin: 3 }}>
              <b>Clouds: </b>
            </p>
          </div>
          <div style={{ margin: 3, marginTop: -5 }}>
            {skyConditionsAsc.map((skyCondition) => {
              return (
                <div key={`${skyCondition.skyCover}-${skyCondition.cloudBase}`} style={{ marginTop: 8 }}>
                  {MetarSkyValuesToString[skyCondition.skyCover]} {skyCondition.cloudBase}{' '}
                  {['CLR', 'SKC', 'CAVOK'].includes(skyCondition.skyCover) === false && 'feet'}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {weatherString && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Weather: </b>
          <span>{weatherString}</span>
        </Typography>
      )}
      {feature.properties.wind_speed_kt != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Wind speed: </b>
          <span>{windSpeed}</span>
        </Typography>
      )}
      {feature.properties.wind_dir_degrees !== null &&
        feature.properties.wind_dir_degrees !== 0 &&
        feature.properties.wind_speed_kt !== 0 &&
        feature.properties.wind_speed_kt !== null && (
          <Typography variant="body2" style={{ margin: 3 }}>
            <b>Wind direction: </b>
            <span>{addLeadingZeroes(feature.properties.wind_dir_degrees, 3)}&deg;</span>
          </Typography>
        )}
      {(feature.properties.wind_dir_degrees === null || feature.properties.wind_dir_degrees === 0) &&
        feature.properties.wind_speed_kt !== 0 &&
        feature.properties.wind_speed_kt !== null && (
          <Typography variant="body2" style={{ margin: 3 }}>
            <b>Wind direction: </b>
            <span>Variable</span>
          </Typography>
        )}
      {feature.properties.wind_gust_kt != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Wind gust: </b>
          <span>{windGust}</span>
        </Typography>
      )}
      {feature.properties.crosswind_component_kt != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Crosswind component: </b>
          <span>{crossWind}</span>
        </Typography>
      )}
      {feature.properties.crosswind_component_kt != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Crosswind runway: </b>
          <span>{feature.properties.crosswind_runway_id}</span>
        </Typography>
      )}
      {feature.properties.temp_c != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Temperature: </b>
          <span>
            {!userSettings.default_temperature_unit
              ? feature.properties.temp_c + ' \u00B0C'
              : celsiusToFahrenheit(feature.properties.temp_c) + ' \u00B0F'}
          </span>
        </Typography>
      )}
      {feature.properties.dewpoint_c != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Dewpoint: </b>
          <span>
            {!userSettings.default_temperature_unit
              ? feature.properties.dewpoint_c + ' \u00B0C'
              : celsiusToFahrenheit(feature.properties.dewpoint_c) + ' \u00B0F'}
          </span>
        </Typography>
      )}
      {feature.properties.relativehumiditypercent != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Relative humidity: </b>
          <span>{feature.properties.relativehumiditypercent} %</span>
        </Typography>
      )}
      {feature.properties.densityaltitudefeet != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Density altitude: </b>
          <span>{feature.properties.densityaltitudefeet} feet</span>
        </Typography>
      )}
      {feature.properties.altim_in_hg != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Altimeter: </b>
          <span>{feature.properties.altim_in_hg}" Hg</span>
        </Typography>
      )}
      <Divider></Divider>
      <Typography variant="body2" style={{ margin: 3, whiteSpace: 'pre-line' }}>
        <b>METAR: </b>
        {feature.properties.raw_text}
      </Typography>
    </>
  );
};
export default MetarsPopup;
