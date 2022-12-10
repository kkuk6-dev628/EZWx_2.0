import React, { useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { DateObject } from 'react-multi-date-picker';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
interface DateData {
  month: string;
  weekDay: string;
  day: number;
  hour: number;
  minute: string;
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

  const getTime = (key, value, childIndex) => {
    if (key === 'hour' && value < 0) {
      const newDate = new DateObject(date);
      // console.log(newDate);
      newDate[key] += value;
      const dateData = {
        month: newDate.month.shortName,
        weekDay: newDate.weekDay.shortName,
        day: newDate.day,
        hour: newDate.hour,
        minute: handleMinute(childIndex),
      };
      return dateData;
    }
    if (key === 'hour' && value > 0) {
      const newDate = new DateObject(date);
      newDate[key] += value;
      const dateData = {
        month: newDate.month.shortName,
        weekDay: newDate.weekDay.shortName,
        day: newDate.day,
        hour: newDate.hour,
        minute: handleMinute(childIndex),
      };
      return dateData;
    }
  };

  const handleMinute = (value) => {
    switch (value) {
      case 0:
        return '55';
      case 1:
        return '50';
      case 2:
        return '45';
      case 3:
        return '40';
      case 4:
        return '35';
      case 5:
        return '30';
      case 6:
        return '25';
      case 7:
        return '20';
      case 8:
        return '15';
      case 9:
        return '10';
      case 10:
        return '05';
      case 11:
        return '00';
      default:
        return '00';
    }
  };

  const hnadelSetDate = (index, limit, childIndex) => {
    // console.log(index);
    handleTime(getTime('hour', index - limit, childIndex));
    setSelectedDate(getTime('hour', index - limit, childIndex));
    //setdate to selected date
    const newDate = new DateObject(date);
    newDate.hour += index - limit;
    setDate(newDate);
  };
  console.log(date);

  return (
    <>
      <div className="collps__top__area">
        <div className="collps__btn__area">
          <button
            onClick={() => setIsColleps(!isColleps)}
            className="collps__btn"
          >
            {selectedDate
              ? `${selectedDate.weekDay} ${selectedDate.day}, ${selectedDate.month} ${selectedDate.hour}:${selectedDate.minute}`
              : `${date.weekDay.shortName} ${date.day}, ${date.month.shortName} ${date.hour}:${date.minute}`}
            <FaChevronDown className="collps__icon" />
          </button>
        </div>
        <div className="collps__dot__area">
          {[...Array(12)].map((_, index) => (
            //get

            <div
              key={index}
              className={`collps__dot__btn ${randomColorData[index % 4]} ${
                isColleps ? 'collps__dot__btn--full' : ''
              }`}
            >
              {[...Array(12)].map((_, i) => (
                <Tippy
                  key={i}
                  content={
                    <span>
                      {getTime('hour', index, i)?.weekDay +
                        ' ' +
                        getTime('hour', index, i)?.day +
                        ', ' +
                        getTime('hour', index, i)?.month +
                        ' ' +
                        getTime('hour', index, i)?.hour +
                        ':' +
                        getTime('hour', index, i)?.minute}
                    </span>
                  }
                >
                  <span
                    key={i}
                    onClick={() => hnadelSetDate(index, 12, i)}
                    className="collps__dot"
                  >
                    &nbsp;
                  </span>
                </Tippy>
              ))}
            </div>
          ))}
          {[...Array(amountOfData)].map((_, index) => (
            //get

            <div
              key={index}
              className={`collps__dot__btn ${randomColorData[index % 4]} ${
                isColleps ? 'collps__dot__btn--full' : ''
              }`}
            >
              {[...Array(12)].map((_, i) => (
                <Tippy
                  key={i}
                  content={
                    <span>
                      {getTime('hour', index, i)?.weekDay +
                        ' ' +
                        getTime('hour', index, i)?.day +
                        ', ' +
                        getTime('hour', index, i)?.month +
                        ' ' +
                        getTime('hour', index, i)?.hour +
                        ':' +
                        getTime('hour', index, i)?.minute}
                    </span>
                  }
                >
                  <span
                    key={i}
                    onClick={() => hnadelSetDate(index, 0, i)}
                    className="collps__dot"
                  >
                    &nbsp;
                  </span>
                </Tippy>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="collps__btm__area">
        <div className="collps__date__area">
          <p className="collps__date__text">
            {getTime('hour', -12, 11).weekDay +
              ' ' +
              getTime('hour', -12, 11).day +
              ', ' +
              getTime('hour', -12, 11).month +
              ' ' +
              getTime('hour', -12, 11).hour +
              ':' +
              getTime('hour', -12, 11).minute}
          </p>
        </div>
        <div className="collps__date__area">
          <p className="collps__date__text">
            {`${date.weekDay.shortName} ${date.day}, ${date.month.shortName} ${date.hour}:00`}
          </p>
        </div>
        <div className="collps__date__area">
          <p className="collps__date__text">
            {getTime('hour', 24, 11).weekDay +
              ' ' +
              getTime('hour', 24, 11).day +
              ', ' +
              getTime('hour', 24, 11).month +
              ' ' +
              getTime('hour', 24, 11).hour +
              ':' +
              getTime('hour', 24, 11).minute}
          </p>
        </div>
        <div className="collps__date__area">
          <p className="collps__date__text">
            {getTime('hour', 42, 11).weekDay +
              ' ' +
              getTime('hour', 42, 11).day +
              ', ' +
              getTime('hour', 42, 11).month +
              ' ' +
              getTime('hour', 42, 11).hour +
              ':' +
              getTime('hour', 42, 11).minute}
          </p>
        </div>
      </div>
    </>
  );
}

export default TimeSlider;
