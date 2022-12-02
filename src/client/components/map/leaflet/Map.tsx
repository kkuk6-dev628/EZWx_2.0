/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import styles from './Map.module.css';
import MapTabs from '../../shared/MapTabs';
import {
  SvgLayer,
  SvgMap,
  SvgProfileCharge,
  SvgRoundMinus,
  SvgRoundPlus,
  SvgRoute,
  SvgTemperature,
  SvgThreeDot,
} from '../../utils/SvgIcons';
import ReactDOMServer from 'react-dom/server';
import LayerControl, { GroupedLayer } from './layer-control/LayerControl';
import { useRouter } from 'next/router';
import Route from '../../shared/Route';
import CollapsibleBar from '../../shared/CollapsibleBar';
import DateSliderModal from '../../shared/DateSliderModal';
import MeteoLayers from './layers/MeteoLayers';

function LeafletMap() {
  const { pathname } = useRouter();
  const [isShowTabs, setIsShowTabs] = useState(false);
  const [isShowDateModal, setIsShowDateModal] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const [layerControlCollapsed, setLayerControlCollapsed] = useState(true);
  const [baseMapControlCollapsed, setBaseMapControlCollapsed] = useState(true);

  useEffect(() => {
    if (pathname === '/try-ezwxbrief') {
      setIsShowTabs(true);
    }
  }, [pathname]);

  const handler = (id: string) => {
    switch (id) {
      case 'layer':
        setBaseMapControlCollapsed(true);
        setLayerControlCollapsed(!layerControlCollapsed);
        break;
      case 'basemap':
        setLayerControlCollapsed(true);
        setBaseMapControlCollapsed(!baseMapControlCollapsed);
        break;
      case 'route':
        setIsShowModal(true);
        break;
      default:
        break;
    }
  };

  const tabMenus = [
    {
      id: '1040Z',
      name: '1040Z',
      handler: handler,
      svg: null,
      isHideResponsive: true,
    },
    {
      id: 'layer',
      name: 'Layer',
      svg: <SvgLayer />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'route',
      name: 'Route',
      svg: <SvgRoute />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'profile',
      name: 'Profile',
      svg: <SvgProfileCharge />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'more',
      name: 'More',
      svg: <SvgThreeDot />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'basemap',
      name: 'Base map',
      svg: <SvgMap />,
      handler: handler,
      isHideResponsive: true,
    },
    {
      id: '7days',
      name: '7 days',
      svg: <SvgTemperature />,
      handler: handler,
      isHideResponsive: true,
    },
  ];

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
      {isShowTabs && <MapTabs tabMenus={tabMenus} />}
      {isShowModal && <Route setIsShowModal={setIsShowModal} />}
      {isShowDateModal && (
        <DateSliderModal setIsShowDateModal={setIsShowDateModal} />
      )}
      <CollapsibleBar setIsShowDateModal={setIsShowDateModal} />
    </div>
  );
}

export default LeafletMap;
