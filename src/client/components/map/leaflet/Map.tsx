import { useEffect, useState } from 'react';
import jsonp from 'jsonp';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import styles from './Map.module.css';
import Ellipse from './layers/BoundedWFSLayer';
import BoundedWFSLayer from './layers/BoundedWFSLayer';

function LeafletMap() {
  const [gairmetData, setGairmetData] = useState(null);
  const [, setMap] = useState(null);
  useEffect(() => {
    jsonp(
      'http://3.95.80.120:8080/geoserver/EZWxBrief/ows',
      {
        param:
          'outputFormat=text/javascript&maxFeatures=250&request=GetFeature&service=WFS&typeName=EZWxBrief:gairmet_latest&version=1.0.0',
        name: 'parseResponse',
      },
      (error, data: any) => {
        // console.log(data);
        if (error) {
          console.error(error);
        } else {
          setGairmetData(data);
        }
      },
    );
  }, []);

  const handleOnMapMounted = (evt: { leafletElement: any }) => {
    setMap(evt ? evt.leafletElement : null);
  };

  return (
    <MapContainer
      className={styles.map}
      bounds={[
        [55.0, -130.0],
        [20.0, -60.0],
      ]}
      zoomControl={false}
      ref={handleOnMapMounted}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
      <BoundedWFSLayer
        url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
        maxFeatures={256}
        typeName="EZWxBrief:gairmet_latest"
        jsonpCallbackName="parseResponse"
      ></BoundedWFSLayer>
      <ZoomControl
        position="topright"
        zoomInText={`<svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V16"
              stroke="#3F0C69"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 12H8"
              stroke="#3F0C69"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 21V21C7.029 21 3 16.971 3 12V12C3 7.029 7.029 3 12 3V3C16.971 3 21 7.029 21 12V12C21 16.971 16.971 21 12 21Z"
              stroke="#3F0C69"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>`}
        zoomOutText={`<svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M16 12H8"
              stroke="#3F0C69"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 21V21C7.029 21 3 16.971 3 12V12C3 7.029 7.029 3 12 3V3C16.971 3 21 7.029 21 12V12C21 16.971 16.971 21 12 21Z"
              stroke="#3F0C69"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>`}
      />
    </MapContainer>
  );
}

export default LeafletMap;