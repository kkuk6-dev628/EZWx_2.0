/* eslint-disable @typescript-eslint/ban-ts-comment */
import LayerControl, { GroupedLayer } from '../layer-control/LayerControl';
import WFSLayer from './WFSLayer';
import { LayerGroup, useMapEvents, WMSTileLayer } from 'react-leaflet';
import L, { CRS, LatLng, TileLayer } from 'leaflet';
import GairmetLayer from './GairmetLayer';
import { useRef, useState } from 'react';
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
import { getBBoxFromPointZoom, getQueryTime } from '../../common/AreoFunctions';
import IntlSigmetPopup from '../popups/IntlSigmetPopup';
import PirepLayer from './PirepLayer';
import PIREPPopup from '../popups/PIREPPopup';
import 'leaflet-responsive-popup';
import 'leaflet-responsive-popup/leaflet.responsive.popup.css';
import WMSLayer from './WMSLayer';
import axios from 'axios';
import MetarsLayer from './MetarsLayer';

const maxLayers = 6;

const MeteoLayers = ({ layerControlCollapsed }) => {
  const [layers, setLayers] = useState([]);
  const wmsLayerRef = useRef(null);
  const debugLayerGroupRef = useRef(null);

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
        layer.layer.resetStyle && layer.layer.resetStyle();
        if (features.length >= maxLayers) {
          return;
        }
        if (layer.group !== 'Meteo') return;
        if (typeof layer.layer.eachLayer !== 'function') return;
        layer.layer.eachLayer((l) => {
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
        if (wmsLayerRef.current) {
          // wmsLayerRef.current.getFeatureInfo(
          //   map.latLngToContainerPoint(e.latlng),
          //   e.latlng,
          //   ['EZWxBrief:2t_NBM', 'EZWxBrief:gairmet'],
          //   (latlng, result) => {
          //     const resultObj = JSON.parse(result);
          //     showPopup({ feature: resultObj.features[0] } as any, latlng);
          //   },
          // );
          axios
            .post('/api/asd', e.latlng)
            .then((result) => {
              Object.entries(result.data).map((entry) => {
                const lnglat = entry[0].split(',');
                if (
                  debugLayerGroupRef.current &&
                  debugLayerGroupRef.current.addLayer
                ) {
                  const circleMarker = new L.CircleMarker(
                    [lnglat[1] as any, lnglat[0] as any],
                    { radius: 2 },
                  );
                  circleMarker.bindTooltip(`<h>${entry[1]}</h>`);
                  debugLayerGroupRef.current.addLayer(circleMarker);
                }
              });
              showPopup(
                { feature: { properties: result.data, id: 'temp' } } as any,
                e.latlng,
              );
            })
            .catch((reason) => {
              console.log(reason);
            });
        }
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

  const current = new Date();
  // current.setHours(current.getHours() - 48);

  return (
    <>
      <LayerControl
        position="topright"
        collapsed={layerControlCollapsed}
        exclusive={false}
        onLayersAdd={(lyr) => {
          setLayers(lyr);
        }}
      >
        <GroupedLayer checked name="temperature" group="Meteo">
          <WMSLayer
            ref={wmsLayerRef}
            url="http://3.95.80.120:8080/geoserver/EZWxBrief/wms?"
            layers={['EZWxBrief:2t_NBM']}
            options={{
              transparent: true,
              format: 'image/png',
              crs: CRS.EPSG4326,
              info_format: 'application/json',
              identify: false,
              tiled: true,
            }}
          ></WMSLayer>
        </GroupedLayer>
        <GroupedLayer checked name="States" group="Admin">
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
        <GroupedLayer checked name="Pirep" group="Meteo">
          <PirepLayer></PirepLayer>
        </GroupedLayer>
        <GroupedLayer checked name="SIGMET" group="Meteo">
          <SigmetLayer></SigmetLayer>
        </GroupedLayer>
        <GroupedLayer checked name="International SIGMET" group="Meteo">
          <IntlSigmetLayer></IntlSigmetLayer>
        </GroupedLayer>
        <GroupedLayer checked name="CWA" group="Meteo">
          <CWALayer></CWALayer>
        </GroupedLayer>
        <GroupedLayer checked name="Convetive Outlook" group="Meteo">
          <ConvectiveOutlookLayer></ConvectiveOutlookLayer>
        </GroupedLayer>
        <GroupedLayer checked name="GAirmet" group="Meteo">
          <GairmetLayer></GairmetLayer>
        </GroupedLayer>
        <GroupedLayer checked name="Metar" group="Meteo">
          <MetarsLayer></MetarsLayer>
        </GroupedLayer>
        <LayerGroup ref={debugLayerGroupRef}></LayerGroup>
      </LayerControl>
    </>
  );
};

export default MeteoLayers;
