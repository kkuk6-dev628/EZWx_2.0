import WFSLayer from './WFSLayer';
import L, { LatLng } from 'leaflet';
import Image from 'next/image';
import ReactDOMServer from 'react-dom/server';
import { Pane, useMap } from 'react-leaflet';
import {
  addLeadingZeroes,
  getCacheVersion,
  getLowestCeiling,
  getMetarCeilingCategory,
  getMetarVisibilityCategory,
  getQueryTime,
  getSkyConditions,
  getWorstSkyCondition,
} from '../../common/AreoFunctions';
import SunCalc from 'suncalc';
import { selectMetar } from '../../../../store/layers/LayerControl';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { selectPersonalMinimums } from '../../../../store/user/UserSettings';
import { MetarMarkerTypes, timeSliderInterval, windIconLimit } from '../../common/AreoConstants';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../caching/dexieDb';

const cacheUpdateInterval = 75; // 75 minutes

export const getFlightCategoryIconUrl = (feature: GeoJSON.Feature): { iconUrl: string; ceiling: number } => {
  const skyConditions = getSkyConditions(feature);
  let sky: string, ceiling: number;
  if (feature.properties.vert_vis_ft) {
    sky = 'OVX';
    ceiling = feature.properties.vert_vis_ft;
  } else if (skyConditions.length > 0) {
    const skyCondition = getLowestCeiling(skyConditions);
    if (skyCondition) ceiling = skyCondition.cloudBase;
    sky = getWorstSkyCondition(skyConditions);
  }
  let flightCategory = feature.properties.flight_category;
  if (!flightCategory) {
    flightCategory = 'Black';
  }
  let iconUrl = '/icons/metar/MISSING.png';
  if (sky === 'CLR' && feature.properties.auto == null) {
    sky = 'SKC';
  }
  if (flightCategory && sky) {
    iconUrl = `/icons/metar/${flightCategory}-${sky}.png`;
  }
  return { iconUrl, ceiling };
};

