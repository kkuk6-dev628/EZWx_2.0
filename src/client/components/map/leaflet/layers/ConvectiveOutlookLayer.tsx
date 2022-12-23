import { PathOptions } from 'leaflet';
import WFSLayer from './WFSLayer';

const ConvectiveOutlookLayer = () => {
  const style = (): PathOptions => {
    const style = {
      color: '#F0F000',
      weight: 2,
      opacity: 0.7,
    };
    return style;
  };

  const getLabel = (): string => {
    const label = 'Conv Outlook';
    // switch (feature.properties.hazard) {
    //   case 'CONVECTIVE':
    //     label = `Convective`;
    //     break;
    //   case 'TURB':
    //     label = `TURB`;
    //     break;
    //   case 'ICING':
    //     label = `Icing`;
    //     break;
    //   case 'IFR':
    //     label = `IFR`;
    //     break;
    //   case 'ASH':
    //     label = `ASH`;
    //     break;
    // }
    return label;
  };

  return (
    <WFSLayer
      url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
      maxFeatures={256}
      typeName="EZWxBrief:conv_outlook"
      propertyNames={[
        'wkb_geometry',
        'ogc_fid',
        'valid_time_from',
        'valid_time_to',
        'raw_text',
      ]}
      style={style}
      getLabel={getLabel}
    ></WFSLayer>
  );
};

export default ConvectiveOutlookLayer;
