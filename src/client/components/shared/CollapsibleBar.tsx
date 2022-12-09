import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { DateObject } from 'react-multi-date-picker';
import TimeSlider from './TimeSlider';

interface DateData {
  month: number;
  day: string;
  hour: number;
}

function CollapsibleBar({
  handleTime,
}: {
  handleTime: (time: DateData) => void;
}) {
  // const [windowSize, setWindowSize] = useState(setWindowSize());

  return (
    <div className="collps">
      <div className="collps__wrp">
        <TimeSlider handleTime={handleTime} />
      </div>
    </div>
  );
}

export default CollapsibleBar;
