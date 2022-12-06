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
import { translateWeatherClausings } from '../../AreoFunctions';

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
              text = `Moderate turbulence from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              icon = <SvgLayer />;
              break;
            case 'TURB-LO':
              text = `Moderate turbulence from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              icon = <SvgLayer />;
              break;
            case 'LLWS':
              text = `Nonconvective low level wind shear below 2,000 feet AGL G-AIRMET`;
              icon = <SvgLayer />;
              break;
            case 'SFC_WND':
              text = `Sustained surface wind > 30 knots G-AIRMET`;
              icon = <SvgLayer />;
              break;
            case 'IFR':
              text = `Center weather advisory for IFR conditions`;
              icon = <SvgLayer />;
              break;
            case 'MT_OBSC':
              text =
                `Mountains obscured by ` +
                translateWeatherClausings(layer.feature.properties.dueto);
              icon = <SvgLayer />;
              break;
            case 'M_FZLVL':
              text = `Multiple freezing levels`;
              icon = <SvgLayer />;
              break;
          }
        } else if (layerName === 'cwa') {
          text = 'CWA';
        } else if (layerName === 'conv_outlook') {
          text = 'Convective outlook';
        } else if (layerName === 'sigmet') {
          switch (layer.feature.properties.hazard) {
            case 'CONVECTIVE':
              text = `Convective SIGMET`;
              break;
            case 'TURB':
              text = `Turbulence SIGMET `;
              break;
            case 'ICING':
              text = `Icing SIGMET`;
              break;
            case 'IFR':
              text = `IFR SIGMET`;
              break;
            case 'ASH':
              text = `Volcanic ash SIGMET`;
              break;
          }
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
      })}
    </BasePopupFrame>
  );
};

export default FeatureSelector;
