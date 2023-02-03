/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ChangeEvent, ReactElement, useEffect, useRef, createContext, useContext } from 'react';
import { Radio, RadioGroup } from '@material-ui/core';
import { useMap } from 'react-leaflet';
import { Layer, DomEvent, LayerGroup, CircleMarker, FeatureGroup } from 'leaflet';
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
  setLayerControlShow,
  SigmetsLayerState,
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

const MeteoLayerControl = ({ position, children }: IProps) => {
  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

  const ref = useRef<HTMLDivElement>();
  const dispatch = useDispatch();
  const meteoLayers = useMeteoLayersContext();
  const layerStatus = useSelector(selectLayerControl);

  const map = useMap();

  const checkEmptyLayer = (layer: Layer): boolean => {
    if (!layer) return false;
    return typeof (layer as any).getLayers === 'function' && (layer as LayerGroup).getLayers().length === 0;
  };

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

  const isCheckedAllMetarFlightCategory = (cloned: MetarLayerState): boolean =>
    cloned.flightCategory.vfr.checked &&
    cloned.flightCategory.mvfr.checked &&
    cloned.flightCategory.ifr.checked &&
    cloned.flightCategory.lifr.checked;

  const isCheckedAllSigmets = (cloned: SigmetsLayerState): boolean =>
    cloned.convection.checked &&
    cloned.outlooks.checked &&
    cloned.turbulence.checked &&
    cloned.airframeIcing.checked &&
    cloned.dust.checked &&
    cloned.ash.checked &&
    cloned.other.checked &&
    cloned.international.checked;

  const isCheckedAllGairmets = (cloned: GairmetLayerState): boolean =>
    cloned.airframeIcing.checked &&
    cloned.multiFrzLevels.checked &&
    cloned.turbulenceHi.checked &&
    cloned.turbulenceLow.checked &&
    cloned.ifrConditions.checked &&
    cloned.mountainObscuration.checked &&
    cloned.nonconvectiveLlws.checked &&
    cloned.sfcWinds.checked;

  const isCheckedAllCwa = (cloned: CwaLayerState): boolean =>
    cloned.airframeIcing.checked &&
    cloned.turbulence.checked &&
    cloned.ifrConditions.checked &&
    cloned.convection.checked &&
    cloned.other.checked;

  const isCheckedAllPirep = (cloned: PirepLayerState): boolean =>
    cloned.icing.checked && cloned.turbulence.checked && cloned.weatherSky.checked;

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

  const disableMapInteraction = (disable: boolean) => {
    inLayerControl.value = disable;

    if (disable) {
      map.dragging.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    } else {
      map.dragging.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }
  };

  useEffect(() => {
    if (ref?.current) {
      // DomEvent.disableClickPropagation(ref.current);
      DomEvent.disableScrollPropagation(ref.current);
      // Disable dragging when user's cursor enters the element
      ref.current.addEventListener('mouseover', function () {
        disableMapInteraction(true);
      });
      // Re-enable dragging when user's cursor leaves the element
      ref.current.addEventListener('mouseout', function () {
        disableMapInteraction(false);
      });
    }
  }, [ref?.current]);

  return (
    //@ts-ignore
    <div className={positionClass + ' layer-control-container'} ref={ref}>
      {layerStatus.show && (
        <div id="layer-control" className="leaflet-control leaflet-bar layer-control">
          <div className="layer-control__header">
            <div
              className="layer-control__img__area"
              onDoubleClick={() => {
                const stationId = prompt('Input Station ID');
                const markers = new FeatureGroup();
                //@ts-ignore
                meteoLayers.metar.eachLayer((layer) => {
                  if (layer.feature.properties.station_id == stationId) {
                    const coords = layer.feature.geometry.coordinates;
                    const marker = new CircleMarker([coords[1], coords[0]]);
                    markers.addLayer(marker);
                  }
                });
                if (markers.getLayers().length > 0) {
                  markers.addTo(map);
                  map.fitBounds(markers.getBounds());
                }
              }}
            >
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
          <div
            className="btn-close"
            onClick={() => {
              dispatch(setLayerControlShow(false));
              disableMapInteraction(false);
            }}
          >
            <i className="fa-regular fa-circle-xmark"></i>
          </div>
          <div className="layer-control-contents">
            <div className="layer-control-item">
              <Accordion key={`metar-layer`} defaultExpanded={false} expanded={layerStatus.metarState.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.metarState.expanded = !layerStatus.metarState.expanded;
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
                            ? showLayer(meteoLayers.metar, layerStatus.metarState.name)
                            : hideLayer(meteoLayers.metar, layerStatus.metarState.name);
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      map.closePopup();
                      const cloned = jsonClone(layerStatus.metarState) as MetarLayerState;
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
                    <div className="flight-category-filters">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerStatus.metarState.flightCategory.all.checked}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              const cloned = jsonClone(layerStatus.metarState) as MetarLayerState;
                              cloned.flightCategory.all.checked = true;
                              cloned.flightCategory.vfr.checked = true;
                              cloned.flightCategory.mvfr.checked = true;
                              cloned.flightCategory.ifr.checked = true;
                              cloned.flightCategory.lifr.checked = true;
                              cloned.markerType = MetarMarkerTypes.flightCategory.value;
                              dispatch(setMetar(cloned));
                            }}
                          />
                        }
                        label={layerStatus.metarState.flightCategory.all.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerStatus.metarState.flightCategory.vfr.checked}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              const cloned = jsonClone(layerStatus.metarState) as MetarLayerState;
                              cloned.flightCategory.vfr.checked = !layerStatus.metarState.flightCategory.vfr.checked;
                              cloned.flightCategory.all.checked = isCheckedAllMetarFlightCategory(cloned);
                              if (cloned.flightCategory.vfr.checked) {
                                cloned.markerType = MetarMarkerTypes.flightCategory.value;
                              }
                              dispatch(setMetar(cloned));
                            }}
                          />
                        }
                        label={layerStatus.metarState.flightCategory.vfr.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerStatus.metarState.flightCategory.mvfr.checked}
                            value={MetarMarkerTypes.flightCategory.value}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              const cloned = jsonClone(layerStatus.metarState) as MetarLayerState;
                              cloned.flightCategory.mvfr.checked = !layerStatus.metarState.flightCategory.mvfr.checked;
                              cloned.flightCategory.all.checked = isCheckedAllMetarFlightCategory(cloned);
                              if (cloned.flightCategory.mvfr.checked) {
                                cloned.markerType = MetarMarkerTypes.flightCategory.value;
                              }
                              dispatch(setMetar(cloned));
                            }}
                          />
                        }
                        label={layerStatus.metarState.flightCategory.mvfr.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerStatus.metarState.flightCategory.ifr.checked}
                            value={MetarMarkerTypes.flightCategory.value}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              const cloned = jsonClone(layerStatus.metarState) as MetarLayerState;
                              cloned.flightCategory.ifr.checked = !layerStatus.metarState.flightCategory.ifr.checked;
                              cloned.flightCategory.all.checked = isCheckedAllMetarFlightCategory(cloned);
                              if (cloned.flightCategory.ifr.checked) {
                                cloned.markerType = MetarMarkerTypes.flightCategory.value;
                              }
                              dispatch(setMetar(cloned));
                            }}
                          />
                        }
                        label={layerStatus.metarState.flightCategory.ifr.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerStatus.metarState.flightCategory.lifr.checked}
                            value={MetarMarkerTypes.flightCategory.value}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              const cloned = jsonClone(layerStatus.metarState) as MetarLayerState;
                              cloned.flightCategory.lifr.checked = !layerStatus.metarState.flightCategory.lifr.checked;
                              cloned.flightCategory.all.checked = isCheckedAllMetarFlightCategory(cloned);
                              if (cloned.flightCategory.lifr.checked) {
                                cloned.markerType = MetarMarkerTypes.flightCategory.value;
                              }
                              dispatch(setMetar(cloned));
                            }}
                          />
                        }
                        label={layerStatus.metarState.flightCategory.lifr.name}
                      />
                    </div>
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
            <div className="layer-control-item" style={{ marginLeft: 12, paddingLeft: 4 }}>
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
                        ? showLayer(meteoLayers.radar, layerStatus.radarState.name)
                        : hideLayer(meteoLayers.radar, layerStatus.radarState.name);
                    }}
                  />
                }
                label={layerStatus.radarState.name}
              />
            </div>
            <div className="layer-control-item">
              <Accordion key={`sigmet-layer`} expanded={layerStatus.sigmetState.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.sigmetState.expanded = !layerStatus.sigmetState.expanded;
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
                            showLayer(meteoLayers.sigmet, layerStatus.sigmetState.name);
                            if (layerStatus.sigmetState.outlooks.checked) {
                              showLayer(meteoLayers.convectiveOutlooks, layerStatus.sigmetState.outlooks.name);
                            }
                            if (layerStatus.sigmetState.international.checked) {
                              showLayer(meteoLayers.intlSigmet, layerStatus.sigmetState.international.name);
                            }
                          } else {
                            hideLayer(meteoLayers.sigmet, layerStatus.sigmetState.name);
                            hideLayer(meteoLayers.convectiveOutlooks, layerStatus.sigmetState.outlooks.name);
                            hideLayer(meteoLayers.intlSigmet, layerStatus.sigmetState.international.name);
                          }
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
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
                          cloned.all.checked = true;
                          cloned.all.checked = true;
                          cloned.convection.checked = true;
                          cloned.outlooks.checked = true;
                          cloned.turbulence.checked = true;
                          cloned.airframeIcing.checked = true;
                          cloned.dust.checked = true;
                          cloned.ash.checked = true;
                          cloned.other.checked = true;
                          cloned.international.checked = true;
                          showLayer(meteoLayers.sigmet, layerStatus.sigmetState.name);
                          showLayer(meteoLayers.convectiveOutlooks, layerStatus.sigmetState.outlooks.name);
                          showLayer(meteoLayers.intlSigmet, layerStatus.sigmetState.international.name);
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
                          cloned.convection.checked = !layerStatus.sigmetState.convection.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.convection.checked) {
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
                          cloned.outlooks.checked = !layerStatus.sigmetState.outlooks.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.outlooks.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.convectiveOutlooks, layerStatus.sigmetState.outlooks.name);
                          } else {
                            hideLayer(meteoLayers.convectiveOutlooks, layerStatus.sigmetState.outlooks.name);
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
                          cloned.turbulence.checked = !layerStatus.sigmetState.turbulence.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.turbulence.checked) {
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
                          cloned.airframeIcing.checked = !layerStatus.sigmetState.airframeIcing.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.airframeIcing.checked) {
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
                          cloned.dust.checked = !layerStatus.sigmetState.dust.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.dust.checked) {
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
                          cloned.ash.checked = !layerStatus.sigmetState.ash.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.ash.checked) {
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
                          cloned.other.checked = !layerStatus.sigmetState.other.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.other.checked) {
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
                          cloned.international.checked = !layerStatus.sigmetState.international.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.international.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.intlSigmet, layerStatus.sigmetState.international.name);
                          } else {
                            hideLayer(meteoLayers.intlSigmet, layerStatus.sigmetState.international.name);
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
              <Accordion key={`gairmet-layer`} expanded={layerStatus.gairmetState.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.gairmetState.expanded = !layerStatus.gairmetState.expanded;
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
                            ? showLayer(meteoLayers.gairmet, layerStatus.gairmetState.name)
                            : hideLayer(meteoLayers.gairmet, layerStatus.gairmetState.name);
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.gairmetState.all.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={() => {
                          const cloned = jsonClone(layerStatus.gairmetState) as GairmetLayerState;
                          cloned.all.checked = true;
                          cloned.airframeIcing.checked = true;
                          cloned.multiFrzLevels.checked = true;
                          cloned.turbulenceHi.checked = true;
                          cloned.turbulenceLow.checked = true;
                          cloned.ifrConditions.checked = true;
                          cloned.mountainObscuration.checked = true;
                          cloned.nonconvectiveLlws.checked = true;
                          cloned.sfcWinds.checked = true;
                          showLayer(meteoLayers.gairmet, layerStatus.gairmetState.name);
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
                          cloned.airframeIcing.checked = !layerStatus.gairmetState.airframeIcing.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.airframeIcing.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
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
                        checked={layerStatus.gairmetState.multiFrzLevels.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.multiFrzLevels.checked = !layerStatus.gairmetState.multiFrzLevels.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.multiFrzLevels.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
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
                          cloned.turbulenceHi.checked = !layerStatus.gairmetState.turbulenceHi.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.turbulenceHi.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
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
                          cloned.turbulenceLow.checked = !layerStatus.gairmetState.turbulenceLow.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.turbulenceLow.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
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
                          cloned.ifrConditions.checked = !layerStatus.gairmetState.ifrConditions.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.ifrConditions.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
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
                        checked={layerStatus.gairmetState.mountainObscuration.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.mountainObscuration.checked = !layerStatus.gairmetState.mountainObscuration.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.mountainObscuration.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
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
                        checked={layerStatus.gairmetState.nonconvectiveLlws.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.gairmetState);
                          cloned.nonconvectiveLlws.checked = !layerStatus.gairmetState.nonconvectiveLlws.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.nonconvectiveLlws.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
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
                          cloned.sfcWinds.checked = !layerStatus.gairmetState.sfcWinds.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.sfcWinds.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
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
              <Accordion key={`pirep-layer`} expanded={layerStatus.pirepState.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.pirepState.expanded = !layerStatus.pirepState.expanded;
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
                            ? showLayer(meteoLayers.pirep, layerStatus.pirepState.name)
                            : hideLayer(meteoLayers.pirep, layerStatus.pirepState.name);
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
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
                          cloned.urgentOnly.checked = !layerStatus.pirepState.urgentOnly.checked;
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
                          const cloned = jsonClone(layerStatus.pirepState) as PirepLayerState;
                          cloned.all.checked = true;
                          cloned.checked = true;
                          cloned.icing.checked = true;
                          cloned.turbulence.checked = true;
                          cloned.weatherSky.checked = true;
                          showLayer(meteoLayers.pirep, cloned.name);
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
                          cloned.icing.checked = !layerStatus.pirepState.icing.checked;
                          cloned.all.checked = isCheckedAllPirep(cloned);
                          if (cloned.icing.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
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
                          cloned.turbulence.checked = !layerStatus.pirepState.turbulence.checked;
                          cloned.all.checked = isCheckedAllPirep(cloned);
                          if (cloned.turbulence.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
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
                          cloned.weatherSky.checked = !layerStatus.pirepState.weatherSky.checked;
                          cloned.all.checked = isCheckedAllPirep(cloned);
                          if (cloned.weatherSky.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
                          }
                          dispatch(setPirep(cloned));
                        }}
                      />
                    }
                    label={layerStatus.pirepState.weatherSky.name}
                  />
                  <div className="pirep-slider">
                    <div className="title">
                      <div className="label">{layerStatus.pirepState.altitude.name}</div>
                      <div className="all-check">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={layerStatus.pirepState.altitude.all}
                              icon={<CircleUnchecked />}
                              checkedIcon={<CircleCheckedFilled />}
                              name="checkedB"
                              color="primary"
                              onChange={(_e) => {
                                const cloned = jsonClone(layerStatus.pirepState) as PirepLayerState;
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
                        value={[layerStatus.pirepState.altitude.valueMin, layerStatus.pirepState.altitude.valueMax]}
                        onChange={(_e: Event, newValues: number[]) => {
                          const cloned = jsonClone(layerStatus.pirepState) as PirepLayerState;
                          cloned.altitude.valueMin = newValues[0];
                          cloned.altitude.valueMax = newValues[1];
                          if (newValues[0] === cloned.altitude.min && newValues[1] === cloned.altitude.max) {
                            cloned.altitude.all = true;
                          } else {
                            cloned.altitude.all = false;
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
              <Accordion key={`cwa-layer`} expanded={layerStatus.cwaState.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.cwaState.expanded = !layerStatus.cwaState.expanded;
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
                          const cloned = jsonClone(layerStatus.cwaState) as CwaLayerState;
                          cloned.checked = !layerStatus.cwaState.checked;
                          dispatch(setCwa(cloned));
                          cloned.checked
                            ? showLayer(meteoLayers.cwa, layerStatus.cwaState.name)
                            : hideLayer(meteoLayers.cwa, layerStatus.cwaState.name);
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.cwaState.all.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus.cwaState) as CwaLayerState;
                          cloned.all.checked = true;
                          cloned.checked = true;
                          cloned.airframeIcing.checked = true;
                          cloned.turbulence.checked = true;
                          cloned.ifrConditions.checked = true;
                          cloned.convection.checked = true;
                          cloned.other.checked = true;
                          showLayer(meteoLayers.cwa, cloned.name);
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
                          const cloned = jsonClone(layerStatus.cwaState) as CwaLayerState;
                          cloned.airframeIcing.checked = !layerStatus.cwaState.airframeIcing.checked;
                          cloned.all.checked = isCheckedAllCwa(cloned);
                          if (cloned.airframeIcing.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
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
                          const cloned = jsonClone(layerStatus.cwaState) as CwaLayerState;
                          cloned.turbulence.checked = !layerStatus.cwaState.turbulence.checked;
                          cloned.all.checked = isCheckedAllCwa(cloned);
                          if (cloned.turbulence.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
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
                          const cloned = jsonClone(layerStatus.cwaState) as CwaLayerState;
                          cloned.ifrConditions.checked = !layerStatus.cwaState.ifrConditions.checked;
                          cloned.all.checked = isCheckedAllCwa(cloned);
                          if (cloned.ifrConditions.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
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
                          const cloned = jsonClone(layerStatus.cwaState) as CwaLayerState;
                          cloned.convection.checked = !layerStatus.cwaState.convection.checked;
                          cloned.all.checked = isCheckedAllCwa(cloned);
                          if (cloned.convection.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
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
                          const cloned = jsonClone(layerStatus.cwaState) as CwaLayerState;
                          cloned.other.checked = !layerStatus.cwaState.other.checked;
                          cloned.all.checked = isCheckedAllCwa(cloned);
                          if (cloned.other.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
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
