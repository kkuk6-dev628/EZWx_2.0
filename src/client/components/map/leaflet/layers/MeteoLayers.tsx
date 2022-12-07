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

const MeteoLayers = ({ layerControlCollapsed }) => {
  const [layers, setLayers] = useState([]);

  const handleFeatureSelect = (feature) => {
    console.log(feature);
  };

  const map = useMapEvents({
    click: (e: any) => {
      const features = [];
      layers.forEach((layer) => {
        layer.layer.resetStyle();
        if (layer.group !== 'Meteo') return;
        layer.layer.eachLayer((l) => {
          if (
            booleanPointInPolygon([e.latlng.lng, e.latlng.lat], l.toGeoJSON())
          ) {
            features.push(l);
          }
        });
      });
      map.closePopup();
      if (features.length === 0) {
        return;
      }
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
      const selectorFeatureNodes =
        document.getElementsByClassName('selector-feature');
      for (let i = 0; i < selectorFeatureNodes.length; i++) {
        selectorFeatureNodes[i].addEventListener('click', (ee) => {
          map.closePopup();
          // @ts-ignore
          const featureId = ee.currentTarget.dataset.featureid;
          features.forEach((layer) => {
            if (layer.feature.id === featureId) {
              layer.setStyle({
                weight: 8,
              });

              const layerName = layer.feature.id.split('.')[0];
              let popup;
              switch (layerName) {
                case 'gairmet':
                  popup = <GairmetPopup feature={layer.feature}></GairmetPopup>;
                  break;
                default:
                  popup = (
                    <GeneralPopup
                      feature={layer.feature}
                      title={`${layerName} properties`}
                    ></GeneralPopup>
                  );
              }
              L.popup()
                .setLatLng(e.latlng)
                .setContent(ReactDOMServer.renderToString(popup))
                .openOn(map);
            }
          });
        });
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
        <GroupedLayer checked name="CWA" group="Meteo">
          <WFSLayer
            url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
            maxFeatures={256}
            typeName="EZWxBrief:cwa"
          ></WFSLayer>
        </GroupedLayer>
        <GroupedLayer checked name="Convetive Outlook" group="Meteo">
          <WFSLayer
            url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
            maxFeatures={256}
            typeName="EZWxBrief:conv_outlook"
          ></WFSLayer>
        </GroupedLayer>
      </LayerControl>
    </>
  );
};

export default MeteoLayers;