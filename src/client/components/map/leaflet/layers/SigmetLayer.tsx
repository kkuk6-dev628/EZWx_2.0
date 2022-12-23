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
        label = `Convective`;
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
    feature: GeoJSON.Feature,
    observationTime: Date,
  ): boolean => {
    const start = new Date(feature.properties.obstime);
    const end = new Date(feature.properties.obstime);
    end.setMinutes(end.getMinutes() + 75);
    end.setSeconds(0);
    end.setMilliseconds(0);
    return start <= observationTime && observationTime < end;
  };

  return (
    <WFSLayer
      url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
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
