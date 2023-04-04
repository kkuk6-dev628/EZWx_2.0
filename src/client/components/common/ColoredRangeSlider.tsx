/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback } from 'react';
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
  mergeTooltipThreshold?: number; // as percent
  mergeTooltipSeparator?: string;
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

export const ColoredRangeSlider = ({
  connectClasses,
  mergeTooltipThreshold,
  mergeTooltipSeparator = '-',
  ...props
}: ColoredRangeSliderProps) => {
  const initConnects = useCallback((slider) => {
    if (!slider || !slider.noUiSlider) {
      return;
    }
    let i = 0;
    recursiveMap(slider.children, (el) => {
      if (el.className === 'noUi-connect' && connectClasses.length > i) {
        el.classList.add(connectClasses[i]);
        i++;
      }
    });
  }, []);

  const mergeTooltips = (values, handle, unencoded, tap, positions, slider) => {
    if (!mergeTooltipThreshold) return;
    const textIsRtl = props.direction === 'rtl';
    const isRtl = slider.options.direction === 'rtl';
    const isVertical = slider.options.orientation === 'vertical';
    const tooltips = slider.getTooltips();
    const origins = slider.getOrigins();

    if (!tooltips) return;
    // Move tooltips into the origin element. The default stylesheet handles this.
    tooltips.forEach(function (tooltip, index) {
      if (tooltip) {
        origins[index].appendChild(tooltip);
      }
    });

    const pools = [[]];
    const poolPositions = [[]];
    const poolValues = [[]];
    let atPool = 0;

    // Assign the first tooltip to the first pool, if the tooltip is configured
    if (tooltips[0]) {
      pools[0][0] = 0;
      poolPositions[0][0] = positions[0];
      poolValues[0][0] = values[0];
    }

    for (let i = 1; i < positions.length; i++) {
      if (!tooltips[i] || positions[i] - positions[i - 1] > mergeTooltipThreshold) {
        atPool++;
        pools[atPool] = [];
        poolValues[atPool] = [];
        poolPositions[atPool] = [];
      }
      if (tooltips[i]) {
        pools[atPool].push(i);
        poolValues[atPool].push(values[i]);
        poolPositions[atPool].push(positions[i]);
      }
    }

    pools.forEach(function (pool, poolIndex) {
      const handlesInPool = pool.length;

      for (let j = 0; j < handlesInPool; j++) {
        const handleNumber = pool[j];

        if (j === handlesInPool - 1) {
          let offset = 0;

          poolPositions[poolIndex].forEach(function (value) {
            offset += 1000 - value;
          });

          const direction = isVertical ? 'bottom' : 'right';
          const last = isRtl ? 0 : handlesInPool - 1;
          const first = isRtl ? handlesInPool - 1 : 0;
          const lastOffset = 1000 - poolPositions[poolIndex][last];
          const firstOffset = 1000 - poolPositions[poolIndex][first];
          offset = (textIsRtl && !isVertical ? 100 : 0) + firstOffset - lastOffset;

          // Center this tooltip over the affected handles
          tooltips[handleNumber].innerHTML = (isRtl ? poolValues[poolIndex].reverse() : poolValues[poolIndex]).join(
            mergeTooltipSeparator,
          );
          tooltips[handleNumber].style.display = 'block';
          tooltips[handleNumber].style[direction] = offset + '%';
          tooltips[handleNumber].style['margin-bottom'] = '6px';
          if (poolValues[poolIndex].length > 1) {
            const va = poolValues[poolIndex][last] < 1000 ? 3 : 5;
            const margin = 30 - (mergeTooltipThreshold - (lastOffset - firstOffset)) * va;
            tooltips[handleNumber].style['margin-left'] = margin + '%';
            console.log(poolValues[poolIndex].length);
          } else {
            tooltips[handleNumber].style['margin-left'] = 0;
          }
        } else {
          // Hide this tooltip
          tooltips[handleNumber].style.display = 'none';
        }
      }
    });
  };

  return (
    <div className="colored-range-slider">
      {/* 
      // @ts-ignore */}
      <Nouislider {...props} className="slider-margin" instanceRef={initConnects} onUpdate={mergeTooltips}></Nouislider>
    </div>
  );
};
