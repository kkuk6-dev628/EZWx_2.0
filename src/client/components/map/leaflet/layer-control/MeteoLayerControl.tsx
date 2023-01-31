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

  useEffect(() => {
    if (ref?.current) {
      DomEvent.disableClickPropagation(ref.current);
    }
  }, []);

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
              <Accordion key={`metar-layer`} defaultExpanded={false}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
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
              <Accordion key={`sigmet-layer`} defaultExpanded={false}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
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
                              convection: {
                                name: layerStatus.sigmetState.all.name,
                                visible: !layerStatus.sigmetState.all.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.convection,
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
                          dispatch(
                            setSigmet({
                              ...layerStatus.sigmetState,
                              convection: {
                                name: layerStatus.sigmetState.convection.name,
                                visible:
                                  !layerStatus.sigmetState.convection.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            meteoLayers.convection,
                            layerStatus.sigmetState.convection as any,
                          );
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
                          dispatch(
                            setSigmet({
                              ...layerStatus.sigmetState,
                              outlooks: {
                                name: layerStatus.sigmetState.outlooks.name,
                                visible:
                                  !layerStatus.sigmetState.outlooks.visible,
                              },
                            }),
                          );
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
                          dispatch(
                            setSigmet({
                              ...layerStatus.sigmetState,
                              turbulence: {
                                name: layerStatus.sigmetState.turbulence.name,
                                visible:
                                  !layerStatus.sigmetState.turbulence.visible,
                              },
                            }),
                          );
                          onLayerClick(
                            null,
                            layerStatus.sigmetState.turbulence as any,
                          );
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
                          onLayerClick(
                            null,
                            layerStatus.sigmetState.airframeIcing as any,
                          );
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
                          onLayerClick(
                            null,
                            layerStatus.sigmetState.dust as any,
                          );
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
                          onLayerClick(
                            null,
                            layerStatus.sigmetState.ash as any,
                          );
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
                          onLayerClick(
                            null,
                            layerStatus.sigmetState.other as any,
                          );
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
