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
        layout={'fill'}
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
              <b>EZWxBrief</b> is an affordable <b>progressive web app</b> elegantly designed to blend high resolution
              supplemental weather guidance with your personal weather minimums. All of this is seamlessly integrated
              with the EZDeparture Advisor™ a unique approach that quantifies your risk and instantly lets you know the
              most favorable time to depart based on your personal weather minimums. Check out this short{' '}
              <a target="_blank" href="https://www.youtube.com/watch?v=ASo3r17oDR0&feature=youtu.be">
                intro video
              </a>{' '}
              to learn how <b>EZWxBrief</b> can help you minimize your exposure to adverse weather along your proposed
              route of flight.
            </div>
          </div>
          <div className="about__cards">
            <div className="about__card">
              <div className="about__card_img__area">
                <Image
                  className="about__img"
                  src="/images/slider4.png"
                  loading="eager"
                  width="400"
                  height="320"
                  alt={''}
                />
              </div>
              <div className="about__card__content">
                <div className="about__card__icon">
                  <i className="fa-solid fa-images"></i>
                </div>
                <h2 className="about__card__title">Amazing Imagery</h2>
                <p className="about__card__subtitle">
                  The imagery in <b>EZWxBrief</b> is by far the most complete online collection of static imagery
                  available to pilots. You'll have access to hundreds of images meticulously organized into dozens of
                  collections that depict the evolution of adverse weather better in time and space than the heavyweight
                  aviation apps have to offer. The spatial and temporal resolution of the weather guidance is truly mind
                  blowing. There’s no need to fumble through dozens of websites when you can have it all included in one
                  place with <b>EZWxBrief</b>. So are you ready to ditch all of those outdated bookmarks and subscribe
                  to <b>EZWxBrief</b> today?
                </p>
              </div>
            </div>
            <div className="about__card">
              <div className="about__card_img__area">
                <Image
                  className="about__img"
                  src="/images/MammatusClouds.jpg"
                  width="400"
                  height="320"
                  loading="eager"
                  alt={''}
                />
              </div>
              <div className="about__card__content">
                <div className="about__card__icon">
                  <i className="fa-solid fa-wand-sparkles"></i>
                </div>
                <h2 className="about__card__title">Stunning Visualizations</h2>
                <p className="about__card__subtitle">
                  Limiting your exposure to adverse weather on any proposed flight is often a function of choosing the
                  right altitude and route. Whether flying under visual or instrument flight rules, the <b>EZWxBrief</b>
                  Profile you will allow you to quickly visualize the turbulence, icing, temperature and wind as a
                  function of altitude. This depicts a vertical cross-section of the weather along your route in a way
                  that allows you to instantly see the location and height of clouds and where there’s a risk of icing,
                  turbulence, convection and IFR conditions. Moreover, pilots flying VFR will be able to easily know
                  their exposure to instrument meteorological conditions (IMC). So are you ready to minimize your
                  exposure to adverse weather and enjoy the simplicity of <b>EZWxBrief</b>?
                </p>
              </div>
            </div>
            <div className="about__card">
              <div className="about__card_img__area">
                <Image
                  className="about__img"
                  src="/images/JoplinThunderstorm.png"
                  width="400"
                  height="320"
                  loading="eager"
                  alt={''}
                />
              </div>
              <div className="about__card__content">
                <div className="about__card__icon">
                  <BsClockFill />
                </div>
                <h2 className="about__card__title">Instant Answers</h2>
                <p className="about__card__subtitle">
                  The <b>EZDeparture Advisor</b> will absolutely change the way you think about a weather briefing.
                  Pilots spend an enormous time determining the best altitude and route, but what about the best time to
                  depart that meets all of your personal weather minimums? Changing your departure time by just a few
                  hours can make the difference between a flight fraught with complex weather to one that is rather
                  boring. Traditional briefings from the various heavyweight apps makes finding the best time to depart
                  an extremely time consuming task. <b>EZWxBrief</b> provides this in an instant! So do you want to
                  stack the deck in your favor and enjoy the simplicity of <b>EZWxBrief</b>?
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
