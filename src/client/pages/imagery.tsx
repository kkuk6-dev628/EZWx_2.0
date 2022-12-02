import React, { useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { AiOutlineSearch } from 'react-icons/ai';
import { GrFormClose } from 'react-icons/gr';
import { FaPlayCircle } from 'react-icons/fa';
import { BsBookmarkPlus, BsShare } from 'react-icons/bs';
import { MdOutlineSaveAlt } from 'react-icons/md';
import MapTabs from '../components/shared/MapTabs';
import {
  SvgDropDown,
  SvgRefresh,
  SvgTabs,
  SvgZoom,
} from '../components/utils/SvgIcons';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Image from 'next/image';

function Imagery() {
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
    <div className="igry">
      <div className="igry__wrp">
        <div className="igry__lft igry__blu">
          <MapTabs
            layerClick={function (event: React.FormEvent<Element>): void {
              throw new Error('Function not implemented.');
            }}
            routeClick={function (event: React.FormEvent<Element>): void {
              throw new Error('Function not implemented.');
            }}
            profileClick={function (event: React.FormEvent<Element>): void {
              throw new Error('Function not implemented.');
            }}
            basemapClick={function (event: React.FormEvent<Element>): void {
              throw new Error('Function not implemented.');
            }}
          />
        </div>
        <div className="igry__mid">
          <div className="igry__img__area">
            <Image
              className="igry__img"
              src="/images/map__img.png"
              layout={'fill'}
              alt={''}
            />
          </div>
        </div>
        <div className="igry__rgt igry__blu">
          <ImageryDropDown />
        </div>
      </div>
      <div className="igry__range">
        <div className="container">
          <h2 className="igry__range__title">
            Valid 0000Z Feb 27 to 1200Z Feb 27
          </h2>
          <div className=" container">
            <div className="igry__range__wrp">
              <div className="igry__btn__area">
                <button className="igry__range__play__btn">
                  <FaPlayCircle className="igry__range__play--icon" />
                </button>
              </div>
              <div className="igry__slider__area">
                <Slider
                  min={20}
                  defaultValue={20}
                  marks={marks}
                  step={null}
                  className="igry__range__slider"
                />
                <div className="igry__marker__area">
                  <p className="igry__range__txt">
                    1200Z Feb 27 - 0000Z Feb 28
                  </p>
                  <p className="igry__range__txt">
                    1200Z Feb 27 - 0000Z Feb 28
                  </p>
                  <p className="igry__range__txt">
                    1200Z Feb 27 - 0000Z Feb 28
                  </p>
                  <p className="igry__range__txt">
                    1200Z Feb 27 - 0000Z Feb 28
                  </p>
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
    </div>
  );
}
// IoMdArrowDropdown
const ImageryDropDown = () => {
  const [isShowDropDown, setIsShowDropDown] = useState(false);
  const [isShowChildren, setIsShowChildren] = useState(null);
  const dropDownMenu = [
    {
      id: 1,
      name: 'MSL Surface Analysis',
      type: 'parent',
      children: [
        {
          id: 1,
          name: 'Prog Charts',
          type: 'child',
        },
        {
          id: 2,
          name: 'National Forecast Chart',
          type: 'child',
          // grandChildren: [
          //   {
          //     id: 1,
          //     name: 'All',
          //     type: 'grandChild',
          //   },
          // ],
        },
        {
          id: 3,
          name: '6 hour QPF',
          type: 'child',
        },
        {
          id: 4,
          name: 'Prob of Precipitation',
          type: 'child',
        },
      ],
    },
    {
      id: 2,
      name: 'Pilot Reports',
      type: 'parent',
      children: [
        {
          id: 1,
          name: 'Airflame Ice',
          type: 'child',
          // grandChildren: [
          //   {
          //     id: 1,
          //     name: 'All',
          //     type: 'grandChild',
          //   },
          // ],
        },
        {
          id: 2,
          name: 'Turbulence',
          type: 'child',
          // grandChildren: [
          //   {
          //     id: 1,
          //     name: 'All',
          //     type: 'grandChild',
          //   },
          // ],
        },
        {
          id: 3,
          name: '6 hour QPF',
          type: 'child',
        },
        {
          id: 4,
          name: 'Prob of Precipitation',
          type: 'child',
        },
      ],
    },
    {
      id: 3,
      name: 'Visible Satellite',
      type: 'parent',
      children: [
        {
          id: 1,
          name: 'Airflame Ice',
          type: 'child',
        },
      ],
    },
  ];
  const handleShowChildren = (id: number) => {
    if (isShowChildren === id) {
      setIsShowChildren(null);
    } else {
      setIsShowChildren(id);
    }
  };
  return (
    <div className="igryDrop">
      <div className="igryDrop__wrp">
        <div
          onClick={() => setIsShowDropDown(!isShowDropDown)}
          className="igryDrop__header"
        >
          <div className="igryDrop__header__lft">
            <h3 className="igryDrop__title">Prob of Precipitation</h3>
          </div>
          <div
            className={`igryDrop__header__rgt ${
              isShowDropDown && 'igryDrop__header__rgt--rotate'
            }`}
          >
            <IoMdArrowDropdown className="igryDrop__icon" />
          </div>
        </div>
        {isShowDropDown && (
          <div className="igryDrop__body">
            <div className="igryDrop__search__area">
              <form action="" className="igryDrop__frm">
                <button className="igryDrop__submit">
                  <AiOutlineSearch className="igryDrop__search__icon" />
                </button>
                <input
                  type="text"
                  name="data"
                  id="data"
                  className="igryDrop__input"
                  placeholder="Filter menu"
                />
                <button className="igryDrop__close">
                  <GrFormClose className="igryDrop__icon__close" />
                </button>
              </form>
            </div>
            <div className="igryDrop__menu">
              {dropDownMenu.map((item) => {
                return (
                  <>
                    <div
                      onClick={() => handleShowChildren(item.id)}
                      className="igryDrop__menu__item"
                      key={item.id}
                    >
                      <p className="igryDrop__menu__text">{item.name}</p>
                      {item.children && (
                        <div
                          className={`igryDrop__menu__icon ${
                            isShowChildren === item.id &&
                            'igryDrop__menu__icon--rotate'
                          }`}
                        >
                          <SvgDropDown />
                        </div>
                      )}
                    </div>
                    {item.children &&
                      item.children.map((child) => {
                        return (
                          <div
                            className={`igryDrop__menu__item igryDrop__menu__item--cld ${
                              isShowChildren === item.id &&
                              'igryDrop__menu__item--cld--show'
                            }
                              `}
                            key={child.id}
                          >
                            <p className="igryDrop__menu__text">{child.name}</p>
                            {/* {child.grandChildren && (
                              <div className="igryDrop__menu__icon">
                                <SvgDropDown />
                              </div>
                            )} */}
                          </div>
                        );
                      })}
                  </>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Imagery;
