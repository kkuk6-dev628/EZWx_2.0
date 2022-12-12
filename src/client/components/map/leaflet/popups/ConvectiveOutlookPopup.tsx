import { Divider, Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';
import { convertTimeFormat, getAltitudeString } from '../../AreoFunctions';

const ConvectiveOutlookPopup = ({ feature }) => {
  let title = 'CWA';
  const base = getAltitudeString(feature.properties.base);
  const top = getAltitudeString(feature.properties.top);

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
        <b>Valid:</b> {convertTimeFormat(feature.properties.valid_time_from)}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Through:</b> {convertTimeFormat(feature.properties.valid_time_to)}
      </Typography>
      <Divider></Divider>
      <Typography variant="body2" style={{ margin: 3, whiteSpace: 'pre-wrap' }}>
        {feature.properties.raw_text}
      </Typography>
    </BasePopupFrame>
  );
};
export default ConvectiveOutlookPopup;
