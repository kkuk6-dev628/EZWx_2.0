import React from 'react';
import {
  SvgLayer,
  SvgMap,
  SvgProfileCharge,
  SvgRoute,
  SvgTemperature,
} from '../utils/SvgIcons';

function MapTabs() {
  return (
    <div className="tabs">
      <button className="tabs__btn">1040Z</button>
      <button className="tabs__btn">
        <SvgLayer />
        <p className="text btn__text">Layer</p>
      </button>
      <button className="tabs__btn">
        <SvgRoute />
        <p className="text btn__text">Route</p>
      </button>
      <button className="tabs__btn">
        <SvgProfileCharge />
        <p className="text btn__text">Profile</p>
      </button>
      <button className="tabs__btn">
        <SvgMap />
        <p className="text btn__text">Base map</p>
      </button>
      <button className="tabs__btn">
        <SvgTemperature />
        <p className="text btn__text">7 days</p>
      </button>
    </div>
  );
}

export default MapTabs;
