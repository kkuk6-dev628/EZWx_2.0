import { Divider, Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';
import { convertTimeFormat, getAltitudeString } from '../../AreoFunctions';

const hazardTranslation = {
  TS: 'Thunderstorms',
  TURB: 'Turbulence',
  ICE: 'Icing',
  MTW: 'Mountain wave',
  VA: 'Volcanic ash',
  TC: 'Tropical cyclone',
};

const qualifiersTranslation = {
  ISOL: 'Isolated',
  SEV: 'Severe',
  EMBD: 'Embedded',
  OCNL: 'Occasional',
};

const IntlSigmetPopup = ({ feature }: { feature: any }) => {
  let title = hazardTranslation[feature.properties.hazard]
    ? `${qualifiersTranslation[feature.properties.qualifier]} ${
        hazardTranslation[feature.properties.hazard]
      }`
    : 'Other';
  let base;
  if (
    isNaN(parseInt(feature.properties.base)) ||
    feature.properties.base == '0'
  ) {
    base = 'Surface';
  } else {
    base = getAltitudeString(feature.properties.base);
  }

  const top = getAltitudeString(feature.properties.top, false);
  switch (feature.properties.hazard) {
    case 'VA':
      title = hazardTranslation.VA;
      break;
  }

  return (
    <BasePopupFrame title={title}>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>FIR Id:</b> {feature.properties.firid}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>FIR Name:</b> {feature.properties.firname}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Hazard:</b> {hazardTranslation[feature.properties.hazard]}
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
      <Typography variant="body2" style={{ margin: 3, whiteSpace: 'pre-wrap' }}>
        {feature.properties.rawsigmet}
      </Typography>
    </BasePopupFrame>
  );
};
export default IntlSigmetPopup;
