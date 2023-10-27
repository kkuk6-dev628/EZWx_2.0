import { useState, SyntheticEvent } from 'react';
import { addLeadingZeroes, simpleTimeOnlyFormat } from '../map/common/AreoFunctions';
import { PersonalMinsEvaluation, personalMinValueToShape } from './DepartureAdvisor';
import { hourInMili } from '../../utils/constants';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../store/user/UserSettings';
import { getEvaluationByTime } from './DepartureAdvisorPopup';
import DepartureAdvisor3Bars from './DepartureAdvisor3Bars';

interface Props {
  index: number;
  time: Date;
  color: string;
  isMap: boolean;
  show3Bar: boolean;
  evaluationsByTime: { time: number; evaluation: PersonalMinsEvaluation }[];
  setShowPopup: (show: boolean) => void;
  handleTimeChange: (time: Date) => void;
}
function DepartureAdvisorTimeBlockComponent({
  index,
  time,
  color,
  isMap,
  show3Bar,
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
  const beforeEval = realIndex < 0 ? null : getEvaluationByTime(evaluationsByTime, time.getTime() - hourInMili);
  const currEval = realIndex < 0 ? null : getEvaluationByTime(evaluationsByTime, time.getTime());
  const afterEval = realIndex < 0 ? null : getEvaluationByTime(evaluationsByTime, time.getTime() + hourInMili);
  const isPast = time.getTime() < new Date().getTime();
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
      onClick={() => {
        setShowBarComponent(false);
        handleTimeChange(time);
      }}
      onMouseOver={(e) => {
        show3Bar && setShowBarComponent(!isPast);
      }}
      onMouseOut={(e) => {
        setShowBarComponent(false);
      }}
    >
      {settingsState.default_time_display_unit
        ? addLeadingZeroes(time.getHours(), 2)
        : addLeadingZeroes(time.getUTCHours(), 2) + 'z'}
      {beforeEval && showBarComponent && (
        <DepartureAdvisor3Bars
          beforeEval={beforeEval}
          currEval={currEval}
          afterEval={afterEval}
          left={0}
          setShowPopup={setShowPopup}
        ></DepartureAdvisor3Bars>
      )}
    </div>
  );
}

export default DepartureAdvisorTimeBlockComponent;
