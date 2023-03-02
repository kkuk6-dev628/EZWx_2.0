/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-img-element */
import BasePopupFrame from './BasePopupFrame';
import L from 'leaflet';
import { Divider } from '@material-ui/core';
import { addLeadingZeroes, getThumbnail, simpleTimeOnlyFormat } from '../../common/AreoFunctions';
import { feature } from '@turf/helpers';

interface FeatureSelectorProps {
  features: L.Layer[];
  userSettings: any;
}
const FeatureSelector = ({ features, userSettings }: FeatureSelectorProps) => {
  const getMetarText = (feature: GeoJSON.Feature): string => {
    const text = `METAR: ${feature.properties.station_id} ${simpleTimeOnlyFormat(
      new Date(feature.properties.observation_time),
      userSettings.default_time_display_unit,
    )}`;
    return text;
  };
  return (
    <BasePopupFrame title="Select Object">
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {features.map((layer: any) => {
          const layerName = layer.feature.id.split('.')[0];
          let text = layerName;
          let icon, imgSrc, base, top;
          if (layer.feature.geometry.type === 'Point' || layer.feature.geometry.type === 'MultiPoint') {
            icon = layer.getIcon().createIcon();
          } else {
            let weight = 0.2;
            if (
              layerName === 'gairmet' &&
              (layer.feature.properties.hazard === 'SFC_WND' || layer.feature.properties.hazard === 'LLWS')
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
              base = layer.feature.properties.base / 100;
              if (isNaN(parseInt(base)) || base == '0') {
                base = 'SFC';
              } else {
                base = addLeadingZeroes(base, 3);
              }
              top = layer.feature.properties.top / 100;
              if (!isNaN(parseInt(top))) {
                top = addLeadingZeroes(top, 3);
              }
              switch (layer.feature.properties.hazard) {
                case 'TS':
                  text = `CWA: Thunderstorms` + top === '000' ? '' : ` to ${top}`;
                  break;
                case 'TURB':
                  text = `CWA: Turbulence` + top === '000' ? '' : ` ${base} to ${top}`;
                  break;
                case 'ICE':
                  text = `CWA: Icing` + top === '000' ? '' : ` ${base} to ${top}`;
                  break;
                case 'IFR':
                  text = `CWA: IFR`;
                  break;
                case 'PCPN':
                  text = `CWA: Heavy precipitation` + top === '000' ? '' : ` to ${top}`;
                  break;
                default:
                  text = `CWA: Unknown`;
                  break;
              }
              break;
            case 'conv_outlook':
              text = 'Convective outlook';
              break;
            case 'sigmet':
              base = layer.feature.properties.altitudelow / 100;
              if (isNaN(parseInt(base)) || base == '0') {
                base = 'SFC';
              } else {
                base = addLeadingZeroes(base, 3);
              }
              top = layer.feature.properties.altitudehi / 100;
              if (top == 600) {
                // @ts-ignore
                top = 'ABV 450';
              } else {
                top = addLeadingZeroes(top, 3);
              }
              switch (layer.feature.properties.hazard) {
                case 'CONVECTIVE':
                  text = `SIGMET: Thunderstorms to ${top}`;
                  break;
                case 'TURB':
                  text = `SIGMET: Severe turbulence ${base} to ${top}`;
                  break;
                case 'ICE':
                  text = `SIGMET: Severe ice ${base} to ${top}`;
                  break;
                case 'IFR':
                  text = `SIGMET: Dust/sandstorm ${base} to ${top}`;
                  break;
                case 'ASH':
                  text = `SIGMET: Volcanic ash ${base} to ${top}`;
                  break;
              }
              break;
            case 'intl_sigmet':
              base = layer.feature.properties.base / 100;
              if (isNaN(parseInt(base)) || base == '0') {
                base = 'SFC';
              } else {
                base = addLeadingZeroes(base, 3);
              }
              top = layer.feature.properties.top / 100;
              if (top == 600) {
                // @ts-ignore
                top = 'ABV 450';
              } else {
                top = addLeadingZeroes(top, 3);
              }
              switch (layer.feature.properties.hazard) {
                case 'ICE':
                  text = `SIGMET: Severe ice ${base} to ${top}`;
                  break;
                case 'TURB':
                  text = `SIGMET: Severe Turbulence ${base} to ${top}`;
                  break;
                case 'TS':
                  text = `SIGMET: Thunderstorms to ${top}`;
                  break;
                case 'MTW':
                  text = `SIGMET: Mountain wave ${base} to ${top}`;
                  break;
                case 'IFR':
                  text = `SIGMET: Dust/sandstorm ${base} to ${top}`;
                  break;
                case 'TC':
                  text = `SIGMET: Tropical cyclone to ${top}`;
                  break;
                case 'ASH':
                  text = `SIGMET: Volcanic ash ${base} to ${top}`;
                  break;
                default:
                  text = `SIGMET ${base} to ${top}`;
                  break;
              }
              break;
            case 'pirep':
              text = layer.feature.properties.aireptype + ' ' + layer.feature.properties.actype;
              break;
            case 'metar':
              text = getMetarText(layer.feature);
            default:
              if (layerName.indexOf('station') === 0) {
                const validDate = new Date(layer.feature.properties.valid_date);
                text = `EZForecast: ${
                  layer.feature.properties.icaoid ? layer.feature.properties.icaoid : layer.feature.properties.faaid
                } ${simpleTimeOnlyFormat(validDate, userSettings.default_time_display_unit)} ${validDate.toLocaleString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                  },
                )}`;
              }
              break;
          }
          return (
            <div key={layer.feature.id}>
              <span className="feature-selector-item" data-featureid={layer.feature.id}>
                {layer.feature.geometry.type === 'Point' && (
                  <div
                    style={{
                      width: 54,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: 'none',
                      marginRight: 4,
                    }}
                    className="feature-selector-item-icon"
                  >
                    <div
                      style={{
                        width: icon.style.width,
                        position: 'relative',
                      }}
                      className={icon.className}
                      dangerouslySetInnerHTML={{ __html: icon.innerHTML }}
                    />
                  </div>
                )}
                {layer.feature.geometry.type !== 'Point' && <img className="feature-selector-item-icon" src={imgSrc} />}
                <p>{text}</p>
              </span>
              <Divider />
            </div>
          );
        })}{' '}
      </div>
    </BasePopupFrame>
  );
};

export default FeatureSelector;
