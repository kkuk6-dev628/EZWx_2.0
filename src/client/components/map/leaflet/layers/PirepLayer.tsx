import WFSLayer from './WFSLayer';
import L, { LatLng } from 'leaflet';
import Image from 'next/image';
import ReactDOMServer from 'react-dom/server';
import { Pane, useMap } from 'react-leaflet';
import {
  addLeadingZeroes,
  getCacheVersion,
  getTimeRangeStart,
} from '../../common/AreoFunctions';
import { useSelector } from 'react-redux';
import { selectPirep } from '../../../../store/layers/LayerControl';
import { useEffect, useState } from 'react';

const cacheUpdateInterval = 75; // 75 minutes

const PirepLayer = () => {
  const map = useMap();
  const filters = {
    Type: {
      All: true,
      Icing: true,
      Turbulence: true,
    },
  };

  const layerStatus = useSelector(selectPirep);
  const [cacheVersion, setCacheVersion] = useState(
    getCacheVersion(cacheUpdateInterval),
  );

  useEffect(() => {
    console.log(layerStatus);
    const v = getCacheVersion(cacheUpdateInterval);
    if (v !== cacheVersion) {
      setCacheVersion(v);
    }
  }, [layerStatus.checked]);

  const getTbIconUrl = (intensity) => {
    let iconUrl = '/icons/pirep/negative-turb-icon.png';
    switch (intensity) {
      case 'NEG':
        iconUrl = '/icons/pirep/negative-turb-icon.png';
        break;
      case 'SMTH-LGT':
        iconUrl = '/icons/pirep/smooth-light-turb-icon.png';
        break;
      case 'LGT':
        iconUrl = '/icons/pirep/light-turb-icon.png';
        break;
      case 'LGT-MOD':
        iconUrl = '/icons/pirep/light-moderate-turb-icon.png';
        break;
      case 'MOD':
        iconUrl = '/icons/pirep/moderate-turb-icon.png';
        break;
      case 'MOD-SEV':
        iconUrl = '/icons/pirep/moderate-severe-turb-icon.png';
        break;
      case 'SEV':
        iconUrl = '/icons/pirep/severe-turb-icon.png';
        break;
      case 'SEV-EXTM':
        iconUrl = '/icons/pirep/severe-extreme-turb-icon.png';
        break;
      case 'EXTM':
        iconUrl = '/icons/pirep/extreme-turb-icon.png';
        break;
    }
    return iconUrl;
  };
  const getIcgIconUrl = (intensity) => {
    let iconUrl = '/icons/pirep/negative-ice-icon.png';
    switch (intensity) {
      case 'NEG':
        iconUrl = '/icons/pirep/negative-ice-icon.png';
        break;
      case 'TRC':
        iconUrl = '/icons/pirep/trace-ice-icon.png';
        break;
      case 'TRC-LGT':
        iconUrl = '/icons/pirep/trace-light-ice-icon.png';
        break;
      case 'LGT':
        iconUrl = '/icons/pirep/light-ice-icon.png';
        break;
      case 'LGT-MOD':
        iconUrl = '/icons/pirep/light-moderate-ice-icon.png';
        break;
      case 'MOD':
        iconUrl = '/icons/pirep/moderate-ice-icon-blue.png';
        break;
      case 'MOD-SEV':
        iconUrl = '/icons/pirep/moderate-severe-ice-icon.png';
        break;
      case 'SEV':
      case 'HVY':
        iconUrl = '/icons/pirep/severe-ice-icon.png';
        break;
    }
    return iconUrl;
  };

  const getMarker = (latlng, iconUrl, fltlvl) => {
    const flightLevel = fltlvl == 0 ? 'UNK' : addLeadingZeroes(fltlvl, 3);
    const spanClass = fltlvl == 0 ? 'pirep-unk-span' : 'pirep-span';
    const pirepMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'pirep-icon',
        html: ReactDOMServer.renderToString(
          <>
            <Image src={iconUrl} alt={''} width={16} height={16} />
            <span className={spanClass}>{flightLevel}</span>
          </>,
        ),
        iconSize: [22, 38],
        iconAnchor: [11, 19],
        //popupAnchor: [0, -10]
      }),
      pane: 'pirep',
    });
    return pirepMarker;
  };
  const getBothMarkers = (latlng, iconUrl1, iconUrl2, fltlvl) => {
    const flightLevel = fltlvl == 0 ? 'UNK' : addLeadingZeroes(fltlvl, 3);
    const spanClass = fltlvl == 0 ? 'pirep-unk-span' : 'pirep-span';
    const pirepMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'pirep-icon',
        html: ReactDOMServer.renderToString(
          <>
            <Image
              src={iconUrl1}
              className="pirep-left-icon"
              alt={''}
              width={16}
              height={16}
            />
            <Image
              src={iconUrl2}
              className="pirep-right-icon"
              alt={''}
              width={16}
              height={16}
            />
            <span className={spanClass}>{flightLevel}</span>
          </>,
        ),
        iconSize: [44, 38],
        iconAnchor: [22, 19],
        //popupAnchor: [0, -18]
      }),
      pane: 'pirep',
    });
    return pirepMarker;
  };

  const pointToLayer = (feature: GeoJSON.Feature, latlng: LatLng): L.Layer => {
    let pirepMarker: L.Layer;
    if (
      feature.properties.tbint1 !== null &&
      feature.properties.icgint1 !== null
    ) {
      const tbIconUrl1 = getTbIconUrl(feature.properties.tbint1);
      const icgIconUrl1 = getIcgIconUrl(feature.properties.icgint1);
      if (filters.Type.All || (filters.Type.Icing && filters.Type.Turbulence)) {
        pirepMarker = getBothMarkers(
          latlng,
          tbIconUrl1,
          icgIconUrl1,
          feature.properties.fltlvl,
        );
      } else if (filters.Type.Icing) {
        pirepMarker = getMarker(latlng, icgIconUrl1, feature.properties.fltlvl);
      } else if (filters.Type.Turbulence) {
        pirepMarker = getMarker(latlng, tbIconUrl1, feature.properties.fltlvl);
      }
    } else if (feature.properties.tbint1 !== null) {
      const tbIconUrl = getTbIconUrl(feature.properties.tbint1);
      pirepMarker = getMarker(latlng, tbIconUrl, feature.properties.fltlvl);
    } else if (feature.properties.icgint1 !== null) {
      const icgIconUrl = getIcgIconUrl(feature.properties.icgint1);
      pirepMarker = getMarker(latlng, icgIconUrl, feature.properties.fltlvl);
    } else if (
      feature.properties.tbint1 === null &&
      feature.properties.icgint1 === null
    ) {
      let iconUrl = '/icons/pirep/weather-sky-icon-black.png';
      if (feature.properties.aireptype === 'Urgent PIREP') {
        iconUrl = '/icons/pirep/weather-sky-icon-red.png';
      }
      pirepMarker = getMarker(latlng, iconUrl, feature.properties.fltlvl);
    }
    pirepMarker.on('click', (e) => {
      map.fire('click', e);
    });
    return pirepMarker;
  };

  const clientFilter = (
    features: GeoJSON.Feature[],
    observationTime: Date,
  ): GeoJSON.Feature[] => {
    const results = features.filter((feature) => {
      const start = new Date(feature.properties.obstime);
      const end = new Date(feature.properties.obstime);
      end.setMinutes(end.getMinutes() + 75);
      end.setSeconds(0);
      end.setMilliseconds(0);
      return start <= observationTime && observationTime < end;
    });
    return results;
  };

  return (
    <Pane name={'pirep'} style={{ zIndex: 699 }}>
      <WFSLayer
        url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
        maxFeatures={10000}
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
        isClusteredMarker={true}
        markerPane={'pirep'}
        serverFilter={`obstime AFTER ${getTimeRangeStart().toISOString()}`}
        clientFilter={clientFilter}
        layerStateSelector={selectPirep}
        cacheVersion={cacheVersion}
      ></WFSLayer>
    </Pane>
  );
};

export default PirepLayer;
