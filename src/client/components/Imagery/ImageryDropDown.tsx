import { useEffect, useRef, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { GrFormClose } from 'react-icons/gr';
import { IoMdArrowDropdown } from 'react-icons/io';
import { ImageryCollectionItem, ImageryState, SubtabGroupItem, SubtabItem } from '../../interfaces/imagery';
import { SvgDropDown } from '../utils/SvgIcons';
import {
  initialImageryState,
  useAddRecentImageryMutation,
  useGetRecentImageryQuery,
} from '../../store/imagery/imageryApi';
import { Icon } from '@iconify/react';
import { useGetSavedItemsQuery } from '../../store/saved/savedApi';
import { selectSelectedFavoriteId, setSelectedFavoriteId } from '../../store/imagery/imagery';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

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
  const [filterInput, setFilterInput] = useState('');
  const [imageData, setImageData] = useState([]);
  const { data: recentImageries } = useGetRecentImageryQuery(null, {
    refetchOnMountOrArgChange: true,
  });
  const [addRecentImagery] = useAddRecentImageryMutation();
  const selectedComponentRef = useRef(null);
  const { data: savedData } = useGetSavedItemsQuery();
  const selectedFavoriteId = useSelector(selectSelectedFavoriteId);
  const [selectedDBImagery, setSelectedDBImagery] = useState<ImageryState>(initialImageryState);
  const dispatch = useDispatch();

  function isSavedImagery({ FAVORITE_ID }) {
    if (savedData) {
      const saved = savedData.find((x) => x.data.type === 'imagery' && x.data.data.FAVORITE_ID === FAVORITE_ID);
      return saved ? true : false;
    }
    return false;
  }

  function selectImage(item: ImageryCollectionItem, l1, l2, l3) {
    setIsShowDropDown(false);
    setSelectedImage(item);
    dispatch(setSelectedFavoriteId(item.FAVORITE_ID));
    const imageryState: ImageryState = {
      selectedLvl1: l1,
      selectedLvl2: l2,
      selectedLvl3: l3,
      selectedImageryName: item.SUBTABLABEL ? item.SUBTABLABEL : item.TITLE,
      selectedImageryId: item.FAVORITE_ID,
    };
    addRecentImagery(imageryState);
  }

  useEffect(() => {
    if (recentImageries && recentImageries.length > 0) {
      setSelectedDBImagery(recentImageries[0]);
    }
  }, [recentImageries]);

  useEffect(() => {
    if (selectedFavoriteId && imageryCollections) {
      for (let i1 = 0; i1 < imageryCollections.length; i1++) {
        const x1 = imageryCollections[i1];
        if (x1.FAVORITE_ID === selectedFavoriteId) {
          setSelectedLevel1(i1);
          setSelectedImage(x1);
          break;
        } else if (x1.SUBTAB_GROUP) {
          const ch1 = Array.isArray(x1.SUBTAB_GROUP) ? x1.SUBTAB_GROUP : x1.SUBTAB_GROUP.SUBTAB;
          if (!Array.isArray(ch1)) {
            console.log('Invalid data structure in wx.json');
          } else {
            for (let i2 = 0; i2 < ch1.length; i2++) {
              const x2 = ch1[i2];
              if (x2.FAVORITE_ID === selectedFavoriteId && x2.IMAGE) {
                setSelectedLevel1(i1);
                setSelectedLevel2(i2);
                setSelectedImage({ ...x1, ...x2 });
                return;
              } else if ((x2 as SubtabGroupItem).SUBTAB) {
                const ch2 = (x2 as SubtabGroupItem).SUBTAB;
                if (!Array.isArray(ch2)) {
                  if ((ch2 as SubtabItem).FAVORITE_ID === selectedFavoriteId && (ch2 as SubtabItem).IMAGE) {
                    setSelectedLevel1(i1);
                    setSelectedLevel2(i2);
                    setSelectedImage({ ...x1, ...(ch2 as SubtabItem) });
                  }
                } else {
                  for (let i3 = 0; i3 < ch2.length; i3++) {
                    const x3 = ch2[i3];
                    if (x3.FAVORITE_ID === selectedFavoriteId && x3.IMAGE) {
                      setSelectedLevel1(i1);
                      setSelectedLevel2(i2);
                      setSelectedLevel3(i3);
                      setSelectedImage({ ...x1, ...x3 });
                      return;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, [selectedFavoriteId, imageryCollections]);

  useEffect(() => {
    if (selectedImage) {
      handleSelectImageCollection(selectedImage);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (selectedFavoriteId && selectedDBImagery && selectedFavoriteId !== selectedDBImagery.selectedImageryId) {
      return;
    }
    if (imageryCollections && selectedDBImagery) {
      setImageData(imageryCollections);
      const imagerySt = selectedDBImagery;
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
        if (!Array.isArray(childrenLvl1)) {
          console.log('Invalid data structure in wx.json');
          setSelectedLevel1(0);
          setSelectedLevel2(0);
          setSelectedLevel3(0);
          return;
        }
        if (childrenLvl1.length <= imagerySt.selectedLvl2 || !childrenLvl1[imagerySt.selectedLvl2]) {
          console.log('Imagery collection has been changed! lvl 2', imagerySt.selectedLvl2);
          setSelectedLevel1(0);
          setSelectedLevel2(0);
          setSelectedLevel3(0);
          return;
        }
        const selectedLvl2Data = childrenLvl1[imagerySt.selectedLvl2];
        if (selectedLvl2Data.IMAGE) {
          setSelectedImage({ ...selectedLvl1Data, ...selectedLvl2Data });
        } else {
          const childrenLvl2 = (selectedLvl2Data as SubtabGroupItem).SUBTAB;
          const selectedLvl3Data = Array.isArray(childrenLvl2) ? childrenLvl2[imagerySt.selectedLvl3] : childrenLvl2;
          if (!selectedLvl3Data) {
            console.log('Imagery collection has been changed! lvl 3', imagerySt.selectedLvl2);
            setSelectedLevel1(0);
            setSelectedLevel2(0);
            setSelectedLevel3(0);
            return;
          }
          if (selectedLvl3Data.IMAGE) {
            setSelectedImage({ ...selectedLvl1Data, ...selectedLvl3Data });
            if (imagerySt == initialImageryState) {
              addRecentImagery(imagerySt);
            }
          } else {
            setSelectedImage({ ...selectedLvl1Data, ...childrenLvl2[0] });
          }
        }
      }
    }
  }, [selectedDBImagery, selectedFavoriteId, imageryCollections]);

  useEffect(() => {
    if (selectedComponentRef.current && isShowDropDown) {
      selectedComponentRef.current.scrollIntoView();
    }
  }, [isShowDropDown]);

  function filterImageData(filter: string) {
    setFilterInput(filter);
    const lowerFilter = filter.toLowerCase();
    const filteredResult = [];
    imageryCollections.forEach((topItem) => {
      if (topItem.TITLE.toLowerCase().includes(lowerFilter)) {
        filteredResult.push(topItem);
      } else {
        if (topItem.SUBTAB_GROUP && Array.isArray(topItem.SUBTAB_GROUP)) {
          const topItemClone = { ...topItem };
          const children = [];
          topItem.SUBTAB_GROUP.forEach((secondItem) => {
            if (secondItem.GROUP_NAME.toLowerCase().includes(lowerFilter)) {
              children.push(secondItem);
            } else {
              const secondItemClone = { ...secondItem };
              const lastChildren = [];
              if (secondItem.SUBTAB && Array.isArray(secondItem.SUBTAB)) {
                secondItem.SUBTAB.forEach((lastItem) => {
                  if (lastItem.SUBTABLABEL.toLowerCase().includes(lowerFilter)) {
                    lastChildren.push(lastItem);
                  }
                });
                if (lastChildren.length > 0) {
                  secondItemClone.SUBTAB = lastChildren;
                  children.push(secondItemClone);
                }
              }
            }
          });
          if (children.length > 0) {
            topItemClone.SUBTAB_GROUP = children;
            filteredResult.push(topItemClone);
          }
        }
      }
    });
    setImageData(filteredResult);
  }

  useEffect(() => {
    if (filterInput) {
      filterImageData(filterInput);
    } else {
      setImageData(imageryCollections);
    }
  }, [filterInput]);

  const title = selectedImage ? selectedImage.SUBTABLABEL || selectedImage.TITLE : '';
  const newTitle = title.replace(/&amp;/g, '&');
  return (
    <div className="igryDrop">
      <div className="igryDrop__wrp">
        <div onClick={() => setIsShowDropDown(!isShowDropDown)} className="igryDrop__header">
          <div className="igryDrop__header__lft">
            <h3 className="igryDrop__title">{newTitle}</h3>
          </div>
          <div className={`igryDrop__header__rgt ${isShowDropDown && 'igryDrop__header__rgt--rotate'}`}>
            <IoMdArrowDropdown className="igryDrop__icon" />
          </div>
        </div>
        {isShowDropDown && (
          <div className="igryDrop__body">
            <div className="igryDrop__search__area">
              <div className="igryDrop__frm">
                <button className="igryDrop__submit">
                  <AiOutlineSearch className="igryDrop__search__icon" />
                </button>
                <input
                  type="text"
                  name="data"
                  id="data"
                  className="igryDrop__input"
                  placeholder="Filter menu"
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.currentTarget.value)}
                />
                <button className="igryDrop__close" onClick={() => setFilterInput('')}>
                  <GrFormClose className="igryDrop__icon__close" />
                </button>
              </div>
            </div>
            <div className="menu-items-container">
              <div className="igryDrop__menu" key={'children-' + Date.now()}>
                {imageData &&
                  imageData.map((item, index1) => {
                    const children = item.SUBTAB_GROUP
                      ? Array.isArray(item.SUBTAB_GROUP)
                        ? item.SUBTAB_GROUP
                        : item.SUBTAB_GROUP.SUBTAB
                      : null;
                    const itemProps =
                      index1 == selectedLevel1 && item.IMAGE !== undefined ? { ref: selectedComponentRef } : null;
                    return (
                      <div key={index1}>
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
                              selectImage(item, index1, -1, -1);
                            }
                          }}
                          className={`igryDrop__menu__item ${item.IMAGE && 'last-item'}`}
                          {...itemProps}
                        >
                          {item.IMAGE && isSavedImagery(item) && (
                            <Icon
                              style={{ marginLeft: -30, marginRight: 17 }}
                              icon="bi:bookmark-fill"
                              color="var(--color-primary)"
                              width={16}
                            />
                          )}
                          {item.IMAGE && selectedLevel1 === index1 && <span className="blue-dot"></span>}
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
                                  <div key={index2}>
                                    <div
                                      onClick={(e) => {
                                        if (selectedLevel2 === index2) {
                                          setSelectedLevel2(-1);
                                        } else {
                                          setSelectedLevel2(index2);
                                          setSelectedLevel3(-1);
                                          if (child.IMAGE) {
                                            selectImage(
                                              {
                                                ...child,
                                                ...item,
                                              },
                                              selectedLevel1,
                                              index2,
                                              -1,
                                            );
                                          }
                                        }
                                      }}
                                      className={`igryDrop__menu__item igryDrop__menu__item--cld ${
                                        child.IMAGE && 'last-item'
                                      }`}
                                      {...itemProps}
                                    >
                                      {child.IMAGE && isSavedImagery(child) && (
                                        <Icon
                                          style={{ marginLeft: -50, marginRight: 38 }}
                                          icon="bi:bookmark-fill"
                                          color="var(--color-primary)"
                                          width={16}
                                        />
                                      )}
                                      {child.IMAGE && selectedLevel2 === index2 && <span className="blue-dot"></span>}
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
                                      <div className="level2-container">
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
                                                  selectImage(
                                                    {
                                                      ...child3,
                                                      ...item,
                                                    },
                                                    selectedLevel1,
                                                    selectedLevel2,
                                                    index3,
                                                  );
                                                }
                                              }}
                                              className={`igryDrop__menu__item igryDrop__menu__item--cld ${
                                                selectedLevel2 === index2 && 'igryDrop__menu__item--cld--show'
                                              } ${child3.IMAGE && 'last-item'}`}
                                              key={child3.SUBTABLABEL || child3.GROUP_NAME}
                                              {...itemProps}
                                            >
                                              {child3.IMAGE && isSavedImagery(child3) && (
                                                <Icon
                                                  style={{ marginLeft: -70, marginRight: 54 }}
                                                  icon="bi:bookmark-fill"
                                                  color="var(--color-primary)"
                                                  width={16}
                                                />
                                              )}
                                              {child3.IMAGE && selectedLevel3 === index3 && (
                                                <span className="blue-dot"></span>
                                              )}
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
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
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
