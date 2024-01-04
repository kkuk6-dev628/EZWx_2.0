import React from 'react';
import { SvgBulbDollar } from '../utils/SvgIcons';
import { useRouter } from 'next/router';

function FlexiblePricing({ content, isShowBtn }) {
  const router = useRouter();
  return (
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
                  Are you ready to take pre-flight planning to a whole new level and enjoy the simplicity of EZWxBrief?
                </p>
                <p className="flx__txt text">
                  Simply tap or click on the Join button below to start your free 30-day trial membership. After 30
                  days, you will be billed $6.99 on a monthly basis. You can cancel your membership at any time.
                </p>
              </>
            )}
          </div>
          {!isShowBtn && (
            <div className="flx__btn__area">
              <button onClick={() => router.push('/signup')} className="btn flx__btn">
                Join Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlexiblePricing;
