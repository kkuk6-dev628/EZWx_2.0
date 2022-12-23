import { Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';
import {
  getAltitudeString,
  translateWeatherClausings,
  convertTimeFormat,
} from '../../common/AreoFunctions';

const GairmetPopup = ({ feature }) => {
  let title = 'G-AIRMET';
  let dueto = 'Moderate';
  const top = getAltitudeString(
    feature.properties.top,
    true,
    feature.properties.fzlbase,
    feature.properties.fzltop,
  );
  const base = getAltitudeString(
    feature.properties.base,
    true,
    feature.properties.fzlbase,
    feature.properties.fzltop,
  );
  switch (feature.properties.hazard) {
    case 'ICE':
      title = `Icing G-AIRMET`;
      dueto = 'Moderate ice';
      break;
    case 'TURB-HI':
      title = `High Level Turbulence G-AIRMET`;
      dueto = 'Moderate turbulence';
      break;
    case 'TURB-LO':
      title = `Low-Level Turbulence G-AIRMET`;
      dueto = 'Moderate turbulence';
      break;
    case 'LLWS':
      title = `Low-level wind shear G-AIRMET`;
      dueto = 'Nonconvective low-level wind shear below 2,000 feet AGL';
      break;
    case 'SFC_WND':
      title = `Surface Wind G-AIRMET`;
      dueto = 'Sustained surface wind > 30 knots';
      break;
    case 'IFR':
      title = `IFR G-AIRMET`;
      dueto =
        'Ceiling below 1,000 feet and/or visibility below 3 statute miles by ' +
        translateWeatherClausings(feature.properties.dueto);
      break;
    case 'MT_OBSC':
      title = 'Mountains obscuration G-AIRMET';
      dueto =
        'Mountains obscured by ' +
        translateWeatherClausings(feature.properties.dueto);
      break;
    case 'M_FZLVL':
      break;
  }

  return (
    <BasePopupFrame title={title}>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Valid:</b> {convertTimeFormat(feature.properties.validtime)}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Issued:</b> {convertTimeFormat(feature.properties.issuetime)}
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
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Due to:</b> {dueto}
      </Typography>
    </BasePopupFrame>
  );
};
export default GairmetPopup;
