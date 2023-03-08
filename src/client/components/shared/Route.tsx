/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineClose, AiOutlineCloseCircle } from 'react-icons/ai';
import { BsBookmarkPlus } from 'react-icons/bs';
import { AiOutlineMinus } from 'react-icons/ai';
import { SvgBin, SvgLeftRight } from '../utils/SvgIcons';
import Switch from 'react-switch';
import { AutoCompleteInput, Modal, MultiSelectInput, PrimaryButton, SecondaryButton } from '../common/index';
import { selectActiveRoute } from '../../store/route/routes';
import { useMap } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { addRouteToMap, isSameRoutes, validateRoute } from '../map/common/AreoFunctions';
import { useCreateRouteMutation, useDeleteRouteMutation } from '../../store/route/routeApi';
import { Route, RoutePoint } from '../../interfaces/route';
import { useMeteoLayersContext } from '../map/leaflet/layer-control/MeteoLayerControlContext';
import 'leaflet-arc';

interface Props {
  setIsShowModal: (isShowModal: boolean) => void;
}

const DEPARTURE = 'departure';
const ROUTE_OF_FLIGHT = 'routeOfFlight';
const DESTINATION = 'destination';
const altitudeStep = 500;

const emptyFormData: Route = {
  departure: null,
  routeOfFlight: [],
  destination: null,
  altitude: 10000,
  useForecastWinds: false,
};

