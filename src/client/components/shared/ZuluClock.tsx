import { useEffect, useState } from 'react';
import { simpleTimeOnlyFormat } from '../map/common/AreoFunctions';

const ZuluClock = () => {
  const [zuluTime, setZuluTime] = useState(simpleTimeOnlyFormat(new Date(), false));
  useEffect(() => {
    const interval = setInterval(() => setZuluTime(simpleTimeOnlyFormat(new Date(), false)), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button key="zulu-clock" className={`tabs__btn tabs__btn--hide_responsive`}>
      <p className="btn__text">{zuluTime}</p>
    </button>
  );
};

export default ZuluClock;
