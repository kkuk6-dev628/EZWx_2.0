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
  surfaceWindBarbs: {
    value: 'surfaceWindBarbs',
    text: 'Surface Wind Barbs',
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

  const getDewpointDepressionMarker = (
    feature: GeoJSON.Feature,
    latlng: LatLng,
  ) => {
    const temperature = parseFloat(feature.properties.temp_c);
    const dewpointTemperature = parseFloat(feature.properties.dewpoint_c);
    // const useCelcius =
    //   $('#hdnUserTemperatureSetting').val().trim() === 'celsius' ? true : false;
    let dewpointDepression = temperature - dewpointTemperature;
    // const temperatureInCelcius = Math.round((temperature - 32) * (5 / 9));
    let dewpointDepressionInCelcius = Math.round(dewpointDepression);
    // const dewpointTemperatureInCelcius = Math.round(
    //   (dewpointTemperature - 32) * (5 / 9),
    // );
    // let dewpointDepressionInCelcius = Math.round(
    //   temperatureInCelcius - dewpointTemperatureInCelcius,
    // );
    if (dewpointDepressionInCelcius < 0) {
      dewpointDepressionInCelcius = 0;
    }
    dewpointDepression = Math.round(dewpointDepression);
    if (dewpointDepression < 0) {
      dewpointDepression = 0;
    }
    let colorCode = 'black';
    if (dewpointDepressionInCelcius > 7) {
      colorCode = 'darkerGreen';
    } else if (
      dewpointDepressionInCelcius > 4 &&
      dewpointDepressionInCelcius <= 7
    ) {
      colorCode = 'lightBlue';
    } else if (
      dewpointDepressionInCelcius > 2 &&
      dewpointDepressionInCelcius <= 4
    ) {
      colorCode = 'darkerBlue';
    } else if (
      dewpointDepressionInCelcius > 1 &&
      dewpointDepressionInCelcius <= 2
    ) {
      colorCode = 'purple';
    } else if (dewpointDepressionInCelcius <= 1) {
      colorCode = 'magenta';
    }

    // if (useCelcius) {
    //   dewpointDepression = dewpointDepressionInCelcius;
    // }

    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-temperature-icon ' + colorCode,
        html: dewpointDepressionInCelcius.toString(),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        //popupAnchor: [0, -13]
      }),
      pane: 'metar',
    });
    return metarMarker;
  };

  const getSurfaceWindBarbsMarker = (
    feature: GeoJSON.Feature,
    latlng: LatLng,
  ) => {
    let windSpeed = feature.properties.wind_speed_kt;
    let windDirection = feature.properties.wind_dir_degrees;
    let iconUrl = '/icons/barbs/0-kt.png';
    let transformAngle = 'rotate(0deg)';
    if (isNaN(windSpeed)) {
      windSpeed = 0;
    }
    if (isNaN(windDirection)) {
      windDirection = 0;
    }
    let anchor = [16, 27];
    if (windSpeed <= 2) {
      anchor = [15, 15];
    }
    if (windSpeed >= 3 && windSpeed <= 7) {
      iconUrl = '/icons/barbs/5-kt.png';
    } else if (windSpeed >= 8 && windSpeed <= 12) {
      iconUrl = '/icons/barbs/10-kt.png';
    } else if (windSpeed >= 13 && windSpeed <= 17) {
      iconUrl = '/icons/barbs/15-kt.png';
    } else if (windSpeed >= 18 && windSpeed <= 22) {
      iconUrl = '/icons/barbs/20-kt.png';
    } else if (windSpeed >= 23 && windSpeed <= 27) {
      iconUrl = '/icons/barbs/25-kt.png';
    } else if (windSpeed >= 28 && windSpeed <= 32) {
      iconUrl = '/icons/barbs/30-kt.png';
    } else if (windSpeed >= 33 && windSpeed <= 37) {
      iconUrl = '/icons/barbs/35-kt.png';
    } else if (windSpeed >= 38 && windSpeed <= 42) {
      iconUrl = '/icons/barbs/40-kt.png';
    } else if (windSpeed >= 43 && windSpeed <= 47) {
      iconUrl = '/icons/barbs/45-kt.png';
    } else if (windSpeed >= 48 && windSpeed <= 52) {
      iconUrl = '/icons/barbs/50-kt.png';
    } else if (windSpeed >= 53 && windSpeed <= 57) {
      iconUrl = '/icons/barbs/55-kt.png';
    } else if (windSpeed >= 58 && windSpeed <= 62) {
      iconUrl = '/icons/barbs/60-kt.png';
    } else if (windSpeed >= 63 && windSpeed <= 67) {
      iconUrl = '/icons/barbs/65-kt.png';
    } else if (windSpeed >= 68 && windSpeed <= 72) {
      iconUrl = '/icons/barbs/70-kt.png';
    } else if (windSpeed >= 73 && windSpeed <= 77) {
      iconUrl = '/icons/barbs/75-kt.png';
    } else if (windSpeed >= 78 && windSpeed <= 82) {
      iconUrl = '/icons/barbs/80-kt.png';
    } else if (windSpeed >= 83 && windSpeed <= 87) {
      iconUrl = '/icons/barbs/85-kt.png';
    } else if (windSpeed >= 88 && windSpeed <= 92) {
      iconUrl = '/icons/barbs/90-kt.png';
    } else if (windSpeed >= 93 && windSpeed <= 97) {
      iconUrl = '/icons/barbs/95-kt.png';
    } else if (windSpeed >= 98 && windSpeed <= 102) {
      iconUrl = '/icons/barbs/100-kt.png';
    } else if (windSpeed >= 103 && windSpeed <= 107) {
      iconUrl = '/icons/barbs/105-kt.png';
    } else if (windSpeed >= 108 && windSpeed <= 112) {
      iconUrl = '/icons/barbs/110-kt.png';
    } else if (windSpeed >= 113 && windSpeed <= 117) {
      iconUrl = '/icons/barbs/115-kt.png';
    } else if (windSpeed >= 118 && windSpeed <= 122) {
      iconUrl = '/icons/barbs/120-kt.png';
    } else if (windSpeed >= 123 && windSpeed <= 140) {
      iconUrl = '/icons/barbs/125-kt.png';
    } else if (windSpeed >= 141 && windSpeed <= 175) {
      iconUrl = '/icons/barbs/150-kt.png';
    } else if (windSpeed > 175) {
      iconUrl = '/icons/barbs/200-kt.png';
    }

    if (windSpeed > 2) {
      transformAngle = 'rotate(' + windDirection + 'deg)';
    }

    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: '',
        html: ReactDOMServer.renderToString(
          <>
            <Image
              src={iconUrl}
              style={{
                transform: transformAngle,
                transformOrigin: '16px 26px',
              }}
              alt={''}
              width={30}
              height={30}
            />
          </>,
        ),
        iconSize: [30, 30],
        iconAnchor: anchor as any,
        //popupAnchor: [0, 0]
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
      case MarkerTypes.surfaceWindBarbs.value:
        return getSurfaceWindBarbsMarker(feature, latlng);
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
        return getDewpointDepressionMarker(feature, latlng);
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
        url="https://eztile4.ezwxbrief.com/geoserver/EZWxBrief/ows"
        maxFeatures={164096}
        typeName="EZWxBrief:metar"
        propertyNames={[
          'wkb_geometry',
          'ogc_fid',
          'station_id',
          // 'elevation_ft',
          'temp_c',
          'dewpoint_c',
          'wind_dir_degrees',
          'observation_time',
          'wind_speed_kt',
          'wind_gust_kt',
          'flight_category',
          // 'raw_text',
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
          // 'altim_in_hg',
          // 'sea_level_pressure_mb',
          'wx_string',
          // 'vert_vis_ft',
          // 'dewpointdepression',
          // 'relativehumiditypercent',
          // 'densityaltitudefeet',
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
