import { DialogTitle } from '@mui/material';
import { SvgBookmark, SvgHomeAirport, SvgRoundClose, SvgSave } from '../utils/SvgIcons';
import { AutoCompleteInput } from '../common/AutoCompleteInput';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../store/user/UserSettings';

function AirportSelectModal({ setIsShowModal }) {
  const settingsState = useSelector(selectSettings);
  function clickHomeAirport() {
    settingsState.default_home_airport;
  }
  return (
    <div className="airport-selector">
      <div className="airport-selector-wrap">
        <DialogTitle className="dlg-title">
          <p className="text" style={{ cursor: 'move' }} id="draggable-dialog-title">
            Select airport
          </p>
          <button onClick={() => setIsShowModal(false)} className="dlg-close" type="button">
            <SvgRoundClose />
          </button>
        </DialogTitle>
        <div className="airport-selector-content">
          <div className="button-area">
            <button className="home-airport">
              <SvgHomeAirport />
              <p className="btn-text">Home airport</p>
            </button>
            <button className="save">
              <SvgBookmark />
              <p className="btn-text">Save</p>
            </button>
          </div>
          <div className="selector-area">
            <AutoCompleteInput
              name="default_home_airport"
              selectedValue={settingsState.default_home_airport as any}
              handleAutoComplete={(name, value) => {
                console.log(name, value);
              }}
              exceptions={[]}
              key={'home-airport'}
              // handleCloseSuggestion={handleCloseSuggestion}
              // showSuggestion={formData[DESTINATION_SUGGESTION]}
            />
          </div>
          <div className="apply-area">
            <button className="btn-apply">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AirportSelectModal;
