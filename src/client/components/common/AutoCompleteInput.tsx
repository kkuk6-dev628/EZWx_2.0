import { CircularProgress, ClickAwayListener, Typography } from '@mui/material';
import React from 'react';
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
  const { isLoading, data: airports } = useGetAirportQuery('');

  const renderItem = (name: string, val: string) => {
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
            className="list__item"
            key={ind}
          >
            {title}
          </span>
        );
      });
  };

  return (
    <>
      <div className="input__container">
        <input
          type="text"
          value={value}
          name={name}
          onChange={({ target: { name: _name, value: _value } }) => {
            handleAutoComplete(_name, _value);
          }}
          className="modal__input"
          id="route-name"
          placeholder="ICAO or FAA"
        />
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
              <div className="input__suggestions__content">{renderItem(name, value)}</div>
            </div>
          </ClickAwayListener>
        ) : (
          <Typography> No Record</Typography>
        ))}
    </>
  );
};

export { AutoCompleteInput };
