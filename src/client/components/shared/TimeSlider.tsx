import React, { useState } from 'react';
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

function TimeSlider({
  handleTime,
  min,
  max,
  step,
}: {
  handleTime: (time: DateData) => void;
  min: number;
  max: number;
  step: number;
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [date, setDate] = useState(new DateObject());
  const [isColleps, setIsColleps] = useState(false);
  const randomColorData = ['red', 'green', 'yellow'];
  console.log(min, ' ', max, ' ', step);

  const getTime = (key, value, childIndex) => {
    if (key === 'hour' && value < 0) {
      const newDate = new DateObject(date);
      if (value === 0) {
        const dateData = {
          month: newDate.month.shortName,
          weekDay: newDate.weekDay.shortName,
          day: newDate.day,
          hour: newDate.hour,
          minute: handleMinute(childIndex),
        };
        console.log(dateData);
        return dateData;
      } else {
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
      // console.log(value, '-- ', dateData);
      return dateData;
    }
    // console.log(dateData, ' ', value);
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
  console.log(date);

  const hnadelSetDate = (index, limit, childIndex) => {
    //index and limit is 0 then it will be current date
    if (index === 0 && limit === 0) {
      const newDate = new DateObject(date);
      const dateData = {
        month: newDate.month.shortName,
        weekDay: newDate.weekDay.shortName,
        day: newDate.day,
        hour: newDate.hour,
        minute: handleMinute(childIndex),
      };
      handleTime(dateData);
      setSelectedDate(dateData);
    } else {
      handleTime(getTime('hour', index - limit, childIndex));
      setSelectedDate(getTime('hour', index - limit, childIndex));
    }
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
              ? `${selectedDate.weekDay} ${selectedDate.day}, ${selectedDate.month} ${selectedDate.hour}:${selectedDate.minute}`
              : `${date.weekDay.shortName} ${date.day}, ${date.month.shortName} ${date.hour}:${date.minute}`}
            <FaChevronDown className="collps__icon" />
          </button>
        </div>
      </div>
      <div className="collps__wrp">
        <div className="collps__btm__wrp">
          <div className="collps__dot__area">
            {!isColleps && (
              <>
                <div className="collps__dot__wrp">
                  {[...Array(24)].map((_, index) => (
                    //get
                    <div
                      key={index}
                      className={`collps__dot__btn ${
                        randomColorData[index % 4]
                      } ${isColleps ? 'collps__dot__btn--full' : ''}`}
                    >
                      {[...Array(1)].map((_, i) => (
                        <Tippy
                          key={i}
                          content={
                            <span>
                              {getTime('hour', index - 24, 11)?.weekDay +
                                ' ' +
                                getTime('hour', index - 24, 11)?.day +
                                ', ' +
                                getTime('hour', index - 24, 11)?.month +
                                ' ' +
                                getTime('hour', index - 24, 11)?.hour +
                                ':' +
                                getTime('hour', index - 24, 11)?.minute}
                            </span>
                          }
                        >
                          <span
                            key={i}
                            onClick={() => hnadelSetDate(index, 24, 11)}
                            className="collps__dot"
                          >
                            &nbsp;
                          </span>
                        </Tippy>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="collps__dot__wrp">
                  {[...Array(24)].map((_, index) => (
                    <div
                      key={index}
                      id={'' + index}
                      className={`collps__dot__btn ${
                        randomColorData[index % 4]
                      } ${isColleps ? 'collps__dot__btn--full' : ''}`}
                    >
                      {[...Array(1)].map((_, i) =>
                        index === 0 ? (
                          <Tippy
                            key={i}
                            content={
                              <span>
                                {date.weekDay.shortName +
                                  ' ' +
                                  date.day +
                                  ', ' +
                                  date.month.shortName +
                                  ' ' +
                                  date.hour +
                                  ':' +
                                  handleMinute(11)}
                              </span>
                            }
                          >
                            <span
                              key={i}
                              onClick={() => hnadelSetDate(index, 0, 11)}
                              className="collps__dot"
                            >
                              &nbsp;
                            </span>
                          </Tippy>
                        ) : (
                          <Tippy
                            key={i}
                            content={
                              <span>
                                {getTime('hour', index, 11)?.weekDay +
                                  ' ' +
                                  getTime('hour', index, 11)?.day +
                                  ', ' +
                                  getTime('hour', index, 11)?.month +
                                  ' ' +
                                  getTime('hour', index, 11)?.hour +
                                  ':' +
                                  getTime('hour', index, 11)?.minute}
                              </span>
                            }
                          >
                            <span
                              key={i}
                              onClick={() => hnadelSetDate(index, 0, 11)}
                              className="collps__dot"
                            >
                              &nbsp;
                            </span>
                          </Tippy>
                        ),
                      )}
                    </div>
                  ))}
                </div>
                <div className="collps__dot__wrp">
                  {[...Array(24)].map((_, index) => (
                    <div
                      key={index}
                      id={'' + index}
                      className={`collps__dot__btn ${
                        randomColorData[index % 4]
                      } ${isColleps ? 'collps__dot__btn--full' : ''}`}
                    >
                      {[...Array(1)].map((_, i) => (
                        <Tippy
                          key={i}
                          content={
                            <span>
                              {getTime('hour', 24 + index, 11)?.weekDay +
                                ' ' +
                                getTime('hour', 24 + index, 11)?.day +
                                ', ' +
                                getTime('hour', 24 + index, 11)?.month +
                                ' ' +
                                getTime('hour', 24 + index, 11)?.hour +
                                ':' +
                                getTime('hour', 24 + index, 11)?.minute}
                            </span>
                          }
                        >
                          <span
                            key={i}
                            onClick={() => hnadelSetDate(index, 0, 11)}
                            className="collps__dot"
                          >
                            &nbsp;
                          </span>
                        </Tippy>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="collps__dot__wrp">
                  {[...Array(24)].map((_, index) => (
                    <div
                      key={index}
                      id={'' + index}
                      className={`collps__dot__btn ${
                        randomColorData[index % 4]
                      } ${isColleps ? 'collps__dot__btn--full' : ''}`}
                    >
                      {[...Array(1)].map((_, i) => (
                        <Tippy
                          key={i}
                          content={
                            <span>
                              {getTime('hour', 48 + index, 11)?.weekDay +
                                ' ' +
                                getTime('hour', 48 + index, 11)?.day +
                                ', ' +
                                getTime('hour', 48 + index, 11)?.month +
                                ' ' +
                                getTime('hour', 48 + index, 11)?.hour +
                                ':' +
                                getTime('hour', 48 + index, 11)?.minute}
                            </span>
                          }
                        >
                          <span
                            key={i}
                            onClick={() => hnadelSetDate(index, 0, 11)}
                            className="collps__dot"
                          >
                            &nbsp;
                          </span>
                        </Tippy>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
            {isColleps && (
              <>
                <div className="collps__dot__wrp">
                  {[...Array(24)].map((_, index) => (
                    //get
                    <div
                      key={index}
                      className={`collps__dot__btn ${
                        randomColorData[index % 4]
                      } ${isColleps ? 'collps__dot__btn--full' : ''}`}
                    >
                      {[...Array(12)].map((_, i) => (
                        <Tippy
                          key={i}
                          content={
                            <span>
                              {getTime('hour', index - 24, i)?.weekDay +
                                ' ' +
                                getTime('hour', index - 24, i)?.day +
                                ', ' +
                                getTime('hour', index - 24, i)?.month +
                                ' ' +
                                getTime('hour', index - 24, i)?.hour +
                                ':' +
                                getTime('hour', index - 24, i)?.minute}
                            </span>
                          }
                        >
                          <span
                            key={i}
                            onClick={() => hnadelSetDate(index, 24, i)}
                            className="collps__dot"
                          >
                            &nbsp;
                          </span>
                        </Tippy>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="collps__dot__wrp">
                  {[...Array(24)].map((_, index) => (
                    <div
                      key={index}
                      id={'' + index}
                      className={`collps__dot__btn ${
                        randomColorData[index % 4]
                      } ${isColleps ? 'collps__dot__btn--full' : ''}`}
                    >
                      {[...Array(12)].map((_, i) =>
                        index === 0 ? (
                          <Tippy
                            key={i}
                            content={
                              <span>
                                {date.weekDay.shortName +
                                  ' ' +
                                  date.day +
                                  ', ' +
                                  date.month.shortName +
                                  ' ' +
                                  date.hour +
                                  ':' +
                                  handleMinute(i)}
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
                        ) : (
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
                        ),
                      )}
                    </div>
                  ))}
                </div>
                <div className="collps__dot__wrp">
                  {[...Array(24)].map((_, index) => (
                    <div
                      key={index}
                      id={'' + index}
                      className={`collps__dot__btn ${
                        randomColorData[index % 4]
                      } ${isColleps ? 'collps__dot__btn--full' : ''}`}
                    >
                      {[...Array(12)].map((_, i) => (
                        <Tippy
                          key={i}
                          content={
                            <span>
                              {getTime('hour', 24 + index, i)?.weekDay +
                                ' ' +
                                getTime('hour', 24 + index, i)?.day +
                                ', ' +
                                getTime('hour', 24 + index, i)?.month +
                                ' ' +
                                getTime('hour', 24 + index, i)?.hour +
                                ':' +
                                getTime('hour', 24 + index, i)?.minute}
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
                <div className="collps__dot__wrp">
                  {[...Array(24)].map((_, index) => (
                    <div
                      key={index}
                      id={'' + index}
                      className={`collps__dot__btn ${
                        randomColorData[index % 4]
                      } ${isColleps ? 'collps__dot__btn--full' : ''}`}
                    >
                      {[...Array(12)].map((_, i) => (
                        <Tippy
                          key={i}
                          content={
                            <span>
                              {getTime('hour', 48 + index, i)?.weekDay +
                                ' ' +
                                getTime('hour', 48 + index, i)?.day +
                                ', ' +
                                getTime('hour', 48 + index, i)?.month +
                                ' ' +
                                getTime('hour', 48 + index, i)?.hour +
                                ':' +
                                getTime('hour', 48 + index, i)?.minute}
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
              </>
            )}
          </div>
          <div className="collps__btm__area">
            <div className="collps__date__area">
              <p className="collps__date__text">
                {getTime('hour', -24, 11)?.weekDay +
                  ' ' +
                  getTime('hour', -24, 11)?.day +
                  ', ' +
                  getTime('hour', -24, 11)?.month +
                  ' ' +
                  getTime('hour', -24, 11)?.hour +
                  ':' +
                  getTime('hour', -24, 11)?.minute}
              </p>
            </div>
            <div className="collps__date__area">
              <p className="collps__date__text">
                {`${date.weekDay.shortName} ${date.day}, ${date.month.shortName} ${date.hour}:00`}
              </p>
            </div>
            <div className="collps__date__area">
              <p className="collps__date__text">
                {getTime('hour', 24, 11)?.weekDay +
                  ' ' +
                  getTime('hour', 24, 11)?.day +
                  ', ' +
                  getTime('hour', 24, 11)?.month +
                  ' ' +
                  getTime('hour', 24, 11)?.hour +
                  ':' +
                  getTime('hour', 24, 11)?.minute}
              </p>
            </div>
            <div className="collps__date__area">
              <p className="collps__date__text">
                {getTime('hour', 48, 10)?.weekDay +
                  ' ' +
                  getTime('hour', 48, 11)?.day +
                  ', ' +
                  getTime('hour', 48, 11)?.month +
                  ' ' +
                  getTime('hour', 48, 11)?.hour +
                  ':' +
                  getTime('hour', 48, 11)?.minute}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TimeSlider;
