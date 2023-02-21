import { CircularProgress, ClickAwayListener, Typography } from '@mui/material';
import React, { KeyboardEvent, useRef, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { useGetAirportQuery } from '../../store/airports/airportApi';
import { matchLowerCaseRegex } from '../utils/RegexUtils';
interface Props {
  name: string;
  handleAutoComplete: (name: string, value: string[]) => void;
  selectedValues: string[];
}

interface airportObj {
  name: string;
  key: string;
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
                handleAutoComplete(name, [...selectedValues, obj.key]);
                setShowSuggestion(false);
                setInputValue('');
              }}
              id={obj.key}
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
    console.log(e.target.innerHTML);
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

  const drop = (e) => {
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
        case 'Enter':
          const filteredResult = renderItem(name, inputValue);
          if (filteredResult.length > 0 && currentFocus + 1 <= filteredResult.length && inputValue !== '') {
            handleAutoComplete(name, [...selectedValues, filteredResult[currentFocus].props.id]);
            setInputValue('');
          }

          break;
        default:
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
    setInputValue(_value.replace(matchLowerCaseRegex, (match) => match.toUpperCase()));
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
              // style={{ touchAction: 'none' }}
            >
              {el}
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
            placeholder="ENTER WAYPOINT IDS"
          />
        </div>

        {isLoading && showSuggestion ? (
          <CircularProgress className="input__loading" size="sm" value={7} />
        ) : (
          (selectedValues.length >= 1 || inputValue) && (
            <span
              className="input__loading"
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
