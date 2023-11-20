/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CircularProgress, ClickAwayListener, Typography } from '@mui/material';
import React, { FocusEventHandler, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { RoutePoint } from '../../interfaces/route';
import { useGetAirportQuery } from '../../store/route/airportApi';
import { matchLowerCaseRegex } from '../utils/RegexUtils';
interface Props {
  selectedValue: RoutePoint;
  name: string;
  handleAutoComplete: (name: string, value: RoutePoint) => void;
  onBlur?: FocusEventHandler<HTMLDivElement>;
  exceptions: string[];
}

const AutoCompleteInput = ({ selectedValue, name, handleAutoComplete, onBlur, exceptions }: Props) => {
  const [currentFocus, setCurrentFocus] = useState(0);
  const [value, setValue] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const parentRef = useRef(null);

  const { isLoading, data: airports } = useGetAirportQuery('');

  const renderItem = (name: string, val: string, exceptions: string[]) => {
    try {
      if (isLoading) return [];
      return airports
        .filter((obj: RoutePoint) => obj.key.includes(val) && !exceptions.includes(obj.key))
        .map((obj: RoutePoint, ind: number) => {
          const title: string = obj.key + ' - ' + obj.name;
          return (
            <span
              onClick={() => {
                handleAutoComplete(name, obj);
                setShowSuggestion(false);
              }}
              className={currentFocus === ind ? 'list__item focused' : 'list__item'}
              key={ind}
              id={title}
              // @ts-ignore
              obj={obj}
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
            if (renderItem(name, value, exceptions).length - 1 > currentFocus) {
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
        case ' ':
        case 'Enter':
          const filteredResult = renderItem(name, value, exceptions);
          if (filteredResult.length > 0 && currentFocus + 1 <= filteredResult.length && value !== '') {
            handleAutoComplete(name, filteredResult[currentFocus].props.obj);
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
    setValue(_value.trim().replace(matchLowerCaseRegex, (match) => match.toUpperCase()));
    setShowSuggestion(true);
    setCurrentFocus(0);
  };

  const handleClose = () => {
    handleAutoComplete(name, null);
    setShowSuggestion(false);
    setValue('');
    setCurrentFocus(0);
  };

  let displayText;
  if (selectedValue && selectedValue.key) {
    displayText = selectedValue.key + ' - ' + selectedValue.name;
  } else {
    if (!airports) {
      displayText = '';
    } else {
      const airport = airports.filter((curr) => {
        return curr.key === (selectedValue as any);
      });
      displayText = airport.length > 0 ? airport[0].key + ' - ' + airport[0].name : '';
    }
  }
  return (
    <>
      <div
        className="auto_complete__input__container"
        onBlur={(e) => {
          if (onBlur) {
            onBlur(e);
            setTimeout(() => setShowSuggestion(false), 500);
          }
        }}
      >
        {selectedValue ? (
          <span className="auto__complete__label">{displayText}</span>
        ) : (
          <input
            type="text"
            name={name}
            autoFocus
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="auto__complete__input"
            placeholder="ENTER ICAO OR FAA AIRPORT ID"
            autoComplete="off"
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
        (renderItem(name, value, exceptions).length > 0 ? (
          <ClickAwayListener onClickAway={() => setShowSuggestion(false)}>
            <div className="input__suggestions__container">
              <div ref={parentRef} className="input__suggestions__content">
                {renderItem(name, value, exceptions)}
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
