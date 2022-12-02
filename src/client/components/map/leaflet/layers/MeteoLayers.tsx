import LayerControl, { GroupedLayer } from '../layer-control/LayerControl';
import WFSLayer from './WFSLayer';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import GairmetLayer from './GairmetLayer';
import { useRef, useState } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import FeatureSelector from '../popups/featureSelector';
import ReactDOMServer from 'react-dom/server';

const MeteoLayers = ({ layerControlCollapsed }) => {
  const [layers, setLayers] = useState([]);
  const [pickedFeatures, setPickedFeatures] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const handleFeatureSelect = (feature) => {
    console.log(feature);
  };

  const map = useMapEvents({
    click: (e: any) => {
      const features = [];
      layers.forEach((layer) => {
        if (layer.group !== 'Meteo') return;
        layer.layer.eachLayer((l) => {
          if (
            booleanPointInPolygon([e.latlng.lng, e.latlng.lat], l.toGeoJSON())
          ) {
            features.push(l);
          }
        });
      });
      setPickedFeatures(features);
      setShowPopup(true);
      L.popup()
        .setLatLng(e.latlng)
        .setContent(
          ReactDOMServer.renderToString(
            <FeatureSelector
              features={pickedFeatures}
              onSelect={handleFeatureSelect}
            ></FeatureSelector>,
          ),
        )
        .openOn(map);
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
        <GroupedLayer checked name="GAirmet" group="Meteo">
          <GairmetLayer></GairmetLayer>
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
        <GroupedLayer checked name="CWA" group="Meteo">
          <WFSLayer
            url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
            maxFeatures={256}
            typeName="EZWxBrief:cwa"
          ></WFSLayer>
        </GroupedLayer>
        <GroupedLayer checked name="SIGMET" group="Meteo">
          <WFSLayer
            url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
            maxFeatures={256}
            typeName="EZWxBrief:sigmet"
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
