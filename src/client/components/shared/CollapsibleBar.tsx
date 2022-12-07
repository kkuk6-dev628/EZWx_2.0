import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { DateObject } from 'react-multi-date-picker';
import TimeSlider from './TimeSlider';

function CollapsibleBar() {
  const [isColleps, setIsColleps] = useState(false);
  const [date, _] = useState(new DateObject());

  // const [windowSize, setWindowSize] = useState(setWindowSize());

  return (
    <div className="collps">
      <div className="collps__wrp">
        <div className="collps__top__area">
          <div className="collps__btn__area">
            <button
              onClick={() => setIsColleps(!isColleps)}
              className="collps__btn"
            >
              {date.day > 10 ? `${date.day}Z` : `0${date.day}Z`}
              <FaChevronDown className="collps__icon" />
            </button>
          </div>
          <div className="collps__dot__area">
            <TimeSlider isColleps={isColleps} />
          </div>
        </div>
        <div className="collps__btm__area">
          <div className="collps__date__area">
            <p className="collps__date__text">Fri 11</p>
          </div>
          <div className="collps__date__area">
            <p className="collps__date__text">Sut 12</p>
          </div>
          <div className="collps__date__area">
            <p className="collps__date__text">Sun 13</p>
          </div>
          <div className="collps__date__area">
            <p className="collps__date__text">Mon 14</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollapsibleBar;
