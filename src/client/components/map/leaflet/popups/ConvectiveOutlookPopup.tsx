import { Divider, Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';
import { convertTimeFormat } from '../../common/AreoFunctions';

const ConvectiveOutlookPopup = ({ feature, userSettings }: { feature: any; userSettings: any }) => {
  return (
    <BasePopupFrame title={'Convective OUTLOOK'}>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Valid:</b> {convertTimeFormat(feature.properties.valid_time_from, userSettings.default_time_display_unit)}
      </Typography>
      <Typography variant="body2" style={{ margin: 3 }}>
        <b>Through:</b> {convertTimeFormat(feature.properties.valid_time_to, userSettings.default_time_display_unit)}
      </Typography>
      <Divider></Divider>
      <Typography variant="body2" style={{ margin: 3, whiteSpace: 'pre-line' }}>
        {feature.properties.raw_text}
      </Typography>
    </BasePopupFrame>
  );
};
export default ConvectiveOutlookPopup;
