/* eslint-disable @typescript-eslint/ban-ts-comment */
import MeteoLayerControl, { GroupedLayer } from '../layer-control/MeteoLayerControl';
import { LayerGroup, Pane, useMapEvents } from 'react-leaflet';
import L, { LatLng, LeafletMouseEvent, Path } from 'leaflet';
import GairmetLayer from './GairmetLayer';
import { useContext, useEffect, useRef } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import FeatureSelector from '../popups/FeatureSelector';
import ReactDOMServer from 'react-dom/server';
import GairmetPopup from '../popups/GairmetPopup';
import GeneralPopup from '../popups/GeneralPopup';
import SigmetLayer from './SigmetLayer';
import CWALayer from './CWALayer';
import SigmetPopup from '../popups/SigmetPopup';
import CWAPopup from '../popups/CWAPopup';
import ConvectiveOutlookLayer from './ConvectiveOutlookLayer';
import ConvectiveOutlookPopup from '../popups/ConvectiveOutlookPopup';
import IntlSigmetLayer from './IntlSigmetLayer';
import IntlSigmetPopup from '../popups/IntlSigmetPopup';
import PirepLayer from './PirepLayer';
import PIREPPopup from '../popups/PIREPPopup';
import 'leaflet-responsive-popup';
import 'leaflet-responsive-popup/leaflet.responsive.popup.css';
import MetarsPopup from '../popups/MetarsPopup';
import { useSelector } from 'react-redux';
import { selectPersonalMinimums, selectSettings } from '../../../../store/user/UserSettings';
import { StationMarkersLayerItems, paneOrders, pickupRadiusPx } from '../../common/AreoConstants';
import { useMeteoLayersContext } from '../layer-control/MeteoLayerControlContext';
import { InLayerControl } from '../layer-control/MeteoLayerControl';
import { InBaseLayerControl } from '../layer-control/BaseMapLayerControl';
import RadarLayer from './RadarLayer';
import { StationMarkersLayer } from './StationMarkersLayer';
import StationForecastPopup from '../popups/StationForecastPopup';
import { selectActiveRoute } from '../../../../store/route/routes';
import { addRouteToMap } from '../../../shared/Route';
import { selectLayerControlState } from '../../../../store/layers/LayerControl';
import { useGetAllAirportsQuery } from '../../../../store/airportwx/airportwxApi';

const maxLayers = 6;

