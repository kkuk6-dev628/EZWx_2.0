import { PathOptions } from 'leaflet';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCwa } from '../../../../store/layers/LayerControl';
import WFSLayer from './WFSLayer';

const CWALayer = () => {
  const [jsonData, setJsonData] = useState();
  const layerState = useSelector(selectCwa);
  const [renderedTime, setRenderedTime] = useState(Date.now());
  useEffect(() => {
    if (layerState.checked) {
      setRenderedTime(Date.now());
    }
  }, [
    layerState.all.checked,
    layerState.convection.checked,
    layerState.turbulence.checked,
    layerState.airframeIcing.checked,
    layerState.ifrConditions.checked,
    layerState.other.checked,
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
      if (layerState.all.checked) {
        return true;
      }
      if (layerState.airframeIcing.checked && feature.properties.hazard === 'ICE') {
        return true;
      }
      if (layerState.turbulence.checked && feature.properties.hazard === 'TURB') {
        return true;
      }
      if (layerState.ifrConditions.checked && feature.properties.hazard === 'IFR') {
        return true;
      }
      if (
        layerState.convection.checked &&
        (feature.properties.hazard === 'TS' || feature.properties.hazard === 'PCPN')
      ) {
        return true;
      }
      if (
        layerState.other.checked &&
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
    ></WFSLayer>
  );
};

export default CWALayer;
