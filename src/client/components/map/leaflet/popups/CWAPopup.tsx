import { Divider, Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';
import { convertTimeFormat, getAltitudeString } from '../../common/AreoFunctions';

const CWAPopup = ({ feature, userSettings }) => {
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
      <div style={{ margin: 3 }}>
        <b>CWSU:</b> {`${feature.properties.cwsu} [${feature.properties.name}]`}
      </div>
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
      <div style={{ margin: 3, whiteSpace: 'pre-line' }}>{feature.properties.cwatext}</div>
    </BasePopupFrame>
  );
};
export default CWAPopup;
