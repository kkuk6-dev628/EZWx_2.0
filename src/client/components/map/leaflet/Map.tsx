/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FormEvent, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import styles from './Map.module.css';
import BoundedWFSLayer from './layers/BoundedWFSLayer';
import MapTabs from '../../shared/MapTabs';
import { SvgRoundMinus, SvgRoundPlus } from '../../utils/SvgIcons';
import ReactDOMServer from 'react-dom/server';
import LayerControl, { GroupedLayer } from './layer-control/LayerControl';
import { useRouter } from 'next/router';

function LeafletMap() {
  const { pathname } = useRouter();
  const [isShowTabs, setIsShowTabs] = useState(false);
  const [, setMap] = useState(null);
  const [layerControlCollapsed, setLayerControlCollapsed] = useState(true);
  const [baseMapControlCollapsed, setBaseMapControlCollapsed] = useState(true);

  const resetHighlightGairmet = useRef(null);
  const resetHighlightToppstate = useRef(null);
  const resetHighlightBugsite = useRef(null);

  const handleOnMapMounted = (evt: { leafletElement: any }) => {
    setMap(evt ? evt.leafletElement : null);
  };

  const mapClicked = (e) => {
    resetHighlightGairmet.current();
    resetHighlightToppstate.current();
    resetHighlightBugsite.current();
  };

  useEffect(() => {
    if (pathname === '/try-ezwxbrief') {
      setIsShowTabs(true);
    }
  }, [pathname]);

  return (
    <div className="map__container">
      <MapContainer
        className={styles.map}
        bounds={[
          [55.0, -130.0],
          [20.0, -60.0],
        ]}
        // @ts-ignore
        zoomControl={false}
        attributionControl={false}
        ref={handleOnMapMounted}
      >
        <LayerControl
          position="topright"
          collapsed={baseMapControlCollapsed}
          exclusive={true}
        >
          <GroupedLayer checked name="ArcGIS Online" group="Base Maps">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
          </GroupedLayer>
          <GroupedLayer checked name="OpenStreetMap" group="Base Maps">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </GroupedLayer>
        </LayerControl>

        <LayerControl
          position="topright"
          collapsed={layerControlCollapsed}
          exclusive={false}
        >
          <GroupedLayer checked name="Sf Bugsites" group="Layers">
            <BoundedWFSLayer
              url="http://3.95.80.120:8080/geoserver/sf/ows"
              maxFeatures={256}
              typeName="sf:bugsites"
              featureClicked={mapClicked}
              resetHighlightRef={resetHighlightBugsite}
            ></BoundedWFSLayer>
          </GroupedLayer>
          <GroupedLayer checked name="GAirmet" group="Layers">
            <BoundedWFSLayer
              url="http://3.95.80.120:8080/geoserver/EZWxBrief/ows"
              maxFeatures={256}
              typeName="EZWxBrief:gairmet"
              propertyNames={['wkb_geometry', 'id', 'forecast']}
              featureClicked={mapClicked}
              enableBBoxQuery={true}
              resetHighlightRef={resetHighlightGairmet}
              style={(feature) => {
                let color = '#990000';
                switch (feature.properties.forecast) {
                  case '3':
                    color = '#009900';
                    break;
                  case '6':
                    color = '#000099';
                    break;
                  case '9':
                    color = '#009999';
                    break;
                  case '12':
                    color = '#999900';
                    break;
                  default:
                    color = '#990000';
                    break;
                }
                return { color };
                // const color =
                //   (feature.properties.forecast / 12.0) * (256 * 256 * 256);
                // return {
                //   color: '#' + color.toString(16),
                // };
              }}
            ></BoundedWFSLayer>
          </GroupedLayer>
          <GroupedLayer checked name="States" group="Layers">
            <BoundedWFSLayer
              url="http://3.95.80.120:8080/geoserver/topp/ows"
              maxFeatures={256}
              typeName="topp:states"
              featureClicked={mapClicked}
              resetHighlightRef={resetHighlightToppstate}
            ></BoundedWFSLayer>
          </GroupedLayer>
        </LayerControl>
        <ZoomControl
          position="topright"
          zoomInText={ReactDOMServer.renderToString(
            <SvgRoundPlus></SvgRoundPlus>,
          )}
          zoomOutText={ReactDOMServer.renderToString(
            <SvgRoundMinus></SvgRoundMinus>,
          )}
        />
      </MapContainer>
      {isShowTabs && (
        <MapTabs
          layerClick={(): void => {
            setBaseMapControlCollapsed(true);
            setLayerControlCollapsed(!layerControlCollapsed);
          }}
          routeClick={(_event: FormEvent<Element>): void => {
            throw new Error('Function not implemented.');
          }}
          profileClick={(_event: FormEvent<Element>): void => {
            throw new Error('Function not implemented.');
          }}
          basemapClick={(): void => {
            setLayerControlCollapsed(true);
            setBaseMapControlCollapsed(!baseMapControlCollapsed);
          }}
        />
      )}
    </div>
  );
}

export default LeafletMap;
