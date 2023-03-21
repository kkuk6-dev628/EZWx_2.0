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
import { StationMarkersLayerItems, POSITION_CLASSES, UsePersonalMinsLayerItems } from '../../common/AreoConstants';
import Image from 'next/image';
import Slider from '@mui/material/Slider';
import { useMeteoLayersContext } from './MeteoLayerControlContext';
import { jsonClone } from '../../../utils/ObjectUtil';
import RangeSlider from '../../../shared/RangeSlider';
import {
  StationMarkersLayerState,
  SigmetsLayerState,
  GairmetLayerState,
  CwaLayerState,
  PirepLayerState,
  LayerControlState,
  StationMarkerType,
  RoutePointType,
  EvaluationType,
} from '../../../../interfaces/layerControl';
import { InputFieldWrapper, RadioButton } from '../../../settings-drawer';
import {
  useGetLayerControlStateQuery,
  useUpdateLayerControlStateMutation,
} from '../../../../store/layers/layerControlApi';
import { useSelector } from 'react-redux';
import {
  selectPirepAltitudeMax,
  selectPirepAltitudeMin,
  selectRadarLayerOpacity,
  setPirepAltitudeMax,
  setPirepAltitudeMin,
  setRadarOpacity,
} from '../../../../store/layers/LayerControl';
import { useDispatch } from 'react-redux';

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
  const meteoLayers = useMeteoLayersContext();
  const { data: layerStatus, isLoading: isLoadingLayerControlState } = useGetLayerControlStateQuery('');
  const [updateLayerControlState] = useUpdateLayerControlStateMutation();
  const radarLayerOpacity = useSelector(selectRadarLayerOpacity);
  const pirepAltitudeMin = useSelector(selectPirepAltitudeMin);
  const pirepAltitudeMax = useSelector(selectPirepAltitudeMax);
  const dispatch = useDispatch();

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
    }
  };

  const hideLayer = (layerObj: Layer, layerName: string) => {
    map.closePopup();
    if (!layerObj) return;
    if (checkEmptyLayer(layerObj)) {
      toast.error(`No ${layerName}'s data displayed`, {
        position: 'top-right',
      });
    }
  };

  const isCheckedAllMetarFlightCategory = (cloned: StationMarkersLayerState): boolean =>
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
    const cloned = JSON.parse(JSON.stringify(layerStatus)) as LayerControlState;
    cloned.stationMarkersState.expanded = false;
    cloned.radarState.expanded = false;
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
      {!isLoadingLayerControlState && layerStatus.show && (
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
              updateLayerControlState({ ...layerStatus, show: false });
              disableMapInteraction(false);
            }}
          >
            <i className="fa-regular fa-circle-xmark"></i>
          </div>
          <div className="layer-control-contents">
            <div className="layer-control-item">
              <Accordion
                key={`metar-layer`}
                defaultExpanded={false}
                expanded={layerStatus.stationMarkersState.expanded}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.stationMarkersState.expanded = !layerStatus.stationMarkersState.expanded;
                      updateLayerControlState(clonedLayerControlState);
                    },
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        style={{ pointerEvents: 'none' }}
                        checked={layerStatus.stationMarkersState.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus) as LayerControlState;
                          cloned.stationMarkersState.checked = !layerStatus.stationMarkersState.checked;
                          updateLayerControlState(cloned);
                          cloned.stationMarkersState.checked
                            ? showLayer(meteoLayers.metar, layerStatus.stationMarkersState.name)
                            : hideLayer(meteoLayers.metar, layerStatus.stationMarkersState.name);
                        }}
                      />
                    }
                    label={layerStatus.stationMarkersState.name}
                  />
                </AccordionSummary>
                <AccordionDetails>
                  <RadioGroup
                    value={layerStatus.stationMarkersState.markerType}
                    name="radio-buttons-group-metar"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      console.log('radio-buttons-group-metar');
                      map.closePopup();
                      const cloned = jsonClone(layerStatus) as LayerControlState;
                      cloned.stationMarkersState.markerType = e.target.value as StationMarkerType;
                      cloned.stationMarkersState.checked = true;
                      updateLayerControlState(cloned);
                    }}
                  >
                    <FormControlLabel
                      value={StationMarkersLayerItems.usePersonalMinimum.value}
                      control={<Radio color="primary" />}
                      label={StationMarkersLayerItems.usePersonalMinimum.text}
                    />
                    <div className="personal-mins">
                      <InputFieldWrapper>
                        <div className="input_radio_container">
                          <RadioButton
                            id={UsePersonalMinsLayerItems.departure.value}
                            value={UsePersonalMinsLayerItems.departure.value}
                            title={UsePersonalMinsLayerItems.departure.text}
                            name="max_takeoff_weight_category"
                            selectedValue={layerStatus.stationMarkersState.usePersonalMinimums.routePointType}
                            description=""
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              map.closePopup();
                              const cloned = jsonClone(layerStatus) as LayerControlState;
                              cloned.stationMarkersState.usePersonalMinimums.routePointType = e.target
                                .value as RoutePointType;
                              cloned.stationMarkersState.checked = true;
                              updateLayerControlState(cloned);
                            }}
                          />
                          <RadioButton
                            id={UsePersonalMinsLayerItems.enRoute.value}
                            value={UsePersonalMinsLayerItems.enRoute.value}
                            title={UsePersonalMinsLayerItems.enRoute.text}
                            name="max_takeoff_weight_category"
                            selectedValue={layerStatus.stationMarkersState.usePersonalMinimums.routePointType}
                            description=""
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              map.closePopup();
                              const cloned = jsonClone(layerStatus) as LayerControlState;
                              cloned.stationMarkersState.usePersonalMinimums.routePointType = e.target
                                .value as RoutePointType;
                              cloned.stationMarkersState.checked = true;
                              updateLayerControlState(cloned);
                            }}
                          />
                          <RadioButton
                            id={UsePersonalMinsLayerItems.destination.value}
                            value={UsePersonalMinsLayerItems.destination.value}
                            title={UsePersonalMinsLayerItems.destination.text}
                            name="max_takeoff_weight_category"
                            selectedValue={layerStatus.stationMarkersState.usePersonalMinimums.routePointType}
                            description=""
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              map.closePopup();
                              const cloned = jsonClone(layerStatus) as LayerControlState;
                              cloned.stationMarkersState.usePersonalMinimums.routePointType = e.target
                                .value as RoutePointType;
                              cloned.stationMarkersState.checked = true;
                              updateLayerControlState(cloned);
                            }}
                          />
                        </div>
                      </InputFieldWrapper>
                      <RadioGroup
                        value={layerStatus.stationMarkersState.usePersonalMinimums.evaluationType}
                        name="radio-group-personal-mins-eval"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          console.log('radio-group-personal-mins-eval');
                          map.closePopup();
                          const cloned = jsonClone(layerStatus) as LayerControlState;
                          cloned.stationMarkersState.usePersonalMinimums.evaluationType = e.target
                            .value as EvaluationType;
                          cloned.stationMarkersState.markerType = StationMarkersLayerItems.usePersonalMinimum
                            .value as StationMarkerType;
                          cloned.stationMarkersState.checked = true;
                          updateLayerControlState(cloned);
                        }}
                      >
                        <FormControlLabel
                          value={UsePersonalMinsLayerItems.flightCategory.value}
                          control={<Radio color="primary" />}
                          label={UsePersonalMinsLayerItems.flightCategory.text}
                        />
                        <FormControlLabel
                          value={UsePersonalMinsLayerItems.ceiling.value}
                          control={<Radio color="primary" />}
                          label={UsePersonalMinsLayerItems.ceiling.text}
                        />
                        <FormControlLabel
                          value={UsePersonalMinsLayerItems.visibility.value}
                          control={<Radio color="primary" />}
                          label={UsePersonalMinsLayerItems.visibility.text}
                        />
                        <FormControlLabel
                          value={UsePersonalMinsLayerItems.crosswind.value}
                          control={<Radio color="primary" />}
                          label={UsePersonalMinsLayerItems.crosswind.text}
                        />
                      </RadioGroup>
                    </div>
                    <FormControlLabel
                      value={StationMarkersLayerItems.flightCategory.value}
                      control={<Radio color="primary" />}
                      label={StationMarkersLayerItems.flightCategory.text}
                    />
                    <div className="flight-category-filters">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerStatus.stationMarkersState.flightCategory.all.checked}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              if (
                                layerStatus.stationMarkersState.markerType !==
                                StationMarkersLayerItems.flightCategory.value
                              ) {
                                return;
                              }
                              const cloned = jsonClone(layerStatus) as LayerControlState;
                              cloned.stationMarkersState.flightCategory.all.checked = true;
                              cloned.stationMarkersState.flightCategory.vfr.checked = true;
                              cloned.stationMarkersState.flightCategory.mvfr.checked = true;
                              cloned.stationMarkersState.flightCategory.ifr.checked = true;
                              cloned.stationMarkersState.flightCategory.lifr.checked = true;
                              cloned.stationMarkersState.markerType = StationMarkersLayerItems.flightCategory.value;
                              updateLayerControlState(cloned);
                            }}
                          />
                        }
                        label={layerStatus.stationMarkersState.flightCategory.all.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerStatus.stationMarkersState.flightCategory.vfr.checked}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              if (
                                layerStatus.stationMarkersState.markerType !==
                                StationMarkersLayerItems.flightCategory.value
                              ) {
                                return;
                              }
                              const cloned = jsonClone(layerStatus) as LayerControlState;
                              cloned.stationMarkersState.flightCategory.vfr.checked =
                                !layerStatus.stationMarkersState.flightCategory.vfr.checked;
                              cloned.stationMarkersState.flightCategory.all.checked = isCheckedAllMetarFlightCategory(
                                cloned.stationMarkersState,
                              );
                              if (cloned.stationMarkersState.flightCategory.vfr.checked) {
                                cloned.stationMarkersState.markerType = StationMarkersLayerItems.flightCategory.value;
                              }
                              updateLayerControlState(cloned);
                            }}
                          />
                        }
                        label={layerStatus.stationMarkersState.flightCategory.vfr.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerStatus.stationMarkersState.flightCategory.mvfr.checked}
                            value={StationMarkersLayerItems.flightCategory.value}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              if (
                                layerStatus.stationMarkersState.markerType !==
                                StationMarkersLayerItems.flightCategory.value
                              ) {
                                return;
                              }
                              const cloned = jsonClone(layerStatus) as LayerControlState;
                              cloned.stationMarkersState.flightCategory.mvfr.checked =
                                !layerStatus.stationMarkersState.flightCategory.mvfr.checked;
                              cloned.stationMarkersState.flightCategory.all.checked = isCheckedAllMetarFlightCategory(
                                cloned.stationMarkersState,
                              );
                              if (cloned.stationMarkersState.flightCategory.mvfr.checked) {
                                cloned.stationMarkersState.markerType = StationMarkersLayerItems.flightCategory.value;
                              }
                              updateLayerControlState(cloned);
                            }}
                          />
                        }
                        label={layerStatus.stationMarkersState.flightCategory.mvfr.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerStatus.stationMarkersState.flightCategory.ifr.checked}
                            value={StationMarkersLayerItems.flightCategory.value}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              if (
                                layerStatus.stationMarkersState.markerType !==
                                StationMarkersLayerItems.flightCategory.value
                              ) {
                                return;
                              }
                              const cloned = jsonClone(layerStatus) as LayerControlState;
                              cloned.stationMarkersState.flightCategory.ifr.checked =
                                !layerStatus.stationMarkersState.flightCategory.ifr.checked;
                              cloned.stationMarkersState.flightCategory.all.checked = isCheckedAllMetarFlightCategory(
                                cloned.stationMarkersState,
                              );
                              if (cloned.stationMarkersState.flightCategory.ifr.checked) {
                                cloned.stationMarkersState.markerType = StationMarkersLayerItems.flightCategory.value;
                              }
                              updateLayerControlState(cloned);
                            }}
                          />
                        }
                        label={layerStatus.stationMarkersState.flightCategory.ifr.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerStatus.stationMarkersState.flightCategory.lifr.checked}
                            value={StationMarkersLayerItems.flightCategory.value}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              if (
                                layerStatus.stationMarkersState.markerType !==
                                StationMarkersLayerItems.flightCategory.value
                              ) {
                                return;
                              }
                              const cloned = jsonClone(layerStatus) as LayerControlState;
                              cloned.stationMarkersState.flightCategory.lifr.checked =
                                !layerStatus.stationMarkersState.flightCategory.lifr.checked;
                              cloned.stationMarkersState.flightCategory.all.checked = isCheckedAllMetarFlightCategory(
                                cloned.stationMarkersState,
                              );
                              if (cloned.stationMarkersState.flightCategory.lifr.checked) {
                                cloned.stationMarkersState.markerType = StationMarkersLayerItems.flightCategory.value;
                              }
                              updateLayerControlState(cloned);
                            }}
                          />
                        }
                        label={layerStatus.stationMarkersState.flightCategory.lifr.name}
                      />
                    </div>
                    <FormControlLabel
                      value={StationMarkersLayerItems.ceilingHeight.value}
                      control={<Radio color="primary" />}
                      label={StationMarkersLayerItems.ceilingHeight.text}
                    />
                    <FormControlLabel
                      value={StationMarkersLayerItems.surfaceVisibility.value}
                      control={<Radio color="primary" />}
                      label={StationMarkersLayerItems.surfaceVisibility.text}
                    />
                    <FormControlLabel
                      value={StationMarkersLayerItems.surfaceWindSpeed.value}
                      control={<Radio color="primary" />}
                      label={StationMarkersLayerItems.surfaceWindSpeed.text}
                    />
                    <FormControlLabel
                      value={StationMarkersLayerItems.surfaceWindBarbs.value}
                      control={<Radio color="primary" />}
                      label={StationMarkersLayerItems.surfaceWindBarbs.text}
                    />
                    <FormControlLabel
                      value={StationMarkersLayerItems.surfaceWindGust.value}
                      control={<Radio color="primary" />}
                      label={StationMarkersLayerItems.surfaceWindGust.text}
                    />
                    <FormControlLabel
                      value={StationMarkersLayerItems.surfaceTemperature.value}
                      control={<Radio color="primary" />}
                      label={StationMarkersLayerItems.surfaceTemperature.text}
                    />
                    <FormControlLabel
                      value={StationMarkersLayerItems.surfaceDewpoint.value}
                      control={<Radio color="primary" />}
                      label={StationMarkersLayerItems.surfaceDewpoint.text}
                    />
                    <FormControlLabel
                      value={StationMarkersLayerItems.dewpointDepression.value}
                      control={<Radio color="primary" />}
                      label={StationMarkersLayerItems.dewpointDepression.text}
                    />
                    <FormControlLabel
                      value={StationMarkersLayerItems.weather.value}
                      control={<Radio color="primary" />}
                      label={StationMarkersLayerItems.weather.text}
                    />
                  </RadioGroup>
                </AccordionDetails>
              </Accordion>
            </div>
            <div className="layer-control-item">
              <Accordion key={`cwa-layer`} expanded={layerStatus.radarState.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.radarState.expanded = !layerStatus.radarState.expanded;
                      updateLayerControlState(clonedLayerControlState);
                    },
                  }}
                >
                  <FormControlLabel
                    label={layerStatus.radarState.name}
                    control={
                      <Checkbox
                        checked={layerStatus.radarState.checked}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus) as LayerControlState;
                          cloned.radarState.checked = !layerStatus.radarState.checked;
                          updateLayerControlState(cloned);
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.radarState.baseReflectivity.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus) as LayerControlState;
                          cloned.radarState.checked = true;
                          cloned.radarState.baseReflectivity.checked = true;
                          cloned.radarState.echoTopHeight.checked = false;
                          updateLayerControlState(cloned);
                        }}
                      />
                    }
                    label={layerStatus.radarState.baseReflectivity.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.radarState.echoTopHeight.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus) as LayerControlState;
                          cloned.radarState.checked = true;
                          cloned.radarState.baseReflectivity.checked = false;
                          cloned.radarState.echoTopHeight.checked = true;
                          updateLayerControlState(cloned);
                        }}
                      />
                    }
                    label={layerStatus.radarState.echoTopHeight.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerStatus.radarState.forecastRadar.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerStatus) as LayerControlState;
                          cloned.radarState.forecastRadar.checked = !layerStatus.radarState.forecastRadar.checked;
                          cloned.radarState.forecastRadar.checked
                            ? (cloned.radarState.checked = cloned.radarState.forecastRadar.checked)
                            : null;
                          updateLayerControlState(cloned);
                        }}
                      />
                    }
                    label={layerStatus.radarState.forecastRadar.name}
                  />
                  <div className="pirep-slider">
                    <div className="title">
                      <div className="label">Opacity</div>
                    </div>
                    <div className="slider">
                      <Slider
                        getAriaLabel={() => 'Opacity range'}
                        min={0}
                        max={100}
                        step={5}
                        value={radarLayerOpacity}
                        valueLabelDisplay="on"
                        marks={[
                          { value: 0, label: 0 },
                          { value: 100, label: 100 },
                        ]}
                        onChangeCommitted={(e: Event, newValue: number) => {
                          const cloned = jsonClone(layerStatus) as LayerControlState;
                          cloned.radarState.opacity = newValue;
                          updateLayerControlState(cloned);
                        }}
                        onChange={(e: Event, newValue: number) => {
                          dispatch(setRadarOpacity(newValue));
                        }}
                      />
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
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
                      updateLayerControlState(clonedLayerControlState);
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
                          updateLayerControlState({ ...layerStatus, sigmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, sigmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, sigmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, sigmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, sigmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, sigmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, sigmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, sigmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, sigmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, sigmetState: cloned });
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
                      updateLayerControlState(clonedLayerControlState);
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
                          updateLayerControlState({ ...layerStatus, gairmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, gairmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, gairmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, gairmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, gairmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, gairmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, gairmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, gairmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, gairmetState: cloned });
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
                          updateLayerControlState({ ...layerStatus, gairmetState: cloned });
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
                      updateLayerControlState(clonedLayerControlState);
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
                          updateLayerControlState({ ...layerStatus, pirepState: cloned });
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
                          updateLayerControlState({ ...layerStatus, pirepState: cloned });
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
                          updateLayerControlState({ ...layerStatus, pirepState: cloned });
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
                          updateLayerControlState({ ...layerStatus, pirepState: cloned });
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
                          updateLayerControlState({ ...layerStatus, pirepState: cloned });
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
                          updateLayerControlState({ ...layerStatus, pirepState: cloned });
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
                                cloned.altitude.all = true;
                                updateLayerControlState({ ...layerStatus, pirepState: cloned });
                              }}
                            />
                          }
                          label="All"
                        />
                      </div>
                    </div>
                    <div className="slider">
                      <RangeSlider
                        getAriaLabel={() => 'Altitude range'}
                        min={layerStatus.pirepState.altitude.min}
                        max={layerStatus.pirepState.altitude.max}
                        step={5}
                        value={[pirepAltitudeMin, pirepAltitudeMax]}
                        mindistance={20}
                        onChange={(_e: Event, newValues: number[]) => {
                          if (!Array.isArray(newValues)) {
                            return;
                          }
                          dispatch(setPirepAltitudeMin(newValues[0]));
                          dispatch(setPirepAltitudeMax(newValues[1]));
                        }}
                        onChangeCommitted={(_e: Event, newValues: number[]) => {
                          if (!Array.isArray(newValues)) {
                            return;
                          }
                          const cloned = jsonClone(layerStatus.pirepState) as PirepLayerState;
                          cloned.altitude.valueMin = newValues[0];
                          cloned.altitude.valueMax = newValues[1];
                          if (newValues[0] === cloned.altitude.min && newValues[1] === cloned.altitude.max) {
                            cloned.altitude.all = true;
                          } else {
                            cloned.altitude.all = false;
                          }
                          updateLayerControlState({ ...layerStatus, pirepState: cloned });
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
                      updateLayerControlState(clonedLayerControlState);
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
                          updateLayerControlState({ ...layerStatus, cwaState: cloned });
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
                          updateLayerControlState({ ...layerStatus, cwaState: cloned });
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
                          updateLayerControlState({ ...layerStatus, cwaState: cloned });
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
                          updateLayerControlState({ ...layerStatus, cwaState: cloned });
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
                          updateLayerControlState({ ...layerStatus, cwaState: cloned });
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
                          updateLayerControlState({ ...layerStatus, cwaState: cloned });
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
                          updateLayerControlState({ ...layerStatus, cwaState: cloned });
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
