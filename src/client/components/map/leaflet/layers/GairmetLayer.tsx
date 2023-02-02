import { PathOptions } from 'leaflet';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectGairmet } from '../../../../store/layers/LayerControl';
import { addLeadingZeroes } from '../../common/AreoFunctions';
import WFSLayer from './WFSLayer';

const GairmetLayer = () => {
  const [jsonData, setJsonData] = useState();
  const layerState = useSelector(selectGairmet);
  const [renderedTime, setRenderedTime] = useState(Date.now());
  useEffect(() => {
    if (layerState.checked) {
      setRenderedTime(Date.now());
    }
  }, [
    layerState.all.checked,
    layerState.multiFrzLevels.checked,
    layerState.turbulenceHi.checked,
    layerState.airframeIcing.checked,
    layerState.turbulenceLow.checked,
    layerState.ifrConditions.checked,
    layerState.mountainObscuration.checked,
    layerState.nonconvectiveLlws.checked,
    layerState.sfcWinds.checked,
  ]);
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
        label = `Frz<br/>${addLeadingZeroes(
          feature.properties.top,
          3,
        )}<br/>${addLeadingZeroes(base, 3)}`;
        break;
    }
    return label;
  };
  const clientFilter = (
    features: GeoJSON.Feature[],
    observationTime: Date,
  ): GeoJSON.Feature[] => {
    setJsonData({ type: 'FeatureCollection', features: features } as any);
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
      const inTime = start <= observationTime && observationTime < end;
      if (!inTime) {
        return false;
      }
      if (layerState.all.checked) {
        return true;
      }
      if (
        layerState.airframeIcing.checked &&
        feature.properties.hazard === 'ICE'
      ) {
        return true;
      }
      if (
        layerState.multiFrzLevels.checked &&
        feature.properties.hazard === 'M_FZLVL'
      ) {
        return true;
      }
      if (
        layerState.turbulenceHi.checked &&
        feature.properties.hazard === 'TURB-HI'
      ) {
        return true;
      }
      if (
        layerState.turbulenceLow.checked &&
        feature.properties.hazard === 'TURB-LO'
      ) {
        return true;
      }
      if (
        layerState.ifrConditions.checked &&
        feature.properties.hazard === 'IFR'
      ) {
        return true;
      }
      if (
        layerState.mountainObscuration.checked &&
        feature.properties.hazard === 'MT_OBSC'
      ) {
        return true;
      }
      if (
        layerState.nonconvectiveLlws.checked &&
        feature.properties.hazard === 'LLWS'
      ) {
        return true;
      }
      if (
        layerState.sfcWinds.checked &&
        feature.properties.hazard === 'SFC_WND'
      ) {
        return true;
      }
      return false;
    });
    return results;
  };

  return (
    <WFSLayer
      key={renderedTime}
      initData={jsonData}
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
