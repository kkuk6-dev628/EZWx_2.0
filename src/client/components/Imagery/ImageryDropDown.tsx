import { useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { GrFormClose } from 'react-icons/gr';
import { IoMdArrowDropdown } from 'react-icons/io';
import { ImageryCollectionItem, SubtabItem } from '../../interfaces/imagery';
import { SvgDropDown } from '../utils/SvgIcons';

// IoMdArrowDropdown
interface ImageryDropDownProps {
  imageryCollectionData: ImageryCollectionItem[];
  handleSelectImageCollection: (item: SubtabItem | ImageryCollectionItem) => void;
}
const ImageryDropDown = ({
  imageryCollectionData: imageryCollections,
  handleSelectImageCollection,
}: ImageryDropDownProps) => {
  const [isShowDropDown, setIsShowDropDown] = useState(false);
  const [isShowChildren, setIsShowChildren] = useState(null);
  const [selectedLevel1, setSelectedLevel1] = useState(0);
  const [selectedLevel2, setSelectedLevel2] = useState(0);
  const [selectedLevel3, setSelectedLevel3] = useState(0);

  return (
    <div className="igryDrop">
      <div className="igryDrop__wrp">
        <div onClick={() => setIsShowDropDown(!isShowDropDown)} className="igryDrop__header">
          <div className="igryDrop__header__lft">
            <h3 className="igryDrop__title">Prob of Precipitation</h3>
          </div>
          <div className={`igryDrop__header__rgt ${isShowDropDown && 'igryDrop__header__rgt--rotate'}`}>
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
                <input type="text" name="data" id="data" className="igryDrop__input" placeholder="Filter menu" />
                <button className="igryDrop__close">
                  <GrFormClose className="igryDrop__icon__close" />
                </button>
              </form>
            </div>
            <div className="menu-items-container">
              <div className="igryDrop__menu">
                {imageryCollections.map((item, index1) => {
                  const children = item.SUBTAB_GROUP
                    ? Array.isArray(item.SUBTAB_GROUP)
                      ? item.SUBTAB_GROUP
                      : item.SUBTAB_GROUP.SUBTAB
                    : null;
                  return (
                    <>
                      <div
                        onClick={() => {
                          setSelectedLevel1(index1);
                          if (item.IMAGE) {
                            handleSelectImageCollection(item);
                          }
                        }}
                        className="igryDrop__menu__item"
                        key={item.TITLE}
                      >
                        <p className="igryDrop__menu__text">{item.TITLE}</p>
                        {children && (
                          <div
                            className={`igryDrop__menu__icon ${
                              selectedLevel1 === index1 && 'igryDrop__menu__icon--rotate'
                            }`}
                          >
                            <SvgDropDown />
                          </div>
                        )}
                      </div>
                      {children && selectedLevel1 === index1 && (
                        <div className="level1-container">
                          {Array.isArray(children) &&
                            children.map((child, index2) => {
                              return (
                                <>
                                  <div
                                    onClick={() => {
                                      setSelectedLevel2(index2);
                                      if (child.IMAGE) {
                                        handleSelectImageCollection(child);
                                      }
                                    }}
                                    className={`igryDrop__menu__item igryDrop__menu__item--cld ${
                                      selectedLevel2 === index2 && 'igryDrop__menu__item--cld--show'
                                    }
                              `}
                                    key={child.SUBTABLABEL || child.GROUP_NAME}
                                  >
                                    <p className="igryDrop__menu__text">{child.SUBTABLABEL || child.GROUP_NAME}</p>
                                    {child.SUBTAB && (
                                      <div
                                        className={`igryDrop__menu__icon ${
                                          selectedLevel1 === index2 && 'igryDrop__menu__icon--rotate'
                                        }`}
                                      >
                                        <SvgDropDown />
                                      </div>
                                    )}
                                  </div>
                                  {child.SUBTAB && selectedLevel2 == index2 && (
                                    <div className="level2-container">
                                      {child.SUBTAB.map((child3, index3) => {
                                        return (
                                          <div
                                            onClick={() => {
                                              setSelectedLevel3(index3);
                                              if (child3.IMAGE) {
                                                handleSelectImageCollection(child3);
                                              }
                                            }}
                                            className={`igryDrop__menu__item igryDrop__menu__item--cld ${
                                              selectedLevel2 === index2 && 'igryDrop__menu__item--cld--show'
                                            }`}
                                            key={child3.SUBTABLABEL || child3.GROUP_NAME}
                                          >
                                            <p className="igryDrop__menu__text">
                                              {child3.SUBTABLABEL || child3.GROUP_NAME}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              );
                            })}
                        </div>
                      )}
                    </>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageryDropDown;
