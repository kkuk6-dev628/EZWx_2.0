import React, { useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
import { SvgLeftArrow, SvgRightArrow } from '../utils/SvgIcons';

function DateSlider() {
  const [date, setDate] = useState(new DateObject());

  function update(key, value) {
    date[key] += value;

    setDate(new DateObject(date));
  }
  console.log(date);
  return (
    <div className="date">
      <div className="date__wrp">
        <div className="date__lft">
          <button onClick={() => update('month', -1)} className="date__btn">
            <SvgLeftArrow />
          </button>
        </div>
        <div className="date__mid">
          {date.month.name} {date.day}, {date.year} <span>1400Z</span>
        </div>
        <div className="date__rgt">
          <button onClick={() => update('month', 1)} className="date__btn">
            <SvgRightArrow />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DateSlider;
