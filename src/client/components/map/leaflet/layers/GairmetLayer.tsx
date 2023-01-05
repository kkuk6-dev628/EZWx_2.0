import { PathOptions } from 'leaflet';
import WFSLayer from './WFSLayer';

const GairmetLayer = () => {
  const gairmetStyle = (feature: GeoJSON.Feature): PathOptions => {
    const style = {
      color: '#333333',
      weight: 2,
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
        style.color = '#F653F6';
        style.dashArray = '60 6 6 6';
        break;
      case 'M_FZLVL':
        style.color = '#7470C4';
        style.dashArray = '60 10 2 10';
        break;
    }
    return style;
  };

  const getLabel = (feature) => {
    let label;
    let base = feature.properties.base;
    if (base === 'FZL') {
      base = `${feature.properties.fzlbase}/${feature.properties.fzltop}`;
    }
    switch (feature.properties.hazard) {
      case 'ICE':
        label = `Icing <br/>${feature.properties.top}<br/>${base}`;
        break;
      case 'TURB-HI':
        label = `TurbHi<br/>${feature.properties.top}<br/>${base}`;
        break;
      case 'TURB-LO':
        label = `TurbLo<br/>${feature.properties.top}<br/>${base}`;
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
  const clientFilter = (
    features: GeoJSON.Feature[],
    observationTime: Date,
  ): GeoJSON.Feature[] => {
    const results = features.filter((feature) => {
      const start = new Date(feature.properties.validtime);
      let duration = 3 * 60; // minutes
      if (feature.properties.forecast == 12) {
        duration = 1.5 * 60;
      }
      const end = new Date(feature.properties.validtime);
      end.setMinutes(end.getMinutes() + duration);
      end.setSeconds(0);
      end.setMilliseconds(0);
      return start <= observationTime && observationTime < end;
    });
    return results;
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
        'fzlbase',
        'fzltop',
        'issuetime',
        'validtime',
        'forecast',
        'hazard',
        'dueto',
      ]}
      style={gairmetStyle}
      // serverFilter={`forecast IN ('0')`}
      getLabel={getLabel}
      clientFilter={clientFilter}
    ></WFSLayer>
  );
};

export default GairmetLayer;
