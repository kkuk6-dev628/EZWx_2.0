import { PathOptions } from 'leaflet';
import { db } from '../../../caching/dexieDb';
import { wfsUrl1 } from '../../common/AreoConstants';
import WFSLayer from './WFSLayer';

const IntlSigmetLayer = () => {
  const gairmetStyle = (): PathOptions => {
    const style = {
      color: '#F50000',
      weight: 2,
      opacity: 0.7,
    };
    return style;
  };

  const getLabel = (feature) => {
    return feature.properties.hazard;
  };
  const clientFilter = (features: GeoJSON.Feature[], observationTime: Date): GeoJSON.Feature[] => {
    const results = features.filter((feature) => {
      const start = new Date(feature.properties.validtimefrom);
      const end = new Date(feature.properties.validtimeto);
      return start <= observationTime && observationTime < end;
    });
    return results;
  };

  return (
    <WFSLayer
      url={wfsUrl1}
      maxFeatures={256}
      typeName="EZWxBrief:intl_sigmet"
      propertyNames={[
        'geometry',
        'icaoid',
        'firid',
        'firname',
        'hazard',
        'validtimefrom',
        'validtimeto',
        'qualifier',
        'base',
        'top',
        'rawsigmet',
      ]}
      style={gairmetStyle}
      getLabel={getLabel}
      clientFilter={clientFilter}
      layerStateName="sigmetState"
    ></WFSLayer>
  );
};

export default IntlSigmetLayer;
