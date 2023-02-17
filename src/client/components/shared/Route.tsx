import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineCloseCircle } from 'react-icons/ai';
import { BsBookmarkPlus } from 'react-icons/bs';
import { AiOutlineMinus } from 'react-icons/ai';
import { SvgBin, SvgLeftRight } from '../utils/SvgIcons';
import Switch from 'react-switch';
import { AutoCompleteInput } from '../common/AutoCompleteInput';
//i pass setIsShowModal as a prop to the modal component
interface Props {
  setIsShowModal: (isShowModal: boolean) => void;
}

const regex1 = /[a-z]/g;
const DEPARTURE = 'departure';
const DEPARTURE_SUGGESTION = 'departureSuggestion';
const ROUTE_OF_FLIGHT = 'routeOfFlight';
const ROUTE_OF_FLIGHT_SUGGESTION = 'routeOfFlightSuggestion';
const DESTINATION = 'destination';
const DESTINATION_SUGGESTION = 'destinationSuggestion';

type FormData = {
  departure: string;
  departureSuggestion: boolean;
  routeOfFlight: string;
  routeOfFlightSuggestion: boolean;
  destination: string;
  destinationSuggestion: boolean;
};

function Route({ setIsShowModal }: Props) {
  const [checked, setChecked] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    departure: '',
    departureSuggestion: false,
    routeOfFlight: '',
    routeOfFlightSuggestion: false,
    destination: '',
    destinationSuggestion: false,
  });

  const handleChange = (nextChecked) => {
    setChecked(nextChecked);
  };

  const handleAutoComplete = (name: string, val: string) => {
    setFormData({
      ...formData,
      [name]: val.replace(regex1, (match) => match.toUpperCase()),
      [name + 'Suggestion']: true,
    });
  };

  const handleCloseSuggestion = () => {
    setFormData((prev) => ({
      ...prev,
      departureSuggestion: false,
      routeOfFlightSuggestion: false,
      destinationSuggestion: false,
    }));
  };

  return (
    <div className="modal">
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
              <button className="modal__tab" type="button">
                <SvgBin />
                <p className="modal__tab__text text">Delete</p>
              </button>
              <button className="modal__tab" type="button">
                <SvgLeftRight />
                <p className="modal__tab__text text">Reverse</p>
              </button>
              <button className="modal__tab" type="button">
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
                  value={formData[DEPARTURE]}
                  handleAutoComplete={handleAutoComplete}
                  handleCloseSuggestion={handleCloseSuggestion}
                  showSuggestion={formData[DEPARTURE_SUGGESTION]}
                />
              </div>

              <div className="modal__input__grp">
                <label htmlFor="route-flight" className="modal__label text">
                  Route of Flight
                </label>
                <AutoCompleteInput
                  name={ROUTE_OF_FLIGHT}
                  value={formData[ROUTE_OF_FLIGHT]}
                  showSuggestion={formData[ROUTE_OF_FLIGHT_SUGGESTION]}
                  handleAutoComplete={handleAutoComplete}
                  handleCloseSuggestion={handleCloseSuggestion}
                />
              </div>

              <div className="modal__input__grp">
                <label htmlFor="route-destination" className="modal__label text">
                  Destination*
                </label>
                <AutoCompleteInput
                  name={DESTINATION}
                  value={formData[DESTINATION]}
                  handleAutoComplete={handleAutoComplete}
                  handleCloseSuggestion={handleCloseSuggestion}
                  showSuggestion={formData[DESTINATION_SUGGESTION]}
                />
              </div>

              <div className="modal__swd">
                <div className="modal__numin__area">
                  <label htmlFor="route-numin" className="modal__label text">
                    Altitude (MSL)*
                  </label>
                  <div className="modal__numin">
                    <span className="modal__lft">
                      <AiOutlineMinus className="modal__icon--mi" />
                    </span>
                    <input type="number" className="modal__input__num" id="route-numin" placeholder="0" />
                    <span className="modal__rgt">+</span>
                  </div>
                </div>
                <div className="table__data">
                  <label className="modal__label text" htmlFor="">
                    Use Forecast Winds
                  </label>
                  <Switch
                    checked={checked}
                    onChange={handleChange}
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
              <button className="modal__btn--btm" type="button">
                Open in Map
              </button>
              <button className="modal__btn--btm" type="button">
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
