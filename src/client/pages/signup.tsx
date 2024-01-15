import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useSignupMutation } from '../store/auth/authApi';
import { useRouter } from 'next/router';
import { api } from '../utils';
import { validateConfirmPassword, validateEmail, validatePassword } from '../utils/utils';
// import { error } from 'console';

interface certifications {
  name: string;
  description: string;
}
interface IFormInput {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  hearAbout: string;
  certifications: certifications[];
  terms: boolean;
  newsletter: boolean;
}

const animatedComponents = makeAnimated();
function signup() {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      confirmPassword: '',
      hearAbout: '',
      certifications: [],
      terms: false,
      newsletter: true,
    },
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [certificationsOptions, setCertificationsOptions] = useState([]);

  const [signup, { data, isLoading, error: responseError }] = useSignupMutation();

  useEffect(() => {
    api({
      method: 'get',
      url: 'certification/findAll',
    })
      .then((res) => {
        console.log('certification data ', res.data);
        setCertificationsOptions(res.data);
      })
      .catch((err) => console.log(err.message));
  }, []);

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log(data);
    delete data.terms;
    delete data.newsletter;
    signup(data);
  };

  // render logic
  // let content = null;

  if (isLoading) {
    console.log('loading');
  } else if (!isLoading && responseError) {
    console.log(responseError);
  } else if (!isLoading && !responseError && data) {
    router.push('/dashboard');
  }

  return (
    <div className="signup">
      <div className="signup__wrp">
        <div className="signup__header">
          <h1 className="signup__header__title">Register now, it's free!</h1>
          <p className="signup__header__txt">
            Are you ready to take your pre-flight weather planning to a whole new level? Enjoy the simplicity of
            EZWxBrief for 14 days on your mobile device, desktop and tablet.
          </p>
        </div>
        <div className="sign__frm__area signup__frm__area">
          <form onSubmit={handleSubmit(onSubmit)} className="sign__frm signup__frm">
            <div className="sign__frm__header">
              <p>
                Want to skip the trial and pay for an annual membership to EZWxBrief right now? Then fill in the
                information below and click on the Purchase Now button below.
              </p>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="email" className="csuinp__lbl">
                  Your first and last name *
                </label>
                <div className="csuinp__grp">
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('firstname', {
                        required: 'The First Name field is required.',
                      })}
                      id="firstname"
                      className={`csuinp__input ${errors.firstname ? 'csuinp__input--error' : ''}`}
                      placeholder="First Name"
                    />
                    {errors.firstname && <p className="csuinp__error__msg">{errors.firstname.message}</p>}
                  </div>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('lastname', {
                        required: 'The Last Name field is required.',
                      })}
                      id="lastname"
                      className={`csuinp__input ${errors.lastname ? 'csuinp__input--error' : ''}`}
                      placeholder="Last Name"
                    />
                    {errors.lastname && <p className="csuinp__error__msg">{errors.lastname.message}</p>}
                  </div>
                </div>
              </div>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="email" className="csuinp__lbl">
                  Email for login and verification *
                </label>
                <div className="csuinp__wrp__two">
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Please enter a valid email address.',
                      validate: validateEmail,
                    })}
                    id="email"
                    className={`csuinp__input ${errors.email ? 'csuinp__input--error' : ''}`}
                    placeholder="Email for Verification"
                  />
                  {errors.email && <p className="csuinp__error__msg">{errors.email.message}</p>}
                </div>
              </div>
              <p className="csuinp__txt">Your email will also be your username</p>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="password" className="csuinp__lbl">
                  Please pick a password *
                </label>
                <div className="csuinp__wrp__two">
                  <input
                    type="password"
                    {...register('password', {
                      validate: validatePassword,
                    })}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`csuinp__input ${errors.password ? 'csuinp__input--error' : ''}`}
                    placeholder="Password (minimum 6 characters)"
                  />
                  {errors.password && <p className="csuinp__error__msg">{errors.password.message}</p>}
                </div>
              </div>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="password" className="csuinp__lbl">
                  Please confirm your password *
                </label>
                <div className="">
                  <input
                    {...register('confirmPassword', {
                      required: true,
                      validate: (value) => validateConfirmPassword(value, password),
                    })}
                    type="password"
                    id="password"
                    className={`csuinp__input ${errors.confirmPassword ? 'csuinp__input--error' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && <p className="csuinp__error__msg">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="password" className="csuinp__lbl">
                  Where did you hear about EZWxBrief? *
                </label>
                <div className="">
                  <select
                    {...register('hearAbout', {
                      required: 'The Where did you hear about EZWxBrief? field is required.',
                    })}
                    id=""
                    className={`csuinp__input csuinp__input--select ${errors.hearAbout ? 'csuinp__input--error' : ''}`}
                  >
                    <option value="">Where did you hear about us?</option>
                    <option value="repeat">Repeat customer</option>
                    <option value="friend">Friend (first & last name?)</option>
                    <option value="discussion">Discussion Forum (Which one?)</option>
                    <option value="magazine">Magazine (Which one?)</option>
                    <option value="Website">Website (Which one?)</option>
                    <option value="podcast">Podcast (Which one?)</option>
                    <option value="search">Search Engine (Which one?)</option>
                    <option value="other">Other (Please specify)</option>
                    <option value="do-not-remember">Do not remember</option>
                  </select>
                  {errors.hearAbout && <p className="csuinp__error__msg">{errors.hearAbout.message}</p>}
                </div>
              </div>
            </div>
            <div className="csuinp">
              <div className="csuinp__ipt__wrp">
                <label htmlFor="password" className="csuinp__lbl">
                  Pilot certificationss (select all that apply) *
                </label>
                <div className="">
                  <Controller
                    name="certificationss"
                    control={control}
                    {...register('certifications', {
                      required: 'The Pilot certificationss (select all that apply) field is required.',
                    })}
                    render={({ field }) => (
                      <Select
                        placeholder="Select your certificationss"
                        isMulti
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: errors.certifications ? '#dc3545' : state.isFocused ? '#886ab5' : '#E5E5E5',
                          }),
                        }}
                        {...field}
                        closeMenuOnSelect={false}
                        getOptionLabel={(option: { description: string }) => option?.description}
                        getOptionValue={(option: { name: string }) => option?.name}
                        className=" csuinp__input--select"
                        options={certificationsOptions.length > 0 && certificationsOptions}
                        components={animatedComponents}
                      />
                    )}
                  />
                  {errors.certifications && <p className="csuinp__error__msg">{errors.certifications.message}</p>}
                </div>
              </div>
            </div>
            <div className="csuinp">
              <div className=" csuinp--checkbox">
                <div className="csuinp__ipt__wrp">
                  <input
                    type="checkbox"
                    {...register('terms', {
                      required: 'This field is required.',
                    })}
                    id="checkbox"
                    className="csuinp__input__checkbox"
                    placeholder="The password you specified during registration"
                  />
                  <FaCheck className="csuinp__input__rgt" />
                </div>
                <label htmlFor="checkbox" className="csuinp__lbl csuinp__lbl--light">
                  I agree to{' '}
                  <a className="csuinp__lbl--link" href="#">
                    Terms of Service
                  </a>
                </label>
              </div>
              {errors.terms && <p className="csuinp__error__msg">{errors.terms.message}</p>}
            </div>
            <div className="csuinp csuinp--checkbox csuinp--checkbox-alg-top">
              <div className="csuinp__ipt__wrp">
                <input
                  type="checkbox"
                  {...register('newsletter')}
                  id="checkbox2"
                  className="csuinp__input__checkbox"
                  placeholder="The password you specified during registration"
                />
                <FaCheck className="csuinp__input__rgt" />
              </div>
              <label htmlFor="checkbox2" className="csuinp__lbl">
                Sign up to receive our monthly EZWxBrief e-newsletter, free video tips and other important
                announcements.
              </label>
            </div>
            <div className="sign__sub__btn__area signup__btn__area">
              <button type="submit" className="sign__sub__btn">
                Purchase Now
              </button>
              <span>Or</span>
              <button type="submit" className="sign__sub__btn">
                Start 14-Day Trial
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default signup;
