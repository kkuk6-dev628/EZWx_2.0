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
import { selectBaseMapLayerControlShow, setBaseMapLayerControlShow } from '../../../store/layers/BaseMapLayerControl';
import { selectAuth } from '../../../store/auth/authSlice';
import { toast } from 'react-hot-toast';
import { useGetAirportQuery } from '../../../store/route/airportApi';
import { useGetRoutesQuery } from '../../../store/route/routeApi';
import { useGetWaypointsQuery } from '../../../store/route/waypointApi';
import { simpleTimeOnlyFormat } from '../common/AreoFunctions';
import MapSideButtons from '../../shared/MapSideButtons';
import {
  useGetLayerControlStateQuery,
  useUpdateLayerControlStateMutation,
} from '../../../store/layers/layerControlApi';
import { jsonClone } from '../../utils/ObjectUtil';
import { LayerControlState } from '../../../interfaces/layerControl';

const PaperComponent = (props) => {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
};

const maxScreenDimension = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth;
const minZoom = maxScreenDimension > 1280 ? 4 : 2;

const LeafletMap = () => {
  const { pathname } = useRouter();
  const [isShowTabs, setIsShowTabs] = useState(false);
  const [isShowDateModal, setIsShowDateModal] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const [zuluTime, setZuluTime] = useState(simpleTimeOnlyFormat(new Date(), false));
  const dispatch = useDispatch();
  const baseMapLayerControlShow = useSelector(selectBaseMapLayerControlShow);
  const auth = useSelector(selectAuth);
  const { data: waypointsData } = useGetWaypointsQuery('');
  const { data: airportsData } = useGetAirportQuery('');
  const {
    data: layerControlState,
    isLoading: isLayerControlStateLoading,
    error: errorLayerControlStateLoading,
  } = useGetLayerControlStateQuery('');
  const [updateLayerControlState] = useUpdateLayerControlStateMutation();

  if (auth.id) {
    useGetRoutesQuery(null);
  }

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
    updateLayerControlState(cloned);
  };
  const handler = (id: string) => {
    switch (id) {
      case 'layer':
        setLayerControlShow(!layerControlState.show);
        dispatch(setBaseMapLayerControlShow(false));
        break;
      case 'basemap':
        setLayerControlShow(false);
        dispatch(setBaseMapLayerControlShow(!baseMapLayerControlShow));
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
        minZoom={minZoom}
        maxZoom={18}
      >
        <BaseMapLayers></BaseMapLayers>
        {!isLayerControlStateLoading && !errorLayerControlStateLoading && <MeteoLayers></MeteoLayers>}
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

      {isShowTabs && <MapTabs tabMenus={tabMenus} />}
      {isShowDateModal && <DateSliderModal setIsShowDateModal={setIsShowDateModal} />}
      <CollapsibleBar />
    </div>
  );
};

export default LeafletMap;
