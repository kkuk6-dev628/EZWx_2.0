import React, { useEffect, useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { AiOutlineSearch } from 'react-icons/ai';
import { GrFormClose } from 'react-icons/gr';
import { FaPauseCircle, FaPlayCircle } from 'react-icons/fa';
import { BsBookmarkPlus, BsShare } from 'react-icons/bs';
import { MdOutlineSaveAlt } from 'react-icons/md';
import MapTabs from '../shared/MapTabs';
import { SvgBookmark, SvgDownload, SvgDropDown, SvgRefresh, SvgShare, SvgTabs, SvgZoom } from '../utils/SvgIcons';
import Image from 'next/image';
import { useGetWxJsonQuery } from '../../store/imagery/imageryApi';
import { ImageryCollectionItem, SubtabItem } from '../../interfaces/imagery';
import axios from 'axios';
import ImageryDropDown from './ImageryDropDown';
import moment from 'moment';
import { Slider } from '@mui/material';
import { convertTimeFormat } from '../map/common/AreoFunctions';

function Imagery() {
  const { isSuccess: isLoadedImageryCollections, data: imageryData } = useGetWxJsonQuery('');
  const imageryServerUrl = imageryData?.ROOTURL;
  const imageryCollections = imageryData?.TAB;
  const [dataTimes, setDataTimes] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [sliderLabels, setSliderLabels] = useState([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerHandle, setTimerHandle] = useState(null);

  useEffect(() => {
    if (selectedImages.length > sliderValue) {
      setSelectedImageUrl(selectedImages[sliderValue]);
    } else {
      setSelectedImageUrl(selectedImages[0]);
    }
  }, [selectedImages, sliderValue]);

  useEffect(() => {
    const sliderMarks = dataTimes.map((time, index) => {
      return {
        value: index,
        label: convertTimeFormat(time, false),
      };
    });
    setSliderLabels(sliderMarks);
  }, [dataTimes]);

  function handleSelectImageCollection(item: SubtabItem | ImageryCollectionItem) {
    if (item.JSON_URL) {
      const jsonUrl = imageryServerUrl + item.JSON_URL;
      const requestUrl = '/api/imagery/timestamps?url=' + jsonUrl;
      setSelectedImages(item.IMAGE.map((img) => img.URL));
      axios.get(requestUrl).then((data) => {
        if (!data.data) {
          return;
        }
        const timestamps = data.data.map((timestr) => moment.utc(timestr, 'YYYYMMDDHHmm').toDate());
        console.log(timestamps);
        setDataTimes(timestamps);
      });
    }
  }

  function play() {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerHandle) {
        clearInterval(timerHandle);
        setTimerHandle(null);
      }
    } else {
      setIsPlaying(true);
      const handle = setInterval(() => {
        if (sliderValue >= selectedImages.length) {
          setSliderValue(0);
        } else {
          setSliderValue((prevValue) => prevValue + 1);
        }
      }, 500);
      setTimerHandle(handle);
    }
  }

  function handler(id: string) {
    console.log(id);
  }

  const tabMenus = [
    {
      id: 'saved',
      name: 'Saved',
      svg: <SvgBookmark />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'export',
      name: 'Export',
      svg: <SvgDownload />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'share',
      name: 'Share',
      svg: <SvgShare />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'future',
      name: 'Future',
      svg: <SvgTabs />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'expand',
      name: 'Expand',
      svg: <SvgZoom />,
      handler: handler,
      isHideResponsive: false,
    },
    {
      id: 'refresh',
      name: 'Refresh',
      svg: <SvgRefresh />,
      handler: handler,
      isHideResponsive: false,
    },
  ];
  return (
    <div className="igry">
      <div className="igry__wrp">
        <div className="igry__lft igry__blu">
          <MapTabs tabMenus={tabMenus} />
        </div>
        <div className="igry__mid">
          <div className="igry__img__area">
            <img className="igry__img" src={imageryServerUrl + selectedImageUrl} alt={''} loading="eager" />
          </div>
        </div>
        <div className="igry__rgt igry__blu">
          <ImageryDropDown
            imageryCollectionData={imageryCollections}
            handleSelectImageCollection={handleSelectImageCollection}
          />
        </div>
      </div>
      <div className="igry__range">
        <div className="container">
          <h2 className="igry__range__title">Valid 0000Z Feb 27 to 1200Z Feb 27</h2>
          <div className=" container">
            <div className="igry__range__wrp">
              <div className="igry__btn__area">
                <button className="igry__range__play__btn" onClick={play}>
                  {!isPlaying && <FaPlayCircle className="igry__range__play--icon" />}
                  {isPlaying && <FaPauseCircle className="igry__range__play--icon" />}
                </button>
              </div>
              <div className="igry__slider__area">
                <Slider
                  min={20}
                  defaultValue={0}
                  marks={sliderLabels}
                  step={1}
                  min={0}
                  max={dataTimes.length > 0 ? dataTimes.length - 1 : 3}
                  className="igry__range__slider"
                  onChange={(event, newValue: number) => {
                    setSliderValue(newValue);
                  }}
                />
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

export default Imagery;
