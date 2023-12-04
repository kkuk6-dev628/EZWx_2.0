/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ComponentRef, useCallback, useEffect, useRef, useState } from 'react';
import { FaPauseCircle, FaPlayCircle } from 'react-icons/fa';
import { BsBookmarkPlus, BsShare } from 'react-icons/bs';
import { MdOutlineSaveAlt } from 'react-icons/md';
import MapTabs from '../shared/MapTabs';
import { SvgBookmark, SvgCollapse, SvgDownload, SvgRefresh, SvgRoundClose, SvgTabs, SvgZoom } from '../utils/SvgIcons';
import { useGetWxJsonQuery } from '../../store/imagery/imageryApi';
import { ImageryCollectionItem } from '../../interfaces/imagery';
import axios from 'axios';
import ImageryDropDown from './ImageryDropDown';
import moment from 'moment';
import { Dialog, DialogTitle, Slider } from '@mui/material';
import { selectSettings } from '../../store/user/UserSettings';
import { useSelector } from 'react-redux';
import { selectShowInformation, setShowInformation } from '../../store/imagery/imagery';
import { PaperComponent } from '../common/PaperComponent';
import { useDispatch } from 'react-redux';
import PrismaZoom from 'react-prismazoom';
import toast from 'react-hot-toast';
import Nouislider from 'nouislider-react';
import { FetchUserSettings } from '../shared/FetchUserSettings';

const sliderStep = 60 * 1000;

