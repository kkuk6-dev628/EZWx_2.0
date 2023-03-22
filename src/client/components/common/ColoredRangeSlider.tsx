import React, { isValidElement, ReactElement, useEffect, useRef } from 'react';
import Nouislider, { NouisliderProps } from 'nouislider-react';
import 'nouislider/distribute/nouislider.css';

export const formatForInteger = {
  from: function (formattedValue) {
    return Number(formattedValue);
  },
  to: function (numericValue) {
    return Math.round(numericValue);
  },
};

export const formatForDecimal = {
  from: function (formattedValue) {
    return Number(formattedValue);
  },
  to: function (numericValue) {
    return Math.round(numericValue * 10) / 10;
  },
};

interface ColoredRangeSliderProps extends NouisliderProps {
  connectClasses: string[];
}

function recursiveMap(children, fn) {
  const arr = [].slice.call(children);
  return arr.map((child: any) => {
    if (child.children) {
      recursiveMap(child.children, fn);
    }

    return fn(child);
  });
}

export const ColoredRangeSlider = ({ connectClasses, ...props }: ColoredRangeSliderProps) => {
  const localRef = useRef();
  useEffect(() => {
    if (localRef.current) {
      const element = localRef.current as HTMLElement;
      let i = 0;
      recursiveMap(element.children, (el) => {
        if (el.className === 'noUi-connect' && connectClasses.length > i) {
          el.classList.add(connectClasses[i]);
          i++;
        }
      });
    }
  }, [localRef.current]);
  return (
    <div ref={localRef} className="colored-range-slider">
      <Nouislider {...props} className="slider-margin"></Nouislider>
    </div>
  );
};
