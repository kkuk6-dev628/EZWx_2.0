import { Divider, Typography } from '@material-ui/core';
import Image from 'next/image';
import { PersonalMinimums } from '../../../../store/user/UserSettings';
import { MetarSkyValuesToString } from '../../common/AreoConstants';
import {
  addLeadingZeroes,
  convertTimeFormat,
  getMetarCeilingCategory,
  getMetarVisibilityCategory,
  toTitleCase,
  visibilityMileToFraction,
  visibilityMileToMeter,
} from '../../common/AreoFunctions';
import { getNbmFlightCategoryIconUrl } from '../layers/StationMarkersLayer';

const StationForecastPopup = ({
  layer,
  personalMinimums,
  airportsData,
}: {
  layer: L.Marker;
  personalMinimums: PersonalMinimums;
  airportsData: any;
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
  }

  const skyConditionsAsc = skyConditions.sort((a, b) => {
    return a.cloudBase > b.cloudBase ? 1 : -1;
  });
  let airportName = airportsData.icaoid[feature.properties.icaoid]
    ? toTitleCase(airportsData.icaoid[feature.properties.icaoid])
    : null;
  if (!airportName) {
    airportName = toTitleCase(airportsData.faaid[feature.properties.faaid]);
  }
  let vimi = feature.properties.vis;
  if (vimi >= 4) {
    vimi = Math.ceil(vimi);
  }
  const visibility = true
    ? `${visibilityMileToFraction(vimi)} statute ${vimi <= 1 ? 'mile' : 'miles'}`
    : `${visibilityMileToMeter(vimi)} meters`;

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
        <b>Time: </b> {convertTimeFormat(feature.properties.valid_date)}
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
          <span>{feature.properties.w_speed === 0 ? 'Calm' : feature.properties.w_speed + ' knots'}</span>
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
          <span>{feature.properties.w_gust} knots</span>
        </Typography>
      )}
      {feature.properties.temp_c != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Temperature: </b>
          <span>{feature.properties.temp_c} &deg;C</span>
        </Typography>
      )}
      {feature.properties.dewp_c != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Dewpoint: </b>
          <span>{feature.properties.dewp_c} &deg;C</span>
        </Typography>
      )}
      {feature.properties.temp_c != null && feature.properties.dewp_c != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Relative humidity: </b>
          <span>{Math.round((feature.properties.temp_c / feature.properties.dewp_c) * 100)} %</span>
        </Typography>
      )}
    </>
  );
};
export default StationForecastPopup;
