import { DomEvent } from 'leaflet';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setDataLoadTime } from '../../store/layers/DataLoadTimeSlice';
import { SvgRefresh } from '../utils/SvgIcons';

const MapSideButtons = () => {
  const dispatch = useDispatch();
  const ref = useRef();
  useEffect(() => {
    if (ref?.current) {
      DomEvent.disableClickPropagation(ref.current);
      DomEvent.disableScrollPropagation(ref.current);
      // L.DomEvent.on(ref.current, 'mousemove contextmenu drag', L.DomEvent.stop);
    }
  }, [ref?.current]);

  return (
    <div className="pos_relative" ref={ref}>
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
