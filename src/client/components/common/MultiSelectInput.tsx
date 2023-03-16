/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CircularProgress, ClickAwayListener, Typography } from '@mui/material';
import React, { KeyboardEvent, useRef, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { RouteOfFlight, RoutePoint } from '../../interfaces/route';
import { useGetAirportQuery } from '../../store/route/airportApi';
import { useGetWaypointsQuery } from '../../store/route/waypointApi';
import { matchLowerCaseRegex } from '../utils/RegexUtils';
interface Props {
  name: string;
  handleAutoComplete: (name: string, value: RouteOfFlight[]) => void;
  selectedValues: RouteOfFlight[];
}

const MultiSelectInput = ({ name, handleAutoComplete, selectedValues }: Props) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [currentFocus, setCurrentFocus] = useState(0);
  const parentRef = useRef(null);
  const dragElementsParentRef = useRef(null);
  const dragItem = useRef();
  const dragOverItem = useRef();
  const { isLoading, data: airports } = useGetAirportQuery('');
  const { isLoading: isLoadingWaypoints, data: waypoints } = useGetWaypointsQuery('');

  const renderItem = (name: string, val: string) => {
    try {
      let filteredItems = [];
      if (!isLoadingWaypoints) {
        filteredItems.push(...waypoints.filter((item) => item.key.includes(val)));
      }
      if (!isLoading) {
        filteredItems.push(...airports.filter((obj: RoutePoint) => obj.key.includes(val)));
      }
      filteredItems = filteredItems.sort((a, b) => {
        if (a.key === val || a.key === 'K' + val) return -1;
        if (b.key === val || b.key === 'K' + val) return 1;
      });
      return filteredItems.map((obj: RoutePoint, ind: number) => {
        const title: string = obj.key + ' - ' + obj.name;
        return (
          <span
            onClick={() => {
              handleAutoComplete(name, [...selectedValues, { routePoint: obj }]);
              setShowSuggestion(false);
              setInputValue('');
            }}
            id={obj.key}
            // @ts-ignore
            obj={obj}
            className={ind === currentFocus ? 'list__item   focused' : 'list__item'}
            key={obj.key + ind}
          >
            {title}
          </span>
        );
      });
    } catch (error) {
      console.error('Render item error', error);
      return [];
    }
  };

  const dragStart = (e, position) => {
    dragItem.current = position;
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
  };
  const onTouchMove = (e, position) => {
    // need to fix
    console.log('e', e);
    const box = dragElementsParentRef.current.children[position];
    console.log('box?.className', box?.className);
    console.log('box', box);
    const touchLocation = e.targetTouches[0];

    // assign box new coordinates based on the touch.
    box.style.left = touchLocation.pageX + 'px';
    box.style.top = touchLocation.pageY + 'px';
  };

  const drop = () => {
    const copyListItems = [...selectedValues];
    const dragItemContent = copyListItems[dragItem.current || 0];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    handleAutoComplete(name, copyListItems);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    try {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (showSuggestion) {
            if (renderItem(name, inputValue).length - 1 > currentFocus) {
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
            handleClose();
          }
          break;
        case ' ':
        case 'Enter':
          const filteredResult = renderItem(name, inputValue);
          if (filteredResult.length > 0 && currentFocus + 1 <= filteredResult.length && inputValue !== '') {
            handleAutoComplete(name, [...selectedValues, { routePoint: filteredResult[currentFocus].props.obj }]);
            setInputValue('');
          }

          break;
        default:
          break;
      }
    } catch (error) {
      console.info('handleKeyDown error', error);
    }
  };

  const handleClose = () => {
    setShowSuggestion(false);
    setCurrentFocus(0);
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
    setInputValue(_value.trim().replace(matchLowerCaseRegex, (match) => match.toUpperCase()));
    setShowSuggestion(true);
    setCurrentFocus(0);
  };

  return (
    <>
      <div className="multi__input__container">
        <div className="multi_values__container" ref={dragElementsParentRef}>
          {selectedValues.map((el, ind) => (
            <span
              draggable
              onDragStart={(e) => dragStart(e, ind)}
              onTouchStart={(e) => dragStart(e, ind)}
              onDragEnter={(e) => dragEnter(e, ind)}
              onTouchMove={(e) => onTouchMove(e, ind)}
              onDragEnd={drop}
              onTouchEnd={drop}
              key={'route-of-flight-' + el.routePoint.key + ind}
              // style={{ touchAction: 'none' }}
            >
              {el.routePoint.key}
              <AiOutlineClose
                className="close__btn"
                onClick={() =>
                  handleAutoComplete(
                    name,
                    selectedValues.filter((value) => value !== el),
                  )
                }
              />
            </span>
          ))}

          <input
            type="text"
            value={inputValue}
            name={name}
            onChange={handleChange}
            id="route-name"
            onKeyDown={handleKeyDown}
            placeholder="ENTER WAYPOINT ID(S)"
            autoComplete="off"
          />
        </div>

        {isLoading && showSuggestion ? (
          <CircularProgress className="multi__input__icon multi__input__loading" size="sm" value={7} />
        ) : (
          (selectedValues.length >= 1 || inputValue) && (
            <span
              className="multi__input__icon"
              onClick={() => {
                setInputValue('');
                handleAutoComplete(name, []);
              }}
            >
              <AiOutlineClose />
            </span>
          )
        )}
      </div>

      {showSuggestion &&
        !isLoading &&
        inputValue.length > 1 &&
        airports != undefined &&
        (renderItem(name, inputValue).length > 0 ? (
          <ClickAwayListener onClickAway={handleClose}>
            <div className="input__suggestions__container">
              <div ref={parentRef} className="input__suggestions__content">
                {renderItem(name, inputValue)}
              </div>
            </div>
          </ClickAwayListener>
        ) : (
          <Typography> No Record</Typography>
        ))}
    </>
  );
};

export { MultiSelectInput };
