import React from 'react';
import { FaInfoCircle, FaListUl, FaRedoAlt } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';

const MapSideButtons = () => {
  return (
    <div className="pos_relative">
      <div className="map__btns__container">
        <div className="user__action__btns" onClick={() => window.location.reload()}>
          <FaRedoAlt />
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
