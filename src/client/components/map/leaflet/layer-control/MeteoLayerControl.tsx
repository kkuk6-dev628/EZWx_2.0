import React, {
  ChangeEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Radio, RadioGroup, Typography } from '@material-ui/core';
import { useMap, useMapEvents } from 'react-leaflet';
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
import {
  selectLayerControl,
  setPirep,
  setRadar,
  setSigmet,
  setMetar,
  LayerState,
  setLayerControl,
  LayerControlState,
  setGairmet,
  setCwa,
} from '../../../../store/layers/LayerControl';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { MetarMarkerTypes } from '../../common/AreoConstants';
import Image from 'next/image';
import Slider from '@mui/material/Slider';
import {
  MeteoLayersProvider,
  useMeteoLayersContext,
} from './MeteoLayerControlContext';

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

const MeteoLayerControl = ({
  position,
  collapsed,
  children,
  exclusive,
  defaultLayer,
  exclusiveSkipLayers,
  onLayersAdd,
}: IProps) => {
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

  const ref = useRef<HTMLDivElement>();
  const dispatch = useDispatch();
  const meteoLayers = useMeteoLayersContext();
  const layerStatus = useSelector(selectLayerControl);
  const [expand, setExpand] = useState(new Array(5).fill(false));

  const map = useMap();

  const checkEmptyLayer = (layer: Layer): boolean => {
    if (!layer) return false;
    return (
      typeof (layer as any).getLayers === 'function' &&
      (layer as LayerGroup).getLayers().length === 0
    );
  };

  const onLayerClick = (layerObj: Layer, layerState: LayerState) => {
    map.closePopup();
    if (!layerObj) return;
    if (checkEmptyLayer(layerObj)) {
      toast.error(`No ${layerState.name}'s data displayed`, {
        position: 'top-right',
      });
    } else {
      if (map?.hasLayer(layerObj)) {
        hideLayer(layerObj);
      } else {
        showLayer(layerObj);
      }
    }
  };

  const showLayer = (layerObj: Layer) => {
    if (!map?.hasLayer(layerObj)) {
      map.addLayer(layerObj);
    }
  };

  const hideLayer = (layerObj: Layer) => {
    if (map?.hasLayer(layerObj)) {
      map.removeLayer(layerObj);
    }
  };

  const getLayerControlStateWithAllClosed = (): LayerControlState => {
    const cloned = JSON.parse(JSON.stringify(layerStatus));
    cloned.metarState.expanded = false;
    cloned.sigmetState.expanded = false;
    cloned.gairmetState.expanded = false;
    cloned.pirepState.expanded = false;
    cloned.cwaState.expanded = false;
    return cloned;
  };

  useEffect(() => {
    if (ref?.current) {
      // DomEvent.disableClickPropagation(ref.current);
      // DomEvent.disableScrollPropagation(ref.current);
      // Disable dragging when user's cursor enters the element
      ref.current.addEventListener('mouseover', function () {
        map.dragging.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
      });
      // Re-enable dragging when user's cursor leaves the element
      ref.current.addEventListener('mouseout', function () {
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
      });
    }
  }, [ref?.current]);

  return (
    <div className={positionClass}>
      {!collapsed && (
        <div
          id="layer-control"
          className="leaflet-control leaflet-bar layer-control"
          ref={ref}
        >
          <div className="layer-control__header">
            <div className="layer-control__img__area">
              <Image
                src="/images/avater.png"
                alt="logo"
                width={60}
                height={60}
                className="layer-control__header__img"
              />
            </div>
            <div className="layer-control__rgt">
              <h3>Map Layers</h3>
            </div>
          </div>
          <div className="layer-control-contents">
            <div className="layer-control-item">
              <Accordion
                key={`metar-layer`}
                defaultExpanded={false}
                expanded={layerStatus.metarState.expanded}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState =
                        getLayerControlStateWithAllClosed();
                      clonedLayerControlState.metarState.expanded =
                        !layerStatus.metarState.expanded;
                      dispatch(setLayerControl(clonedLayerControlState));
                    },
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        style={{ pointerEvents: 'none' }}
                        checked={layerStatus.metarState.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setMetar({
                              ...layerStatus.metarState,
                              visible: !layerStatus.metarState.visible,
                            }),
                          );
                          onLayerClick(
                            meteoLayers.metar,
                            layerStatus.metarState,
                          );
                        }}
                      />
                    }
                    label={layerStatus.metarState.name}
                  />
                </AccordionSummary>
                <AccordionDetails>
                  <RadioGroup
                    defaultValue={layerStatus.metarState.markerType}
                    name="radio-buttons-group-metar"
                    onChangeCapture={(e: ChangeEvent<HTMLInputElement>) => {
                      map.closePopup();
                      dispatch(
                        setMetar({
                          ...layerStatus.metarState,
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
                      value={MetarMarkerTypes.surfaceVisibility.value}
                      control={<Radio color="primary" />}
                      label={MetarMarkerTypes.surfaceVisibility.text}
                    />
                    <FormControlLabel
                      value={MetarMarkerTypes.surfaceWindSpeed.value}
                      control={<Radio color="primary" />}
                      label={MetarMarkerTypes.surfaceWindSpeed.text}
                    />
                    <FormControlLabel
                      value={MetarMarkerTypes.surfaceWindBarbs.value}
                      control={<Radio color="primary" />}
                      label={MetarMarkerTypes.surfaceWindBarbs.text}
                      style={{ marginLeft: 6 }}
                    />
                    <FormControlLabel
                      value={MetarMarkerTypes.surfaceWindGust.value}
                      control={<Radio color="primary" />}
                      label={MetarMarkerTypes.surfaceWindGust.text}
                    />
                    <FormControlLabel
                      value={MetarMarkerTypes.surfaceTemperature.value}
                      control={<Radio color="primary" />}
                      label={MetarMarkerTypes.surfaceTemperature.text}
                    />
                    <FormControlLabel
                      value={MetarMarkerTypes.surfaceDewpoint.value}
                      control={<Radio color="primary" />}
                      label={MetarMarkerTypes.surfaceDewpoint.text}
                    />
                    <FormControlLabel
                      value={MetarMarkerTypes.dewpointDepression.value}
                      control={<Radio color="primary" />}
                      label={MetarMarkerTypes.dewpointDepression.text}
                    />
                    <FormControlLabel
                      value={MetarMarkerTypes.weather.value}
                      control={<Radio color="primary" />}
                      label={MetarMarkerTypes.weather.text}
                    />
                  </RadioGroup>
                </AccordionDetails>
              </Accordion>
            </div>
            <div
              className="layer-control-item"
              style={{ marginLeft: 12, paddingLeft: 4 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={layerStatus.radarState.visible}
                    icon={<CircleUnchecked />}
                    checkedIcon={<CircleCheckedFilled />}
                    name="checkedB"
                    color="primary"
                    onClick={(e) => {
                      dispatch(
                        setRadar({
                          ...layerStatus.radarState,
                          visible: !layerStatus.radarState.visible,
                        }),
                      );
                      onLayerClick(meteoLayers.radar, layerStatus.radarState);
                    }}
                  />
                }
                label={layerStatus.radarState.name}
              />
            </div>
            <div className="layer-control-item">
              <Accordion
                key={`sigmet-layer`}
                expanded={layerStatus.sigmetState.expanded}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState =
                        getLayerControlStateWithAllClosed();
                      clonedLayerControlState.sigmetState.expanded =
                        !layerStatus.sigmetState.expanded;
                      dispatch(setLayerControl(clonedLayerControlState));
                    },
                  }}
                >
                  <FormControlLabel
                    label={layerStatus.sigmetState.name}
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.visible}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          // e.stopPropagation();
                          dispatch(
                            setSigmet({
                              ...layerStatus.sigmetState,
                              visible: !layerStatus.sigmetState.visible,
                            }),
                          );
                          if (checkEmptyLayer(meteoLayers.intlSigmet)) {
                            onLayerClick(
                              meteoLayers.intlSigmet,
                              layerStatus.sigmetState.international as any,
                            );
                          } else {
                            if (!checkEmptyLayer(meteoLayers.sigmet)) {
                              onLayerClick(
                                meteoLayers.sigmet,
                                layerStatus.sigmetState,
                              );
                            }
                            onLayerClick(
                              meteoLayers.intlSigmet,
                              layerStatus.sigmetState.international as any,
                            );
                          }
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.all.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.sigmetState,
                              all: {
                                name: layerStatus.sigmetState.all.name,
                                visible: !layerStatus.sigmetState.all.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.sigmet,
                            layerStatus.sigmetState.all as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.all.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.convection.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          const cloned = {
                            ...layerStatus.sigmetState,
                            convection: {
                              name: layerStatus.sigmetState.convection.name,
                              visible:
                                !layerStatus.sigmetState.convection.visible,
                            },
                          };
                          if (!cloned.convection.visible) {
                            cloned.all = {
                              ...cloned.all,
                              visible: false,
                            };
                          }
                          dispatch(setSigmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.convection.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.outlooks.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          const cloned = {
                            ...layerStatus.sigmetState,
                            outlooks: {
                              name: layerStatus.sigmetState.outlooks.name,
                              visible:
                                !layerStatus.sigmetState.outlooks.visible,
                            },
                          };
                          if (!cloned.outlooks.visible) {
                            cloned.all = {
                              ...cloned.all,
                              visible: false,
                            };
                          }
                          dispatch(setSigmet(cloned));
                          onLayerClick(
                            meteoLayers.outlooks,
                            layerStatus.sigmetState.outlooks as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.outlooks.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.turbulence.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          const cloned = {
                            ...layerStatus.sigmetState,
                            turbulence: {
                              name: layerStatus.sigmetState.turbulence.name,
                              visible:
                                !layerStatus.sigmetState.turbulence.visible,
                            },
                          };
                          if (!cloned.turbulence.visible) {
                            cloned.all = {
                              ...cloned.all,
                              visible: false,
                            };
                          }
                          dispatch(setSigmet(cloned));
                          // onLayerClick(
                          //   null,
                          //   layerStatus.sigmetState.turbulence as any,
                          // );
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.turbulence.name}
                  />{' '}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.airframeIcing.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.sigmetState,
                              airframeIcing: {
                                name: layerStatus.sigmetState.airframeIcing
                                  .name,
                                visible:
                                  !layerStatus.sigmetState.airframeIcing
                                    .visible,
                              },
                            }),
                          );
                          // onLayerClick(
                          //   null,
                          //   layerStatus.sigmetState.airframeIcing as any,
                          // );
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.airframeIcing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.dust.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.sigmetState,
                              dust: {
                                name: layerStatus.sigmetState.dust.name,
                                visible: !layerStatus.sigmetState.dust.visible,
                              },
                            }),
                          );
                          // onLayerClick(
                          //   null,
                          //   layerStatus.sigmetState.dust as any,
                          // );
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.dust.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.ash.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.sigmetState,
                              ash: {
                                name: layerStatus.sigmetState.ash.name,
                                visible: !layerStatus.sigmetState.ash.visible,
                              },
                            }),
                          );
                          // onLayerClick(
                          //   null,
                          //   layerStatus.sigmetState.ash as any,
                          // );
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.ash.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.other.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.sigmetState,
                              other: {
                                name: layerStatus.sigmetState.other.name,
                                visible: !layerStatus.sigmetState.other.visible,
                              },
                            }),
                          );
                          // onLayerClick(
                          //   null,
                          //   layerStatus.sigmetState.other as any,
                          // );
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.other.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.international.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.sigmetState,
                              international: {
                                name: layerStatus.sigmetState.international
                                  .name,
                                visible:
                                  !layerStatus.sigmetState.international
                                    .visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.intlSigmet,
                            layerStatus.sigmetState.international as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.international.name}
                  />
                </AccordionDetails>
              </Accordion>
            </div>
            <div className="layer-control-item">
              <Accordion
                key={`gairmet-layer`}
                expanded={layerStatus.gairmetState.expanded}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState =
                        getLayerControlStateWithAllClosed();
                      clonedLayerControlState.gairmetState.expanded =
                        !layerStatus.gairmetState.expanded;
                      dispatch(setLayerControl(clonedLayerControlState));
                    },
                  }}
                >
                  <FormControlLabel
                    label={layerStatus.gairmetState.name}
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.visible}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          // e.stopPropagation();
                          dispatch(
                            setGairmet({
                              ...layerStatus.gairmetState,
                              visible: !layerStatus.gairmetState.visible,
                            }),
                          );
                          onLayerClick(
                            meteoLayers.gairmet,
                            layerStatus.gairmetState,
                          );
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.airframeIcing.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.gairmetState,
                              airframeIcing: {
                                name: layerStatus.gairmetState.airframeIcing
                                  .name,
                                visible:
                                  !layerStatus.gairmetState.airframeIcing
                                    .visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.gairmet,
                            layerStatus.gairmetState.airframeIcing as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.airframeIcing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          layerStatus.gairmetState.multiFrzLevels.visible
                        }
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.gairmetState,
                              multiFrzLevels: {
                                name: layerStatus.gairmetState.multiFrzLevels
                                  .name,
                                visible:
                                  !layerStatus.gairmetState.multiFrzLevels
                                    .visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.gairmet,
                            layerStatus.gairmetState.multiFrzLevels as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.multiFrzLevels.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.turbulenceHi.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.gairmetState,
                              turbulenceHi: {
                                name: layerStatus.gairmetState.turbulenceHi
                                  .name,
                                visible:
                                  !layerStatus.gairmetState.turbulenceHi
                                    .visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.gairmet,
                            layerStatus.gairmetState.turbulenceHi as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.turbulenceHi.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.turbulenceLow.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.gairmetState,
                              turbulenceLow: {
                                name: layerStatus.gairmetState.turbulenceLow
                                  .name,
                                visible:
                                  !layerStatus.gairmetState.turbulenceLow
                                    .visible,
                              },
                            }),
                          );
                          onLayerClick(
                            null,
                            layerStatus.gairmetState.turbulenceLow as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.turbulenceLow.name}
                  />{' '}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.ifrConditions.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.gairmetState,
                              ifrConditions: {
                                name: layerStatus.gairmetState.ifrConditions
                                  .name,
                                visible:
                                  !layerStatus.gairmetState.ifrConditions
                                    .visible,
                              },
                            }),
                          );
                          onLayerClick(
                            null,
                            layerStatus.gairmetState.ifrConditions as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.ifrConditions.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          layerStatus.gairmetState.mountainObscuration.visible
                        }
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.gairmetState,
                              mountainObscuration: {
                                name: layerStatus.gairmetState
                                  .mountainObscuration.name,
                                visible:
                                  !layerStatus.gairmetState.mountainObscuration
                                    .visible,
                              },
                            }),
                          );
                          onLayerClick(
                            null,
                            layerStatus.gairmetState.mountainObscuration as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.mountainObscuration.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          layerStatus.gairmetState.nonconvectiveLlws.visible
                        }
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.gairmetState,
                              nonconvectiveLlws: {
                                name: layerStatus.gairmetState.nonconvectiveLlws
                                  .name,
                                visible:
                                  !layerStatus.gairmetState.nonconvectiveLlws
                                    .visible,
                              },
                            }),
                          );
                          onLayerClick(
                            null,
                            layerStatus.gairmetState.nonconvectiveLlws as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.nonconvectiveLlws.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.sfcWinds.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.gairmetState,
                              sfcWinds: {
                                name: layerStatus.gairmetState.sfcWinds.name,
                                visible:
                                  !layerStatus.gairmetState.sfcWinds.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            null,
                            layerStatus.gairmetState.sfcWinds as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.sfcWinds.name}
                  />
                </AccordionDetails>
              </Accordion>
            </div>
            <div className="layer-control-item">
              <Accordion
                key={`pirep-layer`}
                expanded={layerStatus.pirepState.expanded}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState =
                        getLayerControlStateWithAllClosed();
                      clonedLayerControlState.pirepState.expanded =
                        !layerStatus.pirepState.expanded;
                      dispatch(setLayerControl(clonedLayerControlState));
                    },
                  }}
                >
                  <FormControlLabel
                    label={layerStatus.pirepState.name}
                    control={
                      <Checkbox
                        checked={layerStatus.pirepState.visible}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          // e.stopPropagation();
                          dispatch(
                            setPirep({
                              ...layerStatus.pirepState,
                              visible: !layerStatus.pirepState.visible,
                            }),
                          );
                          onLayerClick(
                            meteoLayers.pirep,
                            layerStatus.pirepState,
                          );
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.pirepState.urgentOnly.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.pirepState,
                              urgentOnly: {
                                name: layerStatus.pirepState.urgentOnly.name,
                                visible:
                                  !layerStatus.pirepState.urgentOnly.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.pirep,
                            layerStatus.pirepState.urgentOnly as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.pirepState.urgentOnly.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.pirepState.all.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.pirepState,
                              all: {
                                name: layerStatus.pirepState.all.name,
                                visible: !layerStatus.pirepState.all.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.pirep,
                            layerStatus.pirepState.all as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.pirepState.all.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.pirepState.icing.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.pirepState,
                              icing: {
                                name: layerStatus.pirepState.icing.name,
                                visible: !layerStatus.pirepState.icing.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.gairmet,
                            layerStatus.pirepState.icing as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.pirepState.icing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.pirepState.turbulence.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.pirepState,
                              turbulence: {
                                name: layerStatus.pirepState.turbulence.name,
                                visible:
                                  !layerStatus.pirepState.turbulence.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            null,
                            layerStatus.pirepState.turbulence as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.pirepState.turbulence.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.pirepState.weatherSky.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.pirepState,
                              weatherSky: {
                                name: layerStatus.pirepState.weatherSky.name,
                                visible:
                                  !layerStatus.pirepState.weatherSky.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            null,
                            layerStatus.pirepState.weatherSky as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.pirepState.weatherSky.name}
                  />
                  <div className="pirep-slider">
                    <div className="title">
                      <div className="label">
                        {layerStatus.pirepState.altitude.name}
                      </div>
                      <div className="all-check">
                        <FormControlLabel
                          control={
                            <Checkbox
                              icon={<CircleUnchecked />}
                              checkedIcon={<CircleCheckedFilled />}
                              name="checkedB"
                              color="primary"
                              onChange={(e) => {
                                dispatch(
                                  setPirep({
                                    ...layerStatus.pirepState,
                                    altitude: {
                                      ...layerStatus.pirepState.altitude,
                                      valueMin:
                                        layerStatus.pirepState.altitude.min,
                                      valueMax:
                                        layerStatus.pirepState.altitude.max,
                                    },
                                  }),
                                );
                              }}
                            />
                          }
                          label="All"
                        />
                      </div>
                    </div>
                    <div className="slider">
                      <Slider
                        getAriaLabel={() => 'Altitude range'}
                        min={layerStatus.pirepState.altitude.min}
                        max={layerStatus.pirepState.altitude.max}
                        step={20}
                        value={[
                          layerStatus.pirepState.altitude.valueMin,
                          layerStatus.pirepState.altitude.valueMax,
                        ]}
                        onChange={(e: Event, newValues: number[]) => {
                          dispatch(
                            setPirep({
                              ...layerStatus.pirepState,
                              altitude: {
                                ...layerStatus.pirepState.altitude,
                                valueMin: newValues[0],
                                valueMax: newValues[1],
                              },
                            }),
                          );
                        }}
                        valueLabelDisplay="on"
                      />
                    </div>
                  </div>
                  <div className="pirep-slider">
                    <div className="title">
                      <div className="label">
                        {layerStatus.pirepState.time.name}
                      </div>
                      <div className="all-check">
                        <FormControlLabel
                          control={
                            <Checkbox
                              icon={<CircleUnchecked />}
                              checkedIcon={<CircleCheckedFilled />}
                              name="checkedB"
                              color="primary"
                              onChange={(e) => {
                                dispatch(
                                  setPirep({
                                    ...layerStatus.pirepState,
                                    time: {
                                      ...layerStatus.pirepState.time,
                                      hours: layerStatus.pirepState.time.max,
                                    },
                                  }),
                                );
                              }}
                            />
                          }
                          label="All"
                        />
                      </div>
                    </div>
                    <div className="slider">
                      <Slider
                        getAriaLabel={() => 'Time'}
                        min={0}
                        step={1}
                        defaultValue={layerStatus.pirepState.time.hours}
                        max={layerStatus.pirepState.time.max}
                        onChange={(e: Event, newValue: number) => {
                          // dispatch(
                          //   setPirep({
                          //     ...layerStatus.pirepState,
                          //     time: {
                          //       ...layerStatus.pirepState.time,
                          //       hours: newValue,
                          //     },
                          //   }),
                          // );
                        }}
                        valueLabelDisplay="on"
                      />
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
            <div className="layer-control-item">
              <Accordion
                key={`cwa-layer`}
                expanded={layerStatus.cwaState.expanded}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState =
                        getLayerControlStateWithAllClosed();
                      clonedLayerControlState.cwaState.expanded =
                        !layerStatus.cwaState.expanded;
                      dispatch(setLayerControl(clonedLayerControlState));
                    },
                  }}
                >
                  <FormControlLabel
                    label={layerStatus.cwaState.name}
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.visible}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          // e.stopPropagation();
                          dispatch(
                            setCwa({
                              ...layerStatus.cwaState,
                              visible: !layerStatus.cwaState.visible,
                            }),
                          );
                          onLayerClick(meteoLayers.cwa, layerStatus.cwaState);
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.all.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.cwaState,
                              all: {
                                name: layerStatus.cwaState.all.name,
                                visible: !layerStatus.cwaState.all.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.cwa,
                            layerStatus.cwaState.all as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.cwaState.all.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.airframeIcing.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.cwaState,
                              airframeIcing: {
                                name: layerStatus.cwaState.airframeIcing.name,
                                visible:
                                  !layerStatus.cwaState.airframeIcing.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.cwa,
                            layerStatus.cwaState.airframeIcing as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.cwaState.airframeIcing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.turbulence.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.cwaState,
                              icing: {
                                turbulence:
                                  layerStatus.cwaState.turbulence.name,
                                visible:
                                  !layerStatus.cwaState.turbulence.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.cwa,
                            layerStatus.cwaState.turbulence as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.cwaState.turbulence.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.ifrConditions.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.cwaState,
                              ifrConditions: {
                                name: layerStatus.cwaState.ifrConditions.name,
                                visible:
                                  !layerStatus.cwaState.ifrConditions.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            null,
                            layerStatus.cwaState.ifrConditions as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.cwaState.ifrConditions.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.convection.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.cwaState,
                              convection: {
                                name: layerStatus.cwaState.convection.name,
                                visible:
                                  !layerStatus.cwaState.convection.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            null,
                            layerStatus.cwaState.convection as any,
                          );
                        }}
                      />
                    }
                    label={layerStatus.cwaState.convection.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.other.visible}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(e) => {
                          dispatch(
                            setSigmet({
                              ...layerStatus.cwaState,
                              other: {
                                name: layerStatus.cwaState.other.name,
                                visible: !layerStatus.cwaState.other.visible,
                              },
                            }),
                          );
                          onLayerClick(null, layerStatus.cwaState.other as any);
                        }}
                      />
                    }
                    label={layerStatus.cwaState.other.name}
                  />
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
const GroupedLayer = createControlledLayer(
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  (layersControl, layer, options: OrderedLayerProps): any => {},
);
export { GroupedLayer };

export default MeteoLayerControl;