const MeteoLayers = () => {
  const layers = useMeteoLayersContext();
  const debugLayerGroupRef = useRef(null);
  const personalMinimums = useSelector(selectPersonalMinimums);
  const { data: airportsData } = useGetAllAirportsQuery('');
  const settingsState = useSelector(selectSettings);
  const activeRoute = useSelector(selectActiveRoute);
  const layerControlState = useSelector(selectLayerControlState);

  useEffect(() => {
    if (!meteoLayers.routeGroupLayer) {
      meteoLayers.routeGroupLayer = new L.LayerGroup();
    }
    if (!map.hasLayer(meteoLayers.routeGroupLayer)) {
      map.addLayer(meteoLayers.routeGroupLayer);
    }
    if (activeRoute) {
      addRouteToMap(activeRoute, meteoLayers.routeGroupLayer);
    } else if (meteoLayers.routeGroupLayer) {
      meteoLayers.routeGroupLayer.clearLayers();
    }
  }, [activeRoute]);

  const showPopup = (layer: L.GeoJSON, latlng: L.LatLng): void => {
    if (typeof layer.setStyle === 'function') {
      layer.setStyle({
        weight: 8,
      });
    }

    // @ts-ignore
    const layerName = layer.feature.id.split('.')[0];
    let popup;
    let useWidePopup = false;
    let offsetX = 10;
    switch (layerName) {
      case 'gairmet':
        popup = <GairmetPopup feature={layer.feature} userSettings={settingsState}></GairmetPopup>;
        useWidePopup = false;
        break;
      case 'sigmet':
        popup = <SigmetPopup feature={layer.feature} userSettings={settingsState}></SigmetPopup>;
        useWidePopup = true;
        break;
      case 'intl_sigmet':
        popup = <IntlSigmetPopup feature={layer.feature} userSettings={settingsState}></IntlSigmetPopup>;
        useWidePopup = true;
        break;
      case 'cwa':
        popup = <CWAPopup feature={layer.feature} userSettings={settingsState}></CWAPopup>;
        useWidePopup = true;
        break;
      case 'conv_outlook':
        popup = <ConvectiveOutlookPopup feature={layer.feature} userSettings={settingsState}></ConvectiveOutlookPopup>;
        useWidePopup = true;
        break;
      case 'pirep':
        popup = <PIREPPopup feature={layer.feature} userSettings={settingsState}></PIREPPopup>;
        useWidePopup = true;
        break;
      case 'metar':
        if (layerControlState.stationMarkersState.markerType === StationMarkersLayerItems.ceilingHeight.value) {
          offsetX = 25;
        }
        popup = (
          <MetarsPopup
            layer={layer as any}
            airportsData={airportsData}
            personalMinimums={personalMinimums}
            userSettings={settingsState}
          ></MetarsPopup>
        );
        useWidePopup = true;
        break;
      default:
        if (layerName.indexOf('station') === 0) {
          popup = (
            <StationForecastPopup
              layer={layer as any}
              airportsData={airportsData}
              personalMinimums={personalMinimums}
              userSettings={settingsState}
            ></StationForecastPopup>
          );
          break;
        }
        popup = <GeneralPopup feature={layer.feature} title={`${layerName} properties`}></GeneralPopup>;
        useWidePopup = false;
        break;
    }
    const popupContent = ReactDOMServer.renderToString(popup);
    L.responsivePopup({
      minWidth: useWidePopup ? 320 : 196,
      offset: [offsetX, 19],
    })
      .setLatLng(latlng)
      .setContent(popupContent)
      .openOn(map);
  };

  const inLayerControl = useContext(InLayerControl);
  const inBaseLayerControl = useContext(InBaseLayerControl);

  const map = useMapEvents({
    click: (e: LeafletMouseEvent) => {
      if (inLayerControl.value) return;
      if (inBaseLayerControl.value) return;
      const features = [];
      if (debugLayerGroupRef.current) {
        debugLayerGroupRef.current.clearLayers();
      }
      Object.values(layers).forEach((layer: L.Path) => {
        if (!layer || layer.options.interactive !== true) return;
        if (map.hasLayer(layer) === false) return;
        //@ts-ignore
        if (layer.resetStyle) layer.resetStyle();
        if (features.length >= maxLayers) {
          return;
        }
        //@ts-ignore
        layer.eachLayer((l: any) => {
          if (features.length >= maxLayers) {
            return;
          }
          if (l.feature.geometry.type === 'Point' || l.feature.geometry.type === 'MultiPoint') {
            const featurePoint = map.latLngToLayerPoint(
              new LatLng(l.feature.geometry.coordinates[1], l.feature.geometry.coordinates[0]),
            );
            if (
              e.layerPoint.x - pickupRadiusPx < featurePoint.x &&
              e.layerPoint.y - pickupRadiusPx < featurePoint.y &&
              e.layerPoint.x + pickupRadiusPx > featurePoint.x &&
              e.layerPoint.y + pickupRadiusPx > featurePoint.y
            ) {
              features.push(l);
            }
          } else if (
            (l.feature.geometry.type === 'Polygon' || l.feature.geometry.type === 'MultiPolygon') &&
            booleanPointInPolygon([e.latlng.lng, e.latlng.lat], l.toGeoJSON())
          ) {
            features.push(l);
          }
        });
      });
      map.closePopup();

      if (features.length === 0) {
        return;
      } else if (features.length === 1) {
        showPopup(features[0], e.latlng);
      } else {
        L.responsivePopup({ offset: [10, 19] })
          .setLatLng(e.latlng)
          .setContent(
            ReactDOMServer.renderToString(
              <FeatureSelector features={features} userSettings={settingsState}></FeatureSelector>,
            ),
          )
          .openOn(map);
        const selectorFeatureNodes = document.getElementsByClassName('feature-selector-item');
        for (let i = 0; i < selectorFeatureNodes.length; i++) {
          selectorFeatureNodes[i].addEventListener('click', (ee) => {
            map.closePopup();
            // @ts-ignore
            const featureId = ee.currentTarget.dataset.featureid;
            features.forEach((layer) => {
              if (layer.feature.id === featureId) {
                showPopup(layer, e.latlng);
              }
            });
          });
        }
      }
    },
  });

  function sortLayers() {
    if (meteoLayers.gairmet) {
      meteoLayers.gairmet.bringToFront();
    }
    if (meteoLayers.convectiveOutlooks) {
      meteoLayers.convectiveOutlooks.bringToFront();
    }
    if (meteoLayers.intlSigmet) {
      meteoLayers.intlSigmet.bringToFront();
    }
    if (meteoLayers.sigmet) {
      meteoLayers.sigmet.bringToFront();
    }
    if (meteoLayers.cwa) {
      meteoLayers.cwa.bringToFront();
    }
  }
  // useEffect(() => {
  //   L.GridLayer.GridDebug = L.GridLayer.extend({
  //     createTile: function (coords) {
  //       const tile = document.createElement('div');
  //       tile.style.outline = '1px solid green';
  //       tile.style.fontWeight = 'bold';
  //       tile.style.fontSize = '14pt';
  //       tile.innerHTML = [coords.z, coords.x, coords.y].join('/');
  //       return tile;
  //     },
  //   });

  //   L.gridLayer.gridDebug = function (opts) {
  //     return new L.GridLayer.GridDebug(opts);
  //   };

  //   map.addLayer(L.gridLayer.gridDebug());
  // }, [map]);
  const meteoLayers = useMeteoLayersContext();
  return (
    <div className="route__layer">
      <MeteoLayerControl position="topright"></MeteoLayerControl>
      <RadarLayer></RadarLayer>
      <GroupedLayer
        checked={layerControlState.stationMarkersState.checked}
        addLayerToStore={(layer) => {
          meteoLayers.metar = layer;
        }}
      >
        <StationMarkersLayer />
      </GroupedLayer>
      <GroupedLayer
        checked={layerControlState.sigmetState.checked}
        addLayerToStore={(layer) => {
          meteoLayers.sigmet = layer as Path;
          sortLayers();
        }}
      >
        <SigmetLayer></SigmetLayer>
      </GroupedLayer>
      <GroupedLayer
        checked={layerControlState.sigmetState.checked && layerControlState.sigmetState.international.checked}
        addLayerToStore={(layer) => {
          meteoLayers.intlSigmet = layer as Path;
          sortLayers();
        }}
      >
        <IntlSigmetLayer></IntlSigmetLayer>
      </GroupedLayer>
      <GroupedLayer
        checked={layerControlState.sigmetState.checked && layerControlState.sigmetState.outlooks.checked}
        addLayerToStore={(layer) => {
          meteoLayers.convectiveOutlooks = layer as Path;
          sortLayers();
        }}
      >
        <ConvectiveOutlookLayer></ConvectiveOutlookLayer>
      </GroupedLayer>
      <GroupedLayer
        checked={layerControlState.gairmetState.checked}
        addLayerToStore={(layer) => {
          meteoLayers.gairmet = layer as Path;
          sortLayers();
        }}
      >
        {true && <GairmetLayer />}
      </GroupedLayer>
      <GroupedLayer
        checked={layerControlState.cwaState.checked}
        addLayerToStore={(layer) => {
          meteoLayers.cwa = layer as Path;
          sortLayers();
        }}
      >
        <CWALayer></CWALayer>
      </GroupedLayer>
      <GroupedLayer
        checked={layerControlState.pirepState.checked}
        addLayerToStore={(layer) => {
          meteoLayers.pirep = layer;
        }}
      >
        <PirepLayer></PirepLayer>
      </GroupedLayer>
      <LayerGroup ref={debugLayerGroupRef}></LayerGroup>
      <Pane name="route-label" style={{ zIndex: paneOrders.routeLabel }}></Pane>
      <Pane name="route-line" style={{ zIndex: paneOrders.routeLine }}></Pane>
    </div>
  );
};

export default MeteoLayers;
