import { PathOptions } from 'leaflet';
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

  return (
    <WFSLayer
      url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
      maxFeatures={256}
      typeName="EZWxBrief:intl_sigmet"
      propertyNames={[
        'wkb_geometry',
        'ogc_fid',
        'icaoid',
        'firid',
        'firname',
        'hazard',
        'validtimefrom',
        'validtimeto',
        'qualifier',
        'geom',
        'base',
        'top',
        'rawsigmet',
      ]}
      style={gairmetStyle}
      getLabel={getLabel}
    ></WFSLayer>
  );
};

export default IntlSigmetLayer;
