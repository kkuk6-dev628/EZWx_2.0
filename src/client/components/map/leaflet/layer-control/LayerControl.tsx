import React, {
  ChangeEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Radio, RadioGroup, Slider, Typography } from '@material-ui/core';
import { useMapEvents } from 'react-leaflet';
import { Layer, Util, DomEvent, LayerGroup } from 'leaflet';
import Accordion from '@material-ui/core/Accordion';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import lodashGroupBy from 'lodash.groupby';
import toast from 'react-hot-toast';
import { LayersControlProvider } from './layerControlContext';

import createControlledLayer, { OrderedLayerProps } from './controlledLayer';
import { selectMetar, setMetar } from '../../../../store/layers/LayerControl';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { MarkerTypes } from '../layers/MetarsLayer';

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
  defaultLayer?: string;
  exclusiveSkipLayers?: string[];
  onLayersAdd?: (layers: ILayerObj[]) => void;
}

interface ILayerObj {
  layer: Layer;
  group: string;
  name: string;
  checked: boolean;
  id: number;
  isEmpty: boolean;
  pickable: boolean;
  order: number;
}

const LayerControl = ({
  position,
  collapsed,
  children,
  exclusive,
  defaultLayer,
  exclusiveSkipLayers,
  onLayersAdd,
}: IProps) => {
  const [layers, setLayers] = useState<ILayerObj[]>([]);
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

  const ref = useRef<HTMLDivElement>();
  const dispatch = useDispatch();
  const layerStatus = useSelector(selectMetar);

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

  const checkEmptyLayer = (layer: Layer): boolean => {
    return (
      typeof (layer as any).getLayers === 'function' &&
      (layer as LayerGroup).getLayers().length === 0
    );
  };

  const onLayerClick = (layerObj: ILayerObj) => {
    if (checkEmptyLayer(layerObj.layer)) {
      toast.error(`No ${layerObj.name}'s data displayed`, {
        position: 'top-right',
      });
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
      if (
        exclusiveSkipLayers.length > 0 &&
        exclusiveSkipLayers.includes(layerObj.name)
      ) {
        return;
      }
      map.removeLayer(layerObj.layer);
      layerObj.checked = false;
      return {
        ...layerObj,
        checked: false,
      };
    });
    setLayers(layersNew);
  };

  const onGroupAdd = (layer: Layer, options: OrderedLayerProps) => {
    const { group, name, pickable, order } = options;
    const isEmptyLayer = checkEmptyLayer(layer);
    const cLayers = layers;
    const index = cLayers.findIndex((e) => e.name === name);
    if (index > -1) {
      cLayers.splice(index, 1, {
        layer,
        group,
        name,
        order,
        checked: exclusive || isEmptyLayer ? false : map?.hasLayer(layer),
        id: Util.stamp(layer),
        isEmpty: isEmptyLayer,
        pickable,
      });
    } else {
      cLayers.push({
        layer,
        group,
        name,
        order,
        checked: exclusive || isEmptyLayer ? false : map?.hasLayer(layer),
        id: Util.stamp(layer),
        isEmpty: isEmptyLayer,
        pickable,
      });
    }
    if (exclusive) {
      for (let i = 0; i < cLayers.length; i++) {
        if (
          cLayers[i].name === defaultLayer ||
          exclusiveSkipLayers.includes(cLayers[i].name)
        ) {
          cLayers[i].checked = true;
          continue;
        }
        if (map?.hasLayer(cLayers[i].layer)) {
          map.removeLayer(cLayers[i].layer);
        }
      }
    }
    setLayers(cLayers.sort((a, b) => (a.order > b.order ? 1 : -1)));
    if (onLayersAdd) onLayersAdd(layers);
  };

  const groupedLayers = lodashGroupBy(layers, 'group');

  useEffect(() => {
    if (ref?.current) {
      DomEvent.disableClickPropagation(ref.current);
    }
  }, []);
  return (
    <LayersControlProvider
      value={{
        layers,
        addGroup: onGroupAdd,
      }}
    >
      <div className={positionClass}>
        <div
          id="layer-control"
          className="leaflet-control leaflet-bar"
          ref={ref}
        >
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
                {groupedLayers[section]?.map((layerObj, index) => {
                  switch (layerObj.name) {
                    // case 'temperature':
                    //   const groupLayer = layerObj.layer as L.LayerGroup;
                    //   const subLayers = groupLayer.getLayers() as any;
                    //   return (
                    //     <Accordion
                    //       key={`${layerObj.name} ${index}`}
                    //       defaultExpanded={false}
                    //       style={{ marginTop: 0 }}
                    //     >
                    //       <AccordionSummary
                    //         expandIcon={<ExpandMoreIcon />}
                    //         aria-controls="panel1a-content"
                    //         id="panel1a-header"
                    //         style={{ height: 48, minHeight: 48 }}
                    //       >
                    //         <FormControlLabel
                    //           control={
                    //             <Checkbox
                    //               checked={layerObj.checked}
                    //               name="checkedB"
                    //               color="primary"
                    //             />
                    //           }
                    //           label={layerObj.name}
                    //           onClickCapture={(e) => {
                    //             DomEvent.stopPropagation(e as any);
                    //             onLayerClick(layerObj);
                    //           }}
                    //           onDoubleClickCapture={(e) => {
                    //             DomEvent.stopPropagation(e as any);
                    //           }}
                    //         />
                    //       </AccordionSummary>
                    //       <AccordionDetails style={{ paddingBottom: 4 }}>
                    //         <Slider style={{ marginLeft: 26 }}></Slider>
                    //       </AccordionDetails>
                    //       <AccordionDetails>
                    //         {}
                    //         <RadioGroup
                    //           defaultValue={
                    //             subLayers[subLayers.length - 1]._name
                    //           }
                    //           name="radio-buttons-group-metar"
                    //           style={{ paddingLeft: 26 }}
                    //           onChangeCapture={(e) => {
                    //             subLayers.map((sublayer) => {
                    //               if (sublayer._name === e.target.value) {
                    //                 map.addLayer(sublayer);
                    //               } else {
                    //                 map.removeLayer(sublayer);
                    //               }
                    //             });
                    //           }}
                    //         >
                    //           {subLayers.map((sublayer: any) => (
                    //             <FormControlLabel
                    //               value={sublayer._name}
                    //               control={<Radio color="primary" />}
                    //               label={sublayer._name}
                    //             />
                    //           ))}
                    //         </RadioGroup>
                    //       </AccordionDetails>
                    //     </Accordion>
                    //   );
                    case 'Metar':
                      return (
                        <Accordion
                          key={`${layerObj.name} ${index}`}
                          defaultExpanded={false}
                          style={{ marginTop: 0 }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            style={{ height: 48, minHeight: 48 }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={layerObj.checked}
                                  name="checkedB"
                                  color="primary"
                                />
                              }
                              label={layerObj.name}
                              onClickCapture={(e) => {
                                onLayerClick(layerObj);
                              }}
                            />
                          </AccordionSummary>
                          <AccordionDetails style={{ paddingBottom: 4 }}>
                            <Slider style={{ marginLeft: 26 }}></Slider>
                          </AccordionDetails>
                          <AccordionDetails>
                            <RadioGroup
                              defaultValue={layerStatus.markerType}
                              name="radio-buttons-group-metar"
                              style={{ paddingLeft: 26 }}
                              onChangeCapture={(
                                e: ChangeEvent<HTMLInputElement>,
                              ) => {
                                dispatch(
                                  setMetar({
                                    ...layerStatus,
                                    markerType: e.target.value,
                                  }),
                                );
                              }}
                            >
                              <FormControlLabel
                                value={MarkerTypes.flightCategory.value}
                                control={<Radio color="primary" />}
                                label={MarkerTypes.flightCategory.text}
                              />
                              <FormControlLabel
                                value={MarkerTypes.ceilingHeight.value}
                                control={<Radio color="primary" />}
                                label={MarkerTypes.ceilingHeight.text}
                              />
                              <FormControlLabel
                                value={MarkerTypes.surfaceVisibility.value}
                                control={<Radio color="primary" />}
                                label={MarkerTypes.surfaceVisibility.text}
                              />
                              <FormControlLabel
                                value={MarkerTypes.surfaceWindSpeed.value}
                                control={<Radio color="primary" />}
                                label={MarkerTypes.surfaceWindSpeed.text}
                              />
                              <FormControlLabel
                                value={MarkerTypes.surfaceWindGust.value}
                                control={<Radio color="primary" />}
                                label={MarkerTypes.surfaceWindGust.text}
                              />
                              <FormControlLabel
                                value={MarkerTypes.surfaceTemperature.value}
                                control={<Radio color="primary" />}
                                label={MarkerTypes.surfaceTemperature.text}
                              />
                              <FormControlLabel
                                value={MarkerTypes.surfaceDewpoint.value}
                                control={<Radio color="primary" />}
                                label={MarkerTypes.surfaceDewpoint.text}
                              />
                              <FormControlLabel
                                value={MarkerTypes.dewpointDepression.value}
                                control={<Radio color="primary" />}
                                label={MarkerTypes.dewpointDepression.text}
                              />
                              <FormControlLabel
                                value={MarkerTypes.weather.value}
                                control={<Radio color="primary" />}
                                label={MarkerTypes.weather.text}
                              />
                            </RadioGroup>
                          </AccordionDetails>
                        </Accordion>
                      );
                    default:
                      return (
                        <AccordionDetails key={`accDetails_${index}`}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={layerObj.checked}
                                name="checkedB"
                                color="primary"
                              />
                            }
                            label={layerObj.name}
                            onClickCapture={(e) => {
                              DomEvent.stopPropagation(e as any);
                              onLayerClick(layerObj);
                            }}
                            onDoubleClickCapture={(e) => {
                              DomEvent.stopPropagation(e as any);
                            }}
                          />
                        </AccordionDetails>
                      );
                  }
                })}
              </Accordion>
            ))}
        </div>
        {children}
      </div>
    </LayersControlProvider>
  );
};

const GroupedLayer = createControlledLayer(
  (layersControl, layer, options: OrderedLayerProps): any => {
    layersControl.addGroup(layer, options);
  },
);

export default LayerControl;
export { GroupedLayer };
