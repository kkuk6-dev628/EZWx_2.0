import WFSLayer from './WFSLayer';

const SigmetLayer = () => {
  const gairmetStyle = (feature) => {
    const style = {
      color: '#F50000',
      weight: '2',
      opacity: 0.7,
    };
    return style;
  };

  const getLabel = (feature) => {
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

  return (
    <WFSLayer
      url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
      maxFeatures={256}
      typeName="EZWxBrief:sigmet"
      propertyNames={[
        'wkb_geometry',
        'id',
        'altitudelow1',
        'altitudelow2',
        'altitudehi1',
        'altitudehi2',
        'validtimeto',
        'validtimefrom',
        'hazard',
        'rawairsigmet',
      ]}
      style={gairmetStyle}
      getLabel={getLabel}
    ></WFSLayer>
  );
};

export default SigmetLayer;
