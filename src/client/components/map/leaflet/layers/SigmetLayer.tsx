import { PathOptions } from 'leaflet';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectLayerControlState } from '../../../../store/layers/LayerControl';
import { db } from '../../../caching/dexieDb';
import { wfsUrl1 } from '../../common/AreoConstants';
import WFSLayer from './WFSLayer';

const SigmetLayer = () => {
  const [jsonData, setJsonData] = useState();
  const layerControlState = useSelector(selectLayerControlState);
  const sigmetLayerState = layerControlState.sigmetState;
  const [renderedTime, setRenderedTime] = useState(Date.now());
  useEffect(() => {
    if (sigmetLayerState.checked) {
      setRenderedTime(Date.now());
    }
  }, [
    sigmetLayerState.all.checked,
    sigmetLayerState.convection.checked,
    sigmetLayerState.turbulence.checked,
    sigmetLayerState.airframeIcing.checked,
    sigmetLayerState.dust.checked,
    sigmetLayerState.ash.checked,
    sigmetLayerState.other.checked,
  ]);

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
        label = `ICE`;
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

  const clientFilter = (features: GeoJSON.Feature[], observationTime: Date): GeoJSON.Feature[] => {
    setJsonData({ type: 'FeatureCollection', features: features } as any);
    const results = features.filter((feature) => {
      const start = new Date(feature.properties.validtimefrom);
      const end = new Date(feature.properties.validtimeto);
      const inTime = start <= observationTime && observationTime < end;
      if (!inTime) {
        return false;
      }
      if (sigmetLayerState.all.checked) {
        return true;
      }
      if (sigmetLayerState.convection.checked && feature.properties.hazard === 'CONVECTIVE') {
        return true;
      }
      if (sigmetLayerState.turbulence.checked && feature.properties.hazard === 'TURB') {
        return true;
      }
      if (sigmetLayerState.airframeIcing.checked && feature.properties.hazard === 'ICING') {
        return true;
      }
      if (sigmetLayerState.dust.checked && feature.properties.hazard === 'IFR') {
        return true;
      }
      if (sigmetLayerState.ash.checked && feature.properties.hazard === 'ASH') {
        return true;
      }
      if (
        sigmetLayerState.other.checked &&
        ['CONVECTIVE', 'TURB', 'ICING', 'IFR', 'ASH'].includes(feature.properties.hazard) === false
      ) {
        return true;
      }
    });
    return results;
  };

  return (
    <WFSLayer
      key={renderedTime}
      url={wfsUrl1}
      maxFeatures={256}
      typeName="EZWxBrief:sigmet"
      initData={jsonData}
      propertyNames={[
        'wkb_geometry',
        // 'id',
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
      layerStateName={'sigmetState'}
    ></WFSLayer>
  );
};

export default SigmetLayer;
