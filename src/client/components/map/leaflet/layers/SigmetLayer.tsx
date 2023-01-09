import { PathOptions } from 'leaflet';
import WFSLayer from './WFSLayer';

const SigmetLayer = () => {
  const gairmetStyle = (): PathOptions => {
    const style = {
      color: '#F50000',
      weight: 2,
      opacity: 0.7,
    };
    return style;
  };

  const getLabel = (feature: GeoJSON.Feature) => {
    let label;
    switch (feature.properties.hazard) {
      case 'CONVECTIVE':
        label = `TS`;
        break;
      case 'TURB':
        label = `TURB`;
        break;
      case 'ICING':
        label = `Icing`;
        break;
      case 'IFR':
        label = `IFR`;
        break;
      case 'ASH':
        label = `ASH`;
        break;
    }
    return label;
  };

  const clientFilter = (
    features: GeoJSON.Feature[],
    observationTime: Date,
  ): GeoJSON.Feature[] => {
    const results = features.filter((feature) => {
      const start = new Date(feature.properties.validtimefrom);
      const end = new Date(feature.properties.validtimeto);
      return start <= observationTime && observationTime < end;
    });
    return results;
  };

  return (
    <WFSLayer
      url="https://eztile1.ezwxbrief.com/geoserver/EZWxBrief/ows"
      maxFeatures={256}
      typeName="EZWxBrief:sigmet"
      propertyNames={[
        'wkb_geometry',
        'id',
        'altitudelow',
        'altitudehi',
        'validtimeto',
        'validtimefrom',
        'hazard',
        'rawairsigmet',
      ]}
      style={gairmetStyle}
      getLabel={getLabel}
      clientFilter={clientFilter}
    ></WFSLayer>
  );
};

export default SigmetLayer;
