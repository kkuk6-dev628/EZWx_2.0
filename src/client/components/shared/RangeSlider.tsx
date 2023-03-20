import * as React from 'react';
import Slider from '@mui/material/Slider';

const RangeSlider = React.forwardRef((props: any, ref) => {
  const [value2, setValue2] = React.useState<[number, number]>(props.value);
  const [className, setClassName] = React.useState('');
  const minDistance = props.mindistance || 10;
  const max = props.max || 100;
  const min = props.min || 0;

  React.useEffect(() => {
    setValue2(props.value);
  });

  const handleChange2 = (event: Event, newValue: number | [number, number], activeThumb: number) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    const distance = newValue[1] - newValue[0];
    if (newValue[0] < 10) {
      if (distance < 40) {
        setClassName('min-distance margin-10');
      } else {
        setClassName('');
      }
    } else if (newValue[0] < 100) {
      if (distance < 30) {
        if (newValue[0] > 80) {
          setClassName('min-distance margin-36');
        } else {
          setClassName('min-distance margin-20');
        }
      } else if (distance < 40) {
        setClassName('min-distance margin-20');
      } else if (distance < 50) {
        setClassName('min-distance margin-10');
      } else if (distance < 60) {
        setClassName('min-distance margin-10');
      } else if (distance < 75) {
        setClassName('min-distance margin-0');
      } else {
        setClassName('');
      }
    } else {
      if (distance < 30) {
        setClassName('min-distance margin-40');
      } else if (distance < 40) {
        setClassName('min-distance margin-36');
      } else if (distance < 40) {
        setClassName('min-distance margin-20');
      } else if (distance < 60) {
        setClassName('min-distance margin-20');
      } else if (distance < 75) {
        setClassName('min-distance margin-10');
      } else if (distance < 100) {
        setClassName('min-distance margin-0');
      } else {
        setClassName('');
      }
    }
    let values = newValue;
    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], max - minDistance);
        values = [clamped, clamped + minDistance];
        setValue2(values);
      } else {
        const clamped = Math.max(newValue[1], min + minDistance);
        values = [clamped - minDistance, clamped];
        setValue2(values);
      }
    } else {
      setValue2(newValue as [number, number]);
    }
    if (props.onChange) props.onChange(event, values, activeThumb);
  };

  return <Slider {...props} ref={ref} value={value2} className={className} disableSwap onChange={handleChange2} />;
});

export default RangeSlider;
