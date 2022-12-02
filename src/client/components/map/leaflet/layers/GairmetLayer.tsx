import WFSLayer from './WFSLayer';

const GairmetLayer = () => {
  const gairmetStyle = (feature) => {
    const style = {
      color: '#333333',
      weight: '2',
      dashArray: '60 6 6 6',
      opacity: 0.7,
    };
    switch (feature.properties.hazard) {
      case 'ICE':
        style.color = '#3333FF';
        break;
      case 'TURB-HI':
        style.color = '#C87746';
        style.dashArray = '60 6';
        break;
      case 'TURB-LO':
        style.color = '#F69B6B';
        style.dashArray = '60 6 6 6';
        break;
      case 'LLWS':
        style.color = '#814021';
        style.dashArray = '30 6';
        break;
      case 'SFC_WND':
        style.color = '#F3A70C';
        style.dashArray = '30 6';
        break;
      case 'IFR':
        style.color = '#790679';
        style.dashArray = '60 6';
        break;
      case 'MT_OBSC':
        style.color = '#88CC46';
        style.dashArray = '60 6 6 6';
        break;
      case 'M_FZLVL':
        style.color = '#C87746';
        style.dashArray = '60 6';
        break;
    }
    return style;
  };

  const getLabel = (feature) => {
    let label;
    switch (feature.properties.hazard) {
      case 'ICE':
        label = `Icing <br/>${feature.properties.top}<br/>${feature.properties.base}`;
        break;
      case 'TURB-HI':
        label = `TurbHi<br/>${feature.properties.top}<br/>${feature.properties.base}`;
        break;
      case 'TURB-LO':
        label = `TurbLo<br/>${feature.properties.top}<br/>${feature.properties.base}`;
        break;
      case 'LLWS':
        label = `LLWS`;
        break;
      case 'SFC_WND':
        label = `Sfc Wind`;
        break;
      case 'IFR':
        label = `IFR`;
        break;
      case 'MT_OBSC':
        label = 'Mtn Obsc';
        break;
      case 'M_FZLVL':
        break;
    }
    return label;
  };

  return (
    <WFSLayer
      url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
      maxFeatures={256}
      typeName="EZWxBrief:gairmet"
      propertyNames={[
        'wkb_geometry',
        'id',
        'top',
        'base',
        'issuetime',
        'validtime',
        'hazard',
      ]}
      style={gairmetStyle}
      filter={`forecast IN ('0') AND hazard NOT IN ('M_FZLVL')`}
      getLabel={getLabel}
    ></WFSLayer>
  );
};

export default GairmetLayer;
