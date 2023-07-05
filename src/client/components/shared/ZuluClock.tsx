import { useEffect, useState } from 'react';
import { simpleTimeOnlyFormat } from '../map/common/AreoFunctions';

const ZuluClock = ({ textColor }) => {
  const [zuluTime, setZuluTime] = useState(simpleTimeOnlyFormat(new Date(), false));
  useEffect(() => {
    const interval = setInterval(() => setZuluTime(simpleTimeOnlyFormat(new Date(), false)), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button key="zulu-clock" className={`zulu-clock tabs__btn`}>
      <p className="btn__text" style={{ color: textColor }}>
        {zuluTime}
      </p>
    </button>
  );
};

export default ZuluClock;
