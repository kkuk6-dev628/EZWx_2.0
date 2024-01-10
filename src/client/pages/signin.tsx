import React, { useEffect, useState } from 'react';
import { GrFacebook } from 'react-icons/gr';
import { FaTwitterSquare, FaYoutubeSquare, FaCheck } from 'react-icons/fa';
import { BsInstagram } from 'react-icons/bs';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSigninMutation } from '../store/auth/authApi';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { useGetUserSettingsQuery } from '../store/user/userSettingsApi';
import { landingPages } from '../utils/constants';
import Link from 'next/link';
interface IFormInput {
  email: string;
  password: string;
}
function signin() {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<IFormInput>();
  const router = useRouter();
  const [signin, { data, isLoading, error: responseError }] = useSigninMutation();
  const onSubmit: SubmitHandler<IFormInput> = (data, e) => {
    e.preventDefault();
    console.log(data);
    signin(data);
  };
  const { data: settings } = useGetUserSettingsQuery({
    skip: !data,
    refetchOnMountOrArgChange: true,
  });
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  useEffect(() => {
    if (isLoading) {
      console.log('loading');
    } else if (!isLoading && responseError) {
      const { data } = responseError as any;
      if (data && data.message) {
        setShowEmailError(true);
      }
    } else if (!isLoading && !responseError && data) {
      // router.push('/map');
    }
  }, [data, responseError]);

  useEffect(() => {
    if (settings) {
      router.push(landingPages[settings.landing_page]?.url || '/dashboard');
    }
  }, [settings]);

  return (
    <div className="sign">
      <div className="sign__wrp">
        <div className="sign__left">
          <div className="sign__lft__hdr">
            <h3 className="sign__title bahnschrift">
              The simplest way to choose the best time to depart while factoring in your own personal minimums
            </h3>
            <p className="sign__txt bahnschrift">
              EZWxBrief provides access to the highest resolution weather guidance available online with seamless access
              to expert weather training. You'll enjoy robust visualizations of weather along your route that will
              minimize your exposure to adverse weather. Experience the simplicity of EZWxBrief.
            </p>
          </div>
          <div className="sign__btn__area">
            <button className="sign__btn bahnschrift" onClick={() => router.push('/home')}>
              Learn More {`>>`}
            </button>
          </div>
          <div className="sign__social__area">
            <p className="sign__socila__lbl bahnschrift">Find us on social media</p>
            <div className="sign__social__items">
              <a href="https://facebook.com/ezwxbrief" className="ftr__rgt__item ftr__fb">
                <GrFacebook />
              </a>
              <a href="https://instagram.com/ezwxbrief" className="ftr__rgt__item ftr__ytb">
                <FaYoutubeSquare />
              </a>
              <a href="https://youtube.com/@ezwxbrief" className="ftr__rgt__item ftr__insta">
                <BsInstagram />
              </a>
            </div>
          </div>
        </div>
        <div className="sign__frm__area">
          <form onSubmit={handleSubmit(onSubmit)} className="sign__frm" action="">
            {showEmailError && (
              <div className="email-error-message">
                Sorry, we can’t find an account in our system with this email address and password combination. Please
                try again or <Link href="/contact-us">contact our support team</Link> if you are still having an issue
                signing in.
              </div>
            )}
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="email" className="csuinp__lbl">
                  Username
                </label>
                <div className="csuinp__wrp__two">
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Please enter a valid email address.',
                    })}
                    id="email"
                    className="csuinp__input"
                    placeholder="Your EZWxBrief email address"
                  />
                  {errors.email && <p className="csuinp__error__msg">{errors.email.message}</p>}
                </div>
              </div>
              <p className="csuinp__txt">The email address you registered with</p>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="password" className="csuinp__lbl">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password', { required: 'Please enter a valid password' })}
                  id="password"
                  className="csuinp__input"
                  placeholder="Your password (minimum of 6 characters)"
                />
                {errors.password && <p className="csuinp__error__msg">Please enter a valid password</p>}
              </div>
              <p className="csuinp__txt">The password you specified during registration</p>
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
              <label htmlFor="checkbox" className="csuinp__lbl">
                Remember me
              </label>
            </div>
            <div className="sign__sub__btn__area">
              <button type="submit" className="sign__sub__btn">
                Secure sign in
              </button>
            </div>
            <button type="reset" className="sign__forgt" onClick={() => router.push('/reset-password')}>
              Forgot your password?
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default signin;
