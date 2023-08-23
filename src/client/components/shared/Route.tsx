/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineClose, AiOutlineCloseCircle, AiOutlineHeart } from 'react-icons/ai';
import { BsBookmarkPlus, BsFolderPlus } from 'react-icons/bs';
import { AiOutlineMinus } from 'react-icons/ai';
import { SvgBin, SvgLeftRight } from '../utils/SvgIcons';
import Switch from 'react-switch';
import { AutoCompleteInput, Modal, MultiSelectInput, PrimaryButton, SecondaryButton } from '../common/index';
import { selectActiveRoute, setActiveRoute } from '../../store/route/routes';
import { useSelector } from 'react-redux';
import { isSameRoutes, validateRoute } from '../map/common/AreoFunctions';
import { useCreateRouteMutation, useDeleteRouteMutation } from '../../store/route/routeApi';
import { Route, RouteOfFlight, RoutePoint } from '../../interfaces/route';
import { useMeteoLayersContext } from '../map/leaflet/layer-control/MeteoLayerControlContext';
import 'leaflet-arc';
import { Button } from '@mui/material';
import MultipleSelect from './MultipleSelect';
import DialogTitle from '@mui/material/DialogTitle';
import { useRouter } from 'next/router';

interface Props {
  setIsShowModal: (isShowModal: boolean) => void;
}

const DEPARTURE = 'departure';
const ROUTE_OF_FLIGHT = 'routeOfFlight';
const DESTINATION = 'destination';
const altitudeStep = 500;

const emptyFormData: Route = {
  id: undefined,
  departure: null,
  routeOfFlight: [],
  destination: null,
  altitude: 10000,
  useForecastWinds: false,
};

export const addRouteToMap = (route: Route, routeGroupLayer: L.LayerGroup) => {
  if (!routeGroupLayer) {
    return;
  }
  const coordinateList = [
    route.departure.position.coordinates,
    ...route.routeOfFlight.map((item) => item.routePoint.position.coordinates),
    route.destination.position.coordinates,
  ];
  routeGroupLayer.clearLayers();
  const latlngs: L.LatLng[] = L.GeoJSON.coordsToLatLngs(coordinateList);
  latlngs.reduce((a, b) => {
    if (a.lat !== b.lat || a.lng !== b.lng) {
      //@ts-ignore
      const polyline = L.Polyline.Arc(a, b, { color: '#f0fa', weight: 6, pane: 'route-line', vertices: 20 });
      routeGroupLayer.addLayer(polyline);
    }
    return b;
  });
  [route.departure, ...route.routeOfFlight.map((item) => item.routePoint), route.destination].forEach((routePoint) => {
    const marker = L.marker(L.GeoJSON.coordsToLatLng(routePoint.position.coordinates as any), {
      icon: new L.DivIcon({
        className: 'route-label',
        html: routePoint.key,
        iconAnchor: [routePoint.key.length > 4 ? 64 : 54, routePoint.type !== 'waypoint' ? 20 : 10],
        iconSize: [routePoint.key.length > 4 ? 60 : 50, 20],
      }),
      pane: 'route-label',
    });
    routeGroupLayer.addLayer(marker);
  });
};

