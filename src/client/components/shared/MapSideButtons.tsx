import React from 'react';
import { SvgRefresh } from '../utils/SvgIcons';

const MapSideButtons = () => {
  return (
    <div className="pos_relative">
      <div className="map__btns__container">
        <div className="user__action__btns" onClick={() => window.location.reload()}>
          <SvgRefresh />
        </div>
        {/* <div className="user__action__btns" onClick={openUserSettingDrawer}>
          <MdSettings />
        </div>
        <div className="user__action__btns">
          <FaInfoCircle />
        </div>
        <div className="user__action__btns">
          <FaListUl />
        </div> */}
      </div>
    </div>
  );
};

export default MapSideButtons;
