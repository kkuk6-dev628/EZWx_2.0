import React, { FormEventHandler } from 'react';
import {
  SvgLayer,
  SvgMap,
  SvgProfileCharge,
  SvgRoute,
  SvgTemperature,
} from '../utils/SvgIcons';

interface MapTabsProps {
  layerClick: FormEventHandler;
  routeClick: FormEventHandler;
  profileClick: FormEventHandler;
  basemapClick: FormEventHandler;
}

function MapTabs({
  layerClick,
  routeClick,
  profileClick,
  basemapClick,
}: MapTabsProps) {
  return (
    <div className="tabs">
      <button className="tabs__btn">1040Z</button>
      <button className="tabs__btn" onClick={layerClick}>
        <SvgLayer />
        <p className="text btn__text">Layer</p>
      </button>
      <button className="tabs__btn" onClick={routeClick}>
        <SvgRoute />
        <p className="text btn__text">Route</p>
      </button>
      <button className="tabs__btn" onClick={profileClick}>
        <SvgProfileCharge />
        <p className="text btn__text">Profile</p>
      </button>
      <button className="tabs__btn" onClick={basemapClick}>
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
