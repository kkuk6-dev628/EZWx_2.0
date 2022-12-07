import React, { useEffect, useState } from 'react';

function TimeSlider({ isColleps }) {
  const [amountOfData, setAmountOfData] = useState(86);
  const randomColorData = ['red', 'green', 'yellow'];
  useEffect(() => {
    function handleWindowResize() {
      if (window.innerWidth < 991) {
        // TODO document why this block is empty
        setAmountOfData(43);
      } else {
        setAmountOfData(86);
      }
    }

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);
  return (
    <>
      {[...Array(amountOfData)].map((_, index) => (
        //get
        <button
          key={index}
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
    </>
  );
}

export default TimeSlider;
