import React, { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import DateSlider from './DateSlider';
import { PersonalMinsEvaluation, hourInMili, initialEvaluation, personalMinValueToShape } from './DepartureAdvisor';
import { convertTimeFormat, simpleTimeFormat } from '../map/common/AreoFunctions';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../store/user/UserSettings';
import DialogTitle from '@mui/material/DialogTitle';
import { convectivePotential, icingIntensity } from './SettingsDrawer';

export function getEvaluationByTime(
  evaluationData: { time: number; evaluation: PersonalMinsEvaluation }[],
  time: number,
): PersonalMinsEvaluation {
  if (!evaluationData || evaluationData.length === 0) return initialEvaluation;
  const evaluation = evaluationData.reduce((prev, curr) => {
    const diffPrev = time - prev.time;
    const diffCurr = time - curr.time;
    if (diffCurr >= 0 && diffCurr < diffPrev) {
      return curr;
    }
    return prev;
  });
  return evaluation.evaluation ? evaluation.evaluation : initialEvaluation;
}
//i pass setIsShowModal and showModal as a prop to the modal component
interface Props {
  setIsShowDateModal: (isShowModal: boolean) => void;
  evaluationsByTime: any[];
  observationTime: number;
}

function DepartureAdvisorPopup({ setIsShowDateModal, evaluationsByTime, observationTime }: Props) {
  const settingsState = useSelector(selectSettings);
  const [currentTime, setCurrentTime] = useState(observationTime);
  const [evaluation, setEvaluation] = useState<PersonalMinsEvaluation>(
    getEvaluationByTime(evaluationsByTime, observationTime),
  );
  useEffect(() => {
    const evaluation = getEvaluationByTime(evaluationsByTime, currentTime);
    setEvaluation(evaluation);
  }, [currentTime]);

  function moveTime(isForward = true) {
    setCurrentTime((prevState) => (isForward ? prevState + hourInMili : prevState - hourInMili));
  }
  return (
    <div className="departure-advisor-popup">
      <DialogTitle className="departure-advisor-popup-title">
        <p className="text" id="draggable-dialog-title">
          Departure Advisor
        </p>
        <button onClick={() => setIsShowDateModal(false)} className="departure-advisor-popup-close" type="button">
          <AiOutlineClose className="departure-advisor-popup-close-icon" />
        </button>
      </DialogTitle>
      <div className="evaluations-container">
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.departureCeiling.color} ${
              personalMinValueToShape[evaluation.departureCeiling.value]
            }`}
          />
          <p className="evaluation-item-text text">
            Departure ceiling height ({settingsState.ceiling_at_departure[0]}, {settingsState.ceiling_at_departure[1]})
          </p>
        </div>
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.departureVisibility.color} ${
              personalMinValueToShape[evaluation.departureVisibility.value]
            }`}
          />
          <p className="evaluation-item-text text">
            Departure surface visibility ({settingsState.surface_visibility_at_departure[0]},{' '}
            {settingsState.surface_visibility_at_departure[1]})
          </p>
        </div>
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.departureCrosswind.color} ${
              personalMinValueToShape[evaluation.departureCrosswind.value]
            }`}
          />
          <p className="evaluation-item-text text">
            Departure crosswinds ({settingsState.crosswinds_at_departure_airport[0]},{' '}
            {settingsState.crosswinds_at_departure_airport[1]})
          </p>
        </div>
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.alongRouteCeiling.color} ${
              personalMinValueToShape[evaluation.alongRouteCeiling.value]
            }`}
          />
          <p className="evaluation-item-text text">
            En route ceiling height ({settingsState.ceiling_along_route[0]}, {settingsState.ceiling_along_route[1]})
          </p>
        </div>
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.alongRouteVisibility.color} ${
              personalMinValueToShape[evaluation.alongRouteVisibility.value]
            }`}
          />
          <p className="evaluation-item-text text">
            En route surface visibility ({settingsState.surface_visibility_along_route[0]},{' '}
            {settingsState.surface_visibility_along_route[1]})
          </p>
        </div>
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.alongRouteProb.color} ${
              personalMinValueToShape[evaluation.alongRouteProb.value]
            }`}
          />
          <p className="evaluation-item-text text">
            En route icing probability ({settingsState.en_route_icing_probability[0]},{' '}
            {settingsState.en_route_icing_probability[1]})
          </p>
        </div>
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.alongRouteSeverity.color} ${
              personalMinValueToShape[evaluation.alongRouteSeverity.value]
            }`}
          />
          <p className="evaluation-item-text text">
            En route icing intensity ({icingIntensity[settingsState.en_route_icing_intensity[0]]},{' '}
            {icingIntensity[settingsState.en_route_icing_intensity[1]]})
          </p>
        </div>
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.alongRouteTurbulence.color} ${
              personalMinValueToShape[evaluation.alongRouteTurbulence.value]
            }`}
          />
          <p className="evaluation-item-text text">
            En route turbulence intensity ({settingsState.en_route_turbulence_intensity[0]},{' '}
            {settingsState.en_route_turbulence_intensity[1]})
          </p>
        </div>
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.alongRouteConvection.color} ${
              personalMinValueToShape[evaluation.alongRouteConvection.value]
            }`}
          />
          <p className="evaluation-item-text text">
            En route convective potential ({convectivePotential[settingsState.en_route_convective_potential[0]]},{' '}
            {convectivePotential[settingsState.en_route_convective_potential[1]]})
          </p>
        </div>
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.destinationCeiling.color} ${
              personalMinValueToShape[evaluation.destinationCeiling.value]
            }`}
          />
          <p className="evaluation-item-text text">
            Destination ceiling height ({settingsState.ceiling_at_destination[0]},{' '}
            {settingsState.ceiling_at_destination[1]})
          </p>
        </div>
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.destinationVisibility.color} ${
              personalMinValueToShape[evaluation.destinationVisibility.value]
            }`}
          />
          <p className="evaluation-item-text text">
            Destination surface visibility ({settingsState.surface_visibility_at_destination[0]},{' '}
            {settingsState.surface_visibility_at_destination[1]})
          </p>
        </div>
        <div className="evaluation-item">
          <i
            className={`twice dot ${evaluation.destinationCrosswind.color} ${
              personalMinValueToShape[evaluation.destinationCrosswind.value]
            }`}
          />
          <p className="evaluation-item-text text">
            Destination crosswinds ({settingsState.crosswinds_at_destination_airport[0]},{' '}
            {settingsState.crosswinds_at_destination_airport[1]})
          </p>
        </div>
      </div>
      <div className="control-container">
        <div className="time-control" onClick={() => moveTime(false)}>
          <i className="fa-solid fa-backward-step fa-2xl"></i>
        </div>
        <div className="time text">
          <p>{convertTimeFormat(new Date(currentTime), settingsState.default_time_display_unit)}</p>
        </div>
        <div className="time-control" onClick={() => moveTime()}>
          <i className="fa-solid fa-forward-step fa-2xl"></i>
        </div>
      </div>
    </div>
  );
}

export default DepartureAdvisorPopup;
