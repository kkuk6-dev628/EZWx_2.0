/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { AiOutlineSearch } from 'react-icons/ai';
import { GrFormClose } from 'react-icons/gr';
import { FaPauseCircle, FaPlayCircle } from 'react-icons/fa';
import { BsBookmarkPlus, BsShare } from 'react-icons/bs';
import { MdOutlineSaveAlt } from 'react-icons/md';
import MapTabs from '../shared/MapTabs';
import {
  SvgBookmark,
  SvgCollapse,
  SvgDownload,
  SvgDropDown,
  SvgRefresh,
  SvgShare,
  SvgTabs,
  SvgZoom,
} from '../utils/SvgIcons';
import Image from 'next/image';
import { useGetWxJsonQuery } from '../../store/imagery/imageryApi';
import { ImageryCollectionItem, SubtabItem } from '../../interfaces/imagery';
import axios from 'axios';
import ImageryDropDown from './ImageryDropDown';
import moment from 'moment';
import { Slider } from '@mui/material';
import { convertTimeFormat, simpleTimeFormat } from '../map/common/AreoFunctions';
import { selectSettings } from '../../store/user/UserSettings';
import { useSelector } from 'react-redux';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef, useTransformInit } from 'react-zoom-pan-pinch';

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
  const [selectedTime, setSelectedTime] = useState([]);
  const userSettings = useSelector(selectSettings);
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [needMoveCenter, setNeedMoveCenter] = useState(false);
  const [sliderMaxValue, setSliderMaxValue] = useState(3);
  const [dateBlocks, setDateBlocks] = useState([{ width: 100, date: new Date() }]);
  const [delay, setDelay] = useState(500);
  const [loopCount, setLoopCount] = useState(0);
  const [loopStart, setLoopStart] = useState('First');

  useEffect(() => {
    const timeImage = getImageBySliderValue(sliderValue);
    if (timeImage) {
      setSelectedImageUrl(timeImage.image);
      setSelectedTime(timeImage.time);
      setSliderValue(timeImage.sliderValue);
    } else if (selectedImages.length > 0) {
      setSelectedImageUrl(selectedImages[0]);
      dataTimes && setSelectedTime(dataTimes[0]);
    }
    if (timerHandle !== null && sliderValue === sliderMaxValue) {
      setLoopCount((prevState) => prevState + 1);
    }
  }, [selectedImages, dataTimes, sliderValue]);

  useEffect(() => {
    if (dataTimes && dataTimes.length > 0) {
      const startHour = Math.floor(dataTimes[0][0].getTime() / (3600 * 1000));
      const sliderMarks = dataTimes.map((item, index) => {
        return {
          value: Math.floor(item[0].getTime() / (3600 * 1000)) - startHour,
          label: '',
        };
      });
      setSliderLabels(sliderMarks);
      const { dateBlocks, hoursCount } = calcBlockDays(dataTimes.map((item) => item[0]));
      setSliderMaxValue(hoursCount);
      setDateBlocks(dateBlocks);
      let sliderVal = 0;
      if (loopStart === 'Last') {
        sliderVal = dataTimes.length - 1;
      }
      setSliderValue(dataIndex2SliderValue(sliderVal));
    } else {
      setDateBlocks([{ date: null, width: 100 }]);
    }
  }, [dataTimes]);

  useEffect(() => {
    if (loopCount >= 3) {
      stopTimer();
    }
  }, [loopCount]);

  function getImageBySliderValue(value) {
    if (dataTimes && dataTimes.length > 0) {
      const startHour = Math.floor(dataTimes[0][0].getTime() / (3600 * 1000));
      const closest = dataTimes.reduce(
        (acc, curr, index) => {
          const imgTime2SliderValue = Math.floor(curr[0].getTime() / (3600 * 1000)) - startHour;
          const difference = Math.abs(value - imgTime2SliderValue);
          if (difference < acc.diff) {
            return { id: index, diff: difference, sliderValue: imgTime2SliderValue };
          }
          return acc;
        },
        { id: 0, diff: 240, sliderValue: 0 },
      );
      return {
        id: closest.id,
        time: dataTimes[closest.id],
        image: selectedImages[closest.id],
        sliderValue: closest.sliderValue,
      };
    }
  }

  function calcBlockDays(times: Date[]) {
    const hoursCount = Math.ceil((times[times.length - 1].getTime() - times[0].getTime()) / (3600 * 1000));
    const firstDateTime = times[0];
    const lastDateTime = times[times.length - 1];
    const firstDate = Math.floor(firstDateTime.getTime() / (3600 * 24 * 1000));
    const lastDate = Math.floor(lastDateTime.getTime() / (3600 * 24 * 1000));
    const firstTime = userSettings.default_time_display_unit ? firstDateTime.getHours() : firstDateTime.getUTCHours();
    const lastTime = userSettings.default_time_display_unit ? lastDateTime.getHours() : lastDateTime.getUTCHours();
    if (firstDate === lastDate) {
      return {
        dateBlocks: [{ date: firstDateTime, width: 100 }],
        hoursCount,
      };
    }
    const dateBlocks = [{ date: firstDateTime, width: ((24 - firstTime) * 100) / hoursCount }];
    for (let i = 1; i < lastDate - firstDate; i++) {
      const dateTime = new Date(firstDateTime);
      userSettings.default_time_display_unit
        ? dateTime.setDate(firstDateTime.getDate() + i)
        : dateTime.setUTCDate(firstDateTime.getUTCDate() + i);
      dateBlocks.push({ date: dateTime, width: (24 * 100) / hoursCount });
    }
    dateBlocks.push({ date: lastDateTime, width: (lastTime * 100) / hoursCount });
    return { dateBlocks, hoursCount };
  }

  function toTimeString(date: Date, useLocalTime: boolean) {
    const momentObj = moment(date).tz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (useLocalTime) return momentObj.format('ddd, HH:mm MMM DD');
    else {
      const timeStr = momentObj.utc().format('ddd, HHmm MMM DD');
      return `${timeStr.slice(0, 9)}Z${timeStr.slice(9)}`;
    }
  }

  function handleSelectImageCollection(item: SubtabItem | ImageryCollectionItem) {
    stopTimer();
    setSelectedImages(item.IMAGE.map((img) => img.URL));
    setDelay(item.DELAY);
    setLoopStart(item.LOOP);
    if (item.JSON_URL) {
      const jsonUrl = imageryServerUrl + item.JSON_URL;
      const requestUrl = '/api/imagery/timestamps?url=' + jsonUrl;
      axios.get(requestUrl).then((data) => {
        if (!data.data || !Array.isArray(data.data)) {
          return;
        }
        const timestamps = data.data.map((item) => item.map((strTime) => moment.utc(strTime, 'YYYYMMDDHHmm').toDate()));
        setDataTimes(timestamps);
      });
    } else {
      const sliderMarks = item.IMAGE.map((item, index) => {
        return {
          value: index,
          label: index,
        };
      });
      setSliderLabels(sliderMarks);
      setSelectedTime(null);
      setDataTimes(null);
    }
  }

  function dataIndex2SliderValue(index) {
    if (dataTimes && dataTimes.length > 0) {
      return (
        Math.floor(dataTimes[index][0].getTime() / (3600 * 1000)) -
        Math.floor(dataTimes[0][0].getTime() / (3600 * 1000))
      );
    } else {
      return 0;
    }
  }

  function stopTimer() {
    setIsPlaying(false);
    if (timerHandle) {
      clearInterval(timerHandle);
      setTimerHandle(null);
      setLoopCount(0);
    }
  }

  function play() {
    if (isPlaying) {
      stopTimer();
    } else {
      setIsPlaying(true);
      const handle = setInterval(() => {
        setSliderValue((prevValue) => {
          if (prevValue >= sliderMaxValue) {
            return 0;
          } else {
            const prevImageId = getImageBySliderValue(prevValue);
            if (prevImageId) {
              const newValue = dataIndex2SliderValue(prevImageId.id + 1);
              return newValue;
            }
            return prevValue;
          }
        });
      }, delay);
      setTimerHandle(handle);
    }
  }

  function handler(id: string) {
    console.log(id);
    switch (id) {
      case 'collapse':
        if (transformComponentRef.current) {
          const { resetTransform } = transformComponentRef.current;
          resetTransform();
          setImageExpanded(false);
        }
        break;
    }
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
      id: 'collapse',
      name: 'Collapse',
      svg: <SvgCollapse />,
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
            {selectedImageUrl && (
              <TransformWrapper
                ref={transformComponentRef}
                initialPositionX={0}
                initialPositionY={0}
                centerOnInit={true}
                alignmentAnimation={{ disabled: true, sizeX: 0, sizeY: 0 }}
                zoomAnimation={{ disabled: true }}
                velocityAnimation={{ disabled: true }}
                key={JSON.stringify(selectedImages)}
                onInit={() => {
                  setNeedMoveCenter(true);
                }}
              >
                <TransformComponent>
                  <div className="image-wraper">
                    <img
                      className="igry__img"
                      src={imageryServerUrl + selectedImageUrl}
                      width={1024}
                      height={720}
                      alt={''}
                      onLoad={() => {
                        if (transformComponentRef.current && needMoveCenter) {
                          console.log('Image onLoad move center');
                          setNeedMoveCenter(false);
                          const { resetTransform, centerView, setTransform } = transformComponentRef.current;
                          setTransform(0, 0, 1, 0);
                          resetTransform();
                          centerView();
                        }
                      }}
                    />
                  </div>
                </TransformComponent>
              </TransformWrapper>
            )}
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
          {selectedTime && selectedTime.length > 0 && (
            <h2 className="igry__range__title">{`Valid ${toTimeString(
              selectedTime[0],
              userSettings.default_time_display_unit,
            )} ${
              selectedTime.length > 1
                ? 'to ' + toTimeString(selectedTime[1], userSettings.default_time_display_unit)
                : ''
            }`}</h2>
          )}
          {!selectedTime && <h2 className="igry__range__title">Please reference time stamps on image</h2>}
          <div className=" container">
            <div className="igry__range__wrp">
              <div className="igry__btn__area">
                {selectedTime && (
                  <button className="igry__range__play__btn" onClick={play}>
                    {!isPlaying && <FaPlayCircle className="igry__range__play--icon" />}
                    {isPlaying && <FaPauseCircle className="igry__range__play--icon" />}
                  </button>
                )}
              </div>
              <div className="igry__slider__area">
                <div className="date-container">
                  {dateBlocks.map((item, index) => (
                    <div key={'date' + index} className="date" style={{ width: item.width + '%' }}>
                      {item.date && item.width > 5
                        ? item.date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'numeric',
                            timeZone: userSettings.default_time_display_unit ? undefined : 'UTC',
                          })
                        : ''}
                    </div>
                  ))}
                </div>
                {selectedTime && (
                  <Slider
                    min={20}
                    defaultValue={0}
                    value={sliderValue}
                    marks={sliderLabels}
                    step={1}
                    // @ts-ignore
                    min={0}
                    max={sliderMaxValue ? sliderMaxValue : 3}
                    className="igry__range__slider"
                    onChange={(event, newValue: number) => {
                      setSliderValue(newValue);
                    }}
                    onClick={() => stopTimer()}
                  />
                )}
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
