/* eslint-disable @typescript-eslint/ban-ts-comment */
import LayerControl, {
  GroupedLayer,
  ILayerObj,
} from '../layer-control/LayerControl';
import WFSLayer from './WFSLayer';
import { LayerGroup, useMapEvents } from 'react-leaflet';
import L, { CRS, LatLng } from 'leaflet';
import GairmetLayer from './GairmetLayer';
import { useEffect, useRef, useState } from 'react';
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
import { getBBoxFromPointZoom } from '../../common/AreoFunctions';
import IntlSigmetPopup from '../popups/IntlSigmetPopup';
import PirepLayer from './PirepLayer';
import PIREPPopup from '../popups/PIREPPopup';
import 'leaflet-responsive-popup';
import 'leaflet-responsive-popup/leaflet.responsive.popup.css';
import WMSLayer from './WMSLayer';
import axios from 'axios';
import MetarsLayer from './MetarsLayer';
import TimeDimensionLayer from './TimeDimensionLayer';
import MarkerClusterGroup from './MarkerClusterGroup';
import Image from 'next/image';
import MetarsPopup from '../popups/MetarsPopup';
import { useSelector } from 'react-redux';
import { selectMetar } from '../../../../store/layers/LayerControl';
import { selectPersonalMinimums } from '../../../../store/user/UserSettings';

const maxLayers = 6;

