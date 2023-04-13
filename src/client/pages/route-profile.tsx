import React, { useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { AiOutlineSearch } from 'react-icons/ai';
import { GrFormClose } from 'react-icons/gr';
import { FaPlayCircle } from 'react-icons/fa';
import { BsBookmarkPlus, BsShare } from 'react-icons/bs';
import { MdOutlineSaveAlt } from 'react-icons/md';
import MapTabs from '../components/shared/MapTabs';
import { SvgAir, SvgDropDown, SvgMap, SvgRefresh, SvgRoute, SvgTabs, SvgZoom } from '../components/utils/SvgIcons';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import RouteProfileContainer from '../components/route-profile/RouteProfileContainer';
import { useRouter } from 'next/router';
import RouteProfileWrapper from '../components/route-profile/RouteProfileWrapper';

function RouteProfile() {
  const router = useRouter();

  const marks = {
    0: '0',
    25: {
      label: <p className="igry__range__txt">1200Z Feb 27 - 0000Z Feb 28</p>,
    },
    50: {
      label: <p className="igry__range__txt">1200Z Feb 27 - 0000Z Feb 28</p>,
    },
    75: {
      label: <p className="igry__range__txt">1200Z Feb 27 - 0000Z Feb 28</p>,
    },
    100: {
      label: <p className="igry__range__txt">1200Z Feb 27 - 0000Z Feb 28</p>,
    },
  };
  return (
    <>
      <RouteProfileWrapper />
      <div className="igry__range">
        <div className="container">
          <h2 className="igry__range__title">Valid 0000Z Feb 27 to 1200Z Feb 27</h2>
          <div className=" container">
            <div className="igry__range__wrp">
              <div className="igry__btn__area">
                <button className="igry__range__play__btn">
                  <FaPlayCircle className="igry__range__play--icon" />
                </button>
              </div>
              <div className="igry__slider__area">
                <Slider min={20} defaultValue={20} marks={marks} step={null} className="igry__range__slider" />
                <div className="igry__marker__area">
                  <p className="igry__range__txt">1200Z Feb 27 - 0000Z Feb 28</p>
                  <p className="igry__range__txt">1200Z Feb 27 - 0000Z Feb 28</p>
                  <p className="igry__range__txt">1200Z Feb 27 - 0000Z Feb 28</p>
                  <p className="igry__range__txt">1200Z Feb 27 - 0000Z Feb 28</p>
                </div>
              </div>
            </div>
            <div className="igry__tbs">
              <div className="igry__tbs__btn__area">
                <button className="igry__tbs__btn">
                  <BsBookmarkPlus className="igry__tbs__btn--icon" />
                  <p className="igry__tbs__txt">Save</p>
                </button>
              </div>
              <div className="igry__tbs__btn__area">
                <button className="igry__tbs__btn">
                  <MdOutlineSaveAlt className="igry__tbs__btn--icon" />
                  <p className="igry__tbs__txt">Export</p>
                </button>
              </div>
              <div className="igry__tbs__btn__area">
                <button className="igry__tbs__btn">
                  <BsShare className="igry__tbs__btn--icon" />
                  <p className="igry__tbs__txt">Share</p>
                </button>
              </div>
              <div className="igry__tbs__btn__area">
                <button className="igry__range__play__btn">
                  <FaPlayCircle className="igry__range__play--icon" />
                </button>
              </div>
              <div className="igry__tbs__btn__area">
                <button className="igry__tbs__btn">
                  <SvgTabs />
                  <p className="igry__tbs__txt">Future</p>
                </button>
              </div>
              <div className="igry__tbs__btn__area">
                <button className="igry__tbs__btn">
                  <SvgZoom />
                  <p className="igry__tbs__txt">Expand</p>
                </button>
              </div>
              <div className="igry__tbs__btn__area">
                <button className="igry__tbs__btn">
                  <SvgRefresh />
                  <p className="igry__tbs__txt">Expand</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RouteProfile;
