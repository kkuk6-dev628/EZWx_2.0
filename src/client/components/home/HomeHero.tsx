import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper';
import Image from 'next/image';
import 'swiper/css/navigation';
import 'swiper/css';

function HomeHero() {
  return (
    <div className="hero">
      <div className="hero__slider__area">
        <Swiper
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          modules={[Navigation, Autoplay]}
          navigation={true}
          slidesPerView={1}
        >
          <SwiperSlide className="hero__slider">
            <Image className="slider__img" src="/images/slider5.jpeg" loading="eager" fill alt={''} />
            <div className="container hero__slider__content">
              <h1 className="hero__title">Featuring the EZDeparture Advisor</h1>
              <p className="hero__subtitle">With personal weather minimums to stack the deck in your favor</p>
              <button className="btn btn--primary">Learn More</button>
            </div>
          </SwiperSlide>
          <SwiperSlide className="hero__slider">
            <Image className="slider__img" src="/images/slide1.jpeg" loading="eager" fill alt={''} />
            <div className="container hero__slider__content">
              <h1 className="hero__title">Comprehensive weather imagery</h1>
              <p className="hero__subtitle">This is not your ordinary static imagery</p>
              <button className="btn btn--primary">Learn More</button>
            </div>
          </SwiperSlide>
          <SwiperSlide className="hero__slider">
            <Image className="slider__img" src="/images/slider3.jpeg" loading="eager" fill alt={''} />
            <div className="container hero__slider__content">
              <h1 className="hero__title">Vertical route profile adds absolute clarity</h1>
              <p className="hero__subtitle">Enjoy the simplicity of EZWxBrief!™</p>
              <button className="btn btn--primary">Learn More</button>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}

export default HomeHero;