const MeteoLayers = ({ layerControlCollapsed }) => {
  const [layers, setLayers] = useState<ILayerObj[]>([]);
  const wmsLayerRef = useRef(null);
  const debugLayerGroupRef = useRef(null);
  const metarLayerStatus = useSelector(selectMetar);
  const personalMinimums = useSelector(selectPersonalMinimums);

  const showPopup = (layer: L.GeoJSON, latlng: LatLng): void => {
    if (typeof layer.setStyle === 'function') {
      layer.setStyle({
        weight: 8,
      });
    }

    // @ts-ignore
    const layerName = layer.feature.id.split('.')[0];
    let popup;
    let useWidePopup = false;
    switch (layerName) {
      case 'gairmet':
        popup = <GairmetPopup feature={layer.feature}></GairmetPopup>;
        useWidePopup = false;
        break;
      case 'sigmet':
        popup = <SigmetPopup feature={layer.feature}></SigmetPopup>;
        useWidePopup = true;
        break;
      case 'intl_sigmet':
        popup = <IntlSigmetPopup feature={layer.feature}></IntlSigmetPopup>;
        useWidePopup = true;
        break;
      case 'cwa':
        popup = <CWAPopup feature={layer.feature}></CWAPopup>;
        useWidePopup = true;
        break;
      case 'conv_outlook':
        popup = (
          <ConvectiveOutlookPopup
            feature={layer.feature}
          ></ConvectiveOutlookPopup>
        );
        useWidePopup = true;
        break;
      case 'pirep':
        popup = <PIREPPopup feature={layer.feature}></PIREPPopup>;
        useWidePopup = true;
        break;
      case 'metar':
        popup = (
          <MetarsPopup
            layer={layer as any}
            markerType={metarLayerStatus.markerType}
            personalMinimums={personalMinimums}
          ></MetarsPopup>
        );
        useWidePopup = true;
        break;
      default:
        popup = (
          <GeneralPopup
            feature={layer.feature}
            title={`${layerName} properties`}
          ></GeneralPopup>
        );
        useWidePopup = false;
    }
    const popupContent = ReactDOMServer.renderToString(popup);
    L.responsivePopup({ minWidth: useWidePopup ? 320 : 196, offset: [10, 19] })
      .setLatLng(latlng)
      .setContent(popupContent)
      .openOn(map);
  };

  const map = useMapEvents({
    click: (e: any) => {
      const features = [];
      const clickedBBox = getBBoxFromPointZoom(40, e.latlng, map.getZoom());
      if (debugLayerGroupRef.current) {
        debugLayerGroupRef.current.clearLayers();
      }
      layers.forEach((layer) => {
        if (layer.pickable === false) return;
        if (layer.checked === false) return;
        //@ts-ignore
        if (layer.layer.resetStyle) layer.layer.resetStyle();
        if (features.length >= maxLayers) {
          return;
        }
        //@ts-ignore
        layer.layer.eachLayer((l: any) => {
          if (features.length >= maxLayers) {
            return;
          }
          if (
            l.feature.geometry.type === 'Point' ||
            l.feature.geometry.type === 'MultiPoint'
          ) {
            if (
              clickedBBox.latMin < l.feature.geometry.coordinates[1] &&
              l.feature.geometry.coordinates[1] < clickedBBox.latMax &&
              clickedBBox.lngMin < l.feature.geometry.coordinates[0] &&
              l.feature.geometry.coordinates[0] < clickedBBox.lngMax
            ) {
              features.push(l);
            }
          } else if (
            booleanPointInPolygon([e.latlng.lng, e.latlng.lat], l.toGeoJSON())
          ) {
            features.push(l);
          }
        });
      });
      map.closePopup();

      if (features.length === 0) {
        // if (wmsLayerRef.current) {
        //   wmsLayerRef.current.source.getFeatureInfo(
        //     map.latLngToContainerPoint(e.latlng),
        //     e.latlng,
        //     ['EZWxBrief:2t_NBM', 'EZWxBrief:2t_test'],
        //     (latlng: L.LatLng, result: string) => {
        //       try {
        //         const resultObj = JSON.parse(result);
        //         resultObj.features.length > 0 &&
        //           showPopup({ feature: resultObj.features[0] } as any, latlng);
        //       } catch (e) {
        //         console.error(result);
        //       }
        //     },
        //   );
        //   axios
        //     .post('/api/asd', e.latlng)
        //     .then((result) => {
        //       Object.entries(result.data).map((entry) => {
        //         const lnglat = entry[0].split(',');
        //         if (
        //           debugLayerGroupRef.current &&
        //           debugLayerGroupRef.current.addLayer
        //         ) {
        //           const circleMarker = new L.CircleMarker(
        //             [lnglat[1] as any, lnglat[0] as any],
        //             { radius: 2 },
        //           );
        //           circleMarker.bindTooltip(`<h>${entry[1]}</h>`);
        //           debugLayerGroupRef.current.addLayer(circleMarker);
        //         }
        //       });
        //       showPopup(
        //         { feature: { properties: result.data, id: 'temp' } } as any,
        //         e.latlng,
        //       );
        //     })
        //     .catch((reason) => {
        //       console.log(reason);
        //     });
        // }
        return;
      } else if (features.length === 1) {
        showPopup(features[0], e.latlng);
      } else {
        L.responsivePopup({ offset: [10, 19] })
          .setLatLng(e.latlng)
          .setContent(
            ReactDOMServer.renderToString(
              <FeatureSelector features={features}></FeatureSelector>,
            ),
          )
          .openOn(map);
        const selectorFeatureNodes = document.getElementsByClassName(
          'feature-selector-item',
        );
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

  return (
    <div className="route__layer">
      <LayerControl
        position="topright"
        collapsed={layerControlCollapsed}
        exclusive={false}
        onLayersAdd={(lyr) => {
          setLayers(lyr);
        }}
      >
        <GroupedLayer checked name="Pirep" group="Meteo" order={0}>
          <PirepLayer></PirepLayer>
        </GroupedLayer>
        <GroupedLayer checked name="Metar" group="Meteo" order={1}>
          <MetarsLayer></MetarsLayer>
        </GroupedLayer>
        <GroupedLayer checked name="SIGMET" group="Meteo" order={2}>
          <SigmetLayer></SigmetLayer>
        </GroupedLayer>
        <GroupedLayer
          checked
          name="International SIGMET"
          group="Meteo"
          order={3}
        >
          <IntlSigmetLayer></IntlSigmetLayer>
        </GroupedLayer>
        <GroupedLayer checked name="CWA" group="Meteo" order={4}>
          <CWALayer></CWALayer>
        </GroupedLayer>
        <GroupedLayer checked name="Convetive Outlook" group="Meteo" order={5}>
          <ConvectiveOutlookLayer></ConvectiveOutlookLayer>
        </GroupedLayer>
        <GroupedLayer checked name="GAirmet" group="Meteo" order={6}>
          <GairmetLayer></GairmetLayer>
        </GroupedLayer>
        <GroupedLayer
          checked
          name="temperature"
          group="Meteo"
          pickable={false}
          order={7}
        >
          {/* <TimeDimensionLayer
            ref={wmsLayerRef}
            // url="https://eztile1.ezwxbrief.com/geoserver/EZWxBrief/wms?"
            url="https://{s}.ezwxbrief.com/geoserver/EZWxBrief/wms?"
            // url="http://3.95.80.120:8080/geoserver/EZWxBrief/wms?"
            options={{
              transparent: true,
              format: 'image/png',
              crs: CRS.EPSG4326,
              info_format: 'application/json',
              identify: false,
              tiled: false,
              subdomains: ['eztile1', 'eztile2', 'eztile3', 'eztile4'],
              layers: 'EZWxBrief:nbm_t2m_10km',
              // @ts-ignore
              useCache: true,
              // crossOrigin: true,
            }}
          ></TimeDimensionLayer> */}
        </GroupedLayer>
        <LayerGroup ref={debugLayerGroupRef}></LayerGroup>
      </LayerControl>
    </div>
  );
};

export default MeteoLayers;
