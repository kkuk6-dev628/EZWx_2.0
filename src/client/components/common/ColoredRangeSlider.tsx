import React, { isValidElement, ReactElement, useCallback, useEffect, useRef } from 'react';
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
  mergeTooltipThreshold?: number;
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
  const mergeTooltips = useCallback((slider) => {
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
    if (!mergeTooltipThreshold) return;
    const textIsRtl = getComputedStyle(slider).direction === 'rtl';
    const isRtl = slider.noUiSlider.options.direction === 'rtl';
    const isVertical = slider.noUiSlider.options.orientation === 'vertical';
    const tooltips = slider.noUiSlider.getTooltips();
    const origins = slider.noUiSlider.getOrigins();

    if (!tooltips) return;
    // Move tooltips into the origin element. The default stylesheet handles this.
    tooltips.forEach(function (tooltip, index) {
      if (tooltip) {
        origins[index].appendChild(tooltip);
      }
    });

    slider.noUiSlider.on('update', function (values, handle, unencoded, tap, positions) {
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
        } else {
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
            const lastOffset = 1000 - poolPositions[poolIndex][last];
            offset = (textIsRtl && !isVertical ? 100 : 0) + offset / handlesInPool - lastOffset;

            // Center this tooltip over the affected handles
            tooltips[handleNumber].innerHTML = poolValues[poolIndex].join(mergeTooltipSeparator);
            tooltips[handleNumber].style.display = 'block';
            tooltips[handleNumber].style[direction] = offset + '%';
          } else {
            // Hide this tooltip
            tooltips[handleNumber].style.display = 'none';
          }
        }
      });
    });
  }, []);

  return (
    <div className="colored-range-slider">
      <Nouislider {...props} className="slider-margin" instanceRef={mergeTooltips}></Nouislider>
    </div>
  );
};
