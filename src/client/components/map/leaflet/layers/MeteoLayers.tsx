/* eslint-disable @typescript-eslint/ban-ts-comment */
import LayerControl, { GroupedLayer } from '../layer-control/LayerControl';
import WFSLayer from './WFSLayer';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import GairmetLayer from './GairmetLayer';
import { useState } from 'react';
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
import { getBBoxFromPointZoom } from '../../AreoFunctions';
import IntlSigmetPopup from '../popups/IntlSigmetPopup';
import PirepLayer from './PirepLayer';
import { width } from 'dom7';

const MeteoLayers = ({ layerControlCollapsed }) => {
  const [layers, setLayers] = useState([]);

  const handleFeatureSelect = (feature) => {
    console.log(feature);
  };

  const showPopup = (layer: L.Layer, latlng: any): void => {
    if (typeof layer.setStyle === 'function') {
      layer.setStyle({
        weight: 8,
      });
    }

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
    L.popup({ minWidth: useWidePopup ? 320 : 196 })
      .setLatLng(latlng)
      .setContent(popupContent)
      .openOn(map);
  };

  const map = useMapEvents({
    click: (e: any) => {
      const features = [];
      const clickedBBox = getBBoxFromPointZoom(10, e.latlng, map.getZoom());
      layers.forEach((layer) => {
        layer.layer.resetStyle();
        if (layer.group !== 'Meteo') return;
        layer.layer.eachLayer((l) => {
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
        return;
      } else if (features.length === 1) {
        showPopup(features[0], e.latlng);
      } else {
        L.popup()
          .setLatLng(e.latlng)
          .setContent(
            ReactDOMServer.renderToString(
              <FeatureSelector
                features={features}
                onSelect={handleFeatureSelect}
              ></FeatureSelector>,
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
        <GroupedLayer checked name="GAirmet" group="Meteo">
          <GairmetLayer></GairmetLayer>
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
        <GroupedLayer checked name="Pirep" group="Meteo">
          <PirepLayer></PirepLayer>
        </GroupedLayer>
      </LayerControl>
    </>
  );
};

export default MeteoLayers;
