/* eslint-disable @typescript-eslint/ban-ts-comment */
import MeteoLayerControl, { GroupedLayer } from '../layer-control/MeteoLayerControl';
import { LayerGroup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import GairmetLayer from './GairmetLayer';
import { useContext, useEffect, useRef, useState } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import FeatureSelector from '../popups/FeatureSelector';
import ReactDOMServer from 'react-dom/server';
import GairmetPopup from '../popups/GairmetPopup';
import GeneralPopup from '../popups/GeneralPopup';
import SigmetLayer from './SigmetLayer';
import CWALayer from './CWALayer';
import SigmetPopup from '../popups/SigmetPopup';
import CWAPopup from '../popups/CWAPopup';
import ConvectiveOutlookLayer from './ConvectiveOutlookLayer';
import ConvectiveOutlookPopup from '../popups/ConvectiveOutlookPopup';
import IntlSigmetLayer from './IntlSigmetLayer';
import { getBBoxFromPointZoom } from '../../common/AreoFunctions';
import IntlSigmetPopup from '../popups/IntlSigmetPopup';
import PirepLayer from './PirepLayer';
import PIREPPopup from '../popups/PIREPPopup';
import 'leaflet-responsive-popup';
import 'leaflet-responsive-popup/leaflet.responsive.popup.css';
import MetarsLayer from './MetarsLayer';
import MetarsPopup from '../popups/MetarsPopup';
import { useSelector } from 'react-redux';
import { selectMetar } from '../../../../store/layers/LayerControl';
import { selectPersonalMinimums } from '../../../../store/user/UserSettings';
import { MetarMarkerTypes } from '../../common/AreoConstants';
import { useMeteoLayersContext } from '../layer-control/MeteoLayerControlContext';
import { InLayerControl } from '../layer-control/MeteoLayerControl';
import axios from 'axios';
import NbmMarkersLayer from './NbmMarkersLayer';
import { InBaseLayerControl } from '../layer-control/BaseMapLayerControl';
import RadarLayer from './RadarLayer';
import { StationMarkersLayer } from './StationMarkersLayer';

const maxLayers = 6;

const MeteoLayers = () => {
  const layers = useMeteoLayersContext();
  const debugLayerGroupRef = useRef(null);
  const metarLayerStatus = useSelector(selectMetar);
  const personalMinimums = useSelector(selectPersonalMinimums);
  const [airportData, setAirportData] = useState();
  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = () => {
    const params = {
      maxFeatures: 14000,
      request: 'GetFeature',
      service: 'WFS',
      typeName: 'EZWxBrief:airport',
      version: '1.0.0',
      srsName: 'EPSG:4326',
      propertyName: 'icaoid,name,faaid',
      cql_filter: 'faaid is not null',
      outputFormat: 'application/json',
      v: 1,
    } as any;
    // if (abortController) {
    //   abortController.abort();
    // }
    // setAbortController(new AbortController());
    axios
      .get('https://eztile4.ezwxbrief.com/geoserver/EZWxBrief/ows', {
        params: params,
      })
      .then((data) => {
        if (typeof data.data === 'string') {
          console.log('Aireport: Invalid json data!', data.data);
        } else {
          const airports = { icaoid: {}, faaid: {} };
          data.data.features.forEach((feature) => {
            if (!feature.properties.name) return;
            if (feature.properties.faaid) {
              airports.faaid[feature.properties.faaid] = feature.properties.name;
            }
            if (feature.properties.icaoid) {
              airports.icaoid[feature.properties.icaoid] = feature.properties.name;
            }
          });
          setAirportData(airports as any);
        }
      })
      .catch((reason) => {
        console.log('Aireport', reason);
      });
  };

  const showPopup = (layer: L.GeoJSON, latlng: L.LatLng): void => {
    if (typeof layer.setStyle === 'function') {
      layer.setStyle({
        weight: 8,
      });
    }

    // @ts-ignore
    const layerName = layer.feature.id.split('.')[0];
    let popup;
    let useWidePopup = false;
    let offsetX = 10;
    switch (layerName) {
      case 'gairmet':
        popup = <GairmetPopup feature={layer.feature}></GairmetPopup>;
        useWidePopup = false;
        break;
      case 'sigmet':
        popup = <SigmetPopup feature={layer.feature}></SigmetPopup>;
        useWidePopup = true;
        break;
      case 'intl_sigmet':
        popup = <IntlSigmetPopup feature={layer.feature}></IntlSigmetPopup>;
        useWidePopup = true;
        break;
      case 'cwa':
        popup = <CWAPopup feature={layer.feature}></CWAPopup>;
        useWidePopup = true;
        break;
      case 'conv_outlook':
        popup = <ConvectiveOutlookPopup feature={layer.feature}></ConvectiveOutlookPopup>;
        useWidePopup = true;
        break;
      case 'pirep':
        popup = <PIREPPopup feature={layer.feature}></PIREPPopup>;
        useWidePopup = true;
        break;
      case 'metar':
        if (metarLayerStatus.markerType === MetarMarkerTypes.ceilingHeight.value) {
          offsetX = 25;
        }
        popup = (
          <MetarsPopup
            layer={layer as any}
            airportsData={airportData}
            personalMinimums={personalMinimums}
          ></MetarsPopup>
        );
        useWidePopup = true;
        break;
      default:
        popup = <GeneralPopup feature={layer.feature} title={`${layerName} properties`}></GeneralPopup>;
        useWidePopup = false;
    }
    const popupContent = ReactDOMServer.renderToString(popup);
    L.responsivePopup({
      minWidth: useWidePopup ? 320 : 196,
      offset: [offsetX, 19],
    })
      .setLatLng(latlng)
      .setContent(popupContent)
      .openOn(map);
  };

  const inLayerControl = useContext(InLayerControl);
  const inBaseLayerControl = useContext(InBaseLayerControl);

  const map = useMapEvents({
    click: (e: any) => {
      if (inLayerControl.value) return;
      if (inBaseLayerControl.value) return;
      const features = [];
      const clickedBBox = getBBoxFromPointZoom(50, e.latlng, map.getZoom());
      if (debugLayerGroupRef.current) {
        debugLayerGroupRef.current.clearLayers();
      }
      Object.values(layers).forEach((layer: L.Path) => {
        if (layer.options.interactive === false) return;
        if (map.hasLayer(layer) === false) return;
        //@ts-ignore
        if (layer.resetStyle) layer.resetStyle();
        if (features.length >= maxLayers) {
          return;
        }
        //@ts-ignore
        layer.eachLayer((l: any) => {
          if (features.length >= maxLayers) {
            return;
          }
          if (l.feature.geometry.type === 'Point' || l.feature.geometry.type === 'MultiPoint') {
            if (
              clickedBBox.latMin < l.feature.geometry.coordinates[1] &&
              l.feature.geometry.coordinates[1] < clickedBBox.latMax &&
              clickedBBox.lngMin < l.feature.geometry.coordinates[0] &&
              l.feature.geometry.coordinates[0] < clickedBBox.lngMax
            ) {
              features.push(l);
            }
          } else if (
            (l.feature.geometry.type === 'Polygon' || l.feature.geometry.type === 'MultiPolygon') &&
            booleanPointInPolygon([e.latlng.lng, e.latlng.lat], l.toGeoJSON())
          ) {
            features.push(l);
          }
        });
      });
      map.closePopup();

      if (features.length === 0) {
        axios
          .post('/api/asd', e.latlng)
          .then((result) => {
            console.log(result.data);
          })
          .catch((reason) => {
            console.log(reason);
          });

        // if (wmsLayerRef.current) {
        //   wmsLayerRef.current.source.getFeatureInfo(
        //     map.latLngToContainerPoint(e.latlng),
        //     e.latlng,
        //     ['EZWxBrief:2t_NBM', 'EZWxBrief:2t_test'],
        //     (latlng: L.LatLng, result: string) => {
        //       try {
        //         const resultObj = JSON.parse(result);
        //         resultObj.features.length > 0 &&
        //           showPopup({ feature: resultObj.features[0] } as any, latlng);
        //       } catch (e) {
        //         console.error(result);
        //       }
        //     },
        //   );
        //   axios
        //     .post('/api/asd', e.latlng)
        //     .then((result) => {
        //       Object.entries(result.data).map((entry) => {
        //         const lnglat = entry[0].split(',');
        //         if (
        //           debugLayerGroupRef.current &&
        //           debugLayerGroupRef.current.addLayer
        //         ) {
        //           const circleMarker = new L.CircleMarker(
        //             [lnglat[1] as any, lnglat[0] as any],
        //             { radius: 2 },
        //           );
        //           circleMarker.bindTooltip(`<h>${entry[1]}</h>`);
        //           debugLayerGroupRef.current.addLayer(circleMarker);
        //         }
        //       });
        //       showPopup(
        //         { feature: { properties: result.data, id: 'temp' } } as any,
        //         e.latlng,
        //       );
        //     })
        //     .catch((reason) => {
        //       console.log(reason);
        //     });
        // }
        return;
      } else if (features.length === 1) {
        showPopup(features[0], e.latlng);
      } else {
        L.responsivePopup({ offset: [10, 19] })
          .setLatLng(e.latlng)
          .setContent(ReactDOMServer.renderToString(<FeatureSelector features={features}></FeatureSelector>))
          .openOn(map);
        const selectorFeatureNodes = document.getElementsByClassName('feature-selector-item');
        for (let i = 0; i < selectorFeatureNodes.length; i++) {
          selectorFeatureNodes[i].addEventListener('click', (ee) => {
            map.closePopup();
            // @ts-ignore
            const featureId = ee.currentTarget.dataset.featureid;
            features.forEach((layer) => {
              if (layer.feature.id === featureId) {
                showPopup(layer, e.latlng);
              }
            });
          });
        }
      }
    },
  });

  // useEffect(() => {
  //   L.GridLayer.GridDebug = L.GridLayer.extend({
  //     createTile: function (coords) {
  //       const tile = document.createElement('div');
  //       tile.style.outline = '1px solid green';
  //       tile.style.fontWeight = 'bold';
  //       tile.style.fontSize = '14pt';
  //       tile.innerHTML = [coords.z, coords.x, coords.y].join('/');
  //       return tile;
  //     },
  //   });

  //   L.gridLayer.gridDebug = function (opts) {
  //     return new L.GridLayer.GridDebug(opts);
  //   };

  //   map.addLayer(L.gridLayer.gridDebug());
  // }, [map]);
  const meteoLayers = useMeteoLayersContext();

  return (
    <div className="route__layer">
      <MeteoLayerControl position="topright"></MeteoLayerControl>
      <RadarLayer></RadarLayer>
      <GroupedLayer
        checked
        addLayerToStore={(layer) => {
          meteoLayers.metar = layer;
        }}
      >
        <StationMarkersLayer />
      </GroupedLayer>
      {/* <GroupedLayer
        checked
        addLayerToStore={(layer) => {
          meteoLayers.nbmMarkers = layer;
        }}
      >
        <NbmMarkersLayer></NbmMarkersLayer>
      </GroupedLayer> */}
      <GroupedLayer
        checked
        addLayerToStore={(layer) => {
          meteoLayers.sigmet = layer;
        }}
      >
        <SigmetLayer></SigmetLayer>
      </GroupedLayer>
      <GroupedLayer
        checked
        addLayerToStore={(layer) => {
          meteoLayers.intlSigmet = layer;
        }}
      >
        <IntlSigmetLayer></IntlSigmetLayer>
      </GroupedLayer>
      <GroupedLayer
        checked
        addLayerToStore={(layer) => {
          meteoLayers.cwa = layer;
        }}
      >
        <CWALayer></CWALayer>
      </GroupedLayer>
      <GroupedLayer
        checked
        addLayerToStore={(layer) => {
          meteoLayers.convectiveOutlooks = layer;
        }}
      >
        <ConvectiveOutlookLayer></ConvectiveOutlookLayer>
      </GroupedLayer>
      <GroupedLayer
        checked
        addLayerToStore={(layer) => {
          meteoLayers.gairmet = layer;
        }}
      >
        <GairmetLayer></GairmetLayer>
      </GroupedLayer>
      <GroupedLayer
        checked
        addLayerToStore={(layer) => {
          meteoLayers.pirep = layer;
        }}
      >
        <PirepLayer></PirepLayer>
      </GroupedLayer>
      {/* <GroupedLayer
          checked
          name="temperature"
          group="Map Layers"
          pickable={false}
          order={7}
        >
          {/* <TimeDimensionLayer
            ref={wmsLayerRef}
            // url="https://eztile1.ezwxbrief.com/geoserver/EZWxBrief/wms?"
            url="https://{s}.ezwxbrief.com/geoserver/EZWxBrief/wms?"
            // url="http://3.95.80.120:8080/geoserver/EZWxBrief/wms?"
            options={{
              transparent: true,
              format: 'image/png',
              crs: CRS.EPSG4326,
              info_format: 'application/json',
              identify: false,
              tiled: false,
              subdomains: ['eztile1', 'eztile2', 'eztile3', 'eztile4'],
              layers: 'EZWxBrief:nbm_t2m_10km',
              // @ts-ignore
              useCache: true,
              // crossOrigin: true,
            }}
          ></TimeDimensionLayer>
        </GroupedLayer> */}
      <LayerGroup ref={debugLayerGroupRef}></LayerGroup>
    </div>
  );
};

export default MeteoLayers;
