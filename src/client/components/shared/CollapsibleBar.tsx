import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface Props {
  setIsShowDateModal: (isShowModal: boolean) => void;
}

function CollapsibleBar({ setIsShowDateModal }: Props) {
  const [isColleps, setIsColleps] = useState(false);

  const randomColorData = ['red', 'green', 'yellow'];
  return (
    <div className="collps">
      <div className="collps__wrp">
        <div className="collps__top__area">
          <div className="collps__btn__area">
            <button
              onClick={() => setIsColleps(!isColleps)}
              className="collps__btn"
            >
              05Z
              <FaChevronDown className="collps__icon" />
            </button>
          </div>
          <div className="collps__dot__area">
            {[...Array(86)].map((_, index) => (
              //get
              <button
                key={index}
                onClick={() => setIsShowDateModal(true)}
                className={`collps__dot__btn ${randomColorData[index % 4]} ${
                  isColleps ? 'collps__dot__btn--full' : ''
                }`}
              >
                {[...Array(12)].map((_, i) => (
                  <span key={i} className="collps__dot">
                    &nbsp;
                  </span>
                ))}
              </button>
            ))}
          </div>
        </div>
        <div className="collps__btm__area">
          <div className="collps__date__area">
            <p className="collps__date__text">Fri 11</p>
          </div>
          <div className="collps__date__area">
            <p className="collps__date__text">Sut 12</p>
          </div>
          <div className="collps__date__area">
            <p className="collps__date__text">Sun 13</p>
          </div>
          <div className="collps__date__area">
            <p className="collps__date__text">Mon 14</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollapsibleBar;
