import WFSLayer from './WFSLayer';
import L, { LatLng, marker } from 'leaflet';
import Image from 'next/image';
import ReactDOMServer from 'react-dom/server';
import { Pane, useMap } from 'react-leaflet';
import {
  addLeadingZeroes,
  getQueryTime,
  getTimeRangeStart,
} from '../../common/AreoFunctions';
import { selectMetar } from '../../../../store/layers/LayerControl';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';

export const MarkerTypes = {
  flightCategory: {
    value: 'flightCategory',
    text: 'Flight Category',
  },
  ceilingHeight: {
    value: 'ceilingHeight',
    text: 'Ceiling Height',
  },
  surfaceVisibility: {
    value: 'surfaceVisibility',
    text: 'Surface Visibility',
  },
  surfaceWindSpeed: {
    value: 'surfaceWindSpeed',
    text: 'Surface Wind Speed',
  },
  surfaceWindGust: {
    value: 'surfaceWindGust',
    text: 'Surface Wind Gust',
  },
  surfaceTemperature: {
    value: 'surfaceTemperature',
    text: 'Surface Temperature',
  },
  surfaceDewpoint: {
    value: 'surfaceDewpoint',
    text: 'Surface Dewpoint',
  },
  dewpointDepression: {
    value: 'dewpointDepression',
    text: 'Dewpoint Depression',
  },
  weather: {
    value: 'weather',
    text: 'Weather',
  },
};