function unEscape(htmlStr) {
  htmlStr = htmlStr.replace(/&lt;/g, '<');
  htmlStr = htmlStr.replace(/&gt;/g, '>');
  htmlStr = htmlStr.replace(/&quot;/g, '"');
  htmlStr = htmlStr.replace(/&#39;/g, "'");
  htmlStr = htmlStr.replace(/&amp;/g, '&');
  return htmlStr;
}

export function iOS() {
  // @ts-ignore
  const platform = navigator.userAgentData?.platform || navigator.platform;

  return (
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
}

function Imagery() {
  const { data: imageryData, refetch: refetchWxJson } = useGetWxJsonQuery('');
  const imageryServerUrl = imageryData?.ROOTURL;
  const imageryCollections = imageryData?.TAB;
  const [dataTimes, setDataTimes] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [sliderLabels, setSliderLabels] = useState([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerHandle, _setTimerHandle] = useState(null);
  const timerHandleRef = useRef(timerHandle);
  const setTimerHandle = (data) => {
    timerHandleRef.current = data;
    _setTimerHandle(data);
  };
  const [selectedTime, setSelectedTime] = useState([]);
  const userSettings = useSelector(selectSettings);
  const prismaRef = useRef<ComponentRef<typeof PrismaZoom>>(null);
  const noUISliderRef = useRef(null);
  const [sliderMaxValue, setSliderMaxValue] = useState(3);
  const [dateBlocks, setDateBlocks] = useState([{ width: 100, date: new Date() }]);
  const [lastTimeoutHandle, _setLastTimeoutHandle] = useState(null);
  const lastTimeoutHandleRef = useRef(lastTimeoutHandle);
  const setLastTimeoutHandle = (data) => {
    lastTimeoutHandleRef.current = data;
    _setLastTimeoutHandle(data);
  };
  const [refreshTime, setRefreshTime] = useState(Date.now());
  const [selectedImagesData, setSelectedImagesData] = useState<ImageryCollectionItem>(null);
  const [hideWeekDay, setHideWeekDay] = useState(true);
  const showInformation = useSelector(selectShowInformation);
  const dispatch = useDispatch();

  useEffect(() => {
    handleWindowSizeChange();
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  function handleWindowSizeChange() {
    setHideWeekDay(document.documentElement.clientWidth < 1024);
  }

  useEffect(() => {
    const timeImage = getImageBySliderValue(sliderValue);
    if (timeImage) {
      if (timeImage.image != selectedImageUrl) {
        setSelectedImageUrl(timeImage.image);
        setSelectedTime(timeImage.time);
      }
    } else if (selectedImages.length > 0) {
      setSelectedImageUrl(selectedImages[0]);
      dataTimes && setSelectedTime(dataTimes[0]);
    }
    if (timerHandle !== null && sliderValue === sliderMaxValue) {
      clearInterval(timerHandle);
      setTimerHandle(null);
      const timer = setTimeout(
        () => startTimer(),
        (selectedImagesData && selectedImagesData.DELAY ? selectedImagesData.DELAY : 1000) * 3,
      );
      setLastTimeoutHandle(timer);
    }
  }, [selectedImages, dataTimes, sliderValue]);

  useEffect(() => {
    if (dataTimes && dataTimes.length > 0) {
      const startHour = Math.floor(dataTimes[0][0].getTime() / sliderStep);
      const sliderMarks = dataTimes.map((item, index) => {
        return Math.floor(item[0].getTime() / sliderStep) - startHour;
      });
      setSliderLabels(sliderMarks);
      const { dateBlocks, hoursCount } = calcBlockDays(dataTimes.map((item) => (item.length > 1 ? item[1] : item[0])));
      if (hoursCount === 0) {
        setSliderMaxValue(selectedImages.length - 1);
        setSliderLabels(selectedImages.map((img, index) => ({ value: index })));
      } else {
        setSliderMaxValue(hoursCount);
      }
      setDateBlocks(dateBlocks);
      let sliderVal = 0;
      if (selectedImagesData && selectedImagesData.LOOP === 'Last') {
        sliderVal = dataTimes.length - 1;
      }
      const val = dataIndex2SliderValue(sliderVal);
      setSliderValue(val);
      updateSliderValue(val);
    } else {
      setDateBlocks([{ date: null, width: 100 }]);
      let sliderVal = 0;
      if (selectedImagesData && selectedImagesData.LOOP === 'Last') {
        sliderVal = selectedImages.length - 1;
      }
      setSliderValue(sliderVal);
      updateSliderValue(sliderVal);
    }
  }, [dataTimes]);

  function getImageBySliderValue(value) {
    if (
      dataTimes &&
      dataTimes.length > 0 &&
      dataTimes[0][0].getTime() != dataTimes[dataTimes.length - 1][0].getTime()
    ) {
      const startHour = Math.floor(dataTimes[0][0].getTime() / sliderStep);
      const closest = dataTimes.reduce(
        (acc, curr, index) => {
          const imgTime2SliderValue = Math.floor(curr[0].getTime() / sliderStep) - startHour;
          const difference = Math.abs(value - imgTime2SliderValue);
          if (difference < acc.diff) {
            return { id: index, diff: difference, sliderValue: imgTime2SliderValue };
          }
          return acc;
        },
        { id: 0, diff: 240 * 60, sliderValue: 0 },
      );
      return {
        id: closest.id,
        time: dataTimes[closest.id],
        image: selectedImages[closest.id],
        sliderValue: closest.sliderValue,
      };
    } else {
      return {
        id: value,
        time: dataTimes && dataTimes.length > 0 ? dataTimes[0] : null,
        image: selectedImages[value],
        sliderValue: value,
      };
    }
  }

  function calcBlockDays(times: Date[]) {
    const hoursCount = Math.ceil((times[times.length - 1].getTime() - times[0].getTime()) / sliderStep);
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
    const dateBlocks = [{ date: firstDateTime, width: ((24 - firstTime) * 60 * 100) / hoursCount }];
    for (let i = 1; i < lastDate - firstDate; i++) {
      const dateTime = new Date(firstDateTime);
      userSettings.default_time_display_unit
        ? dateTime.setDate(firstDateTime.getDate() + i)
        : dateTime.setUTCDate(firstDateTime.getUTCDate() + i);
      dateBlocks.push({ date: dateTime, width: (24 * 60 * 100) / hoursCount });
    }
    dateBlocks.push({ date: lastDateTime, width: (lastTime * 60 * 100) / hoursCount });
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

  function handleSelectImageCollection(item: ImageryCollectionItem) {
    stopTimer();
    setSelectedImages(item.IMAGE.map((img) => img.URL));
    setSelectedImagesData(item);
    prismaRef.current?.reset();
    if (item.JSON_URL) {
      const jsonUrl = imageryServerUrl + item.JSON_URL;
      const requestUrl = '/api/imagery/timestamps?url=' + jsonUrl;
      axios
        .get(requestUrl)
        .then((data) => {
          if (!data.data || !Array.isArray(data.data)) {
            return;
          }
          const timestamps = data.data.map((item) =>
            item.map((strTime) => moment.utc(strTime, 'YYYYMMDDHHmm').toDate()),
          );
          setDataTimes(timestamps);
        })
        .catch((err) => console.error(err));
    } else {
      const sliderMarks = item.IMAGE.map((item, index) => index);
      setSliderLabels(sliderMarks);
      setSliderMaxValue(item.IMAGE.length - 1);
      setSelectedTime(null);
      setDataTimes(null);
    }
  }

  function dataIndex2SliderValue(index) {
    if (
      dataTimes &&
      dataTimes.length > 0 &&
      (dataTimes.length === 1 || dataTimes[0][0].getTime() != dataTimes[dataTimes.length - 1][0].getTime())
    ) {
      return (
        Math.floor(dataTimes[index][0].getTime() / sliderStep) - Math.floor(dataTimes[0][0].getTime() / sliderStep)
      );
    } else {
      return index;
    }
  }

  function readSliderValue() {
    if (noUISliderRef.current) {
      const str = noUISliderRef.current.noUiSlider?.get();
      return parseInt(str);
    }
    return 0;
  }

  function updateSliderValue(value) {
    if (noUISliderRef.current) {
      noUISliderRef.current.noUiSlider?.set(value);
    }
  }

  function stopTimer() {
    setIsPlaying(false);
    if (timerHandleRef.current) {
      clearInterval(timerHandleRef.current);
      setTimerHandle(null);
    }
    if (lastTimeoutHandleRef.current) {
      clearTimeout(lastTimeoutHandleRef.current);
      setLastTimeoutHandle(null);
    }
  }

  function startTimer() {
    setIsPlaying(true);
    const handle = setInterval(
      () => {
        const prevValue = readSliderValue();
        if (prevValue >= sliderMaxValue) {
          setSliderValue(0);
          updateSliderValue(0);
        } else {
          const prevImageId = getImageBySliderValue(prevValue);
          if (prevImageId) {
            const newValue = dataIndex2SliderValue(prevImageId.id + 1);
            setSliderValue(newValue);
            updateSliderValue(newValue);
          } else {
            setSliderValue(prevValue);
            updateSliderValue(prevValue);
          }
        }
      },
      selectedImagesData && selectedImagesData.DELAY ? selectedImagesData.DELAY : 1000,
    );
    setTimerHandle(handle);
  }

  function clickPlay() {
    if (isPlaying) {
      stopTimer();
    } else {
      startTimer();
    }
  }

  async function handler(id: string) {
    console.log(id);
    switch (id) {
      case 'collapse':
        prismaRef.current?.reset();
        break;
      case 'refresh':
        refetchWxJson();
        setRefreshTime(Date.now());
        break;
      case 'export':
        try {
          const imageResponse = await fetch(imageryServerUrl + selectedImageUrl);
          const imageBlob = await imageResponse.blob();
          const ext = selectedImageUrl.split('.').pop();
          const href = URL.createObjectURL(imageBlob);

          const anchorElement = document.createElement('a');
          anchorElement.href = href;
          anchorElement.download =
            (selectedImagesData && (selectedImagesData.TITLE || selectedImagesData.SUBTABLABEL)) + '.' + ext;

          document.body.appendChild(anchorElement);
          anchorElement.click();

          document.body.removeChild(anchorElement);
          window.URL.revokeObjectURL(href);
        } catch (ex) {
          toast.error('No image to export');
        }
        break;
    }
  }

  const tabMenus = [
    {
      id: 'save',
      name: 'Save',
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
    <div className="igry" key={refreshTime}>
      <FetchUserSettings />
      <Dialog
        PaperComponent={PaperComponent}
        hideBackdrop
        disableEnforceFocus
        style={{ position: 'absolute' }}
        open={showInformation}
        onClose={() => dispatch(setShowInformation())}
      >
        <DialogTitle className="departure-advisor-popup-title">
          <p className="text" id="draggable-dialog-title">
            Info: {selectedImagesData && (selectedImagesData.TITLE || selectedImagesData.SUBTABLABEL)}
          </p>
          <button onClick={() => dispatch(setShowInformation())} className="dlg-close" type="button">
            <SvgRoundClose />
          </button>
        </DialogTitle>
        <div className="imagery-info-body">
          {selectedImagesData && selectedImagesData.HELPTEXT && (
            <div
              dangerouslySetInnerHTML={{
                __html: unEscape(selectedImagesData.HELPTEXT),
              }}
            />
          )}
        </div>
      </Dialog>
      <div className="igry__wrp">
        <div className="igry__lft igry__blu">
          <MapTabs tabMenus={tabMenus} />
        </div>
        <div className="igry__mid">
          <div className="igry__img__area">
            {selectedImageUrl && (
              <PrismaZoom className="prisma" allowTouchEvents={true} ref={prismaRef}>
                <img
                  src={imageryServerUrl + selectedImageUrl}
                  onError={(e) => (e.currentTarget.src = '/images/404.jpg')}
                />
              </PrismaZoom>
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
                {selectedImages.length > 1 && (
                  <button className="igry__range__play__btn" onClick={clickPlay}>
                    {!isPlaying && <FaPlayCircle className="igry__range__play--icon" />}
                    {isPlaying && <FaPauseCircle className="igry__range__play--icon" />}
                  </button>
                )}
              </div>
              <div className="igry__slider__area">
                <div className="date-container">
                  {dateBlocks.map((item, index) => (
                    <div key={'date' + index} className="date" style={{ width: item.width + '%' }}>
                      {item.date && item.width > 10
                        ? item.date.toLocaleDateString(
                            'en-US',
                            hideWeekDay
                              ? {
                                  day: 'numeric',
                                  month: 'numeric',
                                  timeZone: userSettings.default_time_display_unit ? undefined : 'UTC',
                                }
                              : {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'numeric',
                                  timeZone: userSettings.default_time_display_unit ? undefined : 'UTC',
                                },
                          )
                        : ''}
                    </div>
                  ))}
                </div>
                {selectedImages.length > 1 && (
                  <Nouislider
                    instanceRef={(instance) => {
                      if (instance && !noUISliderRef.current) {
                        noUISliderRef.current = instance;
                      }
                    }}
                    range={{ min: 0, max: sliderMaxValue ? sliderMaxValue : 3 }}
                    start={selectedImagesData.LOOP === 'Last' ? sliderMaxValue : 0}
                    step={1}
                    connect={[true, false]}
                    pips={{
                      mode: 'values',
                      values: sliderLabels,
                    }}
                    onSlide={(value) => {
                      setSliderValue(parseInt(value[0]));
                    }}
                    onChange={(value) => {
                      const newValue = parseInt(value[0]);
                      const timeImage = getImageBySliderValue(newValue);
                      if (timeImage) {
                        setSelectedImageUrl(timeImage.image);
                        setSelectedTime(timeImage.time);
                        setSliderValue(timeImage.sliderValue);
                        updateSliderValue(timeImage.sliderValue);
                      }
                      stopTimer();
                    }}
                  ></Nouislider>
                  // <Slider
                  //   min={20}
                  //   defaultValue={0}
                  //   value={sliderValue}
                  //   marks={sliderLabels}
                  //   step={1}
                  //   // @ts-ignore
                  //   min={0}
                  //   max={sliderMaxValue ? sliderMaxValue : 3}
                  //   className="igry__range__slider"
                  //   onChange={(event, newValue: number) => {
                  //     if (isIOS && event.type === 'mousedown') {
                  //       return;
                  //     }
                  //     setSliderValue(newValue);
                  //   }}
                  //   onClick={() => stopTimer()}
                  //   onChangeCommitted={(e, newValue) => {
                  //     if (isIOS && e.type === 'mousedown') {
                  //       return;
                  //     }
                  //     const timeImage = getImageBySliderValue(newValue);
                  //     if (timeImage) {
                  //       setSelectedImageUrl(timeImage.image);
                  //       setSelectedTime(timeImage.time);
                  //       setSliderValue(timeImage.sliderValue);
                  //     }
                  //   }}
                  // />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Imagery;
