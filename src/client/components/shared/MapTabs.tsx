import React, { useState } from 'react';
import ZuluClock from './ZuluClock';

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
      <ZuluClock textColor="black" />
      {tabMenus.map((tabMenu) => (
        <button
          key={tabMenu.id}
          className={`tabs__btn ${tabMenu.isHideResponsive && 'tabs__btn--hide_responsive'} ${
            tabMenu.id === 'more' && 'tabs__btn--more'
          }`}
          onClick={
            tabMenu.id === 'more'
              ? () => setShowDropDown(!showDropDown)
              : () => {
                  setShowDropDown(false);
                  tabMenu.handler(tabMenu.id);
                }
          }
        >
          {tabMenu.svg && tabMenu.svg}
          <p className="btn__text">{tabMenu.name}</p>
        </button>
      ))}

      {showDropDown && (
        <div className="tabs__dropdown">
          {tabMenus.slice(4).map((menuItem) => {
            return (
              <button
                className=" tabs__btn--dropdown"
                onClick={() => {
                  menuItem.handler(menuItem.id);
                  setShowDropDown(false);
                }}
              >
                {menuItem.svg}
                <p className="btn__text">{menuItem.name}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MapTabs;
