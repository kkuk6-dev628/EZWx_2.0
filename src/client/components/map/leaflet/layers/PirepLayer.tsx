import WFSLayer from './WFSLayer';
import L from 'leaflet';
import Image from 'next/image';
import ReactDOMServer from 'react-dom/server';
import { useMap } from 'react-leaflet';

const PirepLayer = () => {
  const map = useMap();
  const pointToLayer = (feature, latlng) => {
    const pirepMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'my-custom-icons',
        html: ReactDOMServer.renderToString(
          <Image
            src="/icons/pirep/light-ice-icon.png"
            alt={''}
            width={16}
            height={16}
          />,
        ),
        iconSize: [16, 16],
        iconAnchor: [16, 16],
        //popupAnchor: [0, -18]
      }),
      // interactive: false,
      // pane: 'leaflet-overlay-pane',
    });
    pirepMarker.on('click', (e) => {
      map.fire('click', e);
    });
    return pirepMarker;
  };

  const getLabel = (feature) => {
    return feature.properties.hazard;
  };

  return (
    <WFSLayer
      url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
      maxFeatures={256}
      typeName="EZWxBrief:pirep"
      propertyNames={[
        'wkb_geometry',
        'ogc_fid',
        'icaoid',
        'aireptype',
        'obstime',
        'actype',
        'temp',
        'wdir',
        'wspd',
        'cloudcvg1',
        'cloudbas1',
        'cloudtop1',
        'cloudcvg2',
        'cloudbas2',
        'cloudtop2',
        'wxstring',
        'fltlvl',
        'fltlvltype',
        'tbint1',
        'tbtype1',
        'tbfreq1',
        'icgint1',
        'icgtype1',
        'brkaction',
        'rawob',
      ]}
      pointToLayer={pointToLayer}
      getLabel={getLabel}
    ></WFSLayer>
  );
};

export default PirepLayer;
