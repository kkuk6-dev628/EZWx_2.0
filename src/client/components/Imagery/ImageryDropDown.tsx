import { useEffect, useRef, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { GrFormClose } from 'react-icons/gr';
import { IoMdArrowDropdown } from 'react-icons/io';
import { ImageryCollectionItem, ImageryState, SubtabGroupItem, SubtabItem } from '../../interfaces/imagery';
import { SvgDropDown } from '../utils/SvgIcons';
import {
  initialImageryState,
  useGetImageryStateQuery,
  useUpdateImageryStateMutation,
} from '../../store/imagery/imageryApi';
import { useDispatch } from 'react-redux';
import { convertTimeFormat } from '../map/common/AreoFunctions';

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
  const [selectedImage, setSelectedImage] = useState<ImageryCollectionItem>(null);
  const {
    data: imageryState,
    isSuccess: isImageryStateLoaded,
    isError: isImageryStateError,
  } = useGetImageryStateQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const [updateImageryState] = useUpdateImageryStateMutation();
  const selectedComponentRef = useRef(null);

  function selectImage(item: ImageryCollectionItem) {
    setIsShowDropDown(false);
    setSelectedImage(item);
  }

  useEffect(() => {
    if (selectedImage) {
      const imageryState: ImageryState = {
        selectedLvl1: selectedLevel1,
        selectedLvl2: selectedLevel2,
        selectedLvl3: selectedLevel3,
        selectedImageryName: selectedImage.TITLE ? selectedImage.TITLE : selectedImage.SUBTABLABEL,
      };
      updateImageryState(imageryState);
      handleSelectImageCollection(selectedImage);
    }
  }, [selectedImage]);

  useEffect(() => {
    if ((imageryCollections && isImageryStateLoaded) || isImageryStateError) {
      let imagerySt = null;
      if (isImageryStateLoaded) {
        imagerySt = imageryState;
      }
      if (isImageryStateError) {
        imagerySt = initialImageryState;
      }
      setSelectedLevel1(imagerySt.selectedLvl1);
      setSelectedLevel2(imagerySt.selectedLvl2);
      setSelectedLevel3(imagerySt.selectedLvl3);
      const selectedLvl1Data = imageryCollections[imagerySt.selectedLvl1];
      if (selectedLvl1Data.IMAGE) {
        setSelectedImage(selectedLvl1Data);
      } else {
        const childrenLvl1 = Array.isArray(selectedLvl1Data.SUBTAB_GROUP)
          ? selectedLvl1Data.SUBTAB_GROUP
          : selectedLvl1Data.SUBTAB_GROUP.SUBTAB;
        const selectedLvl2Data = childrenLvl1[imagerySt.selectedLvl2];
        if (selectedLvl2Data && selectedLvl2Data.IMAGE) {
          setSelectedImage(selectedLvl2Data as any);
        } else if (selectedLvl2Data) {
          const childrenLvl2 = (selectedLvl2Data as SubtabGroupItem).SUBTAB;
          const selectedLvl3Data = Array.isArray(childrenLvl2) ? childrenLvl2[imagerySt.selectedLvl3] : childrenLvl2;
          if (selectedLvl3Data && selectedLvl3Data.IMAGE) {
            setSelectedImage(selectedLvl3Data as any);
          } else {
            setSelectedImage(childrenLvl2[0] as any);
          }
        }
      }
    }
  }, [isImageryStateLoaded, imageryCollections, isImageryStateError]);

  useEffect(() => {
    if (selectedComponentRef.current && isShowDropDown) {
      selectedComponentRef.current.scrollIntoView();
    }
  }, [isShowDropDown]);

  return (
    <div className="igryDrop">
      <div className="igryDrop__wrp">
        <div onClick={() => setIsShowDropDown(!isShowDropDown)} className="igryDrop__header">
          <div className="igryDrop__header__lft">
            <h3 className="igryDrop__title">{selectedImage ? selectedImage.TITLE || selectedImage.SUBTABLABEL : ''}</h3>
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
              <div className="igryDrop__menu" key={'children-' + Date.now()}>
                {imageryCollections.map((item, index1) => {
                  const children = item.SUBTAB_GROUP
                    ? Array.isArray(item.SUBTAB_GROUP)
                      ? item.SUBTAB_GROUP
                      : item.SUBTAB_GROUP.SUBTAB
                    : null;
                  const itemProps =
                    index1 == selectedLevel1 && item.IMAGE !== undefined ? { ref: selectedComponentRef } : null;
                  return (
                    <>
                      <div
                        onClick={(e) => {
                          if (selectedLevel1 === index1) {
                            setSelectedLevel1(-1);
                            return;
                          }
                          setSelectedLevel1(index1);
                          setSelectedLevel2(-1);
                          setSelectedLevel3(-1);
                          if (item.IMAGE) {
                            selectImage(item);
                          }
                        }}
                        className="igryDrop__menu__item"
                        key={item.TITLE}
                        {...itemProps}
                      >
                        <p className="igryDrop__menu__text">{item.TITLE.replace(/&amp;/g, '&')}</p>
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
                              const children2 =
                                child.SUBTAB === undefined || Array.isArray(child.SUBTAB)
                                  ? child.SUBTAB
                                  : [child.SUBTAB];
                              const itemProps =
                                index2 == selectedLevel2 && child.IMAGE !== undefined
                                  ? { ref: selectedComponentRef }
                                  : null;
                              return (
                                <>
                                  <div
                                    onClick={(e) => {
                                      if (selectedLevel2 === index2) {
                                        setSelectedLevel2(-1);
                                      } else {
                                        setSelectedLevel2(index2);
                                        setSelectedLevel3(-1);
                                        if (child.IMAGE) {
                                          selectImage(child);
                                        }
                                      }
                                    }}
                                    className={`igryDrop__menu__item igryDrop__menu__item--cld`}
                                    key={child.SUBTABLABEL || child.GROUP_NAME}
                                    {...itemProps}
                                  >
                                    <p className="igryDrop__menu__text">
                                      {child.SUBTABLABEL
                                        ? child.SUBTABLABEL.replace(/&amp;/g, '&')
                                        : child.GROUP_NAME.replace(/&amp;/g, '&')}
                                    </p>
                                    {children2 && (
                                      <div
                                        className={`igryDrop__menu__icon ${
                                          selectedLevel2 === index2 && 'igryDrop__menu__icon--rotate'
                                        }`}
                                      >
                                        <SvgDropDown />
                                      </div>
                                    )}
                                  </div>
                                  {children2 && selectedLevel2 == index2 && (
                                    <div className="level2-container" key={'children2-' + index2}>
                                      {children2.map((child3, index3) => {
                                        const itemProps =
                                          index3 == selectedLevel3 && child3.IMAGE !== undefined
                                            ? { ref: selectedComponentRef }
                                            : null;
                                        return (
                                          <div
                                            onClick={() => {
                                              setSelectedLevel3(index3);
                                              if (child3.IMAGE) {
                                                selectImage(child3);
                                              }
                                            }}
                                            className={`igryDrop__menu__item igryDrop__menu__item--cld ${
                                              selectedLevel2 === index2 && 'igryDrop__menu__item--cld--show'
                                            }`}
                                            key={child3.SUBTABLABEL || child3.GROUP_NAME}
                                            {...itemProps}
                                          >
                                            <p className="igryDrop__menu__text">
                                              {child3.SUBTABLABEL
                                                ? child3.SUBTABLABEL.replace(/&amp;/g, '&')
                                                : child3.GROUP_NAME.replace(/&amp;/g, '&')}
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
