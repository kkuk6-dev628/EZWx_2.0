import { PathOptions } from 'leaflet';
import { selectOutlooks } from '../../../../store/layers/LayerControl';
import { db } from '../../../caching/dexieDb';
import WFSLayer from './WFSLayer';

const ConvectiveOutlookLayer = () => {
  const style = (): PathOptions => {
    const style = {
      color: '#F0F000',
      weight: 2,
      opacity: 0.7,
    };
    return style;
  };

  const getLabel = (): string => {
    const label = 'Conv<br/>Outlook';
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
    const results = features.filter((feature) => {
      const start = new Date(feature.properties.valid_time_from);
      const end = new Date(feature.properties.valid_time_to);
      return start <= observationTime && observationTime < end;
    });
    return results;
  };

  return (
    <WFSLayer
      url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
      maxFeatures={256}
      typeName="EZWxBrief:conv_outlook"
      propertyNames={['wkb_geometry', 'ogc_fid', 'valid_time_from', 'valid_time_to', 'raw_text']}
      style={style}
      getLabel={getLabel}
      clientFilter={clientFilter}
      layerStateSelector={selectOutlooks}
      readDb={() => db.convectiveOutlook.toArray()}
      writeDb={(features) => {
        db.convectiveOutlook.clear();
        db.convectiveOutlook.bulkAdd(features);
      }}
    ></WFSLayer>
  );
};

export default ConvectiveOutlookLayer;
