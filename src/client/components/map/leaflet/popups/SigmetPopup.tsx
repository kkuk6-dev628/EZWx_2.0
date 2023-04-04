import { Divider } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';
import { convertTimeFormat, getAltitudeString } from '../../common/AreoFunctions';

const SigmetPopup = ({ feature, userSettings }) => {
  let title = 'SIGMET';
  let base;
  if (isNaN(parseInt(feature.properties.altitudelow)) || feature.properties.altitudelow == '0') {
    base = 'Surface';
  } else {
    base = getAltitudeString(feature.properties.altitudelow, false);
  }
  if (feature.properties.hazard === 'CONVECTIVE') {
    base = undefined;
  }

  let top = getAltitudeString(feature.properties.altitudehi, false);
  if (feature.properties.altitudehi == '60000') {
    top = 'Above 45,000 feet MSL';
  } else if (isNaN(parseInt(feature.properties.altitudehi))) {
    top = undefined;
  }
  switch (feature.properties.hazard) {
    case 'TURB':
      title = `SIGMET for Severe Turbulence`;
      break;
    case 'CONVECTIVE':
      title = `SIGMET for Convection`;
      break;
    case 'ICING':
      title = `SIGMET for Severe Ice`;
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
      <div style={{ margin: 3 }}>
        <b>Valid:</b> {convertTimeFormat(feature.properties.validtimefrom, userSettings.default_time_display_unit)}
      </div>
      <div style={{ margin: 3 }}>
        <b>Through:</b> {convertTimeFormat(feature.properties.validtimeto, userSettings.default_time_display_unit)}
      </div>
      {top && (
        <div style={{ margin: 3 }}>
          <b>Top:</b> {top}
        </div>
      )}
      {base && (
        <div style={{ margin: 3 }}>
          <b>Base:</b> {base}
        </div>
      )}
      <Divider></Divider>
      <div style={{ margin: 3, whiteSpace: 'pre-line' }}>{feature.properties.rawairsigmet}</div>
    </BasePopupFrame>
  );
};
export default SigmetPopup;
