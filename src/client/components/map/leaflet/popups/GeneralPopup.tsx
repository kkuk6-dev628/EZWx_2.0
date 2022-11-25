import { Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';

const GeneralPopup = ({ feature, title }) => {
  return (
    <BasePopupFrame title={title}>
      {feature.properties &&
        Object.entries(feature.properties).map(([key, value]) => {
          return (
            <Typography variant="body2" style={{ margin: 3 }}>
              <>
                {key}: {value}
              </>
            </Typography>
          );
        })}
    </BasePopupFrame>
  );
};
export default GeneralPopup;
