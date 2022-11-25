/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import styles from './Map.module.css';
import BoundedWFSLayer from './layers/BoundedWFSLayer';
import MapTabs from '../../shared/MapTabs';
import {
  SvgBulbDollar,
  SvgRoundMinus,
  SvgRoundPlus,
} from '../../utils/SvgIcons';
import ReactDOMServer from 'react-dom/server';

function LeafletMap() {
  const [, setMap] = useState(null);

  const handleOnMapMounted = (evt: { leafletElement: any }) => {
    setMap(evt ? evt.leafletElement : null);
  };

  return (
    <div className="map__container">
      <MapContainer
        className={styles.map}
        bounds={[
          [55.0, -130.0],
          [20.0, -60.0],
        ]}
        // @ts-ignore
        zoomControl={false}
        ref={handleOnMapMounted}
      >
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />

        <BoundedWFSLayer
          url="http://3.95.80.120:8080/geoserver/sf/ows"
          maxFeatures={256}
          typeName="sf:bugsites"
        ></BoundedWFSLayer>

        <BoundedWFSLayer
          url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
          maxFeatures={256}
          typeName="EZWxBrief:gairmet_latest"
          enableBBoxQuery={true}
        ></BoundedWFSLayer>

        <BoundedWFSLayer
          url="http://3.95.80.120:8080/geoserver/topp/ows"
          maxFeatures={256}
          typeName="topp:states"
        ></BoundedWFSLayer>

        <ZoomControl
          position="topright"
          zoomInText={ReactDOMServer.renderToString(
            <SvgRoundPlus></SvgRoundPlus>,
          )}
          zoomOutText={ReactDOMServer.renderToString(
            <SvgRoundMinus></SvgRoundMinus>,
          )}
        />
      </MapContainer>
      <MapTabs />
    </div>
  );
}

export default LeafletMap;
