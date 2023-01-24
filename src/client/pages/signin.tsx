import React from 'react';
import { GrFacebook } from 'react-icons/gr';
import { FaTwitterSquare, FaYoutubeSquare, FaCheck } from 'react-icons/fa';
import { BsInstagram } from 'react-icons/bs';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSigninMutation } from '../store/auth/authApi';
import { useRouter } from 'next/router';
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
  const [signin, { data, isLoading, error: responseError }] =
    useSigninMutation();
  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log(data);
    signin(data);
  };

  if (isLoading) {
    console.log('loading');
  } else if (!isLoading && responseError) {
    console.log(responseError);
  } else if (!isLoading && !responseError && data) {
    router.push('/profile');
  }
  return (
    <div className="sign">
      <div className="sign__wrp">
        <div className="sign__left">
          <div className="sign__lft__hdr">
            <h3 className="sign__title">
              The simplest way to choose the best time to depart while factoring
              in your own personal minimums
            </h3>
            <p className="sign__txt">
              EZWxBrief provides access to the highest resolution weather
              guidance available online with seamless access to expert weather
              training. You'll enjoy robust visualizations of weather along your
              route that will minimize your exposure to adverse weather.
              Experience the simplicity of EZWxBrief.
            </p>
          </div>
          <div className="sign__btn__area">
            <button className="sign__btn">Learn More {`>>`}</button>
          </div>
          <div className="sign__social__area">
            <p className="sign__socila__lbl">Find us on social media</p>
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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="sign__frm"
            action=""
          >
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
                    placeholder="Email for Verification"
                  />
                  {errors.email && (
                    <p className="csuinp__error__msg">{errors.email.message}</p>
                  )}
                </div>
              </div>
              <p className="csuinp__txt">
                The email address you registered with
              </p>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="password" className="csuinp__lbl">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password', { required: true })}
                  id="password"
                  className="csuinp__input"
                  placeholder="The password you specified during registration"
                />
              </div>
              <p className="csuinp__txt">
                The password you specified during registration
              </p>
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
            <button className="sign__forgt">Forgot your password?</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default signin;
