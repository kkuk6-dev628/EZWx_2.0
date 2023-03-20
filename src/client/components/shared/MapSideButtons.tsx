import React from 'react';
import { useDispatch } from 'react-redux';
import { setDataLoadTime } from '../../store/layers/DataLoadTimeSlice';
import { SvgRefresh } from '../utils/SvgIcons';

const MapSideButtons = () => {
  const dispatch = useDispatch();

  return (
    <div className="pos_relative">
      <div className="map__btns__container">
        <div className="user__action__btns" onClick={() => dispatch(setDataLoadTime(Date.now()))}>
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
