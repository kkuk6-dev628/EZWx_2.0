/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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
import './layers/CacheTileLayer';
import WFSLayer from './layers/WFSLayer';

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
      case 'profile':
        setIsShowDateModal(!isShowDateModal);
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
        // timeDimension={true}
        // timeDimensionOptions={{
        //   timeInterval: '2023-01-12T05:00:00.000Z/2023-01-12T17:00:00.000Z',
        //   period: 'PT1H',
        // }}
        // timeDimensionControl={true}
        zoomControl={false}
        attributionControl={false}
        // preferCanvas={true}
        renderer={L.canvas()}
      >
        <LayerControl
          position="topright"
          collapsed={baseMapControlCollapsed}
          exclusive={true}
          defaultLayer="Street"
          exclusiveSkipLayers={['U.S. States']}
        >
          <GroupedLayer
            checked
            name="U.S. States"
            group="Base Admin"
            pickable={false}
            order={0}
          >
            <WFSLayer
              url="http://3.95.80.120:8080/geoserver/topp/ows"
              maxFeatures={256}
              typeName="topp:states"
              interactive={false}
              style={() => {
                return {
                  fillOpacity: 0,
                  weight: 1,
                };
              }}
            ></WFSLayer>
          </GroupedLayer>
          <GroupedLayer checked name="Street" group="Base Maps" order={2}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              // @ts-ignore
              useCache={false}
            />
          </GroupedLayer>
          <GroupedLayer checked name="Topo" group="Base Maps" order={3}>
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              // @ts-ignore
              useCache={false}
            />
          </GroupedLayer>
          <GroupedLayer checked name="Terrain" group="Base Maps" order={4}>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              // @ts-ignore
              useCache={false}
            />
          </GroupedLayer>
          <GroupedLayer checked name="Dark" group="Base Maps" order={5}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              // @ts-ignore
              subdomains="abcd"
              // @ts-ignore
              useCache={false}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </GroupedLayer>
          <GroupedLayer checked name="Satellite" group="Base Maps" order={6}>
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              // @ts-ignore
              useCache={false}
            />
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
      <CollapsibleBar />
    </div>
  );
}

export default LeafletMap;
