import { Divider, Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';
import { convertTimeFormat, getAltitudeString } from '../../AreoFunctions';

const SigmetPopup = ({ feature }) => {
  let title = 'G_AIRMET';
  let base;
  if (
    isNaN(parseInt(feature.properties.altitudelow1)) ||
    feature.properties.altitudelow1 == '0'
  ) {
    base = 'Surface';
  } else {
    base = getAltitudeString(feature.properties.altitudelow1);
  }
  if (feature.properties.hazard === 'CONVECTIVE') {
    base = undefined;
  }

  let top = getAltitudeString(feature.properties.altitudehi2);
  if (feature.properties.altitudehi2 == '600') {
    top = 'Above 45,000 feet MSL';
  } else if (
    isNaN(parseInt(feature.properties.altitudehi1)) &&
    isNaN(parseInt(feature.properties.altitudehi2))
  ) {
    top = undefined;
  }
  switch (feature.properties.hazard) {
    case 'TURB':
      title = `SIGMET for Severe Turbulence`;
      break;
    case 'CONVECTIVE':
      title = `SIGMET for Convection`;
      break;
    case 'ICE':
      title = `SIGMET for Severe Icing`;
      break;
    case 'IFR':
      title = `SIGMET for Dust/Sandstorms`;
      break;
    case 'ASH':
      title = `SIGMET for Volcanic Ash`;
      break;
  }

  return (
    <BasePopupFrame title={title}>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Valid:</b> {convertTimeFormat(feature.properties.validtimefrom)}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Through:</b> {convertTimeFormat(feature.properties.validtimeto)}
      </Typography>
      {top && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Top:</b> {top}
        </Typography>
      )}
      {base && (
        <Typography variant="body2" style={{ margin: 3 }}>
          <b>Base:</b> {base}
        </Typography>
      )}
      <Divider></Divider>
      <Typography variant="body2" style={{ margin: 3, whiteSpace: 'pre-wrap' }}>
        {feature.properties.rawairsigmet}
      </Typography>
    </BasePopupFrame>
  );
};
export default SigmetPopup;
