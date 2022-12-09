import React, { useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { DateObject } from 'react-multi-date-picker';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
interface DateData {
  month: number;
  day: string;
  hour: number;
}

function TimeSlider({ handleTime }: { handleTime: (time: DateData) => void }) {
  const [amountOfData, setAmountOfData] = useState(74);
  const [selectedDate, setSelectedDate] = useState(null);
  const [date, setDate] = useState(new DateObject());
  const [isColleps, setIsColleps] = useState(false);
  const randomColorData = ['red', 'green', 'yellow'];
  useEffect(() => {
    function handleWindowResize() {
      if (window.innerWidth < 991) {
        // TODO document why this block is empty
        setAmountOfData(31);
      } else {
        setAmountOfData(74);
      }
    }

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const getTime = (key, value) => {
    if (key === 'hour' && value < 0) {
      const newDate = new DateObject(date);
      newDate[key] += value;
      const dateData = {
        month: newDate.month.index,
        day: newDate.weekDay.shortName,
        hour: newDate.hour,
      };
      return dateData;
    }
    if (key === 'hour' && value > 0) {
      const newDate = new DateObject(date);
      newDate[key] += value;
      const dateData = {
        month: newDate.month.index,
        day: newDate.weekDay.shortName,
        hour: newDate.hour,
      };
      return dateData;
    }
  };

  const hnadelSetDate = (index, limit) => {
    console.log(index);
    handleTime(getTime('hour', index - limit));
    setSelectedDate(getTime('hour', index - limit));
    //setdate to selected date
    const newDate = new DateObject(date);
    newDate.hour += index - limit;
    setDate(newDate);
  };

  return (
    <>
      <div className="collps__top__area">
        <div className="collps__btn__area">
          <button
            onClick={() => setIsColleps(!isColleps)}
            className="collps__btn"
          >
            {selectedDate
              ? selectedDate.hour > 10
                ? `${selectedDate.hour}Z`
                : `0${selectedDate.hour}Z`
              : date.hour > 10
              ? `${date.hour}Z`
              : `0${date.hour}Z`}
            <FaChevronDown className="collps__icon" />
          </button>
        </div>
        <div className="collps__dot__area">
          {[...Array(12)].map((_, index) => (
            //get
            <Tippy
              content={
                <span>
                  {getTime('hour', index - 12).day +
                    ' ' +
                    getTime('hour', index - 12).hour}
                </span>
              }
            >
              <button
                onClick={() => hnadelSetDate(index, 12)}
                key={index}
                className={`collps__dot__btn ${randomColorData[index % 4]} ${
                  isColleps ? 'collps__dot__btn--full' : ''
                }`}
              >
                {[...Array(12)].map((_, i) => (
                  <span key={i} className="collps__dot">
                    &nbsp;
                  </span>
                ))}
              </button>
            </Tippy>
          ))}
          {[...Array(amountOfData)].map((_, index) => (
            //get
            <Tippy
              content={
                <span>
                  {getTime('hour', index)?.day +
                    ' ' +
                    getTime('hour', index)?.hour}
                </span>
              }
            >
              <button
                key={index}
                onClick={() => hnadelSetDate(index, 0)}
                className={`collps__dot__btn ${randomColorData[index % 4]} ${
                  isColleps ? 'collps__dot__btn--full' : ''
                }`}
              >
                {[...Array(12)].map((_, i) => (
                  <span key={i} className="collps__dot">
                    &nbsp;
                  </span>
                ))}
              </button>
            </Tippy>
          ))}
        </div>
      </div>
      <div className="collps__btm__area">
        <div className="collps__date__area">
          <p className="collps__date__text">
            {getTime('hour', -12).day + ' ' + getTime('hour', -12).hour}
          </p>
        </div>
        <div className="collps__date__area">
          <p className="collps__date__text">
            {date.weekDay.shortName} {date.month.index}
          </p>
        </div>
        <div className="collps__date__area">
          <p className="collps__date__text">
            {getTime('hour', 24).day + ' ' + getTime('hour', 24).hour}
          </p>
        </div>
        <div className="collps__date__area">
          <p className="collps__date__text">
            {getTime('hour', 42).day + ' ' + getTime('hour', 42).hour}
          </p>
        </div>
      </div>
    </>
  );
}

export default TimeSlider;
