import { CircularProgress, ClickAwayListener, Typography } from '@mui/material';
import React, { KeyboardEvent, useRef, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { useGetAirportQuery } from '../../store/airports/airportApi';
import { matchLowerCaseRegex } from '../utils/RegexUtils';
interface Props {
  selectedValue: string;
  name: string;
  handleAutoComplete: (name: string, value: string) => void;
}

interface airportObj {
  name: string;
  key: string;
}
const AutoCompleteInput = ({ selectedValue, name, handleAutoComplete }: Props) => {
  const [currentFocus, setCurrentFocus] = useState(0);
  const [value, setValue] = useState(selectedValue);
  const [showSuggestion, setShowSuggestion] = useState(false);
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
                setShowSuggestion(false);
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
            setShowSuggestion(true);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentFocus > 0) {
            setCurrentFocus((prev) => prev - 1);
            scrollToFocusItem();
          } else {
            setShowSuggestion(false);
          }
          break;
        case 'Enter':
          const filteredResult = renderItem(name, value);
          if (filteredResult.length > 0 && currentFocus + 1 <= filteredResult.length && value !== '') {
            handleAutoComplete(name, filteredResult[currentFocus].props.id);
            setShowSuggestion(false);
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
    setValue(_value.replace(matchLowerCaseRegex, (match) => match.toUpperCase()));
    setShowSuggestion(true);
    setCurrentFocus(0);
  };

  const handleClose = () => {
    handleAutoComplete(name, '');
    setShowSuggestion(false);
    setValue('');
    setCurrentFocus(0);
  };
  console.log('selectedValue', selectedValue);
  return (
    <>
      <div className="auto_complete__input__container">
        {selectedValue ? (
          <span className="auto__complete__label">{selectedValue}</span>
        ) : (
          <input
            type="text"
            value={value}
            name={name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="auto__complete__input"
            placeholder="ICAO or FAA"
          />
        )}
        {isLoading && showSuggestion ? (
          <CircularProgress className="auto__complete__loading auto_complete_close_icon" size="sm" value={7} />
        ) : (
          (value || selectedValue) && (
            <span className="auto__complete__icon" onClick={handleClose}>
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
          <ClickAwayListener onClickAway={() => setShowSuggestion(false)}>
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
