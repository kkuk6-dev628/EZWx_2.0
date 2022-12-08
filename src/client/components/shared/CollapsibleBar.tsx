import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { DateObject } from 'react-multi-date-picker';
import TimeSlider from './TimeSlider';

function CollapsibleBar({
  handleTime,
}: {
  handleTime: (time: string) => void;
}) {
  const [isColleps, setIsColleps] = useState(false);
  const [date, _] = useState(new DateObject());

  const getTime = (key, value) => {
    if (key === 'hour' && value < 0) {
      const newDate = new DateObject(date);
      newDate[key] += value;
      return `${newDate.weekDay.shortName} ${newDate.month.index}`;
    }
    if (key === 'hour' && value > 0) {
      const newDate = new DateObject(date);
      newDate[key] += value;
      return `${newDate.weekDay.shortName} ${newDate.month.index}`;
    }
  };

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
            <TimeSlider handleTime={handleTime} isColleps={isColleps} />
          </div>
        </div>
        <div className="collps__btm__area">
          <div className="collps__date__area">
            <p className="collps__date__text">{getTime('hour', -12)}</p>
          </div>
          <div className="collps__date__area">
            <p className="collps__date__text">
              {date.weekDay.shortName} {date.month.index}
            </p>
          </div>
          <div className="collps__date__area">
            <p className="collps__date__text">{getTime('hour', 24)}</p>
          </div>
          <div className="collps__date__area">
            <p className="collps__date__text">{getTime('hour', 42)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollapsibleBar;
