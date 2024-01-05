import React from 'react';
import Image from 'next/image';
import { SvgBulbDollar } from '../components/utils/SvgIcons';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/auth/authSlice';
import Footer from '../components/layout/Footer';

function Pricing() {
  const { id } = useSelector(selectAuth);
  const router = useRouter();
  return (
    <div className="pricing-container">
      <Image
        className="img-content-background"
        src="/images/PricingPage-Cropped.png"
        sizes="100vw"
        width={0}
        height={0}
        style={{ width: '100%', height: 'auto' }}
        alt=""
      ></Image>
      <div className="flx" id="pricing">
        <div className="container-half">
          <div className="flx__wrp">
            <div className="flx__header">
              <div className="flx__icn">
                <SvgBulbDollar />
              </div>
              <h2 className="flx__title">Single-tier pricing</h2>
            </div>
            <div className="flx__content">
              <p className="flx__txt text">
                Are you ready to take pre-flight planning to a whole new level and enjoy the simplicity of EZWxBrief?
              </p>
              <p className="flx__txt text">
                Simply tap or click on the Join button below to start your free 30-day trial membership. After 30 days,
                you will be billed $6.99 on a monthly basis. You can cancel your membership at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="member-content">
        <div className="member-cards">
          <div className="member-card">
            <h3>30-day trial</h3>
            <h4>Free</h4>
            <p>
              We know that your time is a valuable commodity. Whether you are flying IFR or VFR it can take an enormous
              amount of time to pinpoint that perfect time to depart that meets all of your personal minimums. Well,
              here’s your chance to try out every groundbreaking feature of EZWxBrief for the next two weeks and decide
              for yourself if you want to save time and add confidence to your pre-flight weather planning.
            </p>
          </div>
          <div className="member-card">
            <h3>Member benefits</h3>
            <h1>Your EZWxBrief membership includes:</h1>
            <p>(1) EZMap briefing to plan your route</p>
            <p>(2) EZRoute Profile briefing to find the best altitude</p>
            <p>(3) EZDeparture Advisor to optimize your departure time </p>
            <p>(4) EZMinimums to factor in your personal weather minimums </p>
            <p>(5) Comprehensive static weather imagery </p>
            <p>(6) Incredible service from our awesome support team</p>
          </div>
          <div className="member-card">
            <h3>Auto-renewal</h3>
            <h4>$6.99 monthly</h4>
            <p>
              After your free 30-day trial period ends, your account will seamlessly renew automatically every month so
              you will always stay connected to EZWxBrief on your desktop computer or portable device. Your credit card
              will be charged monthly until you decide to pause your EZWxBrief membership by turning off the
              auto-renewal in your member profile. So what are you waiting for? Join EZWxBrief today!
            </p>
          </div>
        </div>
      </div>
      {!id && (
        <div className="flx__btn__area">
          <button onClick={() => router.push('/signup')} className="btn flx__btn">
            Join Now
          </button>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default Pricing;
