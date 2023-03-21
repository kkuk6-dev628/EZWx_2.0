import { DomEvent, Layer } from 'leaflet';
import { createContext, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { selectBaseMapLayerControl, setBaseMapLayerControl } from '../../../../store/layers/BaseMapLayerControl';
import { POSITION_CLASSES } from '../../common/AreoConstants';
import { FormControlLabel, Checkbox } from '@material-ui/core';
import CircleCheckedFilled from '@material-ui/icons/CheckCircle';
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';
import { jsonClone } from '../../../utils/ObjectUtil';
import { useBaseMapLayersContext } from './BaseMapLayerControlContext';
import { BaseMapLayerControlState } from '../../../../interfaces/layerControl';
import {
  useGetBaseLayerControlStateQuery,
  useUpdateBaseLayerControlStateMutation,
} from '../../../../store/layers/layerControlApi';
import { selectAuth } from '../../../../store/auth/authSlice';

export const InBaseLayerControl = createContext<{ value: boolean }>({
  value: false,
});

const BaseMapLayerControl = ({ position, children }: { children?: ReactElement[]; position: string }) => {
  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;

  const ref = useRef<HTMLDivElement>();
  const dispatch = useDispatch();
  const baseMapLayers = useBaseMapLayersContext();
  const baseMapLayerStatus = useSelector(selectBaseMapLayerControl);
  const [updateBaseLayerControlState] = useUpdateBaseLayerControlStateMutation();
  const auth = useSelector(selectAuth);
  const { data: serverData } = useGetBaseLayerControlStateQuery('');

  useEffect(() => {
    if (serverData) map.fitBounds(serverData.bounds);
  }, [serverData]);

  const map = useMapEvent('moveend', (event) => {
    if (auth.id) {
      const bounds = map.getBounds();
      updateBaseLayerControlState({
        ...baseMapLayerStatus,
        bounds: [
          [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
          [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        ],
      });
    }
  });

  const showLayer = (layerObj: Layer) => {
    map.closePopup();
    if (!layerObj) return;
    if (!map?.hasLayer(layerObj)) {
      map.addLayer(layerObj);
    }
  };

  const hideLayer = (layerObj: Layer) => {
    map.closePopup();
    if (!layerObj) return;
    if (map?.hasLayer(layerObj)) {
      map.removeLayer(layerObj);
    }
  };

  const inLayerControl = useContext(InBaseLayerControl);

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

  const uncheckAllTileLayers = (clonedBaseMapLayerStatus: BaseMapLayerControlState): BaseMapLayerControlState => {
    clonedBaseMapLayerStatus.streetState.checked = false;
    clonedBaseMapLayerStatus.topoState.checked = false;
    clonedBaseMapLayerStatus.terrainState.checked = false;
    clonedBaseMapLayerStatus.darkState.checked = false;
    clonedBaseMapLayerStatus.satelliteState.checked = false;
    hideLayer(baseMapLayers.street);
    hideLayer(baseMapLayers.topo);
    hideLayer(baseMapLayers.terrain);
    hideLayer(baseMapLayers.dark);
    hideLayer(baseMapLayers.satellite);
    return clonedBaseMapLayerStatus;
  };

  const uncheckAllBoundaryLayers = (clonedBaseMapLayerStatus: BaseMapLayerControlState): BaseMapLayerControlState => {
    clonedBaseMapLayerStatus.usProvincesState.checked = false;
    clonedBaseMapLayerStatus.countryWarningAreaState.checked = false;
    hideLayer(baseMapLayers.usProvinces);
    hideLayer(baseMapLayers.countyWarningAreas);
    return clonedBaseMapLayerStatus;
  };

  const setBaseLayerControlState = (cloned: BaseMapLayerControlState, commit = true) => {
    if (commit && auth.id) updateBaseLayerControlState(cloned);
    dispatch(setBaseMapLayerControl(cloned));
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

  useEffect(() => {
    if (ref?.current) {
      if (isMobile) {
        DomEvent.disableClickPropagation(ref.current);
      } else {
        ref.current.addEventListener('mouseover', function () {
          disableMapInteraction(true);
        });
        // Re-enable dragging when user's cursor leaves the element
        ref.current.addEventListener('mouseout', function () {
          disableMapInteraction(false);
        });
      }
      DomEvent.disableScrollPropagation(ref.current);
      // L.DomEvent.on(ref.current, 'mousemove contextmenu drag', L.DomEvent.stop);
    }
  }, [ref?.current]);

  return (
    <div className={positionClass + ' layer-control-container'} ref={ref}>
      {baseMapLayerStatus.show && (
        <div id="layer-control" className="leaflet-control leaflet-bar layer-control">
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
          <div
            className="btn-close"
            onClick={() => {
              dispatch(setBaseMapLayerControl({ ...baseMapLayerStatus, show: false }));
              disableMapInteraction(false);
            }}
          >
            <i className="fa-regular fa-circle-xmark"></i>
          </div>
          <div className="layer-control-contents">
            <div className="layer-control-item" style={{ marginLeft: 12, paddingLeft: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={baseMapLayerStatus.usProvincesState.checked}
                    icon={<CircleUnchecked />}
                    checkedIcon={<CircleCheckedFilled />}
                    name="checkedB"
                    color="primary"
                    onClick={(_e) => {
                      let cloned = jsonClone(baseMapLayerStatus) as BaseMapLayerControlState;
                      cloned = uncheckAllBoundaryLayers(cloned);
                      cloned.usProvincesState.checked = !baseMapLayerStatus.usProvincesState.checked;
                      setBaseLayerControlState(cloned);
                      cloned.usProvincesState.checked
                        ? showLayer(baseMapLayers.usProvinces)
                        : hideLayer(baseMapLayers.usProvinces);
                    }}
                  />
                }
                label={baseMapLayerStatus.usProvincesState.name}
              />
            </div>
            <div className="layer-control-item" style={{ marginLeft: 12, paddingLeft: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={baseMapLayerStatus.canadianProvincesState.checked}
                    icon={<CircleUnchecked />}
                    checkedIcon={<CircleCheckedFilled />}
                    name="checkedB"
                    color="primary"
                    onClick={(_e) => {
                      const cloned = jsonClone(baseMapLayerStatus) as BaseMapLayerControlState;
                      cloned.canadianProvincesState.checked = !baseMapLayerStatus.canadianProvincesState.checked;
                      setBaseLayerControlState(cloned);
                      cloned.canadianProvincesState.checked
                        ? showLayer(baseMapLayers.canadianProvinces)
                        : hideLayer(baseMapLayers.canadianProvinces);
                    }}
                  />
                }
                label={baseMapLayerStatus.canadianProvincesState.name}
              />
            </div>
            <div className="layer-control-item" style={{ marginLeft: 12, paddingLeft: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={baseMapLayerStatus.countryWarningAreaState.checked}
                    icon={<CircleUnchecked />}
                    checkedIcon={<CircleCheckedFilled />}
                    name="checkedB"
                    color="primary"
                    onClick={(_e) => {
                      let cloned = jsonClone(baseMapLayerStatus) as BaseMapLayerControlState;
                      cloned = uncheckAllBoundaryLayers(cloned);
                      cloned.countryWarningAreaState.checked = !baseMapLayerStatus.countryWarningAreaState.checked;
                      setBaseLayerControlState(cloned);
                      cloned.countryWarningAreaState.checked
                        ? showLayer(baseMapLayers.countyWarningAreas)
                        : hideLayer(baseMapLayers.countyWarningAreas);
                    }}
                  />
                }
                label={baseMapLayerStatus.countryWarningAreaState.name}
              />
            </div>
            <div className="layer-control-item" style={{ marginLeft: 12, paddingLeft: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={baseMapLayerStatus.streetState.checked}
                    icon={<CircleUnchecked />}
                    checkedIcon={<CircleCheckedFilled />}
                    name="checkedB"
                    color="primary"
                    onClick={(_e) => {
                      let cloned = jsonClone(baseMapLayerStatus) as BaseMapLayerControlState;
                      cloned = uncheckAllTileLayers(cloned);
                      cloned.streetState.checked = !baseMapLayerStatus.streetState.checked;
                      setBaseLayerControlState(cloned);
                      cloned.streetState.checked ? showLayer(baseMapLayers.street) : hideLayer(baseMapLayers.street);
                    }}
                  />
                }
                label={baseMapLayerStatus.streetState.name}
              />
            </div>
            <div className="layer-control-item" style={{ marginLeft: 12, paddingLeft: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={baseMapLayerStatus.topoState.checked}
                    icon={<CircleUnchecked />}
                    checkedIcon={<CircleCheckedFilled />}
                    name="checkedB"
                    color="primary"
                    onClick={(_e) => {
                      let cloned = jsonClone(baseMapLayerStatus) as BaseMapLayerControlState;
                      cloned = uncheckAllTileLayers(cloned);
                      cloned.topoState.checked = !baseMapLayerStatus.topoState.checked;
                      setBaseLayerControlState(cloned);
                      cloned.topoState.checked ? showLayer(baseMapLayers.topo) : hideLayer(baseMapLayers.topo);
                    }}
                  />
                }
                label={baseMapLayerStatus.topoState.name}
              />
            </div>
            <div className="layer-control-item" style={{ marginLeft: 12, paddingLeft: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={baseMapLayerStatus.terrainState.checked}
                    icon={<CircleUnchecked />}
                    checkedIcon={<CircleCheckedFilled />}
                    name="checkedB"
                    color="primary"
                    onClick={(_e) => {
                      let cloned = jsonClone(baseMapLayerStatus) as BaseMapLayerControlState;
                      cloned = uncheckAllTileLayers(cloned);
                      cloned.terrainState.checked = !baseMapLayerStatus.terrainState.checked;
                      setBaseLayerControlState(cloned);
                      cloned.terrainState.checked ? showLayer(baseMapLayers.terrain) : hideLayer(baseMapLayers.terrain);
                    }}
                  />
                }
                label={baseMapLayerStatus.terrainState.name}
              />
            </div>
            <div className="layer-control-item" style={{ marginLeft: 12, paddingLeft: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={baseMapLayerStatus.darkState.checked}
                    icon={<CircleUnchecked />}
                    checkedIcon={<CircleCheckedFilled />}
                    name="checkedB"
                    color="primary"
                    onClick={(_e) => {
                      let cloned = jsonClone(baseMapLayerStatus) as BaseMapLayerControlState;
                      cloned = uncheckAllTileLayers(cloned);
                      cloned.darkState.checked = !baseMapLayerStatus.darkState.checked;
                      setBaseLayerControlState(cloned);
                      cloned.darkState.checked ? showLayer(baseMapLayers.dark) : hideLayer(baseMapLayers.dark);
                    }}
                  />
                }
                label={baseMapLayerStatus.darkState.name}
              />
            </div>
            <div className="layer-control-item" style={{ marginLeft: 12, paddingLeft: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={baseMapLayerStatus.satelliteState.checked}
                    icon={<CircleUnchecked />}
                    checkedIcon={<CircleCheckedFilled />}
                    name="checkedB"
                    color="primary"
                    onClick={(_e) => {
                      let cloned = jsonClone(baseMapLayerStatus) as BaseMapLayerControlState;
                      cloned = uncheckAllTileLayers(cloned);
                      cloned.satelliteState.checked = !baseMapLayerStatus.satelliteState.checked;
                      setBaseLayerControlState(cloned);
                      cloned.satelliteState.checked
                        ? showLayer(baseMapLayers.satellite)
                        : hideLayer(baseMapLayers.satellite);
                    }}
                  />
                }
                label={baseMapLayerStatus.satelliteState.name}
              />
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default BaseMapLayerControl;
