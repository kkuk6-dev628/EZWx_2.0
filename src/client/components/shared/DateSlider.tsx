import React, { useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
import { SvgLeftArrow, SvgRightArrow } from '../utils/SvgIcons';

function DateSlider() {
  const [date, setDate] = useState(new DateObject());
  const [minus, setMinus] = useState(0);
  const [plus, setPlus] = useState(0);
  function update(key, value) {
    if (value < 0 && minus < 12) {
      console.log('minus', minus);
      date[key] += value;
      setMinus(minus + 1);
    }
    if (plus < 72 && value > 0) {
      date[key] += value;
      setPlus(plus + 1);
    }

    setDate(new DateObject(date));
    // console.log(minus);
  }
  return (
    <div className="date">
      <div className="date__wrp">
        <div className="date__lft">
          <button onClick={() => update('hour', -1)} className="date__btn">
            <SvgLeftArrow />
          </button>
        </div>
        <div className="date__mid">
          {date.month.name} {date.day}, {date.year} <span>{date.hour}00Z</span>
        </div>
        <div className="date__rgt">
          <button onClick={() => update('hour', 1)} className="date__btn">
            <SvgRightArrow />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DateSlider;
