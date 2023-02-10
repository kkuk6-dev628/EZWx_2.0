/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from 'react';
import { MapContainer, ZoomControl } from 'react-leaflet';
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
import { useRouter } from 'next/router';
import Route from '../../shared/Route';
import CollapsibleBar from '../../shared/CollapsibleBar';
import DateSliderModal from '../../shared/DateSliderModal';
import MeteoLayers from './layers/MeteoLayers';
import './plugins/CacheTileLayer';
import { useDispatch } from 'react-redux';
import { selectLayerControlShow, setLayerControlShow } from '../../../store/layers/LayerControl';
import { useSelector } from 'react-redux';
import BaseMapLayers from './layers/BaseMapLayers';
import { selectBaseMapLayerControlShow, setBaseMapLayerControlShow } from '../../../store/layers/BaseMapLayerControl';
import MapSearch from '../../shared/MapSearch';

function LeafletMap() {
  const { pathname } = useRouter();
  const [isShowTabs, setIsShowTabs] = useState(false);
  const [isShowDateModal, setIsShowDateModal] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const dispatch = useDispatch();
  const meteoLayerControlShow = useSelector(selectLayerControlShow);
  const baseMapLayerControlShow = useSelector(selectBaseMapLayerControlShow);

  useEffect(() => {
    if (pathname === '/try-ezwxbrief') {
      setIsShowTabs(true);
    }
  }, [pathname]);

  const handler = (id: string) => {
    switch (id) {
      case 'layer':
        dispatch(setLayerControlShow(!meteoLayerControlShow));
        dispatch(setBaseMapLayerControlShow(false));
        break;
      case 'basemap':
        dispatch(setLayerControlShow(false));
        dispatch(setBaseMapLayerControlShow(!baseMapLayerControlShow));
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
        <BaseMapLayers></BaseMapLayers>
        <MeteoLayers></MeteoLayers>
        <MapSearch />
        <ZoomControl
          position="topright"
          zoomInText={ReactDOMServer.renderToString(<SvgRoundPlus></SvgRoundPlus>)}
          zoomOutText={ReactDOMServer.renderToString(<SvgRoundMinus></SvgRoundMinus>)}
        />
      </MapContainer>
      {isShowTabs && <MapTabs tabMenus={tabMenus} />}
      {isShowModal && <Route setIsShowModal={setIsShowModal} />}
      {isShowDateModal && <DateSliderModal setIsShowDateModal={setIsShowDateModal} />}
      <CollapsibleBar />
    </div>
  );
}

export default LeafletMap;
