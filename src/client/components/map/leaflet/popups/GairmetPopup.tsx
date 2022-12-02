import { Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';

const GairmetPopup = ({ feature }) => {
  return (
    <BasePopupFrame title={'Icing G_AIRMET'}>
      <Typography variant="body2" style={{ margin: 3 }}>
        Valid: {feature.properties.validtime}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        Issued: {feature.properties.issuetime}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        Top: {feature.properties.top}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        Base: {feature.properties.base}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        Due to: Moderate ice
      </Typography>
    </BasePopupFrame>
  );
};
export default GairmetPopup;
