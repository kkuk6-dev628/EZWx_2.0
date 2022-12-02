import React, { MutableRefObject, ReactElement, useState } from 'react';
import { Typography } from '@material-ui/core';
import { useMapEvents } from 'react-leaflet';
import { Layer, Util } from 'leaflet';
import Accordion from '@material-ui/core/Accordion';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import lodashGroupBy from 'lodash.groupby';
import toast from 'react-hot-toast';
import { LayersControlProvider } from './layerControlContext';

import createControlledLayer from './controlledLayer';

const POSITION_CLASSES: { [key: string]: string } = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
};

interface IProps {
  children: ReactElement[];
  position: string;
  collapsed: boolean;
  exclusive: boolean;
  onLayersAdd?: (layers: ILayerObj[]) => void;
}

interface ILayerObj {
  layer: Layer;
  group: string;
  name: string;
  checked: boolean;
  id: number;
  isEmpty: boolean;
}

const LayerControl = ({
  position,
  collapsed,
  children,
  exclusive,
  onLayersAdd,
}: IProps) => {
  const [layers, setLayers] = useState<ILayerObj[]>([]);
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

  const map = useMapEvents({
    layerremove: () => {
      //console.log('layer removed');
    },
    layeradd: () => {
      //console.log('layer add');
    },
    overlayadd: () => {
      //console.log(layers);
    },
  });

  const onLayerClick = (layerObj: ILayerObj) => {
    if (layerObj.isEmpty) {
      toast.error(`No ${layerObj.name}'s data displayed`, {
        position: 'top-right',
      });
      return;
    }
    if (map?.hasLayer(layerObj.layer)) {
      if (!exclusive) hideLayer(layerObj);
    } else {
      if (exclusive) hideAllLayers();
      showLayer(layerObj);
    }
  };

  const showLayer = (layerObj: ILayerObj) => {
    if (!map?.hasLayer(layerObj.layer)) {
      map.addLayer(layerObj.layer);
      setLayers(
        layers.map((layer) => {
          if (layer.id === layerObj.id)
            return {
              ...layer,
              checked: true,
            };
          return layer;
        }),
      );
    }
  };

  const hideLayer = (layerObj: ILayerObj) => {
    if (map?.hasLayer(layerObj.layer)) {
      map.removeLayer(layerObj.layer);
      setLayers(
        layers.map((layer) => {
          if (layer.id === layerObj.id)
            return {
              ...layer,
              checked: false,
            };
          return layer;
        }),
      );
    }
  };

  const hideAllLayers = () => {
    const layersNew = layers.map((layerObj) => {
      map.removeLayer(layerObj.layer);
      layerObj.checked = false;
      return {
        ...layerObj,
        checked: false,
      };
    });
    setLayers(layersNew);
  };

  const onGroupAdd = (layer: Layer, name: string, group: string) => {
    const isEmptyLayer =
      layer._layers !== undefined && Object.keys(layer._layers).length === 0;
    const cLayers = layers;
    cLayers.push({
      layer,
      group,
      name,
      checked: exclusive || isEmptyLayer ? false : map?.hasLayer(layer),
      id: Util.stamp(layer),
      isEmpty: isEmptyLayer,
    });
    if (exclusive) {
      cLayers[0].checked = true;
      for (let i = 1; i < cLayers.length; i++) {
        if (map?.hasLayer(cLayers[i].layer)) {
          map.removeLayer(cLayers[i].layer);
        }
      }
    }
    setLayers(cLayers);
    if (onLayersAdd) onLayersAdd(layers);
  };

  const groupedLayers = lodashGroupBy(layers, 'group');

  return (
    <LayersControlProvider
      value={{
        layers,
        addGroup: onGroupAdd,
      }}
    >
      <div className={positionClass}>
        <div className="leaflet-control leaflet-bar">
          {!collapsed &&
            Object.keys(groupedLayers).map((section, index) => (
              <Accordion key={`${section} ${index}`} defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>{section}</Typography>
                </AccordionSummary>
                {groupedLayers[section]?.map((layerObj, index) => (
                  <AccordionDetails key={`accDetails_${index}`}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={layerObj.checked}
                          onChange={(e) => {
                            console.log(e);
                            onLayerClick(layerObj);
                          }}
                          name="checkedB"
                          color="primary"
                        />
                      }
                      label={layerObj.name}
                    />
                  </AccordionDetails>
                ))}
              </Accordion>
            ))}
        </div>
        {children}
      </div>
    </LayersControlProvider>
  );
};

const GroupedLayer = createControlledLayer(
  (layersControl, layer, name, group) => {
    layersControl.addGroup(layer, name, group);
  },
);

export default LayerControl;
export { GroupedLayer };
