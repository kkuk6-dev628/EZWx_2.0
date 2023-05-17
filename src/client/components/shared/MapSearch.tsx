import React, { useState } from 'react';
import { SvgAir, SvgMap, SvgTemperature } from '../utils/SvgIcons';
import Image from 'next/image';
import { AiOutlineHeart, AiOutlineHome, AiOutlineCaretDown, AiOutlineClose } from 'react-icons/ai';
import { FiNavigation } from 'react-icons/fi';

interface MapSearchObj {
  id: string;
  name: string;
  handler: (id: string) => void;
  svg: React.ReactNode;
  isHideResponsive: boolean;
}

interface MapSearch {
  tabMenus: MapSearchObj[];
}

function MapSearch() {
  const [showDropDown, setShowDropDown] = useState(false);
  return (
    <div className="search">
      <div className="search_logo">
        <Image width={80} height={30} className="" src="/images/Logo.png" alt={'#logo'} loading="eager" />
      </div>
      <span className="search__btn">
        <FiNavigation />
      </span>
      <span className="search__container">
        <input className="search__input" placeholder="search by Airport/ City Name" />
        <AiOutlineClose />
      </span>
      <span className="search__btn">
        <AiOutlineHome />
      </span>
      <span className="search__btn">
        <AiOutlineHeart />
      </span>
      <span className="search__btn">
        <AiOutlineCaretDown />
      </span>
    </div>
  );
}

export default MapSearch;
