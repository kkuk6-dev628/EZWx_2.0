import { CircularProgress, ClickAwayListener, Typography } from '@mui/material';
import React, { useState } from 'react';
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
  const { isLoading, data: airports } = useGetAirportQuery('');

  const renderItem = (name: string, val: string) => {
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
            className="list__item"
            key={ind}
          >
            {title}
          </span>
        );
      });
  };

  const [inputValue, setInputValue] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);

  return (
    <>
      <div className="multi__input__container">
        <div className="multi_values__container">
          {selectedValues.map((el) => (
            <span>
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
            onChange={({ target: { name: _name, value: _value } }) => {
              setInputValue(_value.replace(matchLowerCaseRegex, (match) => match.toUpperCase()));
              setShowSuggestion(true);
            }}
            id="route-name"
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
          <ClickAwayListener onClickAway={() => setShowSuggestion(false)}>
            <div className="input__suggestions__container">
              <div className="input__suggestions__content">{renderItem(name, inputValue)}</div>
            </div>
          </ClickAwayListener>
        ) : (
          <Typography> No Record</Typography>
        ))}
    </>
  );
};

export { MultiSelectInput };
