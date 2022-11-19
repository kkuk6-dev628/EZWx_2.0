import Image from 'next/image';
import React from 'react';
import { GrGallery } from 'react-icons/gr';
import { BsClockFill } from 'react-icons/bs';
import { FaGraduationCap } from 'react-icons/fa';
function HomeAbout() {
  return (
    <div className="about">
      {/* <Image
        className="about__bg__img"
        src="/images/mapbg.jpeg"
        layout="fill"
        alt={''}
      /> */}
      <div className="about__overlay"></div>
      <div className="container-half">
        <div className="about__wrp">
          <div className="about__hdr flex flex-column">
            <div className="about__title__wrp">
              <div className="about__title">ABOUT EZWXBRIEF™</div>
            </div>
            <div className="about__sub">
              <b>EZWxBrief</b> is an affordable progressive web app elegantly
              designed to blend high resolution supplemental weather guidance
              with your personal weather minimums. All of this is seamlessly
              integrated with the EZDeparture Advisor™ a unique approach that
              quantifies your risk and instantly lets you know the most
              favorable time to depart based on your personal weather minimums.
              Check out this short intro video to learn how EZWxBrief can help
              you minimize your exposure to adverse weather along your proposed
              route of flight.
            </div>
          </div>
          <div className="about__cards">
            <div className="about__card">
              <div className="about__card_img__area">
                <Image
                  className="about__img"
                  src="/images/slider3.jpeg"
                  layout="fill"
                  alt={''}
                />
              </div>
              <div className="about__card__content">
                <div className="about__card__icon">
                  <GrGallery />
                </div>
                <h2 className="about__card__title">Amazing Imagery</h2>
                <p className="about__card__subtitle">
                  The imagery in EZWxBrief is by far the most complete online
                  collection of static imagery available to pilots. You'll have
                  access to hundreds of images meticulously organized into
                  dozens of collections that depict the evolution of adverse
                  weather better in time and space than the heavyweight aviation
                  apps have to offer. The spatial and temporal resolution of the
                  weather guidance is truly mind blowing. There’s no need to
                  fumble through dozens of websites when you can have it all
                  included in one place with EZWxBrief. So are you ready to
                  ditch all of those outdated bookmarks and subscribe to
                  EZWxBrief today?
                </p>
              </div>
            </div>
            <div className="about__card">
              <div className="about__card_img__area">
                <Image
                  className="about__img"
                  src="/images/slider3.jpeg"
                  layout="fill"
                  alt={''}
                />
              </div>
              <div className="about__card__content">
                <div className="about__card__icon">
                  <FaGraduationCap />
                </div>
                <h2 className="about__card__title">Amazing Imagery</h2>
                <p className="about__card__subtitle">
                  The imagery in EZWxBrief is by far the most complete online
                  collection of static imagery available to pilots. You'll have
                  access to hundreds of images meticulously organized into
                  dozens of collections that depict the evolution of adverse
                  weather better in time and space than the heavyweight aviation
                  apps have to offer. The spatial and temporal resolution of the
                  weather guidance is truly mind blowing. There’s no need to
                  fumble through dozens of websites when you can have it all
                  included in one place with EZWxBrief. So are you ready to
                  ditch all of those outdated bookmarks and subscribe to
                  EZWxBrief today?
                </p>
              </div>
            </div>
            <div className="about__card">
              <div className="about__card_img__area">
                <Image
                  className="about__img"
                  src="/images/slider3.jpeg"
                  layout="fill"
                  alt={''}
                />
              </div>
              <div className="about__card__content">
                <div className="about__card__icon">
                  <BsClockFill />
                </div>
                <h2 className="about__card__title">Amazing Imagery</h2>
                <p className="about__card__subtitle">
                  The imagery in EZWxBrief is by far the most complete online
                  collection of static imagery available to pilots. You'll have
                  access to hundreds of images meticulously organized into
                  dozens of collections that depict the evolution of adverse
                  weather better in time and space than the heavyweight aviation
                  apps have to offer. The spatial and temporal resolution of the
                  weather guidance is truly mind blowing. There’s no need to
                  fumble through dozens of websites when you can have it all
                  included in one place with EZWxBrief. So are you ready to
                  ditch all of those outdated bookmarks and subscribe to
                  EZWxBrief today?
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeAbout;
