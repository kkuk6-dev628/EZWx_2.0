import { PathOptions } from 'leaflet';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectSigmet } from '../../../../store/layers/LayerControl';
import WFSLayer from './WFSLayer';

const SigmetLayer = () => {
  const layerState = useSelector(selectSigmet);

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
      const inTime = start <= observationTime && observationTime < end;
      if (!inTime) {
        return false;
      }
      if (layerState.all.visible) {
        return true;
      }
      if (
        layerState.convection.visible &&
        feature.properties.hazard === 'CONVECTIVE'
      ) {
        return true;
      }
      if (
        layerState.turbulence.visible &&
        feature.properties.hazard === 'TURB'
      ) {
        return true;
      }
      if (
        layerState.airframeIcing.visible &&
        feature.properties.hazard === 'ICING'
      ) {
        return true;
      }
      if (layerState.dust.visible && feature.properties.hazard === 'IFR') {
        return true;
      }
      if (layerState.ash.visible && feature.properties.hazard === 'ASH') {
        return true;
      }
      if (
        layerState.other.visible &&
        ['CONVECTIVE', 'TURB', 'ICING', 'IFR', 'ASH'].includes(
          feature.properties.hazard,
        ) === false
      ) {
        return true;
      }
    });
    return results;
  };

  return (
    <WFSLayer
      key={JSON.stringify(layerState)}
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
