/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FormEvent, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import styles from './Map.module.css';
import MapTabs from '../../shared/MapTabs';
import { SvgRoundMinus, SvgRoundPlus } from '../../utils/SvgIcons';
import ReactDOMServer from 'react-dom/server';
import LayerControl, { GroupedLayer } from './layer-control/LayerControl';
import { useRouter } from 'next/router';
import MeteoLayers from './layers/MeteoLayers';

function LeafletMap() {
  const { pathname } = useRouter();
  const [isShowTabs, setIsShowTabs] = useState(false);
  const [layerControlCollapsed, setLayerControlCollapsed] = useState(true);
  const [baseMapControlCollapsed, setBaseMapControlCollapsed] = useState(true);

  useEffect(() => {
    if (pathname === '/try-ezwxbrief') {
      setIsShowTabs(true);
    }
  }, [pathname]);

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
        attributionControl={false}
        preferCanvas={true}
        // renderer={L.canvas()}
      >
        <LayerControl
          position="topright"
          collapsed={baseMapControlCollapsed}
          exclusive={true}
        >
          <GroupedLayer checked name="Topo" group="Base Maps">
            <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
          </GroupedLayer>
          <GroupedLayer checked name="Street" group="Base Maps">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </GroupedLayer>
          <GroupedLayer checked name="Terrain" group="Base Maps">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
          </GroupedLayer>
          <GroupedLayer checked name="Dark" group="Base Maps">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              // @ts-ignore
              subdomains="abcd"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </GroupedLayer>
          <GroupedLayer checked name="Satellite" group="Base Maps">
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
          </GroupedLayer>
        </LayerControl>
        <MeteoLayers
          layerControlCollapsed={layerControlCollapsed}
        ></MeteoLayers>
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
      {isShowTabs && (
        <MapTabs
          layerClick={(): void => {
            setBaseMapControlCollapsed(true);
            setLayerControlCollapsed(!layerControlCollapsed);
          }}
          routeClick={(_event: FormEvent<Element>): void => {
            throw new Error('Function not implemented.');
          }}
          profileClick={(_event: FormEvent<Element>): void => {
            throw new Error('Function not implemented.');
          }}
          basemapClick={(): void => {
            setLayerControlCollapsed(true);
            setBaseMapControlCollapsed(!baseMapControlCollapsed);
          }}
        />
      )}
    </div>
  );
}

export default LeafletMap;