const MetarsLayer = () => {
  const map = useMap();

  const layerStatus = useSelector(selectMetar);
  const personalMinimums = useSelector(selectPersonalMinimums);
  const [renderedTime, setRenderedTime] = useState(Date.now());
  const wfsRef = useRef(null);
  const [filteredData, setFilteredData] = useState();
  const [indexedData, setIndexedData] = useState();
  const [cacheVersion, setCacheVersion] = useState(getCacheVersion(cacheUpdateInterval));
  const [clusterRadius, setClusterRadius] = useState(50);

  useEffect(() => {
    setRenderedTime(Date.now());
    const v = getCacheVersion(cacheUpdateInterval);
    if (v !== cacheVersion) {
      setCacheVersion(v);
    }
    layerStatus.markerType === MetarMarkerTypes.surfaceWindBarbs.value ? setClusterRadius(25) : setClusterRadius(50);
    switch (layerStatus.markerType) {
      case MetarMarkerTypes.surfaceVisibility.value:
        break;
      case MetarMarkerTypes.flightCategory.value:
        break;
    }
  }, [
    layerStatus.markerType,
    layerStatus.flightCategory.all.checked,
    layerStatus.flightCategory.vfr.checked,
    layerStatus.flightCategory.mvfr.checked,
    layerStatus.flightCategory.ifr.checked,
    layerStatus.flightCategory.lifr.checked,
  ]);

  const getFlightCatMarker = (feature: GeoJSON.Feature, latlng: LatLng): L.Marker => {
    const { iconUrl } = getFlightCategoryIconUrl(feature);

    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-icon',
        html: ReactDOMServer.renderToString(
          <>
            <Image src={iconUrl} alt={''} width={16} height={16} />
          </>,
        ),
        iconSize: [16, 16],
      }),
      pane: 'metar',
    });
    return metarMarker;
  };

  const getCeilingHeightMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
    const skyConditions = getSkyConditions(feature);
    const skyCondition = getLowestCeiling(skyConditions);
    if (skyCondition == null) return;
    const ceiling = skyCondition.cloudBase;
    const ceilingAmount = addLeadingZeroes(ceiling / 100, 3);
    const worstSkyCondition = getWorstSkyCondition(skyConditions);
    let iconUrl = '';
    if (layerStatus.usePersonalMinimums) {
    } else {
      const [cat] = getMetarCeilingCategory(ceiling, personalMinimums);
      iconUrl = `/icons/metar/${cat}-${worstSkyCondition}.png`;
    }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-ceiling-icon',
        html: ReactDOMServer.renderToString(
          <>
            <div style={{ display: 'inline', verticalAlign: -7, marginLeft: -4 }}>
              <Image src={iconUrl} alt={''} width={20} height={20} />
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
    return metarMarker;
  };

  const getSurfaceVisibilityMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
    let visibility = feature.properties.visibility_statute_mi;
    if (!visibility) return;
    const [category, _] = getMetarVisibilityCategory(visibility, personalMinimums);
    let iconUrl = '/icons/metar/MISSING.png';
    if (visibility === 0.25 && feature.properties.raw_text.indexOf('M1/4SM') > -1) {
      visibility = '<0.25';
    }
    if (visibility > 4) {
      visibility = Math.ceil(visibility);
    }
    if (category) {
      iconUrl = `/icons/metar/${category}-OVC.png`;
    } else {
      iconUrl = `/icons/metar/Black-OVC.png`;
    }

    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-visibility-icon',
        html: ReactDOMServer.renderToString(
          <>
            <div style={{ display: 'inline', verticalAlign: -7, marginLeft: -4 }}>
              <Image src={iconUrl} alt={''} width={20} height={20} />
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
    return metarMarker;
  };

  const getSurfaceWindSpeedMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
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

  const getSurfaceWindGustMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
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

  const getSurfaceTemperatureMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
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

  const getSurfaceDewpointMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
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

  const getDewpointDepressionMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
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
    } else if (dewpointDepressionInCelcius > 4 && dewpointDepressionInCelcius <= 7) {
      colorCode = 'lightBlue';
    } else if (dewpointDepressionInCelcius > 2 && dewpointDepressionInCelcius <= 4) {
      colorCode = 'darkerBlue';
    } else if (dewpointDepressionInCelcius > 1 && dewpointDepressionInCelcius <= 2) {
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

  const getSurfaceWindBarbsMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
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
                // transformOrigin: '16px 26px',
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

  const getWeatherMarker = (feature: GeoJSON.Feature, latlng: LatLng) => {
    let isDayTime = true;
    const sunsetSunriseTime = SunCalc.getTimes(new Date(), latlng.lat, latlng.lng);
    if (Date.parse(sunsetSunriseTime.sunrise) && Date.parse(sunsetSunriseTime.sunset)) {
      const obsTime = new Date(feature.properties.observation_time).getTime();
      isDayTime = obsTime >= sunsetSunriseTime.sunrise.getTime() && obsTime <= sunsetSunriseTime.sunset.getTime();
    }
    let condition = '';
    let worstSkyConditionFetched = false;

    let weatherIconClass = 'fas fa-question-square';
    let iconColor = 'lightslategrey';
    if (Object.keys(personalMinimums).indexOf(feature.properties.flight_category) > -1) {
      iconColor = personalMinimums[feature.properties.flight_category].color;
    }

    if (!feature.properties.wx_string) {
      //if wxString is not set, then get marker's icon from wind speed
      if (
        (feature.properties.wind_speed_kt && feature.properties.wind_speed_kt > windIconLimit.windSpeed) ||
        (feature.properties.wind_gust_kt && feature.properties.wind_gust_kt > windIconLimit.windGust)
      ) {
        weatherIconClass = 'fas fa-wind';
      } else {
        //get icon from worst sky condition
        condition = getWorstSkyCondition(getSkyConditions(feature));

        worstSkyConditionFetched = true;
        switch (condition) {
          case 'SKC':
          case 'CLR':
          case 'CAVOK':
            weatherIconClass = isDayTime ? 'fas fa-sun' : 'fas fa-moon';
            break;
          case 'FEW':
            weatherIconClass = isDayTime ? 'fas fa-sun-cloud' : 'fas fa-moon-cloud';
            break;
          case 'SCT':
            weatherIconClass = isDayTime ? 'fas fa-cloud-sun' : 'fas fa-cloud-moon';
            break;
          case 'BKN':
            weatherIconClass = isDayTime ? 'fas fa-clouds-sun' : 'fas fa-clouds-moon';
            break;
          case 'OVC':
          case 'OVX':
            weatherIconClass = 'fas fa-cloud';
        }
      }
    } else {
      const weatherString = feature.properties.wx_string.replace('-', '').replace('+', '');
      switch (weatherString) {
        case 'SN':
        case 'SHSN':
        case 'SN FZFG':
        case 'SN BR':
        case 'SN FG':
        case 'SN FZFG DRSN':
        case 'SHSN DRSN':
        case 'SN DRSN':
        case 'SG DRSN':
        case 'SG':
        case 'VCSH DRSN':
          weatherIconClass = 'fas fa-cloud-snow';
          break;
        case 'RASN':
        case 'SNRA':
        case 'SN RA':
        case 'SNPL':
        case 'PLSN':
        case 'PL BR':
        case 'PL FG':
        case 'PL HZ':
        case 'RA SN BR':
        case 'SN RA BR':
          weatherIconClass = 'fas fa-cloud-sleet';
          break;
        case 'RAPL':
        case 'PLRA':
        case 'PL':
          weatherIconClass = 'fas fa-cloud-hail-mixed';
          break;
        case 'FZRA':
        case 'FZRASN':
        case 'FZRA FZFG':
        case 'FZDZ BR':
        case 'FZRA BR':
        case 'FZRA FG':
        case 'FZRA HZ':
        case 'FZDZ':
        case 'FZDZ FZFG':
          weatherIconClass = 'fas fa-icicles';
          break;
        case 'RA':
        case 'RA BR':
        case 'RA HZ':
        case 'RA FG':
        case 'RA BCFG':
          weatherIconClass = 'fas fa-cloud-rain';
          break;
        case 'DZ':
        case 'DZ BR':
          weatherIconClass = 'fas fa-cloud-drizzle';
          break;
        case 'SHRA':
        case 'VCSH':
        case 'DRSN VCSH':
          weatherIconClass = 'fas fa-cloud-showers-heavy';
          break;
        case 'TS':
        case 'TS BR':
        case 'TSRA':
        case 'TSRA FG':
        case 'TSSN':
        case 'VCTSRA':
        case 'VCTS':
        case 'VCTS RA':
        case 'VCTS R':
        case 'VCTS RA BR':
        case 'RA BR VCTS':
        case 'VCTS BR':
        case 'VCTS HZ':
        case 'TS FZRA BR':
        case 'TS FZRA FG':
        case 'TS FZRA HZ':
          if (!worstSkyConditionFetched) {
            condition = getWorstSkyCondition(getSkyConditions(feature));
          }
          if (condition === 'SCT' || condition === 'FEW') {
            weatherIconClass = isDayTime ? 'fas fa-thunderstorm-sun' : 'fas fa-thunderstorm-moon';
          } else {
            weatherIconClass = 'fas fa-thunderstorm';
          }
          break;
        case 'TSRA BR':
          weatherIconClass = 'fas fa-thunderstorm';
          break;
        case 'SS':
        case 'DU':
        case 'BLSA':
        case 'BLDU':
        case 'HZ DS SQ':
        case 'HZ DS':
          weatherIconClass = 'fas fa-sun-dust';
          break;
        case 'BLSN':
        case 'DRSN':
        case 'SN BLSN':
        case 'IC DRSN':
          weatherIconClass = 'fas fa-snow-blowing';
          break;
        case 'IC':
          weatherIconClass = 'fas fa-sparkles';
          break;
        case 'FC':
          weatherIconClass = 'fas fa-tornado';
          break;
        case 'GR':
          weatherIconClass = 'fas fa-cloud-hail';
          break;
        case 'FG':
        case 'FZFG':
        case 'VCFG':
        case 'MIFG':
        case 'PRFG':
        case 'BCFG':
        case 'BR BCFG':
        case 'BCFG BR':
        case 'BCFG HZ':
        case 'MIFG BR':
        case 'FZFG UP':
          weatherIconClass = 'fas fa-fog';
          break;
        case 'FU':
        case 'HZ FU':
        case 'BR FU':
        case 'FU HZ':
          weatherIconClass = 'fas fa-fire-smoke';
          break;
        case 'UP':
        case 'BR UP':
        case 'HZ UP':
        case 'BR':
        case 'HZ':
          if (
            (feature.properties.wind_speed_kt && feature.properties.wind_speed_kt > windIconLimit.windSpeed) ||
            (feature.properties.wind_gust_kt && feature.properties.wind_gust_kt > windIconLimit.windGust)
          ) {
            weatherIconClass = 'fas fa-wind';
          } else {
            //get icon from worst sky condition
            if (!worstSkyConditionFetched) {
              condition = getWorstSkyCondition(getSkyConditions(feature));
            }
            switch (condition) {
              case 'SKC':
              case 'CLR':
                weatherIconClass = isDayTime ? 'fas fa-sun' : 'fas fa-moon';
                break;
              case 'FEW':
                weatherIconClass = isDayTime ? 'fas fa-sun-cloud' : 'fas fa-moon-cloud';
                break;
              case 'SCT':
                weatherIconClass = isDayTime ? 'fas fa-cloud-sun' : 'fas fa-cloud-moon';
                break;
              case 'BKN':
                weatherIconClass = isDayTime ? 'fas fa-clouds-sun' : 'fas fa-clouds-moon';
                break;
              case 'OVC':
              case 'OVX':
                weatherIconClass = 'fas fa-cloud';
            }
          }
          break;
        case 'TSPL':
          if (!worstSkyConditionFetched) {
            condition = getWorstSkyCondition(getSkyConditions(feature));
          }
          switch (condition) {
            case 'SKC':
            case 'CLR':
              weatherIconClass = isDayTime ? 'fas fa-sun' : 'fas fa-moon';
              break;
            case 'FEW':
            case 'SCT':
              weatherIconClass = isDayTime ? 'fas fa-thunderstorm-sun' : 'fas fa-thunderstorm-moon';
              break;
            case 'BKN':
            case 'OVC':
            case 'OVX':
              weatherIconClass = 'fas fa-cloud-bolt';
              break;
          }
          break;
      }
    }
    const metarMarker = L.marker(latlng, {
      icon: new L.DivIcon({
        className: 'metar-weather-icon',
        html: "<i style='color:" + iconColor + "' class='" + weatherIconClass + " fa-2x'></i>",
        iconSize: [32, 26],
        iconAnchor: [16, 13],
        //popupAnchor: [0, -13]
      }),
      pane: 'metar',
    });
    return metarMarker;
  };
  const pointToLayer = (feature: GeoJSON.Feature, latlng: LatLng): L.Layer => {
    let marker = null;
    switch (layerStatus.markerType) {
      case MetarMarkerTypes.flightCategory.value:
        marker = getFlightCatMarker(feature, latlng);
        break;
      case MetarMarkerTypes.ceilingHeight.value:
        marker = getCeilingHeightMarker(feature, latlng);
        break;
      case MetarMarkerTypes.surfaceVisibility.value:
        marker = getSurfaceVisibilityMarker(feature, latlng);
        break;
      case MetarMarkerTypes.surfaceWindSpeed.value:
        marker = getSurfaceWindSpeedMarker(feature, latlng);
        break;
      case MetarMarkerTypes.surfaceWindBarbs.value:
        marker = getSurfaceWindBarbsMarker(feature, latlng);
        break;
      case MetarMarkerTypes.surfaceWindGust.value:
        marker = getSurfaceWindGustMarker(feature, latlng);
        break;
      case MetarMarkerTypes.surfaceTemperature.value:
        marker = getSurfaceTemperatureMarker(feature, latlng);
        break;
      case MetarMarkerTypes.surfaceDewpoint.value:
        marker = getSurfaceDewpointMarker(feature, latlng);
        break;
      case MetarMarkerTypes.dewpointDepression.value:
        marker = getDewpointDepressionMarker(feature, latlng);
        break;
      case MetarMarkerTypes.weather.value:
        marker = getWeatherMarker(feature, latlng);
        break;
    }
    marker?.on('click', (e) => {
      map.fire('click', e);
    });
    return marker;
  };

  const buildIndexedData = (features: GeoJSON.Feature[]): any => {
    const data = {};
    features.map((feature) => {
      const obsTime = new Date(feature.properties.observation_time).getTime();
      const index = Math.floor(obsTime / timeSliderInterval);
      if (index in data === false) {
        data[index] = [];
      }
      data[index].push(feature);
    });
    setIndexedData(data as any);
    return data;
  };

  const clientFilter = (features: GeoJSON.Feature[], observationTime: Date): GeoJSON.Feature[] => {
    if (observationTime.getTime() - Date.now() > 0) {
      return [];
    }
    setFilteredData({ type: 'FeatureCollection', features: features } as any);
    let indexedFeatures = indexedData;
    if (!indexedFeatures) {
      indexedFeatures = buildIndexedData(features);
    }
    if (!indexedFeatures) return [];
    const filteredFeatures = {};
    const obsTime = new Date(observationTime).getTime();
    const startIndex = Math.floor((obsTime - 75 * 60 * 1000) / timeSliderInterval);
    const endIndex = Math.floor(obsTime / timeSliderInterval);
    for (let index = startIndex; index < endIndex; index++) {
      const iData = indexedFeatures[index] as GeoJSON.Feature[];
      if (iData) {
        iData.map((feature) => {
          if (
            layerStatus.markerType === MetarMarkerTypes.flightCategory.value &&
            layerStatus.flightCategory.all.checked === false
          ) {
            if (!layerStatus.flightCategory.vfr.checked && feature.properties.flight_category === 'VFR') {
              return;
            }
            if (!layerStatus.flightCategory.mvfr.checked && feature.properties.flight_category === 'MVFR') {
              return;
            }
            if (!layerStatus.flightCategory.ifr.checked && feature.properties.flight_category === 'IFR') {
              return;
            }
            if (!layerStatus.flightCategory.lifr.checked && feature.properties.flight_category === 'LIFR') {
              return;
            }
          }
          if (filteredFeatures[feature.properties.station_id]) {
            const prevFeature = filteredFeatures[feature.properties.station_id];
            if (new Date(prevFeature.properties.observation_time) < new Date(feature.properties.observation_time)) {
              filteredFeatures[feature.properties.station_id] = feature;
            }
          } else {
            filteredFeatures[feature.properties.station_id] = feature;
          }
        });
      }
    }
    const result = Object.values(filteredFeatures);
    return result as any;
  };

  return (
    <Pane name={'metar'} style={{ zIndex: 698 }} key={renderedTime}>
      <WFSLayer
        ref={wfsRef}
        url="https://eztile4.ezwxbrief.com/geoserver/EZWxBrief/ows"
        maxFeatures={164096}
        typeName="EZWxBrief:metar"
        propertyNames={[
          'wkb_geometry',
          'ogc_fid',
          'station_id',
          'auto',
          // 'elevation_ft',
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
          // 'sea_level_pressure_mb',
          'wx_string',
          'vert_vis_ft',
          // 'dewpointdepression',
          'relativehumiditypercent',
          'densityaltitudefeet',
        ]}
        enableBBoxQuery={false}
        pointToLayer={pointToLayer}
        isClusteredMarker={true}
        markerPane={'metar'}
        // serverFilter={serverFilter}
        clientFilter={clientFilter}
        maxClusterRadius={clusterRadius}
        initData={filteredData}
        layerStateSelector={selectMetar}
        readDb={() => db.metars.toArray()}
        writeDb={(features) => {
          db.metars.clear();
          const chunkSize = 400;
          const chunkedAdd = () => {
            if (features.length === 0) return;
            db.metars
              .bulkAdd(features.splice(0, chunkSize))
              .catch((error) => console.log(error))
              .finally(() => {
                chunkedAdd();
              });
          };
          chunkedAdd();
        }}
        // cacheVersion={cacheVersion}
      ></WFSLayer>
    </Pane>
  );
};

export default MetarsLayer;
