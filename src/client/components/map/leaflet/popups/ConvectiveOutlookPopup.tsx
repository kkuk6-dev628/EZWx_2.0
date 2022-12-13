import { Divider, Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';
import { convertTimeFormat, getAltitudeString } from '../../AreoFunctions';

const ConvectiveOutlookPopup = ({ feature }) => {
  return (
    <BasePopupFrame title={'Convective OUTLOOK'}>
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
