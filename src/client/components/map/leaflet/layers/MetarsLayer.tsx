import WFSLayer from './WFSLayer';
import L, { LatLng } from 'leaflet';
import Image from 'next/image';
import ReactDOMServer from 'react-dom/server';
import { Pane, useMap } from 'react-leaflet';
import {
  addLeadingZeroes,
  getTimeRangeStart,
} from '../../common/AreoFunctions';

const MetarsLayer = () => {
  const map = useMap();
  const skyValuesToString = {
    CLR: 'Clear below 12,000 feet',
    SKC: 'Sky clear',
    CAVOK: 'use the same CLR icon.',
    FEW: 'Few',
    SCT: 'Scattered',
    BKN: 'Broken',
    OVC: 'Overcast',
    OVX: 'Indefinite ceiling',
  };

  const ceilingMinimums = {
    LIFR: 0,
    IFR: 500,
    MVFR: 1000,
    VFR: 3000,
  };

  const visibilityMinimums = {
    LIFR: 0,
    IFR: 1,
    MVFR: 3,
    VFR: 3,
  };

  const getTbIconUrl = (intensity) => {
    let iconUrl = '/icons/metar/MISSING.png';
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
    const flightLevel = fltlvl === 0 ? 'UNK' : addLeadingZeroes(fltlvl, 3);
    const spanClass = fltlvl === 0 ? 'pirep-unk-span' : 'pirep-span';
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
  const getSkcClrMarker = (
    feature: GeoJSON.Feature,
    latlng: LatLng,
  ): L.Marker => {
    const [sky, ceiling] = getSkyCeilingValues(feature);
    const ceilingMinimumsValues = Object.values(ceilingMinimums);
    let ceilingMinimum = 0;
    for (let i = 0; i < ceilingMinimumsValues.length; i++) {
      if (ceilingMinimumsValues[i] < ceiling) {
        ceilingMinimum = i;
      }
    }
    const visibility = feature.properties.visibility_statute_mi;
    const visibilityMinimumsValues = Object.values(visibilityMinimums);
    let visibilityMinimum = 0;
    for (let i = 0; i < visibilityMinimumsValues.length; i++) {
      if (visibilityMinimumsValues[i] < visibility) {
        visibilityMinimum = i;
      }
    }
    const combined =
      ceiling && ceilingMinimum < visibilityMinimum
        ? ceilingMinimum
        : visibilityMinimum;
    const colorName = Object.keys(ceilingMinimums)[combined];

    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-icon',
        html: ReactDOMServer.renderToString(
          <>
            <Image
              src={`/icons/metar/${colorName}-${sky}.png`}
              alt={''}
              width={16}
              height={16}
            />
          </>,
        ),
        iconSize: [16, 16],
      }),
      pane: 'metar',
    });
    metarMarker.on('click', (e) => {
      map.fire('click', e);
    });
    return metarMarker;
  };

  const getSkyCeilingValues = (feature: GeoJSON.Feature): number[] => {
    let skyMin = 7;
    const skyValues = Object.keys(skyValuesToString);
    let pos = 1;
    for (let i = 1; i <= 6; i++) {
      const sky = feature.properties[`sky_cover_${i}`];
      const index = skyValues.indexOf(sky);
      if (index > -1 && index < skyMin) {
        skyMin = index;
        pos = i;
      }
    }
    const sky = skyValues[skyMin];
    const ceiling = feature.properties[`cloud_base_ft_agl_${pos}`];
    return [sky, ceiling];
  };

  const pointToLayer = (feature: GeoJSON.Feature, latlng: LatLng): L.Layer => {
    return getSkcClrMarker(feature, latlng);
  };

  const clientFilter = (
    features: GeoJSON.Feature[],
    observationTime: Date,
  ): GeoJSON.Feature[] => {
    const filteredFeatures = {};
    features.map((feature) => {
      const start = new Date(feature.properties.observation_time);
      const end = new Date(feature.properties.observation_time);
      end.setMinutes(end.getMinutes() + 75);
      end.setSeconds(0);
      end.setMilliseconds(0);
      const result = start <= observationTime && observationTime < end;
      if (result) {
        if (filteredFeatures[feature.properties.station_id]) {
          const prevFeature = filteredFeatures[feature.properties.station_id];
          if (
            new Date(prevFeature.properties.observation_time) <
            new Date(feature.properties.observation_time)
          ) {
            filteredFeatures[feature.properties.station_id] = feature;
          }
        } else {
          filteredFeatures[feature.properties.station_id] = feature;
        }
      }
    });
    return Object.values(filteredFeatures);
  };

  return (
    <Pane name={'metar'} style={{ zIndex: 698 }}>
      <WFSLayer
        url="https://eztile2.ezwxbrief.com/geoserver/EZWxBrief/ows"
        maxFeatures={164096}
        typeName="EZWxBrief:metar"
        propertyNames={[
          'wkb_geometry',
          'ogc_fid',
          'station_id',
          'elevation_ft',
          'temp_c',
          'dewpoint_c',
          'wind_dir_degrees',
          'observation_time',
          'wind_speed_kt',
          'wind_gust_kt',
          'flight_category',
          'raw_text',
          'visibility_statute_mi',
          'cloud_base_ft_agl_1',
          'sky_cover_1',
          'cloud_base_ft_agl_2',
          'sky_cover_2',
          'cloud_base_ft_agl_3',
          'sky_cover_3',
          'cloud_base_ft_agl_4',
          'sky_cover_4',
          'cloud_base_ft_agl_5',
          'sky_cover_5',
          'cloud_base_ft_agl_6',
          'sky_cover_6',
          'altim_in_hg',
          'sea_level_pressure_mb',
          'wx_string',
          'vert_vis_ft',
          'dewpointdepressionc',
          'relativehumiditypercent',
          'densityaltitudefeet',
        ]}
        enableBBoxQuery={true}
        pointToLayer={pointToLayer}
        isClusteredMarker={true}
        markerPane={'metar'}
        serverFilter={`sky_cover_1 IS NOT NULL`}
        clientFilter={clientFilter}
      ></WFSLayer>
    </Pane>
  );
};

export default MetarsLayer;