function Route({ setIsShowModal }: Props) {
  const activeRoute = useSelector(selectActiveRoute);
  const [createRoute] = useCreateRouteMutation();
  const [deleteRoute] = useDeleteRouteMutation();
  const [routeData, setRouteData] = useState(activeRoute || emptyFormData);
  const ref = useRef();
  const meteoLayers = useMeteoLayersContext();
  const [forceRerenderKey, setForceRerenderKey] = useState(Date.now());
  const [isShowDeleteRouteModal, setIsShowDeleteRouteModal] = useState(false);
  const [isShowSaveRouteModal, setIsShowSaveRouteModal] = useState(false);
  const [isShowErrorRouteModal, setIsShowErrorRouteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [altitudeText, setAltitudeText] = useState(routeData.altitude.toLocaleString());
  const router = useRouter();

  useEffect(() => {
    // L.DomEvent.disableClickPropagation(ref.current);
    // L.DomEvent.disableScrollPropagation(ref.current);
    // L.DomEvent.on(ref.current, 'mousemove contextmenu', L.DomEvent.stop);
  }, []);

  useEffect(() => {
    if (activeRoute) {
      setRouteData(activeRoute);
    }
  }, [activeRoute]);

  useEffect(() => {
    const newValue = parseInt(altitudeText.replace(/\D+/g, ''));
    setRouteData({ ...routeData, altitude: newValue });
  }, [altitudeText]);

  const handleUseForecastWindsChange = () => {
    setRouteData({ ...routeData, useForecastWinds: !routeData.useForecastWinds });
  };

  const handleAutoComplete = (name: string, val: RoutePoint) => {
    setRouteData({
      ...routeData,
      [name]: val,
    });
  };
  const handleMultiSelectInsertion = (name: string, val: RouteOfFlight[]) => {
    setRouteData({
      ...routeData,
      [name]: val,
    });
  };
  const handleClickOpenInMap = () => {
    const validity = validateRoute(routeData);
    if (validity === true) {
      addRoute();
      setIsShowModal(false);
      router.push('/map');
    } else {
      setErrorMessage(validity as string);
      setIsShowErrorRouteModal(true);
    }
  };
  const handleClickOpenInProfile = () => {
    const validity = validateRoute(routeData);
    if (validity === true) {
      addRoute();
      setIsShowModal(false);
      router.push('/route-profile');
    } else {
      setErrorMessage(validity as string);
      setIsShowErrorRouteModal(true);
    }
  };
  const handleClickDelete = () => {
    setIsShowDeleteRouteModal(true);
  };
  const handleClickReverse = () => {
    setForceRerenderKey(Date.now());
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
    setAltitudeText(emptyFormData.altitude.toLocaleString());
  };

  const addRoute = () => {
    addRouteToMap(routeData, meteoLayers.routeGroupLayer);
    if (isSameRoutes(routeData, activeRoute)) {
      return;
    }
    setActiveRoute(routeData);
    createRoute(routeData);
  };

  const deleteActiveRoute = () => {
    meteoLayers.routeGroupLayer.clearLayers();
    deleteRoute(activeRoute.id);
    setIsShowDeleteRouteModal(false);
    setIsShowModal(false);
    handleClickClear();
  };

  const handleSaveRoute = () => {
    setIsShowSaveRouteModal(true);
  };

  const roundAltitude = (altitude) => {
    if (altitude > 45000) {
      return 45000;
    } else if (altitude < 500) {
      return 500;
    } else {
      return Math.round(altitude / 500) * 500;
    }
  };

  return (
    <div className="route-editor" ref={ref}>
      <div className="route-editor__wrp">
        <DialogTitle className="route-editor__top">
          <p className="route-editor__top__text text" style={{ cursor: 'move' }} id="draggable-dialog-title">
            Enter/Edit/Delete route
          </p>
          <button onClick={() => setIsShowModal(false)} className="route-editor__top__close" type="button">
            <AiOutlineClose className="route-editor__icon" />
          </button>
        </DialogTitle>
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
              <button className="route-editor__tab" type="button" onClick={handleSaveRoute}>
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
                  exceptions={[]}
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
                  exceptions={[]}
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
                        const newValue = roundAltitude(routeData.altitude - altitudeStep);
                        setAltitudeText(newValue.toLocaleString());
                      }}
                    >
                      <AiOutlineMinus className="route-editor__icon--mi" />
                    </span>
                    <input
                      key={'altitude-input-' + forceRerenderKey}
                      type="text"
                      className="route-editor__input__num"
                      id="route-numin"
                      pattern="[0-9]+([,][0-9]{1,2})?"
                      value={altitudeText}
                      onKeyDown={(e) => {
                        if (
                          e.key === 'Backspace' ||
                          e.key === 'Delete' ||
                          e.key === 'ArrowLeft' ||
                          e.key === 'ArrowRight'
                        ) {
                          return;
                        }
                        const regex = /[0-9]|\./;
                        if (!regex.test(e.key)) {
                          if (e.preventDefault) e.preventDefault();
                        }
                      }}
                      onChange={(e) => setAltitudeText(e.target.value)}
                      onBlur={(e) => {
                        let val: number;
                        if (!e.target.value) {
                          val = 0;
                        } else {
                          val = parseInt(e.target.value.replace(/\D+/g, ''));
                        }
                        const newValue = roundAltitude(val);
                        setAltitudeText(newValue.toLocaleString());
                      }}
                      placeholder="0"
                    />
                    <span
                      className="route-editor__rgt"
                      onClick={() => {
                        const newValue = roundAltitude(routeData.altitude + altitudeStep);
                        setAltitudeText(newValue.toLocaleString());
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
      <Modal
        open={isShowSaveRouteModal}
        handleClose={() => setIsShowSaveRouteModal(false)}
        title="Save favorite"
        description=""
        footer={
          <div className="route__modal__box">
            <div className="route__modal__box__2">
              <label className="label" htmlFor="">
                Name
              </label>
              <div className="route__modal__box__input1">
                <AiOutlineHeart className="route__modal__box__icon" />
                <input aria-label="name" type="text" className="route__modal__box__input" />
              </div>
            </div>
            <MultipleSelect />
            <div className="button">
              <BsFolderPlus />
              <Button variant="text">Add New Folder</Button>
            </div>
            <div className="buttonDiv">
              <SecondaryButton onClick={() => setIsShowDeleteRouteModal(false)} text="Cancel" isLoading={false} />
              <PrimaryButton text="Save" onClick={() => deleteActiveRoute()} isLoading={false} />
            </div>
          </div>
        }
      />
      <Modal
        open={isShowErrorRouteModal}
        handleClose={() => setIsShowErrorRouteModal(false)}
        title="Route Error"
        description={errorMessage}
        footer={
          <>
            <PrimaryButton text="Close" onClick={() => setIsShowErrorRouteModal(false)} isLoading={false} />
          </>
        }
      />
    </div>
  );
}

export default Route;
