import { SvgRoundMinus, SvgRoundPlus } from '../utils/SvgIcons';
import { useEffect, useState } from 'react';
import axios from 'axios-jsonp-pro';
import Map from './LeafletMap';

function LeafletMap() {
  const [gairmetData, setGairmetData] = useState(null);
  const [map, setMap] = useState(null);
  useEffect(() => {
    axios
      .jsonp('http://3.95.80.120:8080/geoserver/EZWxBrief/ows', {
        params: {
          outputFormat: 'text/javascript',
          maxFeatures: 250,
          request: 'GetFeature',
          service: 'WFS',
          typeName: 'EZWxBrief:gairmet_latest',
          version: '1.0.0',
          format_options: 'callback:__jp0',
        },
        timeout: 5000,
        // name: 'parseResponse',
      })
      .then((data) => {
        console.log(data);
        setGairmetData(data);
      })
      .catch((error) => Promise.reject(error));
  }, []);

  const handleOnMapMounted = (evt) => {
    setMap(evt ? evt.leafletElement : null);
  };

  return (
    <Map
      bounds={[
        [55.0, -130.0],
        [20.0, -60.0],
      ]}
      zoomControl={false}
      ref={handleOnMapMounted}
    >
      {({ TileLayer, GeoJSON, Marker, Popup, ZoomControl }) => (
        <>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
          {gairmetData != null && <GeoJSON data={gairmetData} />}
          <Marker position={[38.907132, -77.036546]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
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
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 12H8"
              stroke="#3F0C69"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 21V21C7.029 21 3 16.971 3 12V12C3 7.029 7.029 3 12 3V3C16.971 3 21 7.029 21 12V12C21 16.971 16.971 21 12 21Z"
              stroke="#3F0C69"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
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
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 21V21C7.029 21 3 16.971 3 12V12C3 7.029 7.029 3 12 3V3C16.971 3 21 7.029 21 12V12C21 16.971 16.971 21 12 21Z"
              stroke="#3F0C69"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>`}
          />
        </>
      )}
    </Map>
  );
}

export default LeafletMap;
