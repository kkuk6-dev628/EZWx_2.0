/* eslint-disable @next/next/no-img-element */
import BasePopupFrame from './BasePopupFrame';
import L from 'leaflet';
import { Divider } from '@material-ui/core';
import { SvgAir, SvgLayer } from '../../../utils/SvgIcons';
import { getThumbnail } from '../../AreoFunctions';

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
        // let icon = <SvgAir />;
        const icon = getThumbnail(layer.feature, {
          stroke: layer.options.color,
          weight: 0.2,
        });
        const svg = new Blob([icon], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svg);
        if (layerName === 'gairmet') {
          switch (layer.feature.properties.hazard) {
            case 'ICE':
              text = `Moderate ice from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              break;
            case 'TURB-HI':
              text = `Moderate turbulence from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              break;
            case 'TURB-LO':
              text = `Moderate turbulence from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              break;
            case 'LLWS':
              text = `Low-level wind shear`;
              break;
            case 'SFC_WND':
              text = `Surface wind`;
              break;
            case 'IFR':
              text = `IFR G-AIRMET`;
              break;
            case 'MT_OBSC':
              text = `Mountain obscuration`;
              break;
            case 'M_FZLVL':
              text = `Multiple freezing levels`;
              break;
          }
        } else if (layerName === 'cwa') {
          text = 'CWA';
        } else if (layerName === 'conv_outlook') {
          text = 'Convective outlook';
        } else if (layerName === 'sigmet') {
          switch (layer.feature.properties.hazard) {
            case 'CONVECTIVE':
              text = `Convection with tops to ${layer.feature.properties.top}`;
              break;
            case 'TURB':
              text = `Severe turbulence from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              break;
            case 'ICING':
              text = `Severe ice from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              break;
            case 'IFR':
              text = `Dust or sandstorm from ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
              break;
            case 'ASH':
              text = `Volcanic ash`;
              break;
          }
        }
        return (
          <div key={layer.feature.id}>
            <span
              className="feature-selector-item"
              data-featureid={layer.feature.id}
            >
              <img className="feature-selector-item-icon" src={url} />
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
