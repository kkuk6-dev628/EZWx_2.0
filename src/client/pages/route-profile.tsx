import React, { useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { AiOutlineSearch } from 'react-icons/ai';
import { GrFormClose } from 'react-icons/gr';
import { FaPlayCircle } from 'react-icons/fa';
import { BsBookmarkPlus, BsShare } from 'react-icons/bs';
import { MdOutlineSaveAlt } from 'react-icons/md';
import { SvgRefresh, SvgTabs, SvgZoom } from '../components/utils/SvgIcons';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import RouteProfileWrapper from '../components/route-profile/RouteProfileWrapper';

function RouteProfile() {
  return (
    <>
      <RouteProfileWrapper />
    </>
  );
}

export default RouteProfile;
