import { Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';

const GairmetPopup = ({ feature }) => {
  return (
    <BasePopupFrame title={'GAirmet Feature Properties'}>
      <Typography variant="body2" style={{ margin: 3 }}>
        Valid: {feature.properties.level}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        Forecast: {feature.properties.forecast}
      </Typography>
    </BasePopupFrame>
  );
};
export default GairmetPopup;