const defaultServerFilter = `observation_time DURING ${getQueryTime(
  new Date(),
)}`;

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

  const layerStatus = useSelector(selectMetar);
  const [serverFilter, setServerFilter] = useState(defaultServerFilter);
  const wfsRef = useRef(null);
  const [filteredData, setFilteredData] = useState();

  const getSkyCeilingValues = (
    feature: GeoJSON.Feature,
    markerType = MarkerTypes.flightCategory.value,
  ): any[] => {
    let skyMin = 0;
    const skyValues = Object.keys(skyValuesToString);
    const ceilingValues: number[] = [];
    switch (markerType) {
      case MarkerTypes.ceilingHeight.value:
        for (let i = 1; i <= 6; i++) {
          const sky = feature.properties[`sky_cover_${i}`];
          const index = skyValues.indexOf(sky);

          // consider only BKN, OVC and OVX
          if (index < 5) continue;

          // get ceiling height values
          ceilingValues.push(feature.properties[`cloud_base_ft_agl_${i}`]);
          if (index > -1 && index > skyMin) {
            skyMin = index;
          }
        }
        break;
      default:
        for (let i = 1; i <= 6; i++) {
          const sky = feature.properties[`sky_cover_${i}`];
          ceilingValues.push(feature.properties[`cloud_base_ft_agl_${i}`]);
          const index = skyValues.indexOf(sky);
          if (index > -1 && index > skyMin) {
            skyMin = index;
          }
        }
        break;
    }
    const sky = skyValues[skyMin];
    const ceiling = Math.min(...ceilingValues);
    return [sky, ceiling, skyMin];
  };

  const getFlightCatMarker = (
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

  const getCeilingHeightMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
    const [sky, ceiling] = getSkyCeilingValues(
      feature,
      MarkerTypes.ceilingHeight.value,
    );
    if (!isFinite(ceiling)) return;
    const ceilingMinimumsValues = Object.values(ceilingMinimums);
    const ceilingAmount = addLeadingZeroes(ceiling / 100, 3);
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
        className: 'metar-ceiling-icon',
        html: ReactDOMServer.renderToString(
          <>
            <div style={{ display: 'inline', verticalAlign: -7 }}>
              <Image
                src={`/icons/metar/${colorName}-${sky}.png`}
                alt={''}
                width={20}
                height={20}
              />
            </div>
            <div
              style={{
                display: 'inline',
                fontWeight: 'bold',
                color: 'white',
                verticalAlign: -2,
              }}
            >
              {ceilingAmount}
            </div>
          </>,
        ),
        iconSize: [50, 20],
        iconAnchor: [25, 10],
      }),
      pane: 'metar',
    });
    metarMarker.on('click', (e) => {
      map.fire('click', e);
    });
    return metarMarker;
  };

  const getSurfaceVisibilityMarker = (
    feature: GeoJSON.Feature,
    latlng: LatLng,
  ) => {
    const visibility = feature.properties.visibility_statute_mi;
    if (!visibility) return;
    const visibilityMinimumsValues = Object.values(visibilityMinimums);
    let visibilityMinimum = 0;
    for (let i = 0; i < visibilityMinimumsValues.length; i++) {
      if (visibilityMinimumsValues[i] < visibility) {
        visibilityMinimum = i;
      }
    }
    const colorName = Object.keys(visibilityMinimums)[visibilityMinimum];
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-ceiling-icon',
        html: ReactDOMServer.renderToString(
          <>
            <div style={{ display: 'inline', verticalAlign: -7 }}>
              <Image
                src={`/icons/metar/${colorName}-OVC.png`}
                alt={''}
                width={20}
                height={20}
              />
            </div>
            <div
              style={{
                display: 'inline',
                fontWeight: 'bold',
                color: 'white',
                verticalAlign: -2,
              }}
            >
              {visibility}
            </div>
          </>,
        ),
        iconSize: [50, 20],
        iconAnchor: [25, 10],
      }),
      pane: 'metar',
    });
    metarMarker.on('click', (e) => {
      map.fire('click', e);
    });
    return metarMarker;
  };

  const getSurfaceWindSpeedMarker = (
    feature: GeoJSON.Feature,
    latlng: LatLng,
  ) => {
    const windSpeed = parseFloat(feature.properties.wind_speed_kt);
    if (Number.isNaN(windSpeed)) return;
    let colorCode = 'black';
    if (windSpeed > 30) {
      colorCode = 'c10000';
    } else if (windSpeed > 25 && windSpeed <= 30) {
      colorCode = 'cc0000';
    } else if (windSpeed > 20 && windSpeed <= 25) {
      colorCode = 'fe0000';
    } else if (windSpeed > 15 && windSpeed <= 20) {
      colorCode = 'f79749';
    } else if (windSpeed > 10 && windSpeed <= 15) {
      colorCode = 'ffbf00';
    } else if (windSpeed > 5 && windSpeed <= 10) {
      colorCode = 'lightGreen';
    } else if (windSpeed <= 5) {
      colorCode = 'darkerGreen';
    }
    // const useKnots =
    //   $('#hdnUserWindSpeed').val().trim() === 'knots' ? true : false;
    // if (!useKnots) {
    //   windSpeed = Math.round(parseFloat(windSpeed) * 1.152);
    // }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-wind-icon ' + colorCode,
        html: `${windSpeed}`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        //popupAnchor: [0, -13]
      }),
      pane: 'metar',
    });
    return metarMarker;
  };

  const getSurfaceWindGustMarker = (
    feature: GeoJSON.Feature,
    latlng: LatLng,
  ) => {
    const windGust = parseFloat(feature.properties.wind_gust_kt);
    if (Number.isNaN(windGust)) return;
    let colorCode = 'black';
    if (windGust > 45) {
      colorCode = 'c10000';
    } else if (windGust > 40 && windGust <= 45) {
      colorCode = 'cc0000';
    } else if (windGust > 35 && windGust <= 40) {
      colorCode = 'fe0000';
    } else if (windGust > 30 && windGust <= 35) {
      colorCode = 'f79749';
    } else if (windGust > 20 && windGust <= 30) {
      colorCode = 'ffbf00';
    } else if (windGust > 10 && windGust <= 20) {
      colorCode = 'lightGreen';
    } else if (windGust <= 10) {
      colorCode = 'darkerGreen';
    }
    // const useKnots =
    //   $('#hdnUserWindSpeed').val().trim() === 'knots' ? true : false;
    // if (!useKnots) {
    //   windGust = Math.round(parseFloat(windGust) * 1.152);
    // }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-wind-icon ' + colorCode,
        html: windGust.toString(),
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        //popupAnchor: [0, -13]
      }),
      pane: 'metar',
    });
    return metarMarker;
  };

  const getSurfaceTemperatureMarker = (
    feature: GeoJSON.Feature,
    latlng: LatLng,
  ) => {
    let tempInCelcius = parseFloat(feature.properties.temp_c);
    if (Number.isNaN(tempInCelcius)) return;
    tempInCelcius = Math.round(tempInCelcius);
    // const tempInCelcius = Math.round((temperature - 32) * (5 / 9));
    let colorCode = 'black';
    if (tempInCelcius > 38) {
      colorCode = 'c10000';
    } else if (tempInCelcius > 32 && tempInCelcius <= 38) {
      colorCode = 'cc0000';
    } else if (tempInCelcius > 27 && tempInCelcius <= 32) {
      colorCode = 'fe0000';
    } else if (tempInCelcius > 21 && tempInCelcius <= 27) {
      colorCode = 'f79749';
    } else if (tempInCelcius > 16 && tempInCelcius <= 21) {
      colorCode = 'ffbf00';
    } else if (tempInCelcius > 10 && tempInCelcius <= 16) {
      colorCode = 'lightGreen';
    } else if (tempInCelcius > 4 && tempInCelcius <= 10) {
      colorCode = 'darkerGreen';
    } else if (tempInCelcius > -1 && tempInCelcius <= 4) {
      colorCode = 'lightBlue';
    } else if (tempInCelcius > -7 && tempInCelcius <= -1) {
      colorCode = 'darkerBlue';
    } else if (tempInCelcius > -12 && tempInCelcius <= -7) {
      colorCode = 'purple';
    } else if (tempInCelcius >= -18 && tempInCelcius <= -12) {
      colorCode = 'magenta';
    } else if (tempInCelcius < -18) {
      colorCode = 'cc0199';
    }
    // const useCelcius =
    //   $('#hdnUserTemperatureSetting').val().trim() === 'celsius' ? true : false;
    // if (useCelcius) {
    //   temperature = tempInCelcius;
    // } else {
    //   temperature = Math.round(temperature);
    // }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-temperature-icon ' + colorCode,
        html: tempInCelcius.toString(),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        //popupAnchor: [0, -14]
      }),
      pane: 'metar',
    });
    return metarMarker;
  };

  const getSurfaceDewpointMarker = (
    feature: GeoJSON.Feature,
    latlng: LatLng,
  ) => {
    let tempInCelcius = parseFloat(feature.properties.dewpoint_c);
    if (Number.isNaN(tempInCelcius)) return;
    tempInCelcius = Math.round(tempInCelcius);
    // const tempInCelcius = Math.round((temperature - 32) * (5 / 9));
    let colorCode = 'black';
    if (tempInCelcius > 38) {
      colorCode = 'c10000';
    } else if (tempInCelcius > 32 && tempInCelcius <= 38) {
      colorCode = 'cc0000';
    } else if (tempInCelcius > 27 && tempInCelcius <= 32) {
      colorCode = 'fe0000';
    } else if (tempInCelcius > 21 && tempInCelcius <= 27) {
      colorCode = 'f79749';
    } else if (tempInCelcius > 16 && tempInCelcius <= 21) {
      colorCode = 'ffbf00';
    } else if (tempInCelcius > 10 && tempInCelcius <= 16) {
      colorCode = 'lightGreen';
    } else if (tempInCelcius > 4 && tempInCelcius <= 10) {
      colorCode = 'darkerGreen';
    } else if (tempInCelcius > -1 && tempInCelcius <= 4) {
      colorCode = 'lightBlue';
    } else if (tempInCelcius > -7 && tempInCelcius <= -1) {
      colorCode = 'darkerBlue';
    } else if (tempInCelcius > -12 && tempInCelcius <= -7) {
      colorCode = 'purple';
    } else if (tempInCelcius >= -18 && tempInCelcius <= -12) {
      colorCode = 'magenta';
    } else if (tempInCelcius < -18) {
      colorCode = 'cc0199';
    }
    // const useCelcius =
    //   $('#hdnUserTemperatureSetting').val().trim() === 'celsius' ? true : false;
    // if (useCelcius) {
    //   temperature = tempInCelcius;
    // } else {
    //   temperature = Math.round(temperature);
    // }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-temperature-icon ' + colorCode,
        html: tempInCelcius.toString(),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        //popupAnchor: [0, -14]
      }),
      pane: 'metar',
    });
    return metarMarker;
  };

  const pointToLayer = (feature: GeoJSON.Feature, latlng: LatLng): L.Layer => {
    switch (layerStatus.markerType) {
      case MarkerTypes.flightCategory.value:
        return getFlightCatMarker(feature, latlng);
        break;
      case MarkerTypes.ceilingHeight.value:
        return getCeilingHeightMarker(feature, latlng);
        break;
      case MarkerTypes.surfaceVisibility.value:
        return getSurfaceVisibilityMarker(feature, latlng);
        break;
      case MarkerTypes.surfaceWindSpeed.value:
        return getSurfaceWindSpeedMarker(feature, latlng);
        break;
      case MarkerTypes.surfaceWindGust.value:
        return getSurfaceWindGustMarker(feature, latlng);
        break;
      case MarkerTypes.surfaceTemperature.value:
        return getSurfaceTemperatureMarker(feature, latlng);
        break;
      case MarkerTypes.surfaceDewpoint.value:
        return getSurfaceDewpointMarker(feature, latlng);
        break;
      case MarkerTypes.dewpointDepression.value:
        break;
      case MarkerTypes.weather.value:
        break;
    }
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
    const result = Object.values(filteredFeatures);
    setFilteredData({ type: 'FeatureCollection', features: result } as any);
    return result as any;
  };

  useEffect(() => {
    console.log(layerStatus);
    switch (layerStatus.markerType) {
      case MarkerTypes.surfaceVisibility.value:
        setServerFilter(
          defaultServerFilter + ` AND visibility_statute_mi IS NOT NULL`,
        );
        break;
    }
  }, [layerStatus]);
  return (
    <Pane name={'metar'} style={{ zIndex: 698 }} key={layerStatus.markerType}>
      <WFSLayer
        ref={wfsRef}
        url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
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
          // 'dewpointdepression',
          'relativehumiditypercent',
          'densityaltitudefeet',
        ]}
        enableBBoxQuery={true}
        pointToLayer={pointToLayer}
        isClusteredMarker={true}
        markerPane={'metar'}
        serverFilter={serverFilter}
        clientFilter={clientFilter}
        maxClusterRadius={50}
        initData={filteredData}
      ></WFSLayer>
    </Pane>
  );
};

export default MetarsLayer;
