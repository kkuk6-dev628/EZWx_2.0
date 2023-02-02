import { Divider, Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';
import { convertTimeFormat, getAltitudeString } from '../../common/AreoFunctions';

const CWAPopup = ({ feature }) => {
  let title = 'CWA';
  const base = getAltitudeString(feature.properties.base, false);
  const top = getAltitudeString(feature.properties.top, false);

  switch (feature.properties.hazard) {
    case 'TURB':
      title = `Center Weather Advisory for Turbulence`;
      break;
    case 'TS':
      title = `Center Weather Advisory for Thunderstorms`;
      break;
    case 'ICE':
      title = `Center Weather Advisory for Icing`;
      break;
    case 'IFR':
      title = `Center Weather Advisory for IFR Conditions`;
      break;
    case 'PCPN':
      title = `Center Weather Advisory for Precipitation`;
      break;
    case 'UNK':
      title = `Center Weather Advisory`;
      break;
  }

  return (
    <BasePopupFrame title={title}>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>CWSU:</b> {`${feature.properties.cwsu} [${feature.properties.name}]`}
      </Typography>
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
      <Typography variant="body2" style={{ margin: 3, whiteSpace: 'pre-line' }}>
        {feature.properties.cwatext}
      </Typography>
    </BasePopupFrame>
  );
};
export default CWAPopup;
