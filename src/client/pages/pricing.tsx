import React from 'react';
import { NextPage } from 'next';
import Image from 'next/image';
import FlexiblePricing from '../components/shared/FlexiblePricing';

const Pricing: NextPage = () => {
  const data = {
    isShowBtn: true,
    content: [
      {
        text: `We are aware that you have a budget with respect to your aviation expenditures. So when it's time to renew your annual membership, tell us what you'd like to spend on EZWxBrief. If you love the application, but only need it occasionally, then name your price. Or perhaps EZWxBrief has saved you a ton of time and lowered your stress and you want to pay a bit more than the standard price. That's also fine. Either way you'll receive our gratitude and our dedication to take this groundbreaking application even further. Please note: Members that renew for less than or equal to $30 will be required to subscribe at the full EZWxBrief price when their annual membership expires next year.`,
      },
      {
        text: `Make no mistake, we are not asking you for a donation. We simply don't want price to get in the way of providing you with a life-saving tool that will minimize your exposure to adverse weather. So are you ready to take pre-flight weather planning to a whole new level and enjoy the simplicity of EZWxBrief? Simply tap or click on the Join Now button below.  And don't forget our customer referral program where you can get a free membership just by referring others.  Click here to see the specific details.`,
      },
    ],
  };
  return (
    <div className="prc">
      <div className="prc__header">
        <Image
          className="prc__img"
          src="/images/baner.jpg"
          layout="fill"
          alt={''}
        />
      </div>
      <FlexiblePricing {...data} />
      <div className="container-half">
        <div className="prc__wrp">
          <div className="prc__card">
            <h2 className="prc__title">14-Day trial membership</h2>
            <h2 className="prc__price">Free</h2>
            <p className="prc__text text">
              We know that your time is a valuable commodity. Whether you are
              flying IFR or VFR it can take an enormous amount of time to
              pinpoint that perfect time to depart that meets all of your
              personal minimums. Well, here’s your chance to try out every
              groundbreaking feature of EZWxBrief for the next two weeks and
              decide for yourself if you want to save time and add confidence to
              your pre-flight weather planning.
            </p>
          </div>
          <div className="prc__card prc__card--active">
            <h2 className="prc__title">14-Day trial membership</h2>
            <h2 className="prc__price">
              <span>$</span>
              79/yr
            </h2>
            <div className="prc__sub__area">
              <h4 className="prc__subtitle">Your membership</h4>
              <h4 className="prc__subtitle">includes:</h4>
            </div>
            <div className="prc__txt__area">
              <p className="prc__text text">
                (1) EZMap briefing to plan your route
              </p>
              <p className="prc__text text">
                (2) EZRoute Profile briefing to find the best altitude
              </p>
              <p className="prc__text text">
                (3) EZDeparture Advisor to optimize your departure time
              </p>
              <p className="prc__text text">
                (4) EZMinimums to factor in your personal weather minimums
              </p>
              <p className="prc__text text">
                (5) Comprehensive static weather imagery
              </p>
              <p className="prc__text text">
                (6) Library of bite-sized training workshops
              </p>
              <p className="prc__text text">
                (7) Incredible service from our awesome support team
              </p>
            </div>
          </div>
          <div className="prc__card">
            <h2 className="prc__title">14-Day trial membership</h2>
            <h2 className="prc__price">
              <span>$</span>
              69/yr
            </h2>
            <p className="prc__text text">
              After you have had a chance to get hooked on EZWxBrief for an
              entire year, you’ll enjoy a $10 savings on your annual membership
              if you choose to set up your account to renew automatically. You
              can do this when you initially register or at any time thereafter
              in your user profile. This gives you the peace of mind that your
              EZWxBrief membership will never expire. So what are you waiting
              for? Join today and enjoy the simplicity of EZWxBrief!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
