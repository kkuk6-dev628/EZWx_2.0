import { DialogTitle } from '@mui/material';
import { SvgBookmark, SvgHomeAirport, SvgRoundClose, SvgSave } from '../utils/SvgIcons';
import { AutoCompleteInput } from '../common/AutoCompleteInput';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../store/user/UserSettings';
import { useDispatch } from 'react-redux';
import { selectCurrentAirport, setCurrentAirport } from '../../store/airportwx/airportwx';
import { useRouter } from 'next/router';
import {
  useAddRecentAirportMutation,
  useGetAllAirportsQuery,
  useGetRecentAirportQuery,
} from '../../store/airportwx/airportwxApi';
import { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { PrimaryButton } from '../common/Buttons';
import { SaveDialog } from '../saved/SaveDialog';

function AirportSelectModal({ setIsShowModal }) {
  const settingsState = useSelector(selectSettings);
  const currentAirport = useSelector(selectCurrentAirport);
  const [selectedAirport, setSelectedAirport] = useState<any>(currentAirport);
  const [prevValidAirport, setPrevValidAirport] = useState(currentAirport);
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: recentAirports, isSuccess: isSuccessRecentAirports } = useGetRecentAirportQuery(null);
  const [addRecentAirport] = useAddRecentAirportMutation();
  const [showError, setShowError] = useState(false);
  const [showSaveDlg, setShowSaveDlg] = useState(false);
  const { data: allAirports } = useGetAllAirportsQuery('');
  const [homeAirport, setHomeAirport] = useState(null);

  useEffect(() => {
    if (isSuccessRecentAirports && recentAirports.length > 0) {
      dispatch(setCurrentAirport(recentAirports[0].airport));
      updateSelectedAirport(recentAirports[0].airport);
    }
  }, [isSuccessRecentAirports]);

  useEffect(() => {
    if (allAirports) {
      const found = allAirports.find((x) => x.key === settingsState.default_home_airport);
      setHomeAirport(found);
      if (!recentAirports) {
        dispatch(setCurrentAirport(found));
        updateSelectedAirport(found);
      }
    }
  }, [isSuccessRecentAirports, allAirports]);

  function updateSelectedAirport(airport) {
    setSelectedAirport(airport);
    if (airport) {
      setPrevValidAirport(airport);
    }
  }
  function clickHomeAirport(e) {
    e.stopPropagation();
    updateSelectedAirport(homeAirport);
  }

  function clickApply(e) {
    e.stopPropagation();
    if (selectedAirport) {
      dispatch(setCurrentAirport(selectedAirport));
      addRecentAirport({ airportId: selectedAirport.key, airport: selectedAirport });
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
        <div
          className="airport-selector-content"
          onClick={() => {
            if (selectedAirport) {
              return;
            }
            setSelectedAirport(prevValidAirport);
          }}
        >
          <div className="button-area">
            <button className="right-separator" onClick={clickHomeAirport}>
              <SvgHomeAirport />
              <p className="btn-text">Home airport</p>
            </button>
            <button className="save" onClick={() => (selectedAirport ? setShowSaveDlg(true) : setShowError(true))}>
              <SvgBookmark />
              <p className="btn-text">Save</p>
            </button>
          </div>
          <div className="selector-area">
            <AutoCompleteInput
              name="default_home_airport"
              selectedValue={selectedAirport}
              handleAutoComplete={(name, value) => {
                updateSelectedAirport(value);
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
      {selectedAirport && (
        <SaveDialog
          title="Save airport"
          name={`${selectedAirport.key} - ${selectedAirport.name}`}
          open={showSaveDlg}
          onClose={() => setShowSaveDlg(false)}
          data={{ type: 'airport', data: selectedAirport }}
        />
      )}
    </div>
  );
}

export default AirportSelectModal;
