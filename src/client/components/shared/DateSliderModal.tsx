import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';

//i pass setIsShowModal and showModal as a prop to the modal component
interface Props {
  setIsShowDateModal: (isShowModal: boolean) => void;
}

function DateSliderModal({ setIsShowDateModal }: Props) {
  return (
    <div className="dates">
      <div className="dates__wrp">
        <div className="dates__top">
          <p className="dates__top__text text">Date slider</p>
          <button
            onClick={() => setIsShowDateModal(false)}
            className="dates__top__close"
          >
            <AiOutlineClose className="dates__icon" />
          </button>
        </div>
        <div className="dates__content">
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__red">&nbsp;</div>
            <p className="dates__text text">
              Departure ceiling height (2900, 4800)
            </p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__yello">&nbsp;</div>
            <p className="dates__text text">
              Departure surface visibility (4.5, 11.5)
            </p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__grn">&nbsp;</div>
            <p className="dates__text text">Departure crosswinds (9, 22)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__red">&nbsp;</div>
            <p className="dates__text text">
              En route ceiling height (2400, 4300)
            </p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__yello">&nbsp;</div>
            <p className="dates__text text">
              En route surface visibility (5.5, 12.5)
            </p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__grn">&nbsp;</div>
            <p className="dates__text text">
              En route icing probability (18, 69)
            </p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__yello">&nbsp;</div>
            <p className="dates__text text">
              Departure surface visibility (4.5, 11.5)
            </p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__grn">&nbsp;</div>
            <p className="dates__text text">Departure crosswinds (9, 22)</p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__red">&nbsp;</div>
            <p className="dates__text text">
              En route ceiling height (2400, 4300)
            </p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__yello">&nbsp;</div>
            <p className="dates__text text">
              En route surface visibility (5.5, 12.5)
            </p>
          </div>
          <div className="dates__data__area">
            <div className="dates__circle dates__circle__grn">&nbsp;</div>
            <p className="dates__text text">
              En route icing probability (18, 69)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DateSliderModal;
