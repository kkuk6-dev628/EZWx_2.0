import { Divider, Typography } from '@material-ui/core';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { PersonalMinimums, selectSettings } from '../../../../store/user/UserSettings';
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
  const feature = layer.feature;
  const iconUrl = getNbmFlightCategoryIconUrl(layer.feature, personalMinimums);
  const ceiling = layer.feature.properties.ceil;
  const [, ceilingColor] = getMetarCeilingCategory(ceiling, personalMinimums);
  const [, visibilityColor] = getMetarVisibilityCategory(feature.properties.vis, personalMinimums);
  const skyConditions = [];
  const skyCover = feature.properties.skycov;
  const lowestCloud = layer.feature.properties.l_cloud;
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
  const airportName = toTitleCase(
    feature.properties.icaoid
      ? getAirportNameById(feature.properties.icaoid, airportsData)
      : getAirportNameById(feature.properties.faaid, airportsData),
  );
  let vimi = feature.properties.vis;
  if (vimi >= 4) {
    vimi = Math.ceil(vimi);
  }
  const visibility = !userSettings.default_visibility_unit
    ? `${visibilityMileToFraction(vimi)} statute ${vimi <= 1 ? 'mile' : 'miles'}`
    : `${visibilityMileToMeter(vimi)} meters`;
  const windSpeed =
    feature.properties.w_speed === 0
      ? 'Calm'
      : !userSettings.default_wind_speed_unit
      ? feature.properties.w_speed + ' knots'
      : knotsToMph(feature.properties.w_speed) + ' mph';
  const windGust = !userSettings.default_wind_speed_unit
    ? feature.properties.w_gust + ' knots'
    : knotsToMph(feature.properties.w_gust) + ' mph';

  const crossWind = !userSettings.default_wind_speed_unit
    ? feature.properties.cross_com + ' knots'
    : knotsToMph(feature.properties.cross_com) + ' mph';

  return (
    <>
      <div style={{ display: 'flex' }}>
        <Image src={iconUrl} alt={''} width={16} height={16} />
        &nbsp;
        <b>
          {feature.properties.icaoid ? feature.properties.icaoid : feature.properties.faaid}
          &nbsp;EZForecast
        </b>
      </div>
      <Divider></Divider>
      {airportName && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Name: </b>
          <span>{airportName}</span>
        </Typography>
      )}
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Time: </b> {convertTimeFormat(feature.properties.valid_date, userSettings.default_time_display_unit)}
      </Typography>
      {ceiling && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Ceiling: </b>
          <span style={{ color: ceilingColor }}>{ceiling} feet</span>
        </Typography>
      )}
      {feature.properties.vis != null && (
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
                  {MetarSkyValuesToString[skyCondition.skyCover]}{' '}
                  {['CLR', 'SKC', 'CAVOK'].includes(skyCondition.skyCover) === false &&
                    skyCondition.cloudBase + ' feet'}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {feature.properties.w_speed != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Wind speed: </b>
          <span>{windSpeed}</span>
        </Typography>
      )}
      {feature.properties.w_dir !== null &&
        feature.properties.w_dir !== 0 &&
        feature.properties.w_speed !== 0 &&
        feature.properties.w_speed !== null && (
          <Typography variant="body2" style={{ margin: 3 }}>
            <b>Wind direction: </b>
            <span>{addLeadingZeroes(feature.properties.w_dir, 3)}&deg;</span>
          </Typography>
        )}
      {(feature.properties.w_dir === null || feature.properties.w_dir === 0) &&
        feature.properties.w_speed !== 0 &&
        feature.properties.w_speed !== null && (
          <Typography variant="body2" style={{ margin: 3 }}>
            <b>Wind direction: </b>
            <span>Variable</span>
          </Typography>
        )}
      {feature.properties.w_gust != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Wind gust: </b>
          <span>{windGust}</span>
        </Typography>
      )}
      {feature.properties.cross_com != null && (feature.properties.w_dir || !feature.properties.w_speed) && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Crosswind component: </b>
          <span>{crossWind}</span>
        </Typography>
      )}
      {feature.properties.cross_com != null && (feature.properties.w_dir || !feature.properties.w_speed) && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Crosswind runway: </b>
          <span>{feature.properties.cross_r_id}</span>
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
      {feature.properties.dewp_c != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Dewpoint: </b>
          <span>
            {!userSettings.default_temperature_unit
              ? feature.properties.dewp_c + ' \u00B0C'
              : celsiusToFahrenheit(feature.properties.dewp_c) + ' \u00B0F'}
          </span>
        </Typography>
      )}
      {feature.properties.temp_c != null && feature.properties.dewp_c != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Relative humidity: </b>
          <span>{Math.round(calcRelativeHumidity(feature.properties.temp_c, feature.properties.dewp_c))} %</span>
        </Typography>
      )}
    </>
  );
};
export default StationForecastPopup;
