import { Typography } from '@material-ui/core';
import BasePopupFrame from './BasePopupFrame';

const GeneralPopup = ({ feature, title }) => {
  return (
    <BasePopupFrame title={title}>
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {feature.properties &&
          Object.entries(feature.properties).map(([key, value]) => {
            return (
              <Typography variant="body2" style={{ margin: 3 }} key={key}>
                <>
                  {key}: {value}
                </>
              </Typography>
            );
          })}
      </div>
    </BasePopupFrame>
  );
};
export default GeneralPopup;
