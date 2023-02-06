import React from 'react';
import { SvgBulbDollar } from '../utils/SvgIcons';

function FlexiblePricing({ content, isShowBtn }) {
  return (
    <div className="flx">
      <div className="container-half">
        <div className="flx__wrp">
          <div className="flx__header">
            <div className="flx__icn">
              <SvgBulbDollar />
            </div>
            <h2 className="flx__title">Flexible pricing</h2>
          </div>
          <div className="flx__content">
            {content?.map((item, index) => (
              <div key={index}>
                <p className="flx__txt text" key={index}>
                  {item.text}
                </p>
              </div>
            ))}
            {!content && (
              <>
                <p className="flx__txt text">
                  We are aware that you have a budget with respect to your aviation expenditures. So when it's time to
                  renew your annual membership, tell us what you'd like to spend on EZWxBrief. If you love the
                  application, but only need it occasionally, then name your price. Or perhaps EZWxBrief has saved you a
                  ton of time and lowered your stress and you want to pay a bit more than the standard renewal price.
                  That's also fine. Either way you'll receive our gratitude and our dedication to take this
                  groundbreaking application even further. Please note: Members that renew for less than or equal to $30
                  will be required to subscribe at the full EZWxBrief price when their annual membership expires next
                  year.
                </p>
                <p className="flx__txt text">
                  Make no mistake, we are not asking for a donation. We simply don't want price to get in the way of
                  providing you with a life-saving tool that will minimize your exposure to adverse weather. So are you
                  ready to take preflight weather planning to a whole new level and enjoy the simplicity of EZWxBrief?
                </p>
              </>
            )}
          </div>
          {!isShowBtn && (
            <div className="flx__btn__area">
              <button className="btn flx__btn">Join Now</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlexiblePricing;
