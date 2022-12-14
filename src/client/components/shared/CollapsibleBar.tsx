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
  const [minOfTimeSlider, setMinOfTimeSlider] = useState(new Date().getTime());
  const [maxOfTimeSlider, setMaxOfTimeSlider] = useState(new Date().getTime());

  return (
    <div className="collps">
      <TimeSlider
        handleTime={handleTime}
        min={minOfTimeSlider}
        max={maxOfTimeSlider}
        step={2}
      />
    </div>
  );
}

export default CollapsibleBar;
