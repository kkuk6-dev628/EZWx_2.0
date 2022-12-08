import React, { useEffect, useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
function TimeSlider({
  isColleps,
  handleTime,
}: {
  handleTime: (time: string) => void;
  isColleps: boolean;
}) {
  const [amountOfData, setAmountOfData] = useState(74);
  const [date, _] = useState(new DateObject());
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
      return `${newDate.weekDay.shortName} ${newDate.hour}`;
    }
    if (key === 'hour' && value > 0) {
      const newDate = new DateObject(date);
      newDate[key] += value;
      return `${newDate.weekDay.shortName} ${newDate.hour}`;
    }
  };

  return (
    <>
      {[...Array(12)].map((_, index) => (
        //get
        <button
          onClick={() => handleTime(getTime('hour', index - 12))}
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
      ))}
      {[...Array(amountOfData)].map((_, index) => (
        //get
        <button
          key={index}
          onClick={() => handleTime(getTime('hour', index))}
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
      ))}
    </>
  );
}

export default TimeSlider;
