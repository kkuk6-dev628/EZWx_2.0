import React from 'react';
import { FaCheck } from 'react-icons/fa';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();
function signup() {
  const colourOptions = [
    { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
    { value: 'blue', label: 'Blue', color: '#0052CC', isFixed: true },
    { value: 'purple', label: 'Purple', color: '#5243AA' },
    { value: 'red', label: 'Red', color: '#FF5630', isDisabled: true },
    { value: 'orange', label: 'Orange', color: '#FF8B00' },
  ];
  return (
    <div className="signup">
      <div className="signup__wrp">
        <div className="signup__header">
          <h1 className="signup__header__title">Register now, it's free!</h1>
          <p className="signup__header__txt">
            Are you ready to take your pre-flight weather planning to a whole
            new level? Enjoy the simplicity of EZWxBrief for 14 days on your
            mobile device, desktop and tablet.
          </p>
        </div>
        <div className="sign__frm__area signup__frm__area">
          <form action="" className="sign__frm signup__frm">
            <div className="sign__frm__header">
              <p>
                Want to skip the trial and pay for an annual membership to
                EZWxBrief right now? Then fill in the information below and
                click on the Purchase Now button below.
              </p>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="email" className="csuinp__lbl">
                  Your first and last name *
                </label>
                <div className="csuinp__grp">
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    className="csuinp__input"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    className="csuinp__input"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="email" className="csuinp__lbl">
                  Email for login and verification *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="csuinp__input"
                  placeholder="Email for Verification"
                />
              </div>
              <p className="csuinp__txt">
                Your email will also be your username
              </p>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="password" className="csuinp__lbl">
                  Please pick a password *
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="csuinp__input"
                  placeholder="Password (minimum 6 characters)"
                />
              </div>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="password" className="csuinp__lbl">
                  Please confirm your password *
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="csuinp__input"
                />
              </div>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="password" className="csuinp__lbl">
                  Where did you hear about EZWxBrief? *
                </label>
                <select
                  name=""
                  id=""
                  className="csuinp__input csuinp__input--select"
                >
                  <option value="">Where did you hear about us?</option>
                  <option value="">Where did you hear about us?</option>
                  <option value="">Where did you hear about us?</option>
                  <option value="">Where did you hear about us?</option>
                </select>
              </div>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="password" className="csuinp__lbl">
                  Pilot certifications (select all that apply) *
                </label>
                <Select
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? '#886ab5' : '#E5E5E5',
                    }),
                  }}
                  className=" csuinp__input--select"
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  defaultValue={[colourOptions[4], colourOptions[5]]}
                  isMulti
                  options={colourOptions}
                />
              </div>
            </div>
            <div className="csuinp csuinp--checkbox">
              <div className="csuinp__ipt__wrp">
                <input
                  type="checkbox"
                  name="checkbox"
                  id="checkbox"
                  className="csuinp__input__checkbox"
                  placeholder="The password you specified during registration"
                />
                <FaCheck className="csuinp__input__rgt" />
              </div>
              <label
                htmlFor="checkbox"
                className="csuinp__lbl csuinp__lbl--light"
              >
                I agree to{' '}
                <a className="csuinp__lbl--link" href="#">
                  Terms of Service
                </a>
              </label>
            </div>
            <div className="csuinp csuinp--checkbox csuinp--checkbox-alg-top">
              <div className="csuinp__ipt__wrp">
                <input
                  checked={true}
                  type="checkbox"
                  name="checkbox"
                  id="checkbox2"
                  className="csuinp__input__checkbox"
                  placeholder="The password you specified during registration"
                />
                <FaCheck className="csuinp__input__rgt" />
              </div>
              <label htmlFor="checkbox2" className="csuinp__lbl">
                Sign up to receive our monthly EZWxBrief e-newsletter, free
                video tips and other important announcements.
              </label>
            </div>
            <div className="sign__sub__btn__area signup__btn__area">
              <button className="sign__sub__btn">Purchase Now</button>
              <span>Or</span>
              <button className="sign__sub__btn">Start 14-Day Trial</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default signup;
