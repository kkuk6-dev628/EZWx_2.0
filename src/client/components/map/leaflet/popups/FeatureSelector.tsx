import BasePopupFrame from './BasePopupFrame';
import L from 'leaflet';
import {
  Button,
  Divider,
  Typography,
  MenuItem,
  MenuList,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core';
import { SvgAir, SvgLayer } from '../../../utils/SvgIcons';

interface FeatureSelectorProps {
  features: L.Layer[];
  onSelect: (feature: L.Feature) => void;
}
const FeatureSelector = ({ features, onSelect }: FeatureSelectorProps) => {
  return (
    <BasePopupFrame title="Select Object">
      {features.map((layer) => {
        const layerName = layer.feature.id.split('.')[0];
        let text = '';
        let icon = <SvgAir />;
        if (layerName === 'gairmet') {
          switch (layer.feature.properties.hazard) {
            case 'ICE':
              text = `Moderate ice from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              icon = <SvgLayer />;
              break;
            case 'TURB-HI':
              text = `Severe turbulence from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              icon = <SvgLayer />;
              break;
            case 'TURB-LO':
              text = `Moderate ice from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              icon = <SvgLayer />;
              break;
            case 'LLWS':
              text = `Moderate ice from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              icon = <SvgLayer />;
              break;
            case 'SFC_WND':
              text = `Moderate ice from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              icon = <SvgLayer />;
              break;
            case 'IFR':
              text = `Center weather advisory for IFR conditions`;
              icon = <SvgLayer />;
              break;
            case 'MT_OBSC':
              text = `Mountains obscured by precipitation, clouds and mist`;
              icon = <SvgLayer />;
              break;
            case 'M_FZLVL':
              text = `Moderate ice from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              icon = <SvgLayer />;
              break;
          }
          return (
            <div key={layer.feature.id}>
              <span
                style={{
                  margin: 3,
                  cursor: 'pointer',
                  display: 'flex',
                }}
                className="selector-feature"
                data-featureid={layer.feature.id}
              >
                <span style={{ alignSelf: 'center' }}>{icon}</span>
                <p>{text}</p>
              </span>
              <Divider />
            </div>
          );
        } else if (layerName === 'cwa') {
          return (
            <>
              <Typography
                key={layer.feature.id}
                style={{ margin: 3, cursor: 'pointer', border: '1px' }}
                className="selector-feature"
                data-featureid={layer.feature.id}
              >
                <SvgAir></SvgAir>
                {layer.feature.properties.hazard}
              </Typography>
              <Divider />
            </>
          );
        } else if (layerName === 'conv_outlook') {
          return (
            <>
              <Typography
                key={layer.feature.id}
                style={{ margin: 3, cursor: 'pointer', border: '1px' }}
                className="selector-feature"
                data-featureid={layer.feature.id}
              >
                <SvgAir></SvgAir>
                {layer.feature.properties.hazard}
              </Typography>
              <Divider />
            </>
          );
        }
      })}
    </BasePopupFrame>
  );
};

export default FeatureSelector;
