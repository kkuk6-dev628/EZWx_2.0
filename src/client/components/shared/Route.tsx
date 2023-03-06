import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineClose, AiOutlineCloseCircle } from 'react-icons/ai';
import { BsBookmarkPlus } from 'react-icons/bs';
import { AiOutlineMinus } from 'react-icons/ai';
import { SvgBin, SvgLeftRight } from '../utils/SvgIcons';
import Switch from 'react-switch';
import { AutoCompleteInput, MultiSelectInput } from '../common/index';
import { selectActiveRoute } from '../../store/route/routes';
import { useMap } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { isSameRoutes, validateRoute } from '../map/common/AreoFunctions';
import { useDispatch } from 'react-redux';
import { useCreateRouteMutation, useGetRoutesQuery } from '../../store/route/routeApi';
import { Route, RoutePoint } from '../../interfaces/routeInterfaces';

interface Props {
  setIsShowModal: (isShowModal: boolean) => void;
}

const DEPARTURE = 'departure';
const ROUTE_OF_FLIGHT = 'routeOfFlight';
const DESTINATION = 'destination';

const emptyFormData: Route = {
  departure: null,
  routeOfFlight: [],
  destination: null,
  altitude: 10000,
  useForecastWinds: true,
};

function Route({ setIsShowModal }: Props) {
  const map = useMap();
  const dispatch = useDispatch();
  const activeRoute = useSelector(selectActiveRoute);
  const [createRoute, createdRoute] = useCreateRouteMutation();
  const [routeData, setRouteData] = useState(activeRoute || emptyFormData);
  const ref = useRef();

  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current);
    L.DomEvent.disableScrollPropagation(ref.current);
    L.DomEvent.on(ref.current, 'mousemove contextmenu', L.DomEvent.stop);
  }, []);

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
      const coordinateList = [
        routeData.departure.position.coordinates,
        ...routeData.routeOfFlight.map((item) => item.position.coordinates),
        routeData.destination.position.coordinates,
      ];
      const latlngs = L.GeoJSON.coordsToLatLngs(coordinateList);
      const polyline = L.polyline(latlngs, { color: 'red' }).addTo(map);
    }
  };
  const handleClickOpenInProfile = () => {
    if (validateRoute(routeData)) {
      addRoute();
    }
  };
  const handleClickReverse = () => {
    setRouteData({
      ...routeData,
      departure: routeData.destination,
      destination: routeData.departure,
      routeOfFlight: [...routeData.routeOfFlight].reverse(),
    });
  };
  const handleClickDelete = () => {
    deleteActiveRoute();
  };

  const addRoute = () => {
    if (isSameRoutes(routeData, activeRoute)) {
      return;
    }
    createRoute(routeData);
  };

  const deleteActiveRoute = () => {
    // dispatch(deleteRoute(activeRoute.id));
    setRouteData(emptyFormData);
  };

  return (
    <div className="modal" ref={ref}>
      <div className="modal__wrp">
        <div className="modal__top">
          <p className="modal__top__text text">Enter/Edit/Delete route</p>
          <button onClick={() => setIsShowModal(false)} className="modal__top__close" type="button">
            <AiOutlineClose className="modal__icon" />
          </button>
        </div>
        <div className="modal__content">
          <div className="modal__content__top">
            <div className="modal__tabs">
              <button className="modal__tab" type="button" onClick={handleClickDelete}>
                <SvgBin />
                <p className="modal__tab__text text">Delete</p>
              </button>
              <button className="modal__tab" type="button" onClick={handleClickReverse}>
                <SvgLeftRight />
                <p className="modal__tab__text text">Reverse</p>
              </button>
              <button
                className="modal__tab"
                type="button"
                onClick={() => {
                  setRouteData(emptyFormData);
                }}
              >
                <AiOutlineCloseCircle className="modal__icon" />
                <p className="modal__tab__text text">Clear</p>
              </button>
              <button className="modal__tab" type="button">
                <BsBookmarkPlus className="modal__icon" />
                <p className="modal__tab__text text">Add to saved</p>
              </button>
            </div>
            <form action="" className="modal__form">
              <div className="modal__input__grp">
                <label htmlFor="route-name" className="modal__label text">
                  Departure*
                </label>
                <AutoCompleteInput
                  name={DEPARTURE}
                  selectedValue={routeData[DEPARTURE]}
                  handleAutoComplete={handleAutoComplete}
                  // handleCloseSuggestion={handleCloseSuggestion}
                  // showSuggestion={formData[DEPARTURE_SUGGESTION]}
                />
              </div>

              <div className="modal__input__grp">
                <label htmlFor="route-flight" className="modal__label text">
                  Route of Flight
                </label>
                <MultiSelectInput
                  name={ROUTE_OF_FLIGHT}
                  selectedValues={routeData[ROUTE_OF_FLIGHT]}
                  handleAutoComplete={handleMultiSelectInsertion}
                />
              </div>

              <div className="modal__input__grp">
                <label htmlFor="route-destination" className="modal__label text">
                  Destination*
                </label>
                <AutoCompleteInput
                  name={DESTINATION}
                  selectedValue={routeData[DESTINATION]}
                  handleAutoComplete={handleAutoComplete}
                  // handleCloseSuggestion={handleCloseSuggestion}
                  // showSuggestion={formData[DESTINATION_SUGGESTION]}
                />
              </div>

              <div className="modal__swd">
                <div className="modal__numin__area">
                  <label htmlFor="route-numin" className="modal__label text">
                    Altitude (MSL)*
                  </label>
                  <div className="modal__numin">
                    <span
                      className="modal__lft"
                      onClick={() => {
                        setRouteData({ ...routeData, altitude: routeData.altitude - 1 });
                      }}
                    >
                      <AiOutlineMinus className="modal__icon--mi" />
                    </span>
                    <input
                      type="number"
                      className="modal__input__num"
                      id="route-numin"
                      value={routeData.altitude}
                      onChange={(e) => {
                        setRouteData({ ...routeData, altitude: parseInt(e.currentTarget.value) });
                      }}
                      placeholder="0"
                    />
                    <span
                      className="modal__rgt"
                      onClick={() => {
                        setRouteData({ ...routeData, altitude: routeData.altitude + 1 });
                      }}
                    >
                      +
                    </span>
                  </div>
                </div>
                <div className="table__data">
                  <label className="modal__label text" htmlFor="">
                    Use Forecast Winds
                  </label>
                  <Switch
                    checked={routeData.useForecastWinds}
                    onChange={handleUseForecastWindsChange}
                    onColor="#791DC6"
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
            <div className="modal__btn__grp">
              <button className="modal__btn--btm" type="button" onClick={handleClickOpenInMap}>
                Open in Map
              </button>
              <button className="modal__btn--btm" type="button" onClick={handleClickOpenInProfile}>
                Open in Profile
              </button>
            </div>
            <p className="modal__txt">* Required field</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Route;
