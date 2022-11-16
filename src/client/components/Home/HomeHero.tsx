import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper';
import Image from 'next/image';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import 'swiper/css';

function HomeHero() {
  return (
    <div className="hero">
      <div className="hero__slider__area">
        <Swiper
          spaceBetween={30}
          effect="fade"
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          modules={[Navigation, Autoplay]}
          navigation={true}
          slidesPerView={1}
        >
          <SwiperSlide className="hero__slider">
            <Image
              className="slider__img"
              src="/images/slide1.jpeg"
              layout="fill"
              alt={''}
            />
            <div className="container hero__slider__content">
              <h1 className="hero__title">Comprehensive weather imagery</h1>
              <p className="hero__subtitle">
                This is not your ordinary static imagery
              </p>
              <button className="btn">Learn More</button>
            </div>
          </SwiperSlide>
          <SwiperSlide className="hero__slider">
            <Image
              className="slider__img"
              src="/images/slider2.jpeg"
              layout="fill"
              alt={''}
            />
            <div className="container hero__slider__content">
              <h1 className="hero__title">Comprehensive weather imagery</h1>
              <p className="hero__subtitle">
                This is not your ordinary static imagery
              </p>
              <button className="btn">Learn More</button>
            </div>
          </SwiperSlide>
          <SwiperSlide className="hero__slider">
            <Image
              className="slider__img"
              src="/images/slider3.jpeg"
              layout="fill"
              alt={''}
            />
            <div className="container hero__slider__content">
              <h1 className="hero__title">Comprehensive weather imagery</h1>
              <p className="hero__subtitle">
                This is not your ordinary static imagery
              </p>
              <button className="btn">Learn More</button>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="hero__card__area">
        <div className="hero__card__area__header">
          <h1 className="hero__card__area__title"></h1>
          <h1 className="hero__card__area__text text"></h1>
        </div>
        <div className="hero__card__container">
          <div className="hero__card">
            <div className="hero__card__top"></div>
            <div className="hero__card__btm">
              <div className="hero__card__icon"></div>
              <h2 className="hero__card__title"></h2>
              <p className="hero__card__text text"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeHero;
