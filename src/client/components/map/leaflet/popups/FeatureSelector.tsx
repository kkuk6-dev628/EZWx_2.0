import BasePopupFrame from './BasePopupFrame';
import L from 'leaflet';
import { Divider } from '@material-ui/core';
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
              text = `Moderate turbulence from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              icon = <SvgLayer />;
              break;
            case 'TURB-LO':
              text = `Moderate turbulence from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              icon = <SvgLayer />;
              break;
            case 'LLWS':
              text = `Low-level wind shear`;
              icon = <SvgLayer />;
              break;
            case 'SFC_WND':
              text = `Surface wind`;
              icon = <SvgLayer />;
              break;
            case 'IFR':
              text = `IFR G-AIRMET`;
              icon = <SvgLayer />;
              break;
            case 'MT_OBSC':
              text = `Mountain obscuration`;
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
              className="feature-selector-item"
              data-featureid={layer.feature.id}
            >
              <span
                style={{ alignSelf: 'center' }}
                className="feature-selector-item-text"
              >
                {icon}
              </span>
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
