import { Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';
import { WeatherCausings } from '../../AreoConstants';

const SigmetPopup = ({ feature }) => {
  const getAltitudeString = (value: string): string => {
    if (value === 'SFC') {
      return 'Surface';
    } else if (value === 'FZL') {
      return 'FZL';
    } else if (!isNaN(parseInt(value))) {
      return parseInt(value) * 100 + ' ft MSL';
    }
  };

  const translateWeatherClausings = (dueto: string): string => {
    if (!dueto) {
      return '';
    }
    const weatherCausings = dueto.slice(dueto.lastIndexOf(' ') + 1);
    const splitWeatherCausing = weatherCausings.split('/');
    const wc = splitWeatherCausing.map((element) => {
      return WeatherCausings[element];
    });
    return wc.join(', ').replace(/,(?=[^,]+$)/, ' and');
  };

  let title = 'G_AIRMET';
  let dueto = 'Moderate.';
  const top = getAltitudeString(feature.properties.top);
  const base = getAltitudeString(feature.properties.base);
  switch (feature.properties.hazard) {
    case 'TURB':
      title = `Icing SIGMET`;
      dueto = 'Moderate ice.';
      break;
    case 'CONVECTIVE':
      title = `High Level Turbulence G-AIRMET`;
      dueto = 'Moderate turbulence.';
      break;
    case 'ICING':
      title = `Low Level Turbulence G-AIRMET`;
      dueto = 'Moderate turbulence';
      break;
    case 'IFR':
      title = `LLWS G-AIRMET`;
      dueto = 'Nonconvective low level wind shear below 2,000 feet AGL';
      break;
    case 'ASH':
      title = `Surface Winds G-AIRMET`;
      dueto = 'Sustained surface  wind > 30 knots ';
      break;
  }

  return (
    <BasePopupFrame title={title}>
      <Typography variant="body2" style={{ margin: 3 }}>
        Valid: {feature.properties.validtime}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        Issued: {feature.properties.issuetime}
      </Typography>
      {top && (
        <Typography variant="body2" style={{ margin: 3 }}>
          Top: {top}
        </Typography>
      )}
      {base && (
        <Typography variant="body2" style={{ margin: 3 }}>
          Base: {base}
        </Typography>
      )}
      <Typography variant="body2" style={{ margin: 3 }}>
        Due to: {dueto}
      </Typography>
    </BasePopupFrame>
  );
};
export default SigmetPopup;
