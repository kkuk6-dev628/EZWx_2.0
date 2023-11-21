/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
  ChangeEvent,
  ReactElement,
  useEffect,
  useRef,
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
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
import CircleChecked from '@material-ui/icons/CheckCircleOutline';
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
import { useUpdateLayerControlStateMutation } from '../../../../store/layers/layerControlApi';
import { useSelector } from 'react-redux';
import { selectLayerControlState, setLayerControlState } from '../../../../store/layers/LayerControl';
import { useDispatch } from 'react-redux';
import { selectAuth } from '../../../../store/auth/authSlice';
import { useGetUserSettingsQuery } from '../../../../store/user/userSettingsApi';
import { useCookies } from 'react-cookie';
import { SvgRoundClose } from '../../../utils/SvgIcons';
import { useGetAllAirportsQuery } from '../../../../store/airportwx/airportwxApi';

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
  const auth = useSelector(selectAuth);
  const [cookies] = useCookies(['logged_in']);
  const ref = useRef<HTMLDivElement>();
  const meteoLayers = useMeteoLayersContext();
  const [updateLayerControlStateAPI] = useUpdateLayerControlStateMutation();
  const layerControlState = useSelector(selectLayerControlState);
  const dispatch = useDispatch();
  let refetchUserSettings;
  if (auth.id || cookies.logged_in) {
    const { refetch } = useGetUserSettingsQuery(auth.id);
    refetchUserSettings = () => {
      refetch();
    };
  }

  const { isSuccess: isLoadedAirports, data: airportsTable } = useGetAllAirportsQuery('');

  const map = useMap();

  const updateLayerControl = (cloned: LayerControlState, commit = true) => {
    if (refetchUserSettings) refetchUserSettings();
    dispatch(setLayerControlState(cloned));
    if (commit && auth.id) updateLayerControlStateAPI(cloned);
  };

  const checkEmptyLayer = (layer: Layer): boolean => {
    if (!layer) return false;
    return typeof (layer as any).getLayers === 'function' && (layer as LayerGroup).getLayers().length === 0;
  };

  const showLayer = (layerObj: Layer, layerName: string) => {
    map.closePopup();
    if (!layerObj) return;
    if (checkEmptyLayer(layerObj)) {
      toast.error(`No ${layerName}'s data displayed`);
    }
  };

  const hideLayer = (layerObj: Layer, layerName: string) => {
    map.closePopup();
    if (!layerObj) return;
    if (checkEmptyLayer(layerObj)) {
      toast.error(`No ${layerName}'s data displayed`);
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
    const cloned = JSON.parse(JSON.stringify(layerControlState)) as LayerControlState;
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
  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 768;
  const handleDisableMapInteraction = useCallback((node) => {
    if (node) {
      if (isMobile) {
        DomEvent.disableClickPropagation(node);
        DomEvent.disableScrollPropagation(node);
      } else {
        node.addEventListener('mouseover', function () {
          disableMapInteraction(true);
        });
        // Re-enable dragging when user's cursor leaves the element
        node.addEventListener('mouseout', function () {
          disableMapInteraction(false);
        });
      }
      DomEvent.disableScrollPropagation(node);
      // L.DomEvent.on(ref.current, 'mousemove contextmenu drag', L.DomEvent.stop);
    }
  }, []);

  return (
    //@ts-ignore
    <div className={positionClass + ' layer-control-container'} ref={handleDisableMapInteraction}>
      {layerControlState.show && (
        <div id="layer-control" className="leaflet-control leaflet-bar layer-control">
          <div className="layer-control__header">
            <div
              className="layer-control__img__area"
              onDoubleClick={() => {
                const stationId = prompt('Input Station ID');
                const markers = new FeatureGroup();
                //@ts-ignore
                airportsTable.map((airport) => {
                  if (airport.key == stationId) {
                    const coords = airport.position.coordinates;
                    const marker = new CircleMarker([coords[1], coords[0]]);
                    markers.addLayer(marker);
                  }
                });
                if (markers.getLayers().length > 0) {
                  markers.addTo(map);
                  map.fitBounds(markers.getBounds());
                }
                // map.fitBounds([
                //   [55.0, -130.0],
                //   [20.0, -60.0],
                // ]);
              }}
            >
              <Image
                src="/images/avater.png"
                alt="logo"
                width={60}
                height={60}
                className="layer-control__header__img"
                loading="eager"
              />
            </div>
            <div className="layer-control__rgt">
              <h3>Map Layers</h3>
            </div>
            <div
              className="btn-close dlg-close"
              onClick={() => {
                updateLayerControl({ ...layerControlState, show: false });
                disableMapInteraction(false);
              }}
            >
              <SvgRoundClose />
            </div>{' '}
          </div>

          <div className="layer-control-contents">
            <div className="layer-control-item">
              <Accordion
                key={`metar-layer`}
                defaultExpanded={false}
                expanded={layerControlState.stationMarkersState.expanded}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.stationMarkersState.expanded =
                        !layerControlState.stationMarkersState.expanded;
                      updateLayerControl(clonedLayerControlState);
                    },
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        style={{ pointerEvents: 'none' }}
                        checked={layerControlState.stationMarkersState.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState) as LayerControlState;
                          cloned.stationMarkersState.checked = !layerControlState.stationMarkersState.checked;
                          updateLayerControl(cloned);
                          cloned.stationMarkersState.checked
                            ? showLayer(meteoLayers.metar, layerControlState.stationMarkersState.name)
                            : hideLayer(meteoLayers.metar, layerControlState.stationMarkersState.name);
                        }}
                      />
                    }
                    label={layerControlState.stationMarkersState.name}
                  />
                </AccordionSummary>
                <AccordionDetails>
                  <RadioGroup
                    value={layerControlState.stationMarkersState.markerType}
                    name="radio-buttons-group-metar"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      console.log('radio-buttons-group-metar');
                      map.closePopup();
                      const cloned = jsonClone(layerControlState) as LayerControlState;
                      cloned.stationMarkersState.markerType = e.target.value as StationMarkerType;
                      cloned.stationMarkersState.checked = true;
                      updateLayerControl(cloned);
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
                            selectedValue={layerControlState.stationMarkersState.usePersonalMinimums.routePointType}
                            description=""
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              map.closePopup();
                              const cloned = jsonClone(layerControlState) as LayerControlState;
                              cloned.stationMarkersState.usePersonalMinimums.routePointType = e.target
                                .value as RoutePointType;
                              cloned.stationMarkersState.checked = true;
                              updateLayerControl(cloned);
                            }}
                          />
                          <RadioButton
                            id={UsePersonalMinsLayerItems.enRoute.value}
                            value={UsePersonalMinsLayerItems.enRoute.value}
                            title={UsePersonalMinsLayerItems.enRoute.text}
                            disabled={
                              layerControlState.stationMarkersState.usePersonalMinimums.evaluationType === 'crosswind'
                            }
                            selectedValue={layerControlState.stationMarkersState.usePersonalMinimums.routePointType}
                            description=""
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              map.closePopup();
                              const cloned = jsonClone(layerControlState) as LayerControlState;
                              cloned.stationMarkersState.usePersonalMinimums.routePointType = e.target
                                .value as RoutePointType;
                              cloned.stationMarkersState.checked = true;
                              updateLayerControl(cloned);
                            }}
                          />
                          <RadioButton
                            id={UsePersonalMinsLayerItems.destination.value}
                            value={UsePersonalMinsLayerItems.destination.value}
                            title={UsePersonalMinsLayerItems.destination.text}
                            name="max_takeoff_weight_category"
                            selectedValue={layerControlState.stationMarkersState.usePersonalMinimums.routePointType}
                            description=""
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              map.closePopup();
                              const cloned = jsonClone(layerControlState) as LayerControlState;
                              cloned.stationMarkersState.usePersonalMinimums.routePointType = e.target
                                .value as RoutePointType;
                              cloned.stationMarkersState.checked = true;
                              updateLayerControl(cloned);
                            }}
                          />
                        </div>
                      </InputFieldWrapper>
                      <RadioGroup
                        value={layerControlState.stationMarkersState.usePersonalMinimums.evaluationType}
                        name="radio-group-personal-mins-eval"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          console.log('radio-group-personal-mins-eval');
                          map.closePopup();
                          const cloned = jsonClone(layerControlState) as LayerControlState;
                          cloned.stationMarkersState.usePersonalMinimums.evaluationType = e.target
                            .value as EvaluationType;
                          cloned.stationMarkersState.markerType = StationMarkersLayerItems.usePersonalMinimum
                            .value as StationMarkerType;
                          cloned.stationMarkersState.checked = true;
                          updateLayerControl(cloned);
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
                          control={
                            <Radio
                              color="primary"
                              disabled={
                                layerControlState.stationMarkersState.usePersonalMinimums.routePointType === 'en_route'
                              }
                            />
                          }
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
                            checked={layerControlState.stationMarkersState.flightCategory.all.checked}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              if (
                                layerControlState.stationMarkersState.markerType !==
                                StationMarkersLayerItems.flightCategory.value
                              ) {
                                return;
                              }
                              const cloned = jsonClone(layerControlState) as LayerControlState;
                              cloned.stationMarkersState.flightCategory.all.checked = true;
                              cloned.stationMarkersState.flightCategory.vfr.checked = true;
                              cloned.stationMarkersState.flightCategory.mvfr.checked = true;
                              cloned.stationMarkersState.flightCategory.ifr.checked = true;
                              cloned.stationMarkersState.flightCategory.lifr.checked = true;
                              cloned.stationMarkersState.markerType = StationMarkersLayerItems.flightCategory.value;
                              updateLayerControl(cloned);
                            }}
                          />
                        }
                        label={layerControlState.stationMarkersState.flightCategory.all.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerControlState.stationMarkersState.flightCategory.vfr.checked}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              if (
                                layerControlState.stationMarkersState.markerType !==
                                StationMarkersLayerItems.flightCategory.value
                              ) {
                                return;
                              }
                              const cloned = jsonClone(layerControlState) as LayerControlState;
                              cloned.stationMarkersState.flightCategory.vfr.checked =
                                !layerControlState.stationMarkersState.flightCategory.vfr.checked;
                              cloned.stationMarkersState.flightCategory.all.checked = isCheckedAllMetarFlightCategory(
                                cloned.stationMarkersState,
                              );
                              if (cloned.stationMarkersState.flightCategory.vfr.checked) {
                                cloned.stationMarkersState.markerType = StationMarkersLayerItems.flightCategory.value;
                              }
                              updateLayerControl(cloned);
                            }}
                          />
                        }
                        label={layerControlState.stationMarkersState.flightCategory.vfr.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerControlState.stationMarkersState.flightCategory.mvfr.checked}
                            value={StationMarkersLayerItems.flightCategory.value}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              if (
                                layerControlState.stationMarkersState.markerType !==
                                StationMarkersLayerItems.flightCategory.value
                              ) {
                                return;
                              }
                              const cloned = jsonClone(layerControlState) as LayerControlState;
                              cloned.stationMarkersState.flightCategory.mvfr.checked =
                                !layerControlState.stationMarkersState.flightCategory.mvfr.checked;
                              cloned.stationMarkersState.flightCategory.all.checked = isCheckedAllMetarFlightCategory(
                                cloned.stationMarkersState,
                              );
                              if (cloned.stationMarkersState.flightCategory.mvfr.checked) {
                                cloned.stationMarkersState.markerType = StationMarkersLayerItems.flightCategory.value;
                              }
                              updateLayerControl(cloned);
                            }}
                          />
                        }
                        label={layerControlState.stationMarkersState.flightCategory.mvfr.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerControlState.stationMarkersState.flightCategory.ifr.checked}
                            value={StationMarkersLayerItems.flightCategory.value}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              if (
                                layerControlState.stationMarkersState.markerType !==
                                StationMarkersLayerItems.flightCategory.value
                              ) {
                                return;
                              }
                              const cloned = jsonClone(layerControlState) as LayerControlState;
                              cloned.stationMarkersState.flightCategory.ifr.checked =
                                !layerControlState.stationMarkersState.flightCategory.ifr.checked;
                              cloned.stationMarkersState.flightCategory.all.checked = isCheckedAllMetarFlightCategory(
                                cloned.stationMarkersState,
                              );
                              if (cloned.stationMarkersState.flightCategory.ifr.checked) {
                                cloned.stationMarkersState.markerType = StationMarkersLayerItems.flightCategory.value;
                              }
                              updateLayerControl(cloned);
                            }}
                          />
                        }
                        label={layerControlState.stationMarkersState.flightCategory.ifr.name}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={layerControlState.stationMarkersState.flightCategory.lifr.checked}
                            value={StationMarkersLayerItems.flightCategory.value}
                            icon={<CircleUnchecked />}
                            checkedIcon={<CircleCheckedFilled />}
                            name="checkedB"
                            color="primary"
                            onClick={(_e) => {
                              if (
                                layerControlState.stationMarkersState.markerType !==
                                StationMarkersLayerItems.flightCategory.value
                              ) {
                                return;
                              }
                              const cloned = jsonClone(layerControlState) as LayerControlState;
                              cloned.stationMarkersState.flightCategory.lifr.checked =
                                !layerControlState.stationMarkersState.flightCategory.lifr.checked;
                              cloned.stationMarkersState.flightCategory.all.checked = isCheckedAllMetarFlightCategory(
                                cloned.stationMarkersState,
                              );
                              if (cloned.stationMarkersState.flightCategory.lifr.checked) {
                                cloned.stationMarkersState.markerType = StationMarkersLayerItems.flightCategory.value;
                              }
                              updateLayerControl(cloned);
                            }}
                          />
                        }
                        label={layerControlState.stationMarkersState.flightCategory.lifr.name}
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
              <Accordion key={`cwa-layer`} expanded={layerControlState.radarState.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.radarState.expanded = !layerControlState.radarState.expanded;
                      updateLayerControl(clonedLayerControlState);
                    },
                  }}
                >
                  <FormControlLabel
                    label={layerControlState.radarState.name}
                    control={
                      <Checkbox
                        checked={layerControlState.radarState.checked}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState) as LayerControlState;
                          cloned.radarState.checked = !layerControlState.radarState.checked;
                          updateLayerControl(cloned);
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.radarState.baseReflectivity.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState) as LayerControlState;
                          cloned.radarState.checked = true;
                          cloned.radarState.baseReflectivity.checked = true;
                          cloned.radarState.echoTopHeight.checked = false;
                          updateLayerControl(cloned);
                        }}
                      />
                    }
                    label={layerControlState.radarState.baseReflectivity.name}
                  />
                  {/* <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.radarState.echoTopHeight.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState) as LayerControlState;
                          cloned.radarState.checked = true;
                          cloned.radarState.baseReflectivity.checked = false;
                          cloned.radarState.echoTopHeight.checked = true;
                          updateLayerControl(cloned);
                        }}
                      />
                    }
                    label={layerControlState.radarState.echoTopHeight.name}
                  /> */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.radarState.forecastRadar.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState) as LayerControlState;
                          cloned.radarState.forecastRadar.checked = !layerControlState.radarState.forecastRadar.checked;
                          cloned.radarState.forecastRadar.checked
                            ? (cloned.radarState.checked = cloned.radarState.forecastRadar.checked)
                            : null;
                          updateLayerControl(cloned);
                        }}
                      />
                    }
                    label={layerControlState.radarState.forecastRadar.name}
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
                        value={layerControlState.radarState.opacity}
                        valueLabelDisplay="on"
                        marks={[
                          { value: 0, label: 0 },
                          { value: 100, label: 100 },
                        ]}
                        onChangeCommitted={(e: Event, newValue: number) => {
                          const cloned = jsonClone(layerControlState) as LayerControlState;
                          cloned.radarState.opacity = newValue;
                          updateLayerControl(cloned);
                        }}
                        onChange={(e: Event, newValue: number) => {
                          const cloned = jsonClone(layerControlState) as LayerControlState;
                          cloned.radarState.opacity = newValue;
                          updateLayerControl(cloned, false);
                        }}
                      />
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            </div>
            <div className="layer-control-item">
              <Accordion key={`sigmet-layer`} expanded={layerControlState.sigmetState.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.sigmetState.expanded = !layerControlState.sigmetState.expanded;
                      updateLayerControl(clonedLayerControlState);
                    },
                  }}
                >
                  <FormControlLabel
                    label={layerControlState.sigmetState.name}
                    control={
                      <Checkbox
                        checked={layerControlState.sigmetState.checked}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={() => {
                          // e.stopPropagation();
                          const cloned = jsonClone(layerControlState.sigmetState);
                          cloned.checked = !layerControlState.sigmetState.checked;
                          updateLayerControl({ ...layerControlState, sigmetState: cloned });
                          if (cloned.checked) {
                            showLayer(meteoLayers.sigmet, layerControlState.sigmetState.name);
                            if (layerControlState.sigmetState.outlooks.checked) {
                              showLayer(meteoLayers.convectiveOutlooks, layerControlState.sigmetState.outlooks.name);
                            }
                            if (layerControlState.sigmetState.international.checked) {
                              showLayer(meteoLayers.intlSigmet, layerControlState.sigmetState.international.name);
                            }
                          } else {
                            hideLayer(meteoLayers.sigmet, layerControlState.sigmetState.name);
                            hideLayer(meteoLayers.convectiveOutlooks, layerControlState.sigmetState.outlooks.name);
                            hideLayer(meteoLayers.intlSigmet, layerControlState.sigmetState.international.name);
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
                        checked={layerControlState.sigmetState.all.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={() => {
                          const cloned = jsonClone(layerControlState.sigmetState);
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
                          showLayer(meteoLayers.sigmet, layerControlState.sigmetState.name);
                          showLayer(meteoLayers.convectiveOutlooks, layerControlState.sigmetState.outlooks.name);
                          showLayer(meteoLayers.intlSigmet, layerControlState.sigmetState.international.name);
                          updateLayerControl({ ...layerControlState, sigmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.sigmetState.all.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.sigmetState.convection.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={() => {
                          const cloned = jsonClone(layerControlState.sigmetState);
                          cloned.convection.checked = !layerControlState.sigmetState.convection.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.convection.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, sigmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.sigmetState.convection.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.sigmetState.outlooks.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.sigmetState);
                          cloned.outlooks.checked = !layerControlState.sigmetState.outlooks.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.outlooks.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.convectiveOutlooks, layerControlState.sigmetState.outlooks.name);
                          } else {
                            hideLayer(meteoLayers.convectiveOutlooks, layerControlState.sigmetState.outlooks.name);
                          }
                          updateLayerControl({ ...layerControlState, sigmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.sigmetState.outlooks.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.sigmetState.turbulence.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.sigmetState);
                          cloned.turbulence.checked = !layerControlState.sigmetState.turbulence.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.turbulence.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, sigmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.sigmetState.turbulence.name}
                  />{' '}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.sigmetState.airframeIcing.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.sigmetState);
                          cloned.airframeIcing.checked = !layerControlState.sigmetState.airframeIcing.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.airframeIcing.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, sigmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.sigmetState.airframeIcing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.sigmetState.dust.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.sigmetState);
                          cloned.dust.checked = !layerControlState.sigmetState.dust.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.dust.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, sigmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.sigmetState.dust.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.sigmetState.ash.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.sigmetState);
                          cloned.ash.checked = !layerControlState.sigmetState.ash.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.ash.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, sigmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.sigmetState.ash.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.sigmetState.other.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.sigmetState);
                          cloned.other.checked = !layerControlState.sigmetState.other.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.other.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.sigmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, sigmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.sigmetState.other.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.sigmetState.international.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.sigmetState);
                          cloned.international.checked = !layerControlState.sigmetState.international.checked;
                          cloned.all.checked = isCheckedAllSigmets(cloned);
                          if (cloned.international.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.intlSigmet, layerControlState.sigmetState.international.name);
                          } else {
                            hideLayer(meteoLayers.intlSigmet, layerControlState.sigmetState.international.name);
                          }
                          updateLayerControl({ ...layerControlState, sigmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.sigmetState.international.name}
                  />
                </AccordionDetails>
              </Accordion>
            </div>
            <div className="layer-control-item">
              <Accordion key={`gairmet-layer`} expanded={layerControlState.gairmetState.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.gairmetState.expanded = !layerControlState.gairmetState.expanded;
                      updateLayerControl(clonedLayerControlState);
                    },
                  }}
                >
                  <FormControlLabel
                    label={layerControlState.gairmetState.name}
                    control={
                      <Checkbox
                        checked={layerControlState.gairmetState.checked}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.gairmetState);
                          cloned.checked = !layerControlState.gairmetState.checked;
                          updateLayerControl({ ...layerControlState, gairmetState: cloned });
                          cloned.checked
                            ? showLayer(meteoLayers.gairmet, layerControlState.gairmetState.name)
                            : hideLayer(meteoLayers.gairmet, layerControlState.gairmetState.name);
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.gairmetState.all.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={() => {
                          const cloned = jsonClone(layerControlState.gairmetState) as GairmetLayerState;
                          cloned.all.checked = true;
                          cloned.airframeIcing.checked = true;
                          cloned.multiFrzLevels.checked = true;
                          cloned.turbulenceHi.checked = true;
                          cloned.turbulenceLow.checked = true;
                          cloned.ifrConditions.checked = true;
                          cloned.mountainObscuration.checked = true;
                          cloned.nonconvectiveLlws.checked = true;
                          cloned.sfcWinds.checked = true;
                          showLayer(meteoLayers.gairmet, layerControlState.gairmetState.name);
                          updateLayerControl({ ...layerControlState, gairmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.gairmetState.all.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.gairmetState.airframeIcing.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.gairmetState);
                          cloned.airframeIcing.checked = !layerControlState.gairmetState.airframeIcing.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.airframeIcing.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, gairmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.gairmetState.airframeIcing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.gairmetState.multiFrzLevels.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.gairmetState);
                          cloned.multiFrzLevels.checked = !layerControlState.gairmetState.multiFrzLevels.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.multiFrzLevels.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, gairmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.gairmetState.multiFrzLevels.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.gairmetState.turbulenceHi.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.gairmetState);
                          cloned.turbulenceHi.checked = !layerControlState.gairmetState.turbulenceHi.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.turbulenceHi.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, gairmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.gairmetState.turbulenceHi.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.gairmetState.turbulenceLow.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.gairmetState);
                          cloned.turbulenceLow.checked = !layerControlState.gairmetState.turbulenceLow.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.turbulenceLow.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, gairmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.gairmetState.turbulenceLow.name}
                  />{' '}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.gairmetState.ifrConditions.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.gairmetState);
                          cloned.ifrConditions.checked = !layerControlState.gairmetState.ifrConditions.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.ifrConditions.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, gairmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.gairmetState.ifrConditions.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.gairmetState.mountainObscuration.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.gairmetState);
                          cloned.mountainObscuration.checked =
                            !layerControlState.gairmetState.mountainObscuration.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.mountainObscuration.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, gairmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.gairmetState.mountainObscuration.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.gairmetState.nonconvectiveLlws.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.gairmetState);
                          cloned.nonconvectiveLlws.checked = !layerControlState.gairmetState.nonconvectiveLlws.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.nonconvectiveLlws.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, gairmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.gairmetState.nonconvectiveLlws.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.gairmetState.sfcWinds.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.gairmetState);
                          cloned.sfcWinds.checked = !layerControlState.gairmetState.sfcWinds.checked;
                          cloned.all.checked = isCheckedAllGairmets(cloned);
                          if (cloned.sfcWinds.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.gairmet, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, gairmetState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.gairmetState.sfcWinds.name}
                  />
                </AccordionDetails>
              </Accordion>
            </div>
            <div className="layer-control-item">
              <Accordion key={`cwa-layer`} expanded={layerControlState.cwaState.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.cwaState.expanded = !layerControlState.cwaState.expanded;
                      updateLayerControl(clonedLayerControlState);
                    },
                  }}
                >
                  <FormControlLabel
                    label={layerControlState.cwaState.name}
                    control={
                      <Checkbox
                        checked={layerControlState.cwaState.checked}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.cwaState) as CwaLayerState;
                          cloned.checked = !layerControlState.cwaState.checked;
                          updateLayerControl({ ...layerControlState, cwaState: cloned });
                          cloned.checked
                            ? showLayer(meteoLayers.cwa, layerControlState.cwaState.name)
                            : hideLayer(meteoLayers.cwa, layerControlState.cwaState.name);
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.cwaState.all.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.cwaState) as CwaLayerState;
                          cloned.all.checked = true;
                          cloned.checked = true;
                          cloned.airframeIcing.checked = true;
                          cloned.turbulence.checked = true;
                          cloned.ifrConditions.checked = true;
                          cloned.convection.checked = true;
                          cloned.other.checked = true;
                          showLayer(meteoLayers.cwa, cloned.name);
                          updateLayerControl({ ...layerControlState, cwaState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.cwaState.all.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.cwaState.airframeIcing.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.cwaState) as CwaLayerState;
                          cloned.airframeIcing.checked = !layerControlState.cwaState.airframeIcing.checked;
                          cloned.all.checked = isCheckedAllCwa(cloned);
                          if (cloned.airframeIcing.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, cwaState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.cwaState.airframeIcing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.cwaState.turbulence.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.cwaState) as CwaLayerState;
                          cloned.turbulence.checked = !layerControlState.cwaState.turbulence.checked;
                          cloned.all.checked = isCheckedAllCwa(cloned);
                          if (cloned.turbulence.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, cwaState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.cwaState.turbulence.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.cwaState.ifrConditions.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.cwaState) as CwaLayerState;
                          cloned.ifrConditions.checked = !layerControlState.cwaState.ifrConditions.checked;
                          cloned.all.checked = isCheckedAllCwa(cloned);
                          if (cloned.ifrConditions.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, cwaState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.cwaState.ifrConditions.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.cwaState.convection.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.cwaState) as CwaLayerState;
                          cloned.convection.checked = !layerControlState.cwaState.convection.checked;
                          cloned.all.checked = isCheckedAllCwa(cloned);
                          if (cloned.convection.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, cwaState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.cwaState.convection.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.cwaState.other.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.cwaState) as CwaLayerState;
                          cloned.other.checked = !layerControlState.cwaState.other.checked;
                          cloned.all.checked = isCheckedAllCwa(cloned);
                          if (cloned.other.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.cwa, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, cwaState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.cwaState.other.name}
                  />
                </AccordionDetails>
              </Accordion>
            </div>
            <div className="layer-control-item">
              <Accordion key={`pirep-layer`} expanded={layerControlState.pirepState.expanded}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  IconButtonProps={{
                    onClick: () => {
                      const clonedLayerControlState = getLayerControlStateWithAllClosed();
                      clonedLayerControlState.pirepState.expanded = !layerControlState.pirepState.expanded;
                      updateLayerControl(clonedLayerControlState);
                    },
                  }}
                >
                  <FormControlLabel
                    label={layerControlState.pirepState.name}
                    control={
                      <Checkbox
                        checked={layerControlState.pirepState.checked}
                        style={{ pointerEvents: 'none' }}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.pirepState);
                          cloned.checked = !layerControlState.pirepState.checked;
                          updateLayerControl({ ...layerControlState, pirepState: cloned });
                          cloned.checked
                            ? showLayer(meteoLayers.pirep, layerControlState.pirepState.name)
                            : hideLayer(meteoLayers.pirep, layerControlState.pirepState.name);
                        }}
                      />
                    }
                  />
                </AccordionSummary>
                <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.pirepState.urgentOnly.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.pirepState);
                          cloned.urgentOnly.checked = !layerControlState.pirepState.urgentOnly.checked;
                          if (cloned.urgentOnly.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, pirepState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.pirepState.urgentOnly.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.pirepState.all.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.pirepState) as PirepLayerState;
                          cloned.all.checked = true;
                          cloned.checked = true;
                          cloned.icing.checked = true;
                          cloned.turbulence.checked = true;
                          cloned.weatherSky.checked = true;
                          showLayer(meteoLayers.pirep, cloned.name);
                          updateLayerControl({ ...layerControlState, pirepState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.pirepState.all.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.pirepState.icing.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.pirepState);
                          cloned.icing.checked = !layerControlState.pirepState.icing.checked;
                          cloned.all.checked = isCheckedAllPirep(cloned);
                          if (cloned.icing.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, pirepState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.pirepState.icing.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.pirepState.turbulence.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.pirepState);
                          cloned.turbulence.checked = !layerControlState.pirepState.turbulence.checked;
                          cloned.all.checked = isCheckedAllPirep(cloned);
                          if (cloned.turbulence.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, pirepState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.pirepState.turbulence.name}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={layerControlState.pirepState.weatherSky.checked}
                        icon={<CircleUnchecked />}
                        checkedIcon={<CircleCheckedFilled />}
                        name="checkedB"
                        color="primary"
                        onClick={(_e) => {
                          const cloned = jsonClone(layerControlState.pirepState);
                          cloned.weatherSky.checked = !layerControlState.pirepState.weatherSky.checked;
                          cloned.all.checked = isCheckedAllPirep(cloned);
                          if (cloned.weatherSky.checked) {
                            cloned.checked = true;
                            showLayer(meteoLayers.pirep, cloned.name);
                          }
                          updateLayerControl({ ...layerControlState, pirepState: cloned });
                        }}
                      />
                    }
                    label={layerControlState.pirepState.weatherSky.name}
                  />
                  <div className="pirep-slider">
                    <div className="title">
                      <div className="label">{layerControlState.pirepState.altitude.name}</div>
                      <div className="all-check">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={layerControlState.pirepState.altitude.all}
                              icon={<CircleUnchecked />}
                              checkedIcon={<CircleCheckedFilled />}
                              name="checkedB"
                              color="primary"
                              onChange={(_e) => {
                                const cloned = jsonClone(layerControlState.pirepState) as PirepLayerState;
                                cloned.altitude.valueMin = cloned.altitude.min;
                                cloned.altitude.valueMax = cloned.altitude.max;
                                cloned.altitude.all = true;
                                updateLayerControl({ ...layerControlState, pirepState: cloned });
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
                        min={layerControlState.pirepState.altitude.min}
                        max={layerControlState.pirepState.altitude.max}
                        step={5}
                        value={[
                          layerControlState.pirepState.altitude.valueMin,
                          layerControlState.pirepState.altitude.valueMax,
                        ]}
                        mindistance={20}
                        onChange={(_e: Event, newValues: number[]) => {
                          if (!Array.isArray(newValues)) {
                            return;
                          }
                          const cloned = jsonClone(layerControlState.pirepState) as PirepLayerState;
                          cloned.altitude.valueMin = newValues[0];
                          cloned.altitude.valueMax = newValues[1];
                          if (newValues[0] === cloned.altitude.min && newValues[1] === cloned.altitude.max) {
                            cloned.altitude.all = true;
                          } else {
                            cloned.altitude.all = false;
                          }
                          updateLayerControl({ ...layerControlState, pirepState: cloned }, false);
                        }}
                        onChangeCommitted={(_e: Event, newValues: number[]) => {
                          if (!Array.isArray(newValues)) {
                            return;
                          }
                          const cloned = jsonClone(layerControlState.pirepState) as PirepLayerState;
                          cloned.altitude.valueMin = newValues[0];
                          cloned.altitude.valueMax = newValues[1];
                          if (newValues[0] === cloned.altitude.min && newValues[1] === cloned.altitude.max) {
                            cloned.altitude.all = true;
                          } else {
                            cloned.altitude.all = false;
                          }
                          updateLayerControl({ ...layerControlState, pirepState: cloned });
                        }}
                        valueLabelDisplay="on"
                        component={null}
                      />
                    </div>
                  </div>
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
