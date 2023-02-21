import { CircularProgress, ClickAwayListener, Typography } from '@mui/material';
import React, { KeyboardEvent, useRef, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { useGetAirportQuery } from '../../store/airports/airportApi';
interface Props {
  value: string;
  name: string;
  showSuggestion: boolean;
  handleAutoComplete: (name: string, value: string) => void;
  handleCloseSuggestion: () => void;
}

interface airportObj {
  name: string;
  key: string;
}
const AutoCompleteInput = ({ value, name, showSuggestion, handleAutoComplete, handleCloseSuggestion }: Props) => {
  const [currentFocus, setCurrentFocus] = useState(0);
  const parentRef = useRef(null);

  const { isLoading, data: airports } = useGetAirportQuery('');

  const renderItem = (name: string, val: string) => {
    try {
      if (isLoading) return [];
      return airports
        .filter((obj: airportObj) => obj.key.includes(val))
        .map((obj: airportObj, ind: number) => {
          const title: string = obj.key + ' - ' + obj.name;
          return (
            <span
              onClick={() => {
                handleAutoComplete(name, title);
                handleCloseSuggestion();
              }}
              className={currentFocus === ind ? 'list__item focused' : 'list__item'}
              key={ind}
              id={title}
            >
              {title}
            </span>
          );
        });
    } catch (error) {
      console.error('error', error);
      return [];
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    try {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (showSuggestion) {
            if (renderItem(name, value).length - 1 > currentFocus) {
              setCurrentFocus((prev) => prev + 1);
              scrollToFocusItem();
            }
          } else {
            handleAutoComplete(name, value);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentFocus > 0) {
            setCurrentFocus((prev) => prev - 1);
            scrollToFocusItem();
          } else {
            handleCloseSuggestion();
          }
          break;
        case 'Enter':
          const filteredResult = renderItem(name, value);
          if (filteredResult.length > 0 && currentFocus + 1 <= filteredResult.length && value !== '') {
            handleAutoComplete(name, filteredResult[currentFocus].props.id);
            handleCloseSuggestion();
          }
          break;
        default:
      }
    } catch (error) {
      console.info('handleKeyDown error', error);
    }
  };

  const scrollToFocusItem = () => {
    const focusedItem = document.querySelector('.focused');
    const parentBounds = parentRef.current.getBoundingClientRect();
    const itemBounds = focusedItem.getBoundingClientRect();
    const topOffset = itemBounds.top - parentBounds.top;
    const bottomOffset = itemBounds.bottom - parentBounds.bottom;
    if (topOffset < 50) {
      parentRef.current.scrollBy(0, topOffset - 40);
    }
    if (bottomOffset > -50) {
      parentRef.current.scrollBy(0, bottomOffset + 40);
    }
  };

  const handleChange = ({ target: { name: _name, value: _value } }) => {
    handleAutoComplete(_name, _value);
    setCurrentFocus(0);
  };

  return (
    <>
      <div className="input__container">
        <input
          type="text"
          value={value}
          name={name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="modal__input"
          placeholder="ICAO or FAA"
        />
        <label htmlFor={name}></label>
        {isLoading && showSuggestion ? (
          <CircularProgress className="input__loading" size="sm" value={7} />
        ) : (
          value && (
            <span className="input__loading" onClick={() => handleAutoComplete(name, '')}>
              <AiOutlineClose />
            </span>
          )
        )}
      </div>

      {showSuggestion &&
        !isLoading &&
        value.length > 1 &&
        airports != undefined &&
        (renderItem(name, value).length > 0 ? (
          <ClickAwayListener onClickAway={handleCloseSuggestion}>
            <div className="input__suggestions__container">
              <div ref={parentRef} className="input__suggestions__content">
                {renderItem(name, value)}
              </div>
            </div>
          </ClickAwayListener>
        ) : (
          <Typography> No Record</Typography>
        ))}
    </>
  );
};

export { AutoCompleteInput };
