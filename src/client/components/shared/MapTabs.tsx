import React, { FormEventHandler, useState } from 'react';
import {
  SvgAir,
  SvgLayer,
  SvgMap,
  SvgProfileCharge,
  SvgRoute,
  SvgTemperature,
  SvgThreeDot,
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
  const [showDropDown, setShowDropDown] = useState(false);
  return (
    <div className="tabs">
      <button className="tabs__btn">1040Z</button>
      <button className="tabs__btn" onClick={layerClick}>
        <SvgLayer />
        <p className="btn__text">Layer</p>
      </button>
      <button className="tabs__btn" onClick={routeClick}>
        <SvgRoute />
        <p className="btn__text">Route</p>
      </button>
      <button className="tabs__btn" onClick={profileClick}>
        <SvgProfileCharge />
        <p className="btn__text">Profile</p>
      </button>
      <button
        className="tabs__btn tabs__btn--more"
        onClick={() => setShowDropDown(!showDropDown)}
      >
        <SvgThreeDot />
      </button>
      <button className="tabs__btn tabs__btn--hide" onClick={basemapClick}>
        <SvgMap />
        <p className="btn__text">Base map</p>
      </button>
      <button className="tabs__btn tabs__btn--hide">
        <SvgTemperature />
        <p className="btn__text">7 days</p>
      </button>
      {showDropDown && (
        <div className="tabs__dropdown">
          <button className=" tabs__btn--dropdown">
            <SvgAir />
            <p className="btn__text">Airport</p>
          </button>
          <button className="tabs__btn--dropdown" onClick={basemapClick}>
            <SvgMap />
            <p className=" btn__text">Base map</p>
          </button>
          <button className=" tabs__btn--dropdown">
            <SvgTemperature />
            <p className="btn__text">7 days</p>
          </button>
        </div>
      )}
    </div>
  );
}

export default MapTabs;
