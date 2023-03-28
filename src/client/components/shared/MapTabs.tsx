import React, { useState } from 'react';
import { SvgAir, SvgMap, SvgTemperature } from '../utils/SvgIcons';

interface TabMenusObj {
  id: string;
  name: string;
  handler: (id: string) => void;
  svg: React.ReactNode;
  isHideResponsive: boolean;
}

interface TabMenus {
  tabMenus: TabMenusObj[];
}

function MapTabs({ tabMenus }: TabMenus) {
  const [showDropDown, setShowDropDown] = useState(false);
  return (
    <div className="tabs">
      {tabMenus.map((tabMenu) => (
        <button
          key={tabMenu.id}
          className={`tabs__btn ${tabMenu.isHideResponsive && 'tabs__btn--hide'} ${
            tabMenu.id === 'more' && 'tabs__btn--more'
          }`}
          onClick={tabMenu.id === 'more' ? () => setShowDropDown(!showDropDown) : () => tabMenu.handler(tabMenu.id)}
        >
          {tabMenu.svg && tabMenu.svg}
          <p className="btn__text">{tabMenu.name}</p>
        </button>
      ))}

      {showDropDown && (
        <div className="tabs__dropdown">
          <button
            className=" tabs__btn--dropdown"
            onClick={() => {
              setShowDropDown(false);
            }}
          >
            <SvgAir />
            <p className="btn__text">Airport</p>
          </button>
          <button
            className="tabs__btn--dropdown"
            onClick={() => {
              tabMenus[5].handler(tabMenus[5].id);
              setShowDropDown(false);
            }}
          >
            <SvgMap />
            <p className=" btn__text">Base map</p>
          </button>
          <button
            className=" tabs__btn--dropdown"
            onClick={() => {
              setShowDropDown(false);
            }}
          >
            <SvgTemperature />
            <p className="btn__text">7 days</p>
          </button>
        </div>
      )}
    </div>
  );
}

export default MapTabs;
