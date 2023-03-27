/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CircularProgress, ClickAwayListener, Typography } from '@mui/material';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { RouteOfFlight, RoutePoint } from '../../interfaces/route';
import { useGetAirportQuery } from '../../store/route/airportApi';
import { useGetWaypointsQuery } from '../../store/route/waypointApi';
import { matchLowerCaseRegex } from '../utils/RegexUtils';
import * as ReactDOM from 'react-dom';
//@ts-ignore
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

let portal;

// ---------------------------------------------------------------------------
// Dragging Item

const PortalAwareItem = ({ provided, snapshot, item, removeItemHandler }) => {
  const usePortal = snapshot.isDragging;

  const child = (
    <div
      key={'draggable-' + item.id}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      className="draggable-route-point"
    >
      {item ? item.routePoint.key : ''}
      <AiOutlineClose className="close__btn" onClick={() => removeItemHandler(item)} />
    </div>
  );

  if (!usePortal) {
    return child;
  }

  // if dragging - put the item in a portal
  return ReactDOM.createPortal(child, portal);
};

interface Props {
  name: string;
  handleAutoComplete: (name: string, value: RouteOfFlight[]) => void;
  selectedValues: RouteOfFlight[];
}

const MultiSelectInput = ({ name, handleAutoComplete, selectedValues }: Props) => {
  console.log('selectedValues', selectedValues);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [currentFocus, setCurrentFocus] = useState(0);
  const parentRef = useRef(null);
  // const dragElementsParentRef = useRef(null);
  const { isLoading, data: airports } = useGetAirportQuery('');
  const { isLoading: isLoadingWaypoints, data: waypoints } = useGetWaypointsQuery('');

  useEffect(() => {
    portal = document?.createElement('div');
    document?.body?.appendChild(portal);
  }, []);

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
        if (a.key === val && b.key === 'K' + val) {
          return -1;
        }
        if (a.key === 'K' + val && b.key === val) {
          return 1;
        }
        if (a.key === 'K' + val || a.key === val) {
          return -1;
        }
        if (b.key === val || b.key === 'K' + val) return 1;
      });
      return filteredItems.map((obj: RoutePoint, ind: number) => {
        const title: string = obj.key + ' - ' + obj.name;
        return (
          <span
            onClick={() => {
              handleAutoComplete(name, [
                ...selectedValues,
                { routePoint: obj, id: Math.floor(1000 + Math.random() * 9000) },
              ]);
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

  const onDragEnd = (params) => {
    if (!params?.destination) return;
    console.log('params', params);
    const items: RouteOfFlight[] = reorder(selectedValues, params.source.index, params.destination.index);

    handleAutoComplete(name, [...items]);
  };
  const reorder = (list: RouteOfFlight[], startIndex, endIndex): RouteOfFlight[] => {
    const result: RouteOfFlight[] = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
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
            handleAutoComplete(name, [
              ...selectedValues,
              {
                routePoint: filteredResult[currentFocus].props.obj,
                id: Math.floor(1000 + Math.random() * 9000),
              },
            ]);
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
        <DragDropContext onDragEnd={onDragEnd} key="route-dragdrop-context">
          <Droppable key="route-droppable" droppableId={'route-droppable'} direction="horizontal">
            {(droppableProvided) => (
              <div
                key={'route-droppable-div'}
                className="multi_values__container"
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
              >
                {selectedValues.map((el, ind) => (
                  <Draggable key={el.id} draggableId={'' + el.id} index={ind}>
                    {(draggableProvided, draggableSnapshot) => (
                      <PortalAwareItem
                        item={el}
                        provided={draggableProvided}
                        snapshot={draggableSnapshot}
                        removeItemHandler={(item) =>
                          handleAutoComplete(
                            name,
                            selectedValues.filter((value) => value !== item),
                          )
                        }
                      />
                    )}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
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
            )}
          </Droppable>
        </DragDropContext>

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
