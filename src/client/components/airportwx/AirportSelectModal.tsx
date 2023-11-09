import { DialogTitle } from '@mui/material';
import { SvgBookmark, SvgHomeAirport, SvgRoundClose, SvgSave } from '../utils/SvgIcons';
import { AutoCompleteInput } from '../common/AutoCompleteInput';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../store/user/UserSettings';
import { useDispatch } from 'react-redux';
import { selectCurrentAirport, setCurrentAirport } from '../../store/airportwx/airportwx';
import { useRouter } from 'next/router';
import { useAddRecentAirportMutation, useGetRecentAirportQuery } from '../../store/airportwx/airportwxApi';
import { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { PrimaryButton } from '../common/Buttons';

function AirportSelectModal({ setIsShowModal }) {
  const settingsState = useSelector(selectSettings);
  const currentAirport = useSelector(selectCurrentAirport);
  const [selectedAirport, setSelectedAirport] = useState<any>(currentAirport);
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: recentAirports, isSuccess: isSuccessRecentAirports } = useGetRecentAirportQuery(null);
  const [addRecentAirport] = useAddRecentAirportMutation();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (isSuccessRecentAirports && recentAirports.length > 0) {
      dispatch(setCurrentAirport(recentAirports[0].airportId));
      setSelectedAirport(recentAirports[0].airportId);
    } else {
      dispatch(setCurrentAirport(settingsState.default_home_airport));
      setSelectedAirport(settingsState.default_home_airport);
    }
  }, [isSuccessRecentAirports]);

  function clickHomeAirport() {
    setSelectedAirport(settingsState.default_home_airport);
  }

  function clickApply() {
    if (selectedAirport) {
      dispatch(setCurrentAirport(selectedAirport.key || selectedAirport));
      addRecentAirport({ airportId: selectedAirport.key || selectedAirport });
      setIsShowModal(false);
      router.push('/airportwx');
    } else {
      setShowError(true);
    }
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
            <button className="home-airport" onClick={clickHomeAirport}>
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
              selectedValue={selectedAirport}
              handleAutoComplete={(name, value) => {
                setSelectedAirport(value);
              }}
              exceptions={[]}
              key={'home-airport'}
              // handleCloseSuggestion={handleCloseSuggestion}
              // showSuggestion={formData[DESTINATION_SUGGESTION]}
            />
          </div>
          <div className="apply-area" onClick={clickApply}>
            <button className="btn-apply">Apply</button>
          </div>
        </div>
      </div>
      <Modal
        open={showError}
        handleClose={() => setShowError(false)}
        title="Airport Error"
        description="No valid airport entered"
        footer={
          <>
            <PrimaryButton text="Close" onClick={() => setShowError(false)} isLoading={false} />
          </>
        }
      />
    </div>
  );
}

export default AirportSelectModal;
