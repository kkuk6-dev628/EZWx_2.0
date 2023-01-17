import { Divider, Typography } from '@material-ui/core';
import Image from 'next/image';
import { PersonalMinimums } from '../../../../store/user/UserSettings';
import {
  MetarMarkerTypes,
  MetarSkyValuesToString,
} from '../../common/AreoConstants';
import {
  convertTimeFormat,
  getMetarCeilingCategory,
  getMetarDecodedWxString,
  getMetarVisibilityCategory,
  getSkyCeilingValues,
} from '../../common/AreoFunctions';

const MetarsPopup = ({
  layer,
  markerType,
  personalMinimums,
}: {
  layer: L.Marker;
  markerType: string;
  personalMinimums: PersonalMinimums;
}) => {
  const feature = layer.feature;
  const [sky, ceiling] = getSkyCeilingValues(layer.feature, markerType);
  const [ceilingCat, ceilingColor] = getMetarCeilingCategory(
    ceiling,
    personalMinimums,
  );
  const [, visibilityColor] = getMetarVisibilityCategory(
    feature.properties.visibility_statute_mi,
    personalMinimums,
  );
  const skyString = MetarSkyValuesToString[sky];
  let weatherString = undefined;
  if (markerType === MetarMarkerTypes.weather.value) {
    weatherString = getMetarDecodedWxString(feature.properties.wx_string);
  }
  return (
    <>
      <div style={{ display: 'flex' }}>
        <Image
          src={`/icons/metar/${ceilingCat}-${sky}.png`}
          alt={''}
          width={16}
          height={16}
        />
        &nbsp;<b>{feature.properties.station_id}&nbsp;Surface observation</b>
      </div>
      <Divider></Divider>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Time: </b> {convertTimeFormat(feature.properties.observation_time)}
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
          <span style={{ color: visibilityColor }}>
            {feature.properties.visibility_statute_mi} statute miles
          </span>
        </Typography>
      )}
      {isFinite(ceiling) && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Clouds: </b>
          <span>
            {skyString} {ceiling} feet
          </span>
        </Typography>
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
          <span>
            {feature.properties.wind_speed_kt === 0
              ? 'Calm'
              : feature.properties.wind_speed_kt}
            &nbsp;knots
          </span>
        </Typography>
      )}
      {feature.properties.wind_dir_degrees != null &&
        feature.properties.wind_speed_kt === 0 &&
        feature.properties.wind_speed_kt === null && (
          <Typography variant="body2" style={{ margin: 3 }}>
            <b>Wind direction: </b>
            <span>{feature.properties.wind_dir_degrees}&deg;</span>
          </Typography>
        )}
      {feature.properties.wind_gust_kt != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Wind gust: </b>
          <span>{feature.properties.wind_gust_kt} knots</span>
        </Typography>
      )}
      {feature.properties.temp_c != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Temperature: </b>
          <span>{feature.properties.temp_c}&#8451;</span>
        </Typography>
      )}
      {feature.properties.dewpoint_c != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Dewpoint: </b>
          <span>{feature.properties.dewpoint_c}&#8451;</span>
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
      {feature.properties.alt_in_hg != null && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Altimeter: </b>
          <span>{feature.properties.alt_in_hg} &deg; Hg</span>
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
