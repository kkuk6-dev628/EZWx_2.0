/* eslint-disable @typescript-eslint/ban-ts-comment */
import { GroupedLayer } from '../layer-control/MeteoLayerControl';
import { TileLayer } from 'react-leaflet';
import { useBaseMapLayersContext } from '../layer-control/BaseMapLayerControlContext';
import WFSLayer from './WFSLayer';
import BaseMapLayerControl from '../layer-control/BaseMapLayerControl';
import { useSelector } from 'react-redux';
import { selectBaseMapLayerControl } from '../../../../store/layers/BaseMapLayerControl';
import { db } from '../../../caching/dexieDb';
import { wfsUrl2 } from '../../common/AreoConstants';

const BaseMapLayers = () => {
  const baseMapLayers = useBaseMapLayersContext();
  const baseMapLayerStatus = useSelector(selectBaseMapLayerControl);

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

  return (
    <div className="route__layer">
      <BaseMapLayerControl position="topright"></BaseMapLayerControl>
      <GroupedLayer
        checked={baseMapLayerStatus.usProvincesState.checked}
        addLayerToStore={(layer) => {
          baseMapLayers.usProvinces = layer;
        }}
      >
        <WFSLayer
          url={wfsUrl2}
          maxFeatures={256}
          typeName="topp:states"
          interactive={false}
          style={() => {
            return {
              fillOpacity: 0,
              weight: 1,
            };
          }}
          readDb={() => db.usProvinces.toArray()}
          writeDb={(features) => {
            db.usProvinces.clear();
            db.usProvinces.bulkAdd(features);
          }}
        ></WFSLayer>
      </GroupedLayer>
      <GroupedLayer
        checked={baseMapLayerStatus.canadianProvincesState.checked}
        addLayerToStore={(layer) => {
          baseMapLayers.canadianProvinces = layer;
        }}
      >
        <WFSLayer
          url={wfsUrl2}
          maxFeatures={256}
          typeName="EZWxBrief:canadian_province"
          interactive={false}
          style={() => {
            return {
              fillOpacity: 0,
              weight: 1,
            };
          }}
          getLabel={(feature) => {
            return feature.properties.NAME;
          }}
          readDb={() => db.usProvinces.toArray()}
          writeDb={(features) => {
            db.canadianProvinces.clear();
            db.canadianProvinces.bulkAdd(features);
          }}
        ></WFSLayer>
      </GroupedLayer>
      <GroupedLayer
        checked={baseMapLayerStatus.countryWarningAreaState.checked}
        addLayerToStore={(layer) => {
          baseMapLayers.countyWarningAreas = layer;
        }}
      >
        <WFSLayer
          url={wfsUrl2}
          maxFeatures={256}
          typeName="EZWxBrief:county_warning_areas"
          interactive={false}
          enableBBoxQuery={false}
          geometryColumn="the_geom"
          style={() => {
            return {
              fillOpacity: 0,
              weight: 1,
              color: '#ff69',
            };
          }}
          readDb={() => db.usProvinces.toArray()}
          writeDb={(features) => {
            db.countyWarningAreas.clear();
            const chunkSize = 2;
            let i = 0;
            const chunkedAdd = () => {
              if (features.length <= i) return;
              db.countyWarningAreas
                .bulkAdd(features.slice(i, i + chunkSize))
                .catch((error) => console.log(error))
                .finally(() => {
                  i += chunkSize;
                  chunkedAdd();
                });
            };
            chunkedAdd();
          }}
        ></WFSLayer>
      </GroupedLayer>
      <GroupedLayer
        checked={baseMapLayerStatus.streetState.checked}
        addLayerToStore={(layer) => {
          baseMapLayers.street = layer;
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // @ts-ignore
          useCache={true}
        />
      </GroupedLayer>
      <GroupedLayer
        checked={baseMapLayerStatus.topoState.checked}
        addLayerToStore={(layer) => {
          baseMapLayers.topo = layer;
        }}
      >
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          // @ts-ignore
          useCache={true}
        />
      </GroupedLayer>
      <GroupedLayer
        checked={baseMapLayerStatus.terrainState.checked}
        addLayerToStore={(layer) => {
          baseMapLayers.terrain = layer;
        }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          // @ts-ignore
          useCache={true}
        />
      </GroupedLayer>
      <GroupedLayer
        checked={baseMapLayerStatus.darkState.checked}
        addLayerToStore={(layer) => {
          baseMapLayers.dark = layer;
        }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          // @ts-ignore
          subdomains="abcd"
          // @ts-ignore
          useCache={true}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
      </GroupedLayer>
      <GroupedLayer
        checked={baseMapLayerStatus.satelliteState.checked}
        addLayerToStore={(layer) => {
          baseMapLayers.satellite = layer;
        }}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          // @ts-ignore
          useCache={true}
        />
      </GroupedLayer>
    </div>
  );
};

export default BaseMapLayers;
