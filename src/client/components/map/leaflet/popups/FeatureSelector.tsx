/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-img-element */
import BasePopupFrame from './BasePopupFrame';
import L from 'leaflet';
import { Divider } from '@material-ui/core';
import { createElementFromHTML, getThumbnail } from '../../AreoFunctions';

interface FeatureSelectorProps {
  features: L.Layer[];
  onSelect: (feature: L.Feature) => void;
}
const FeatureSelector = ({ features, onSelect }: FeatureSelectorProps) => {
  return (
    <BasePopupFrame title="Select Object">
      {features.map((layer) => {
        const layerName = layer.feature.id.split('.')[0];
        let text = layerName;
        let icon, imgSrc, base;
        if (
          layer.feature.geometry.type === 'Point' ||
          layer.feature.geometry.type === 'MultiPoint'
        ) {
          icon = createElementFromHTML(layer.options.icon.options.html);
          imgSrc = icon.src;
        } else {
          let weight = 0.2;
          if (
            layerName === 'gairmet' &&
            (layer.feature.properties.hazard === 'SFC_WND' ||
              layer.feature.properties.hazard === 'LLWS')
          ) {
            weight = 0.1;
          }
          icon = getThumbnail(layer.feature, {
            stroke: layer.options.color,
            weight: weight,
          });
          const img = new Blob([icon], { type: 'image/svg+xml' });
          imgSrc = URL.createObjectURL(img);
        }
        switch (layerName) {
          case 'gairmet':
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
            break;
          case 'cwa':
            text = 'CWA';
            base = layer.feature.properties.base;
            if (isNaN(parseInt(base)) || base == '0') {
              base = 'SUF';
            }
            switch (layer.feature.properties.hazard) {
              case 'CONVECTIVE':
                text = `CWA: TS TOPS TO ${layer.feature.properties.top}`;
                break;
              case 'TURB':
                text = `CWA: TURB ${base} to ${layer.feature.properties.top}`;
                break;
              case 'ICE':
                text = `CWA: ICING ${base} TO ${layer.feature.properties.top}`;
                break;
              case 'IFR':
                text = `CWA: IFR`;
                break;
              case 'PCPN':
                text = `CWA: PRECIP TOPS TO ${layer.feature.properties.top}`;
                break;
              default:
                text = `CWA: UNKNOWN`;
                break;
            }
            break;
          case 'conv_outlook':
            text = 'Convective outlook';
            break;
          case 'sigmet':
            base = layer.feature.properties.altitudelow / 100;
            if (isNaN(parseInt(base)) || base == '0') {
              base = 'SUF';
            }
            let top = layer.feature.properties.altitudehi / 100;
            if (top == 600) {
              // @ts-ignore
              top = 'ABV 450';
            }
            switch (layer.feature.properties.hazard) {
              case 'CONVECTIVE':
                text = `SIGMET: THUNDERSTORMS TO ${top}`;
                break;
              case 'TURB':
                text = `SIGMET: SEVERE TURB ${base} TO ${top}`;
                break;
              case 'ICE':
                text = `SIGMET: SEVERE ICE ${base} TO ${top}`;
                break;
              case 'IFR':
                text = `SIGMET: DUST/SANDSTORM ${base} TO ${top}`;
                break;
              case 'ASH':
                text = `SIGMET: VOLCANIC ASH ${base} TO ${top}`;
                break;
            }
            break;
          case 'intl_sigmet':
            switch (layer.feature.properties.hazard) {
              case 'ICE':
                text = `SIGMET: SEVERE ICE ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
                break;
              case 'TURB':
                text = `SIGMET: SEVERE TURB ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
                break;
              case 'TS':
                text = `SIGMET: THUNDERSTORMS TO ${layer.feature.properties.top}`;
                break;
              case 'MTW':
                text = `SIGMET: MTN WAVE ${layer.feature.properties.base} TO ${layer.feature.properties.top}`;
                break;
              case 'IFR':
                text = `SIGMET: DUST/SANDSTORM ${layer.feature.properties.base} TO ${layer.feature.properties.top}`;
                break;
              case 'TC':
                text = `SIGMET: TROP CYCLONE TO ${layer.feature.properties.top}`;
                break;
              case 'ASH':
                text = `SIGMET: VOLCANIC ASH ${layer.feature.properties.base} TO ${layer.feature.properties.top}`;
                break;
              default:
                text = `SIGMET ${layer.feature.properties.base} to ${layer.feature.properties.top}`;
                break;
            }
            break;
          case '':
            break;
          default:
            break;
        }
        return (
          <div key={layer.feature.id}>
            <span
              className="feature-selector-item"
              data-featureid={layer.feature.id}
            >
              <img className="feature-selector-item-icon" src={imgSrc} />
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
