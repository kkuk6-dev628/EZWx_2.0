/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from 'react';
import { MapContainer, ZoomControl } from 'react-leaflet';
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
import Dialog from '@material-ui/core/Dialog';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import Route from '../../shared/Route';
import CollapsibleBar from '../../shared/CollapsibleBar';
import DateSliderModal from '../../shared/DateSliderModal';
import MeteoLayers from './layers/MeteoLayers';
// import './plugins/CacheTileLayer';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import BaseMapLayers from './layers/BaseMapLayers';
import { selectBaseMapLayerControl, setBaseMapLayerControl } from '../../../store/layers/BaseMapLayerControl';
import { selectAuth } from '../../../store/auth/authSlice';
import { toast } from 'react-hot-toast';
import { useGetAirportQuery } from '../../../store/route/airportApi';
import { useGetWaypointsQuery } from '../../../store/route/waypointApi';
import { simpleTimeOnlyFormat } from '../common/AreoFunctions';
import MapSideButtons from '../../shared/MapSideButtons';
import {
  useUpdateBaseLayerControlStateMutation,
  useUpdateLayerControlStateMutation,
} from '../../../store/layers/layerControlApi';
import { jsonClone } from '../../utils/ObjectUtil';
import { BaseMapLayerControlState, LayerControlState } from '../../../interfaces/layerControl';
import { selectLayerControlState, setLayerControlState } from '../../../store/layers/LayerControl';

const PaperComponent = (props) => {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
};

const maxScreenDimension = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth;
const minZoom = maxScreenDimension > 1024 ? 4 : 3;
const defaultBounds = [
  [55.0, -130.0],
  [20.0, -60.0],
];

const LeafletMap = () => {
  const { pathname } = useRouter();
  const [isShowTabs, setIsShowTabs] = useState(false);
  const [isShowDateModal, setIsShowDateModal] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const [zuluTime, setZuluTime] = useState(simpleTimeOnlyFormat(new Date(), false));
  const dispatch = useDispatch();
  const baseMapLayerControl = useSelector(selectBaseMapLayerControl);
  const auth = useSelector(selectAuth);
  useGetWaypointsQuery('');
  useGetAirportQuery('');
  const layerControlState = useSelector(selectLayerControlState);
  const [updateLayerControlState] = useUpdateLayerControlStateMutation();
  const [updateBaseLayerControlState] = useUpdateBaseLayerControlStateMutation();

  useEffect(() => {
    const interval = setInterval(() => setZuluTime(simpleTimeOnlyFormat(new Date(), false)), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pathname === '/try-ezwxbrief') {
      setIsShowTabs(true);
    }
  }, [pathname]);

  const setLayerControlShow = (layerControlShow: boolean) => {
    const cloned = jsonClone(layerControlState) as LayerControlState;
    cloned.show = layerControlShow;
    dispatch(setLayerControlState(cloned));
    if (auth.id) updateLayerControlState(cloned);
  };

  const setBaseLayerControlShow = (baseLayerControlShow: boolean) => {
    const cloned = jsonClone(baseMapLayerControl) as BaseMapLayerControlState;
    cloned.show = baseLayerControlShow;
    dispatch(setBaseMapLayerControl(cloned));
    if (auth.id) updateBaseLayerControlState(cloned);
  };

  const handler = (id: string) => {
    switch (id) {
      case 'layer':
        setLayerControlShow(!layerControlState.show);
        setBaseLayerControlShow(false);
        break;
      case 'basemap':
        setLayerControlShow(false);
        setBaseLayerControlShow(!baseMapLayerControl.show);
        break;
      case 'route':
        if (auth.id) {
          setIsShowModal(true);
        } else {
          toast.error('Please sign in to create route!');
        }
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
      name: zuluTime,
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
      {isShowTabs && <MapTabs tabMenus={tabMenus} />}
      <MapContainer
        className={styles.map}
        bounds={
          baseMapLayerControl.bounds && baseMapLayerControl.bounds.length ? baseMapLayerControl.bounds : defaultBounds
        }
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
        minZoom={minZoom}
        maxZoom={18}
      >
        <BaseMapLayers></BaseMapLayers>
        <MeteoLayers></MeteoLayers>
        {/* <MapSearch /> */}
        <MapSideButtons></MapSideButtons>
        <ZoomControl
          position="topright"
          zoomInText={ReactDOMServer.renderToString(<SvgRoundPlus></SvgRoundPlus>)}
          zoomOutText={ReactDOMServer.renderToString(<SvgRoundMinus></SvgRoundMinus>)}
        />
        <Dialog
          PaperComponent={PaperComponent}
          hideBackdrop
          disableEnforceFocus
          style={{ position: 'absolute' }}
          open={isShowModal}
          onClose={() => setIsShowModal(false)}
          aria-labelledby="draggable-dialog-title"
        >
          <Route setIsShowModal={setIsShowModal} />
        </Dialog>
      </MapContainer>
      {isShowDateModal && <DateSliderModal setIsShowDateModal={setIsShowDateModal} />}
      <CollapsibleBar />
    </div>
  );
};

export default LeafletMap;
