/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
  ChangeEvent,
  ReactElement,
  useEffect,
  useRef,
  createContext,
  useContext,
} from 'react';
import { Radio, RadioGroup } from '@material-ui/core';
import { useMap } from 'react-leaflet';
import { Layer, DomEvent, LayerGroup } from 'leaflet';
import Accordion from '@material-ui/core/Accordion';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import toast from 'react-hot-toast';
import CircleCheckedFilled from '@material-ui/icons/CheckCircle';
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';
import createControlledLayer, { OrderedLayerProps } from './controlledLayer';
import {
  selectLayerControl,
  setPirep,
  setRadar,
  setSigmet,
  setMetar,
  setLayerControl,
  LayerControlState,
  setGairmet,
  setCwa,
  GairmetLayerState,
  PirepLayerState,
  CwaLayerState,
  MetarLayerState,
} from '../../../../store/layers/LayerControl';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { MetarMarkerTypes } from '../../common/AreoConstants';
import Image from 'next/image';
import Slider from '@mui/material/Slider';
import { useMeteoLayersContext } from './MeteoLayerControlContext';
import { jsonClone } from '../../../utils/ObjectUtil';

const POSITION_CLASSES: { [key: string]: string } = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
};

interface IProps {
  children?: ReactElement[];
  position: string;
  collapsed: boolean;
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

export const InLayerControl = createContext<{ value: boolean }>({
  value: false,
});

const MeteoLayerControl = ({ position, collapsed, children }: IProps) => {
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

  const ref = useRef<HTMLDivElement>();
  const dispatch = useDispatch();
  const meteoLayers = useMeteoLayersContext();
  const layerStatus = useSelector(selectLayerControl);

  const map = useMap();

  const checkEmptyLayer = (layer: Layer): boolean => {
    if (!layer) return false;
    return (
      typeof (layer as any).getLayers === 'function' &&
      (layer as LayerGroup).getLayers().length === 0
    );
  };

  // const onLayerClick = (layerObj: Layer, layerState: LayerState) => {
  //   map.closePopup();
  //   if (!layerObj) return;
  //   if (checkEmptyLayer(layerObj)) {
  //     toast.error(`No ${layerState.name}'s data displayed`, {
  //       position: 'top-right',
  //     });
  //   } else {
  //     if (map?.hasLayer(layerObj)) {
  //       hideLayer(layerObj);
  //     } else {
  //       showLayer(layerObj);
  //     }
  //   }
  // };

  const showLayer = (layerObj: Layer, layerName: string) => {
    map.closePopup();
    if (!layerObj) return;
    if (checkEmptyLayer(layerObj)) {
      toast.error(`No ${layerName}'s data displayed`, {
        position: 'top-right',
      });
    } else {
      if (!map?.hasLayer(layerObj)) {
        map.addLayer(layerObj);
      }
    }
  };

  const hideLayer = (layerObj: Layer, layerName: string) => {
    map.closePopup();
    if (!layerObj) return;
    if (checkEmptyLayer(layerObj)) {
      toast.error(`No ${layerName}'s data displayed`, {
        position: 'top-right',
      });
    } else {
      if (map?.hasLayer(layerObj)) {
        map.removeLayer(layerObj);
      }
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

  const inLayerControl = useContext(InLayerControl);

  useEffect(() => {
    if (ref?.current) {
      // DomEvent.disableClickPropagation(ref.current);
      DomEvent.disableScrollPropagation(ref.current);
      // Disable dragging when user's cursor enters the element
      ref.current.addEventListener('mouseover', function () {
        map.dragging.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.touchZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        if (map.tap) map.tap.disable();
        inLayerControl.value = true;
      });
      // Re-enable dragging when user's cursor leaves the element
      ref.current.addEventListener('mouseout', function () {
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.touchZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        if (map.tap) map.tap.enable();
        inLayerControl.value = false;
      });
    }
  }, [ref?.current]);

  return (
    //@ts-ignore
    <div className={positionClass + ' layer-control-container'} ref={ref}>
      {!collapsed && (
        <div
          id="layer-control"
          className="leaflet-control leaflet-bar layer-control"
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
                        checked={layerStatus.metarState.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.metarState);
                          cloned.checked = !layerStatus.metarState.checked;
                          dispatch(setMetar(cloned));
                          cloned.checked
                            ? showLayer(
                                meteoLayers.metar,
                                layerStatus.metarState.name,
                              )
                            : hideLayer(
                                meteoLayers.metar,
                                layerStatus.metarState.name,
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
                      const cloned = jsonClone(
                        layerStatus.metarState,
                      ) as MetarLayerState;
                      cloned.markerType = e.target.value;
                      cloned.checked = true;
                      dispatch(setMetar(cloned));
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
                    checked={layerStatus.radarState.checked}
                    icon={<CircleUnchecked />}
                    checkedIcon={<CircleCheckedFilled />}
                    name="checkedB"
                    color="primary"
                    onClick={(_e) => {
                      dispatch(
                        setRadar({
                          ...layerStatus.radarState,
                          checked: !layerStatus.radarState.checked,
                        }),
                      );
                      layerStatus.radarState.checked
                        ? showLayer(
                            meteoLayers.radar,
                            layerStatus.radarState.name,
                          )
                        : hideLayer(
                            meteoLayers.radar,
                            layerStatus.radarState.name,
                          );
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
                        checked={layerStatus.sigmetState.checked}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={() => {
                          // e.stopPropagation();
                          const cloned = jsonClone(layerStatus.sigmetState);
                          cloned.checked = !layerStatus.sigmetState.checked;
                          dispatch(setSigmet(cloned));
                          if (cloned.checked) {
                            showLayer(
                              meteoLayers.sigmet,
                              layerStatus.sigmetState.name,
                            );
                            if (layerStatus.sigmetState.outlooks.checked) {
                              showLayer(
                                meteoLayers.outlooks,
                                layerStatus.sigmetState.outlooks.name,
                              );
                            }
                            if (layerStatus.sigmetState.international.checked) {
                              showLayer(
                                meteoLayers.intlSigmet,
                                layerStatus.sigmetState.international.name,
                              );
                            }
                          } else {
                            hideLayer(
                              meteoLayers.sigmet,
                              layerStatus.sigmetState.name,
                            );
                            hideLayer(
                              meteoLayers.outlooks,
                              layerStatus.sigmetState.outlooks.name,
                            );
                            hideLayer(
                              meteoLayers.intlSigmet,
                              layerStatus.sigmetState.international.name,
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
                        checked={layerStatus.sigmetState.all.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={() => {
                          const cloned = jsonClone(layerStatus.sigmetState);
                          if (layerStatus.sigmetState.all.checked) {
                            cloned.all.checked = false;
                          } else {
                            cloned.all.checked = true;
                            cloned.convection.checked = true;
                            cloned.outlooks.checked = true;
                            cloned.turbulence.checked = true;
                            cloned.airframeIcing.checked = true;
                            cloned.dust.checked = true;
                            cloned.ash.checked = true;
                            cloned.other.checked = true;
                            cloned.international.checked = true;
                            showLayer(
                              meteoLayers.sigmet,
                              layerStatus.sigmetState.name,
                            );
                            showLayer(
                              meteoLayers.outlooks,
                              layerStatus.sigmetState.outlooks.name,
                            );
                            showLayer(
                              meteoLayers.intlSigmet,
                              layerStatus.sigmetState.international.name,
                            );
                          }
                          dispatch(setSigmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.all.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.convection.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={() => {
                          const cloned = jsonClone(layerStatus.sigmetState);
                          cloned.convection.checked =
                            !layerStatus.sigmetState.convection.checked;
                          if (!cloned.convection.checked) {
                            cloned.all.checked = false;
                          } else {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
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
                        checked={layerStatus.sigmetState.outlooks.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.sigmetState);
                          cloned.outlooks.checked =
                            !layerStatus.sigmetState.outlooks.checked;
                          if (!cloned.outlooks.checked) {
                            cloned.all.checked = false;
                            hideLayer(
                              meteoLayers.outlooks,
                              layerStatus.sigmetState.outlooks.name,
                            );
                          } else {
                            cloned.checked = true;
                            showLayer(
                              meteoLayers.outlooks,
                              layerStatus.sigmetState.outlooks.name,
                            );
                          }
                          dispatch(setSigmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.outlooks.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.turbulence.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.sigmetState);
                          cloned.turbulence.checked =
                            !layerStatus.sigmetState.turbulence.checked;
                          if (!cloned.turbulence.checked) {
                            cloned.all.checked = false;
                          } else {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
                          }
                          dispatch(setSigmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.turbulence.name}
                  />{' '}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.airframeIcing.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.sigmetState);
                          cloned.airframeIcing.checked =
                            !layerStatus.sigmetState.airframeIcing.checked;
                          if (!cloned.airframeIcing.checked) {
                            cloned.all.checked = false;
                          } else {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
                          }
                          dispatch(setSigmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.airframeIcing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.dust.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.sigmetState);
                          cloned.dust.checked =
                            !layerStatus.sigmetState.dust.checked;
                          if (!cloned.dust.checked) {
                            cloned.all.checked = false;
                          } else {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
                          }
                          dispatch(setSigmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.dust.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.ash.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.sigmetState);
                          cloned.ash.checked =
                            !layerStatus.sigmetState.ash.checked;
                          if (!cloned.ash.checked) {
                            cloned.all.checked = false;
                          } else {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
                          }
                          dispatch(setSigmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.ash.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.other.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.sigmetState);
                          cloned.other.checked =
                            !layerStatus.sigmetState.other.checked;
                          if (!cloned.other.checked) {
                            cloned.all.checked = false;
                          } else {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
                          }
                          dispatch(setSigmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.sigmetState.other.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.sigmetState.international.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.sigmetState);
                          cloned.international.checked =
                            !layerStatus.sigmetState.international.checked;
                          if (!cloned.international.checked) {
                            cloned.all.checked = false;
                            hideLayer(
                              meteoLayers.intlSigmet,
                              layerStatus.sigmetState.international.name,
                            );
                          } else {
                            cloned.checked = true;
                            showLayer(
                              meteoLayers.intlSigmet,
                              layerStatus.sigmetState.international.name,
                            );
                          }
                          dispatch(setSigmet(cloned));
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
                        checked={layerStatus.gairmetState.checked}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.checked = !layerStatus.gairmetState.checked;
                          dispatch(setGairmet(cloned));
                          cloned.checked
                            ? showLayer(
                                meteoLayers.gairmet,
                                layerStatus.gairmetState.name,
                              )
                            : hideLayer(
                                meteoLayers.gairmet,
                                layerStatus.gairmetState.name,
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
                        checked={layerStatus.gairmetState.all.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={() => {
                          const cloned = jsonClone(
                            layerStatus.gairmetState,
                          ) as GairmetLayerState;
                          if (layerStatus.gairmetState.all.checked) {
                            cloned.all.checked = false;
                          } else {
                            cloned.all.checked = true;
                            cloned.airframeIcing.checked = true;
                            cloned.multiFrzLevels.checked = true;
                            cloned.turbulenceHi.checked = true;
                            cloned.turbulenceLow.checked = true;
                            cloned.ifrConditions.checked = true;
                            cloned.mountainObscuration.checked = true;
                            cloned.nonconvectiveLlws.checked = true;
                            cloned.sfcWinds.checked = true;
                            showLayer(
                              meteoLayers.gairmet,
                              layerStatus.gairmetState.name,
                            );
                          }
                          dispatch(setGairmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.all.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.airframeIcing.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.airframeIcing.checked =
                            !layerStatus.gairmetState.airframeIcing.checked;
                          if (cloned.airframeIcing.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setGairmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.airframeIcing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          layerStatus.gairmetState.multiFrzLevels.checked
                        }
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.multiFrzLevels.checked =
                            !layerStatus.gairmetState.multiFrzLevels.checked;
                          if (cloned.multiFrzLevels.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setGairmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.multiFrzLevels.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.turbulenceHi.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.turbulenceHi.checked =
                            !layerStatus.gairmetState.turbulenceHi.checked;
                          if (cloned.turbulenceHi.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setGairmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.turbulenceHi.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.turbulenceLow.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.turbulenceLow.checked =
                            !layerStatus.gairmetState.turbulenceLow.checked;
                          if (cloned.turbulenceLow.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setGairmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.turbulenceLow.name}
                  />{' '}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.ifrConditions.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.ifrConditions.checked =
                            !layerStatus.gairmetState.ifrConditions.checked;
                          if (cloned.ifrConditions.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setGairmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.ifrConditions.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          layerStatus.gairmetState.mountainObscuration.checked
                        }
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.mountainObscuration.checked =
                            !layerStatus.gairmetState.mountainObscuration
                              .checked;
                          if (cloned.mountainObscuration.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setGairmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.mountainObscuration.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          layerStatus.gairmetState.nonconvectiveLlws.checked
                        }
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.nonconvectiveLlws.checked =
                            !layerStatus.gairmetState.nonconvectiveLlws.checked;
                          if (cloned.nonconvectiveLlws.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setGairmet(cloned));
                        }}
                      />
                    }
                    label={layerStatus.gairmetState.nonconvectiveLlws.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.sfcWinds.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.sfcWinds.checked =
                            !layerStatus.gairmetState.sfcWinds.checked;
                          if (cloned.sfcWinds.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setGairmet(cloned));
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
                        checked={layerStatus.pirepState.checked}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.pirepState);
                          cloned.checked = !layerStatus.pirepState.checked;
                          dispatch(setPirep(cloned));
                          cloned.checked
                            ? showLayer(
                                meteoLayers.pirep,
                                layerStatus.pirepState.name,
                              )
                            : hideLayer(
                                meteoLayers.pirep,
                                layerStatus.pirepState.name,
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
                        checked={layerStatus.pirepState.urgentOnly.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.pirepState);
                          cloned.urgentOnly.checked =
                            !layerStatus.pirepState.urgentOnly.checked;
                          if (cloned.urgentOnly.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
                          }
                          dispatch(setPirep(cloned));
                        }}
                      />
                    }
                    label={layerStatus.pirepState.urgentOnly.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.pirepState.all.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(
                            layerStatus.pirepState,
                          ) as PirepLayerState;
                          cloned.all.checked =
                            !layerStatus.pirepState.all.checked;
                          if (cloned.all.checked) {
                            cloned.checked = true;
                            cloned.icing.checked = true;
                            cloned.turbulence.checked = true;
                            cloned.weatherSky.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setPirep(cloned));
                        }}
                      />
                    }
                    label={layerStatus.pirepState.all.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.pirepState.icing.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.pirepState);
                          cloned.icing.checked =
                            !layerStatus.pirepState.icing.checked;
                          if (cloned.icing.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setPirep(cloned));
                        }}
                      />
                    }
                    label={layerStatus.pirepState.icing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.pirepState.turbulence.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.pirepState);
                          cloned.turbulence.checked =
                            !layerStatus.pirepState.turbulence.checked;
                          if (cloned.turbulence.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setPirep(cloned));
                        }}
                      />
                    }
                    label={layerStatus.pirepState.turbulence.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.pirepState.weatherSky.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.pirepState);
                          cloned.weatherSky.checked =
                            !layerStatus.pirepState.weatherSky.checked;
                          if (cloned.weatherSky.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setPirep(cloned));
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
                              onChange={(_e) => {
                                const cloned = jsonClone(
                                  layerStatus.pirepState,
                                ) as PirepLayerState;
                                cloned.altitude.valueMin = cloned.altitude.min;
                                cloned.altitude.valueMax = cloned.altitude.max;
                                dispatch(setPirep(cloned));
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
                        step={2}
                        value={[
                          layerStatus.pirepState.altitude.valueMin,
                          layerStatus.pirepState.altitude.valueMax,
                        ]}
                        onChange={(_e: Event, newValues: number[]) => {
                          const cloned = jsonClone(
                            layerStatus.pirepState,
                          ) as PirepLayerState;
                          cloned.altitude.valueMin = newValues[0];
                          cloned.altitude.valueMax = newValues[1];
                          if (
                            newValues[0] !== cloned.altitude.min ||
                            newValues[1] !== cloned.altitude.max
                          ) {
                            cloned.all.checked = false;
                          }
                          dispatch(setPirep(cloned));
                        }}
                        valueLabelDisplay="on"
                        component={null}
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
                        checked={layerStatus.cwaState.checked}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(
                            layerStatus.cwaState,
                          ) as CwaLayerState;
                          cloned.checked = !layerStatus.cwaState.checked;
                          dispatch(setCwa(cloned));
                          cloned.checked
                            ? showLayer(
                                meteoLayers.cwa,
                                layerStatus.cwaState.name,
                              )
                            : hideLayer(
                                meteoLayers.cwa,
                                layerStatus.cwaState.name,
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
                        checked={layerStatus.cwaState.all.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(
                            layerStatus.cwaState,
                          ) as CwaLayerState;
                          cloned.all.checked =
                            !layerStatus.cwaState.all.checked;
                          if (cloned.all.checked) {
                            cloned.checked = true;
                            cloned.airframeIcing.checked = true;
                            cloned.turbulence.checked = true;
                            cloned.ifrConditions.checked = true;
                            cloned.convection.checked = true;
                            cloned.other.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
                          }
                          dispatch(setCwa(cloned));
                        }}
                      />
                    }
                    label={layerStatus.cwaState.all.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.airframeIcing.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(
                            layerStatus.cwaState,
                          ) as CwaLayerState;
                          cloned.airframeIcing.checked =
                            !layerStatus.cwaState.airframeIcing.checked;
                          if (cloned.airframeIcing.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setCwa(cloned));
                        }}
                      />
                    }
                    label={layerStatus.cwaState.airframeIcing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.turbulence.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(
                            layerStatus.cwaState,
                          ) as CwaLayerState;
                          cloned.turbulence.checked =
                            !layerStatus.cwaState.turbulence.checked;
                          if (cloned.turbulence.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setCwa(cloned));
                        }}
                      />
                    }
                    label={layerStatus.cwaState.turbulence.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.ifrConditions.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(
                            layerStatus.cwaState,
                          ) as CwaLayerState;
                          cloned.ifrConditions.checked =
                            !layerStatus.cwaState.ifrConditions.checked;
                          if (cloned.ifrConditions.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setCwa(cloned));
                        }}
                      />
                    }
                    label={layerStatus.cwaState.ifrConditions.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.convection.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(
                            layerStatus.cwaState,
                          ) as CwaLayerState;
                          cloned.convection.checked =
                            !layerStatus.cwaState.convection.checked;
                          if (cloned.convection.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setCwa(cloned));
                        }}
                      />
                    }
                    label={layerStatus.cwaState.convection.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.other.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(
                            layerStatus.cwaState,
                          ) as CwaLayerState;
                          cloned.other.checked =
                            !layerStatus.cwaState.other.checked;
                          if (cloned.other.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
                          } else {
                            cloned.all.checked = false;
                          }
                          dispatch(setCwa(cloned));
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
  (_layersControl, _layer, _options: OrderedLayerProps): any => {},
);
export { GroupedLayer };

export default MeteoLayerControl;