function Route({ setIsShowModal }: Props) {
  const map = useMap();
  const activeRoute = useSelector(selectActiveRoute);
  const [createRoute] = useCreateRouteMutation();
  const [deleteRoute] = useDeleteRouteMutation();
  const [routeData, setRouteData] = useState(activeRoute || emptyFormData);
  const ref = useRef();
  const meteoLayers = useMeteoLayersContext();
  const [forceRerenderKey, setForceRerenderKey] = useState(Date.now());
  const [isShowDeleteRouteModal, setIsShowDeleteRouteModal] = useState(false);

  useEffect(() => {
    // L.DomEvent.disableClickPropagation(ref.current);
    // L.DomEvent.disableScrollPropagation(ref.current);
    // L.DomEvent.on(ref.current, 'mousemove contextmenu', L.DomEvent.stop);
    if (!meteoLayers.routeGroupLayer) {
      const groupLayer = new L.LayerGroup();
      map.addLayer(groupLayer);
      meteoLayers.routeGroupLayer = groupLayer;
      if (activeRoute) {
        addRouteToMap(routeData, meteoLayers.routeGroupLayer);
      }
    }
  }, []);

  useEffect(() => {
    if (activeRoute) {
      setRouteData(activeRoute);
    }
  }, [activeRoute]);

  const handleUseForecastWindsChange = () => {
    setRouteData({ ...routeData, useForecastWinds: !routeData.useForecastWinds });
  };

  const handleAutoComplete = (name: string, val: RoutePoint) => {
    setRouteData({
      ...routeData,
      [name]: val,
    });
  };
  const handleMultiSelectInsertion = (name: string, val: RoutePoint[]) => {
    setRouteData({
      ...routeData,
      [name]: val,
    });
  };
  const handleClickOpenInMap = () => {
    if (validateRoute(routeData)) {
      addRoute();
      setIsShowModal(false);
    }
  };
  const handleClickOpenInProfile = () => {
    if (validateRoute(routeData)) {
      addRoute();
    }
  };
  const handleClickDelete = () => {
    setIsShowDeleteRouteModal(true);
  };
  const handleClickReverse = () => {
    setRouteData({
      ...routeData,
      departure: routeData.destination,
      destination: routeData.departure,
      routeOfFlight: [...routeData.routeOfFlight].reverse(),
    });
  };
  const handleClickClear = () => {
    setRouteData(emptyFormData);
    setForceRerenderKey(Date.now());
  };

  const addRoute = () => {
    addRouteToMap(routeData, meteoLayers.routeGroupLayer);
    if (isSameRoutes(routeData, activeRoute)) {
      return;
    }
    createRoute(routeData);
  };

  const deleteActiveRoute = () => {
    meteoLayers.routeGroupLayer.clearLayers();
    deleteRoute(activeRoute.id);
    handleClickClear();
  };

  return (
    <div className="route-editor" ref={ref}>
      <div className="route-editor__wrp">
        <div className="route-editor__top">
          <p className="route-editor__top__text text">Enter/Edit/Delete route</p>
          <button onClick={() => setIsShowModal(false)} className="route-editor__top__close" type="button">
            <AiOutlineClose className="route-editor__icon" />
          </button>
        </div>
        <div className="route-editor__content">
          <div className="route-editor__content__top">
            <div className="route-editor__tabs">
              <button className="route-editor__tab" type="button" onClick={handleClickDelete}>
                <SvgBin />
                <p className="route-editor__tab__text text">Delete</p>
              </button>
              <button className="route-editor__tab" type="button" onClick={handleClickReverse}>
                <SvgLeftRight />
                <p className="route-editor__tab__text text">Reverse</p>
              </button>
              <button className="route-editor__tab" type="button" onClick={handleClickClear}>
                <AiOutlineCloseCircle className="route-editor__icon" />
                <p className="route-editor__tab__text text">Clear</p>
              </button>
              <button className="route-editor__tab" type="button">
                <BsBookmarkPlus className="route-editor__icon" />
                <p className="route-editor__tab__text text">Add to saved</p>
              </button>
            </div>
            <form action="" className="route-editor__form">
              <div className="route-editor__input__grp">
                <label htmlFor="route-name" className="route-editor__label text">
                  Departure*
                </label>
                <AutoCompleteInput
                  name={DEPARTURE}
                  selectedValue={routeData[DEPARTURE]}
                  handleAutoComplete={handleAutoComplete}
                  key={'departure-' + forceRerenderKey}
                  // handleCloseSuggestion={handleCloseSuggestion}
                  // showSuggestion={formData[DEPARTURE_SUGGESTION]}
                />
              </div>

              <div className="route-editor__input__grp">
                <label htmlFor="route-flight" className="route-editor__label text">
                  Route of Flight
                </label>
                <MultiSelectInput
                  name={ROUTE_OF_FLIGHT}
                  selectedValues={routeData[ROUTE_OF_FLIGHT]}
                  handleAutoComplete={handleMultiSelectInsertion}
                  key={'path-' + forceRerenderKey}
                />
              </div>

              <div className="route-editor__input__grp">
                <label htmlFor="route-destination" className="route-editor__label text">
                  Destination*
                </label>
                <AutoCompleteInput
                  name={DESTINATION}
                  selectedValue={routeData[DESTINATION]}
                  handleAutoComplete={handleAutoComplete}
                  key={'destination-' + forceRerenderKey}
                  // handleCloseSuggestion={handleCloseSuggestion}
                  // showSuggestion={formData[DESTINATION_SUGGESTION]}
                />
              </div>

              <div className="route-editor__swd">
                <div className="route-editor__numin__area">
                  <label htmlFor="route-numin" className="route-editor__label text">
                    Altitude (MSL)*
                  </label>
                  <div className="route-editor__numin">
                    <span
                      className="route-editor__lft"
                      onClick={() => {
                        let newValue = routeData.altitude - altitudeStep;
                        if (newValue < 0) {
                          newValue = 0;
                        }
                        setRouteData({ ...routeData, altitude: newValue });
                      }}
                    >
                      <AiOutlineMinus className="route-editor__icon--mi" />
                    </span>
                    <input
                      type="number"
                      className="route-editor__input__num"
                      id="route-numin"
                      value={routeData.altitude}
                      onChange={(e) => {
                        let newValue = parseInt(e.currentTarget.value);
                        if (newValue > 45000) {
                          newValue = 45000;
                        } else if (newValue < 0) {
                          newValue = 0;
                        }
                        setRouteData({ ...routeData, altitude: newValue });
                      }}
                      placeholder="0"
                    />
                    <span
                      className="route-editor__rgt"
                      onClick={() => {
                        let newValue = routeData.altitude + altitudeStep;
                        if (newValue > 45000) {
                          newValue = 45000;
                        }
                        setRouteData({ ...routeData, altitude: newValue });
                      }}
                    >
                      +
                    </span>
                  </div>
                </div>
                <div className="use-forcast">
                  <label className="route-editor__label text" htmlFor="">
                    Use Forecast Winds
                  </label>
                  <Switch
                    checked={routeData.useForecastWinds}
                    onChange={handleUseForecastWindsChange}
                    onColor="#EED8FF"
                    onHandleColor="#3F0C69"
                    offColor="#fff"
                    handleDiameter={32}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={40}
                    width={80}
                    className="react-switch"
                    id="material-switch"
                  />
                </div>
              </div>
            </form>
            <div className="route-editor__btn__grp">
              <button className="route-editor__btn--btm" type="button" onClick={handleClickOpenInMap}>
                Open in Map
              </button>
              <button className="route-editor__btn--btm" type="button" onClick={handleClickOpenInProfile}>
                Open in Profile
              </button>
            </div>
            <p className="route-editor__txt">* Required field</p>
          </div>
        </div>
      </div>
      <Modal
        open={isShowDeleteRouteModal}
        handleClose={() => setIsShowDeleteRouteModal(false)}
        title="Delete route confirmation"
        description="Are you sure you want to delete the active route?"
        footer={
          <>
            <SecondaryButton onClick={() => setIsShowDeleteRouteModal(false)} text="No" isLoading={false} />
            <PrimaryButton text="Yes" onClick={() => deleteActiveRoute()} isLoading={false} />
          </>
        }
      />
    </div>
  );
}

export default Route;
