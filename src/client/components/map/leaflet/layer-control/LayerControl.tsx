import React, {
  ChangeEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Radio, RadioGroup, Typography } from '@material-ui/core';
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
import CircleCheckedFilled from '@material-ui/icons/CheckCircle';
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';
import createControlledLayer, { OrderedLayerProps } from './controlledLayer';
import { selectMetar, setMetar } from '../../../../store/layers/LayerControl';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { MetarMarkerTypes } from '../../common/AreoConstants';
import Image from 'next/image';
import Slider from '@mui/material/Slider';

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

export interface ILayerObj {
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
    map.closePopup();
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
  };

  const groupedLayers = lodashGroupBy(layers, 'group');

  useEffect(() => {
    if (ref?.current) {
      DomEvent.disableClickPropagation(ref.current);
    }
  }, []);

  useEffect(() => {
    if (onLayersAdd) onLayersAdd(layers);
  }, [layers]);
  return (
    <LayersControlProvider
      value={{
        layers,
        addGroup: onGroupAdd,
      }}
    >
      {!collapsed && (
        <div className={positionClass}>
          <div
            id="base-layer-control"
            className="leaflet-control leaflet-bar leaycnt"
            ref={ref}
          >
            <div className="leaycnt__header">
              <div className="leaycnt__img__area">
                <Image
                  src="/images/avater.png"
                  alt="logo"
                  width={60}
                  height={60}
                  className="leaycnt__header__img"
                />
              </div>
              <div className="leaycnt__rgt">
                <h3>Map Layers</h3>
              </div>
            </div>
            {Object.keys(groupedLayers).map((section, index) => (
              <div key={index} className="">
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
                      case 'Station Markers':
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
                                    icon={<CircleUnchecked />}
                                    checkedIcon={<CircleCheckedFilled />}
                                    name="checkedB"
                                    color="primary"
                                    onClick={() => {
                                      dispatch(
                                        setMetar({
                                          ...layerStatus,
                                          visible: !layerStatus.visible,
                                        }),
                                      );
                                    }}
                                  />
                                }
                                label={layerObj.name}
                                onClickCapture={(e) => {
                                  onLayerClick(layerObj);
                                }}
                              />
                            </AccordionSummary>
                            <AccordionDetails style={{ paddingBottom: 4 }}>
                              {/* <Slider
                                key="metar-opacity"
                                style={{ marginLeft: 26 }}
                                min={0}
                                max={1}
                                step={0.1}
                                value={0.7}
                                size="small"
                                defaultValue={0.7}
                                aria-label="Opacity"
                                valueLabelDisplay="auto"
                              ></Slider> */}
                            </AccordionDetails>
                            <AccordionDetails>
                              <RadioGroup
                                defaultValue={layerStatus.markerType}
                                name="radio-buttons-group-metar"
                                style={{ paddingLeft: 26 }}
                                onChangeCapture={(
                                  e: ChangeEvent<HTMLInputElement>,
                                ) => {
                                  map.closePopup();
                                  dispatch(
                                    setMetar({
                                      ...layerStatus,
                                      markerType: e.target.value,
                                    }),
                                  );
                                }}
                              >
                                <FormControlLabel
                                  value={MetarMarkerTypes.flightCategory.value}
                                  control={<Radio color="primary" />}
                                  label={MetarMarkerTypes.flightCategory.text}
                                />
                                <FormControlLabel
                                  value={MetarMarkerTypes.ceilingHeight.value}
                                  control={<Radio color="primary" />}
                                  label={MetarMarkerTypes.ceilingHeight.text}
                                />
                                <FormControlLabel
                                  value={
                                    MetarMarkerTypes.surfaceVisibility.value
                                  }
                                  control={<Radio color="primary" />}
                                  label={
                                    MetarMarkerTypes.surfaceVisibility.text
                                  }
                                />
                                <FormControlLabel
                                  value={
                                    MetarMarkerTypes.surfaceWindSpeed.value
                                  }
                                  control={<Radio color="primary" />}
                                  label={MetarMarkerTypes.surfaceWindSpeed.text}
                                />
                                <FormControlLabel
                                  value={
                                    MetarMarkerTypes.surfaceWindBarbs.value
                                  }
                                  control={<Radio color="primary" />}
                                  label={MetarMarkerTypes.surfaceWindBarbs.text}
                                />
                                <FormControlLabel
                                  value={MetarMarkerTypes.surfaceWindGust.value}
                                  control={<Radio color="primary" />}
                                  label={MetarMarkerTypes.surfaceWindGust.text}
                                />
                                <FormControlLabel
                                  value={
                                    MetarMarkerTypes.surfaceTemperature.value
                                  }
                                  control={<Radio color="primary" />}
                                  label={
                                    MetarMarkerTypes.surfaceTemperature.text
                                  }
                                />
                                <FormControlLabel
                                  value={MetarMarkerTypes.surfaceDewpoint.value}
                                  control={<Radio color="primary" />}
                                  label={MetarMarkerTypes.surfaceDewpoint.text}
                                />
                                <FormControlLabel
                                  value={
                                    MetarMarkerTypes.dewpointDepression.value
                                  }
                                  control={<Radio color="primary" />}
                                  label={
                                    MetarMarkerTypes.dewpointDepression.text
                                  }
                                />
                                <FormControlLabel
                                  value={MetarMarkerTypes.weather.value}
                                  control={<Radio color="primary" />}
                                  label={MetarMarkerTypes.weather.text}
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
                                  icon={<CircleUnchecked />}
                                  checkedIcon={<CircleCheckedFilled />}
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
              </div>
            ))}
          </div>
        </div>
      )}
      {children}
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
