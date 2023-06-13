import { useState, SyntheticEvent } from 'react';
import { addLeadingZeroes, simpleTimeOnlyFormat } from '../map/common/AreoFunctions';
import { PersonalMinsEvaluation, hourInMili, personalMinValueToShape } from './DepartureAdvisor';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../store/user/UserSettings';

interface Props {
  index: number;
  time: Date;
  color: string;
  isMap: boolean;
  evaluationsByTime: { time: number; evaluation: PersonalMinsEvaluation }[];
  setShowPopup: (show: boolean) => void;
  handleTimeChange: (time: Date) => void;
}
function DepartureAdvisorTimeBlockComponent({
  index,
  time,
  color,
  isMap,
  evaluationsByTime,
  setShowPopup,
  handleTimeChange,
}: Props) {
  const [hideDotsBars, setHideDotsBars] = useState(true);
  const [clickedDotsBars, setClickedDotsBars] = useState(false);
  const [showBarComponent, setShowBarComponent] = useState(false);
  const settingsState = useSelector(selectSettings);
  const realIndex = isMap ? index - 4 : index;
  // if (realIndex < 0) {
  //   return;
  // }
  const beforeEval = realIndex < 0 ? null : evaluationsByTime[realIndex * 3].evaluation;
  const currEval = realIndex < 0 ? null : evaluationsByTime[realIndex * 3 + 1].evaluation;
  const afterEval = realIndex < 0 ? null : evaluationsByTime[realIndex * 3 + 2].evaluation;
  const positionInPercent = (index * (100 - 4) * 3) / (isMap ? 84 : 72) + 2.5;
  function clickEvaluationBar(e: SyntheticEvent) {
    e.nativeEvent.stopPropagation();
    setHideDotsBars(false);
    setClickedDotsBars(true);
    evaluationsByTime && setShowPopup(true);
  }
  return (
    <div
      key={'time' + index}
      className={`prevent-select block ${color}`}
      onClick={() => handleTimeChange(time)}
      onMouseOver={(e) => {
        if (
          settingsState.observation_time < time.getTime() - hourInMili ||
          settingsState.observation_time > time.getTime() - hourInMili
        ) {
          setShowBarComponent(true);
        }
      }}
      onMouseOut={(e) => {
        setShowBarComponent(false);
      }}
    >
      {settingsState.default_time_display_unit
        ? addLeadingZeroes(time.getHours(), 2)
        : addLeadingZeroes(time.getUTCHours(), 2) + 'z'}
      {beforeEval && showBarComponent && (
        <div
          className={'bars-container' + (hideDotsBars ? ' fade-out' : '')}
          onClick={clickEvaluationBar}
          // onMouseDown={(e) => e.stopPropagation()}
          // onMouseOver={() => {
          //   setHideDotsBars(false);
          //   setClickedDotsBars(true);
          // }}
          // onMouseOut={() => {
          //   setHideDotsBars(true);
          //   setClickedDotsBars(false);
          // }}
          style={{ left: positionInPercent + '%' }}
        >
          <div className="bar">
            <i
              title="Departure ceiling height"
              className={`dot ${beforeEval.departureCeiling.color} ${
                personalMinValueToShape[beforeEval.departureCeiling.value]
              }`}
            ></i>
            <i
              title="Departure surface visibility"
              className={`dot ${beforeEval.departureVisibility.color} ${
                personalMinValueToShape[beforeEval.departureVisibility.value]
              }`}
            ></i>
            <i
              title="Departure crosswinds"
              className={`dot ${beforeEval.departureCrosswind.color} ${
                personalMinValueToShape[beforeEval.departureCrosswind.value]
              }`}
            ></i>
            <i
              title="En route ceiling height"
              className={`dot ${beforeEval.alongRouteCeiling.color} ${
                personalMinValueToShape[beforeEval.alongRouteCeiling.value]
              }`}
            ></i>
            <i
              title="En route surface visibility"
              className={`dot ${beforeEval.alongRouteVisibility.color} ${
                personalMinValueToShape[beforeEval.alongRouteVisibility.value]
              }`}
            ></i>
            <i
              title="En route icing probability"
              className={`dot ${beforeEval.alongRouteProb.color} ${
                personalMinValueToShape[beforeEval.alongRouteProb.value]
              }`}
            ></i>
            <i
              title="En route icing severity"
              className={`dot ${beforeEval.alongRouteSeverity.color} ${
                personalMinValueToShape[beforeEval.alongRouteSeverity.value]
              }`}
            ></i>
            <i
              title="En route turbulence intensity"
              className={`dot ${beforeEval.alongRouteTurbulence.color} ${
                personalMinValueToShape[beforeEval.alongRouteTurbulence.value]
              }`}
            ></i>
            <i
              title="En route convective potential"
              className={`dot ${beforeEval.alongRouteConvection.color} ${
                personalMinValueToShape[beforeEval.alongRouteConvection.value]
              }`}
            ></i>
            <i
              title="Destination ceiling height"
              className={`dot ${beforeEval.destinationCeiling.color} ${
                personalMinValueToShape[beforeEval.destinationCeiling.value]
              }`}
            ></i>
            <i
              title="Destination surface visibility"
              className={`dot ${beforeEval.destinationVisibility.color} ${
                personalMinValueToShape[beforeEval.destinationVisibility.value]
              }`}
            ></i>
            <i
              title="Destination crosswinds"
              className={`dot ${beforeEval.destinationCrosswind.color} ${
                personalMinValueToShape[beforeEval.destinationCrosswind.value]
              }`}
            ></i>
          </div>
          <div className="bar">
            <i
              title="Departure ceiling height"
              className={`dot ${currEval.departureCeiling.color} ${
                personalMinValueToShape[currEval.departureCeiling.value]
              }`}
            ></i>
            <i
              title="Departure surface visibility"
              className={`dot ${currEval.departureVisibility.color} ${
                personalMinValueToShape[currEval.departureVisibility.value]
              }`}
            ></i>
            <i
              title="Departure crosswinds"
              className={`dot ${currEval.departureCrosswind.color} ${
                personalMinValueToShape[currEval.departureCrosswind.value]
              }`}
            ></i>
            <i
              title="En route ceiling height"
              className={`dot ${currEval.alongRouteCeiling.color} ${
                personalMinValueToShape[currEval.alongRouteCeiling.value]
              }`}
            ></i>
            <i
              title="En route surface visibility"
              className={`dot ${currEval.alongRouteVisibility.color} ${
                personalMinValueToShape[currEval.alongRouteVisibility.value]
              }`}
            ></i>
            <i
              title="En route icing probability"
              className={`dot ${currEval.alongRouteProb.color} ${
                personalMinValueToShape[currEval.alongRouteProb.value]
              }`}
            ></i>
            <i
              title="En route icing severity"
              className={`dot ${currEval.alongRouteSeverity.color} ${
                personalMinValueToShape[currEval.alongRouteSeverity.value]
              }`}
            ></i>
            <i
              title="En route turbulence intensity"
              className={`dot ${currEval.alongRouteTurbulence.color} ${
                personalMinValueToShape[currEval.alongRouteTurbulence.value]
              }`}
            ></i>
            <i
              title="En route convective potential"
              className={`dot ${currEval.alongRouteConvection.color} ${
                personalMinValueToShape[currEval.alongRouteConvection.value]
              }`}
            ></i>
            <i
              title="Destination ceiling height"
              className={`dot ${currEval.destinationCeiling.color} ${
                personalMinValueToShape[currEval.destinationCeiling.value]
              }`}
            ></i>
            <i
              title="Destination surface visibility"
              className={`dot ${currEval.destinationVisibility.color} ${
                personalMinValueToShape[currEval.destinationVisibility.value]
              }`}
            ></i>
            <i
              title="Destination crosswinds"
              className={`dot ${currEval.destinationCrosswind.color} ${
                personalMinValueToShape[currEval.destinationCrosswind.value]
              }`}
            ></i>
          </div>
          <div className="bar">
            <i
              title="Departure ceiling height"
              className={`dot ${afterEval.departureCeiling.color} ${
                personalMinValueToShape[afterEval.departureCeiling.value]
              }`}
            ></i>
            <i
              title="Departure surface visibility"
              className={`dot ${afterEval.departureVisibility.color} ${
                personalMinValueToShape[afterEval.departureVisibility.value]
              }`}
            ></i>
            <i
              title="Departure crosswinds"
              className={`dot ${afterEval.departureCrosswind.color} ${
                personalMinValueToShape[afterEval.departureCrosswind.value]
              }`}
            ></i>
            <i
              title="En route ceiling height"
              className={`dot ${afterEval.alongRouteCeiling.color} ${
                personalMinValueToShape[afterEval.alongRouteCeiling.value]
              }`}
            ></i>
            <i
              title="En route surface visibility"
              className={`dot ${afterEval.alongRouteVisibility.color} ${
                personalMinValueToShape[afterEval.alongRouteVisibility.value]
              }`}
            ></i>
            <i
              title="En route icing probability"
              className={`dot ${afterEval.alongRouteProb.color} ${
                personalMinValueToShape[afterEval.alongRouteProb.value]
              }`}
            ></i>
            <i
              title="En route icing severity"
              className={`dot ${afterEval.alongRouteSeverity.color} ${
                personalMinValueToShape[afterEval.alongRouteSeverity.value]
              }`}
            ></i>
            <i
              title="En route turbulence intensity"
              className={`dot ${afterEval.alongRouteTurbulence.color} ${
                personalMinValueToShape[afterEval.alongRouteTurbulence.value]
              }`}
            ></i>
            <i
              title="En route convective potential"
              className={`dot ${afterEval.alongRouteConvection.color} ${
                personalMinValueToShape[afterEval.alongRouteConvection.value]
              }`}
            ></i>
            <i
              title="Destination ceiling height"
              className={`dot ${afterEval.destinationCeiling.color} ${
                personalMinValueToShape[afterEval.destinationCeiling.value]
              }`}
            ></i>
            <i
              title="Destination surface visibility"
              className={`dot ${afterEval.destinationVisibility.color} ${
                personalMinValueToShape[afterEval.destinationVisibility.value]
              }`}
            ></i>
            <i
              title="Destination crosswinds"
              className={`dot ${afterEval.destinationCrosswind.color} ${
                personalMinValueToShape[afterEval.destinationCrosswind.value]
              }`}
            ></i>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartureAdvisorTimeBlockComponent;
