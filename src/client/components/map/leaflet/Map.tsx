/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FormEvent, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import styles from './Map.module.css';
import BoundedWFSLayer from './layers/BoundedWFSLayer';
import MapTabs from '../../shared/MapTabs';
import { SvgRoundMinus, SvgRoundPlus } from '../../utils/SvgIcons';
import ReactDOMServer from 'react-dom/server';
import LayerControl, { GroupedLayer } from './layer-control/LayerControl';

function LeafletMap() {
  const [, setMap] = useState(null);
  const [layerControlCollapsed, setLayerControlCollapsed] = useState(true);
  const [baseMapControlCollapsed, setBaseMapControlCollapsed] = useState(true);

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
        <LayerControl position="topright" collapsed={baseMapControlCollapsed}>
          <GroupedLayer checked name="ArcGIS Online" group="Base Maps">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
          </GroupedLayer>
          <GroupedLayer checked name="OpenStreetMap" group="Base Maps">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </GroupedLayer>
        </LayerControl>

        <LayerControl position="topright" collapsed={layerControlCollapsed}>
          <GroupedLayer checked name="Sf Bugsites" group="Layers">
            <BoundedWFSLayer
              url="http://3.95.80.120:8080/geoserver/sf/ows"
              maxFeatures={256}
              typeName="sf:bugsites"
            ></BoundedWFSLayer>
          </GroupedLayer>
          <GroupedLayer checked name="GAirmet" group="Layers">
            <BoundedWFSLayer
              url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
              maxFeatures={256}
              typeName="EZWxBrief:gairmet_latest"
              propertyNames={['wkb_geometry', 'id']}
              enableBBoxQuery={true}
            ></BoundedWFSLayer>
          </GroupedLayer>
          <GroupedLayer checked name="States" group="Layers">
            <BoundedWFSLayer
              url="http://3.95.80.120:8080/geoserver/topp/ows"
              maxFeatures={256}
              typeName="topp:states"
            ></BoundedWFSLayer>
          </GroupedLayer>
        </LayerControl>
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
      <MapTabs
        layerClick={(): void => {
          setLayerControlCollapsed(!layerControlCollapsed);
        }}
        routeClick={(_event: FormEvent<Element>): void => {
          throw new Error('Function not implemented.');
        }}
        profileClick={(_event: FormEvent<Element>): void => {
          throw new Error('Function not implemented.');
        }}
        basemapClick={(): void => {
          setBaseMapControlCollapsed(!baseMapControlCollapsed);
        }}
      />
    </div>
  );
}

export default LeafletMap;
