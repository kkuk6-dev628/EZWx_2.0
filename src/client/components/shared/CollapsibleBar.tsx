import React, { useState } from 'react';
import TimeSlider from './TimeSlider';

interface DateData {
  month: string;
  weekDay: string;
  day: number;
  hour: number;
  minute: string;
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
