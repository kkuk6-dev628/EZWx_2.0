import { PathOptions } from 'leaflet';
import { useEffect, useState } from 'react';
import { useGetLayerControlStateQuery } from '../../../../store/layers/layerControlApi';
import { db } from '../../../caching/dexieDb';
import WFSLayer from './WFSLayer';

const CWALayer = () => {
  const [jsonData, setJsonData] = useState();
  const { data: layerControlState } = useGetLayerControlStateQuery('');
  const cwaLayerState = layerControlState.cwaState;
  const [renderedTime, setRenderedTime] = useState(Date.now());
  useEffect(() => {
    if (cwaLayerState.checked) {
      setRenderedTime(Date.now());
    }
  }, [
    cwaLayerState.all.checked,
    cwaLayerState.convection.checked,
    cwaLayerState.turbulence.checked,
    cwaLayerState.airframeIcing.checked,
    cwaLayerState.ifrConditions.checked,
    cwaLayerState.other.checked,
  ]);

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
  const clientFilter = (features: GeoJSON.Feature[], observationTime: Date): GeoJSON.Feature[] => {
    setJsonData({ type: 'FeatureCollection', features: features } as any);
    const results = features.filter((feature) => {
      const start = new Date(feature.properties.validtimefrom);
      const end = new Date(feature.properties.validtimeto);
      const inTime = start <= observationTime && observationTime < end;
      if (!inTime) {
        return false;
      }
      if (cwaLayerState.all.checked) {
        return true;
      }
      if (cwaLayerState.airframeIcing.checked && feature.properties.hazard === 'ICE') {
        return true;
      }
      if (cwaLayerState.turbulence.checked && feature.properties.hazard === 'TURB') {
        return true;
      }
      if (cwaLayerState.ifrConditions.checked && feature.properties.hazard === 'IFR') {
        return true;
      }
      if (
        cwaLayerState.convection.checked &&
        (feature.properties.hazard === 'TS' || feature.properties.hazard === 'PCPN')
      ) {
        return true;
      }
      if (
        cwaLayerState.other.checked &&
        ['ICE', 'TURB', 'IFR', 'TS', 'PCPN'].includes(feature.properties.hazard) === false
      ) {
        return true;
      }
    });
    return results;
  };

  return (
    <WFSLayer
      key={renderedTime}
      initData={jsonData}
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
      layerStateName={'cwaState'}
      readDb={() => db.cwa.toArray()}
      writeDb={(features) => {
        db.cwa.clear();
        db.cwa.bulkAdd(features);
      }}
    ></WFSLayer>
  );
};

export default CWALayer;
