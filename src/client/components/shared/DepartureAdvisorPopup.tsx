import React, { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import DateSlider from './DateSlider';

//i pass setIsShowModal and showModal as a prop to the modal component
interface Props {
  setIsShowDateModal: (isShowModal: boolean) => void;
  evaluationsByTime: any[];
  observationTime: number;
}

function DepartureAdvisorPopup({ setIsShowDateModal, evaluationsByTime, observationTime }: Props) {
  const [currentTime, setCurrentTime] = useState(observationTime);
  const [evaluation, setEvaluation] = useState();
  useEffect(() => {
    const evaluation = evaluationsByTime.reduce((prev, curr) => {
      const diffPrev = currentTime - prev.time;
      const diffCurr = currentTime - curr.time;
      if (diffCurr > 0 && diffCurr < diffPrev) {
        return curr;
      }
      return prev;
    });
    setEvaluation(evaluation.evaluation);
  }, [currentTime]);
  return (
    <div className="dates">
      <div className="dates__wrp">
        <div className="dates__top">
          <p className="dates__top__text text">Departure Advisor</p>
          <button onClick={() => setIsShowDateModal(false)} className="dates__top__close">
            <AiOutlineClose className="dates__icon" />
          </button>
        </div>
        <div className="dates__content">
          <div className="dates__date__area">
            <div>
              <b>Time:</b>
            </div>
            <p>
              {new Date(currentTime).toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'numeric',
                timeZone: 'UTC',
              })}
            </p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__red">&nbsp;</div>
            <p className="dates__text text">Departure ceiling height (2900, 4800)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__yello">&nbsp;</div>
            <p className="dates__text text">Departure surface visibility (4.5, 11.5)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__grn">&nbsp;</div>
            <p className="dates__text text">Departure crosswinds (9, 22)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__red">&nbsp;</div>
            <p className="dates__text text">En route ceiling height (2400, 4300)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__yello">&nbsp;</div>
            <p className="dates__text text">En route surface visibility (5.5, 12.5)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__grn">&nbsp;</div>
            <p className="dates__text text">En route icing probability (18, 69)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__yello">&nbsp;</div>
            <p className="dates__text text">Departure surface visibility (4.5, 11.5)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__grn">&nbsp;</div>
            <p className="dates__text text">Departure crosswinds (9, 22)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__red">&nbsp;</div>
            <p className="dates__text text">En route ceiling height (2400, 4300)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__yello">&nbsp;</div>
            <p className="dates__text text">En route surface visibility (5.5, 12.5)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__grn">&nbsp;</div>
            <p className="dates__text text">En route icing probability (18, 69)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepartureAdvisorPopup;
