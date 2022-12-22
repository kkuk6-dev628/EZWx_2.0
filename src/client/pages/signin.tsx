import React from 'react';
import { GrFacebook } from 'react-icons/gr';
import { FaTwitterSquare, FaYoutubeSquare } from 'react-icons/fa';
import { BsInstagram } from 'react-icons/bs';
import CustomInput from '../components/shared/CustomInput/CustomInput';

function signin() {
  return (
    <div className="sign">
      <div className="container">
        <div className="signin__wrp">
          <div className="sign__left">
            <div className="sign__lft__hdr">
              <h3 className="sing__title">
                The simplest way to choose the best time to depart while
                factoring in your own personal minimums
              </h3>
              <p className="sign__txt">
                EZWxBrief provides access to the highest resolution weather
                guidance available online with seamless access to expert weather
                training. You'll enjoy robust visualizations of weather along
                your route that will minimize your exposure to adverse weather.
                Experience the simplicity of EZWxBrief.
              </p>
            </div>
            <div className="signin__btn__area">
              <button className="sign__btn">Learn More {`>>`}</button>
            </div>
            <div className="sing__social__area">
              <p className="sing__socila__lbl">Find us on social media</p>
              <div className="sign__social__items">
                <a href="#" className="ftr__rgt__item ftr__fb">
                  <GrFacebook />
                </a>
                <a href="#" className="ftr__rgt__item ftr__tw">
                  <FaTwitterSquare />
                </a>
                <a href="#" className="ftr__rgt__item ftr__ytb">
                  <FaYoutubeSquare />
                </a>
                <a href="#" className="ftr__rgt__item ftr__insta">
                  <BsInstagram />
                </a>
              </div>
            </div>
          </div>
          <div className="sign__frm__area">
            <form className="sign__frm" action="">
              {/* <CustomInput
                CustomInputProps={
                  ((inputName = 'email'),
                  (id = 'email'),
                  (placeholder = 'Email for Verification'),
                  (label = 'Email'),
                  (txt = 'The email address you registered with'))
                }
              /> */}
              <div className="sign__input__area">
                <label htmlFor="email" className="sign__lbl">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="sign__input"
                  placeholder="Email for Verification"
                />
                <p className="sign__input__txt">
                  The email address you registered with
                </p>
              </div>
              <div className="sign__input__area">
                <label htmlFor="password" className="sign__lbl">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="sign__input"
                  placeholder="Your password (minimum 6 characters)"
                />
                <p className="sign__input__txt">
                  The password you specified during registration
                </p>
              </div>
              <div className="sign__input__area">
                <input
                  type="checkbox"
                  name="remember"
                  id="remember"
                  className="sign__input"
                />
                <label htmlFor="remember" className="sign__lbl">
                  Remember me
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default signin;
