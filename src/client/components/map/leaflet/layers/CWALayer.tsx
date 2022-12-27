import { PathOptions } from 'leaflet';
import WFSLayer from './WFSLayer';

const CWALayer = () => {
  const style = (): PathOptions => {
    const style = {
      color: '#3BF5E3',
      weight: 2,
      opacity: 0.7,
    };
    return style;
  };

  const getLabel = (feature: GeoJSON.Feature): string => {
    const label = feature.properties.hazard;
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
  const clientFilter = (
    feature: GeoJSON.Feature,
    observationTime: Date,
  ): boolean => {
    const start = new Date(feature.properties.validtimefrom);
    const end = new Date(feature.properties.validtimeto);
    return start <= observationTime && observationTime < end;
  };

  return (
    <WFSLayer
      url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
      maxFeatures={256}
      typeName="EZWxBrief:cwa"
      propertyNames={[
        'wkb_geometry',
        'id',
        'data',
        'cwsu',
        'name',
        'base',
        'top',
        'validtimeto',
        'validtimefrom',
        'hazard',
        'cwatext',
      ]}
      style={style}
      getLabel={getLabel}
      clientFilter={clientFilter}
    ></WFSLayer>
  );
};

export default CWALayer;
