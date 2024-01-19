import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import makeAnimated from 'react-select/animated';
import Select, { OnChangeValue } from 'react-select';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { api } from '../utils';
import Switch from 'react-switch';
import ChangePasswordModal from '../components/shared/ChangePasswordModal';
import { useSelector } from 'react-redux';
import { selectAuth } from '../store/auth/authSlice';
import { PrimaryButton, SecondaryButton } from '../components/common';
import AvatarEdit from '../components/shared/AvatarEdit';
import { Avatar } from '@mui/material';
import { countryStates } from '../utils/constants';
import { useGetUserQuery, useUpdateUserInfoMutation } from '../store/auth/authApi';
import toast from 'react-hot-toast';
import { validateEmail } from '../utils/utils';

interface certifications {
  name: string;
  description: string;
}

interface IFormInput {
  firstname: string;
  lastname: string;
  email: string;
  displayName: string;
  alternateEmail: string;
  country: string;
  address1: string;
  address2: string;
  city: string;
  stateProvince: string;
  zip: number;
  phone: number;
  phoneType: string;
  certifications: certifications[];
}

function profile() {
  const [showChangePasswordMOdal, setShowChangePasswordModal] = useState(false);
  const [certificationsOptions, setCertificationsOptions] = useState([]);
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const { data: userData } = useGetUserQuery(null, { refetchOnMountOrArgChange: true });
  const [updateUserInfo] = useUpdateUserInfoMutation();

  const [userInfo, setUserInfo] = useState<{ [key: string]: any }>({});

  const user = useSelector(selectAuth);

  // console.log('info certificaions ', userInfo.certifications);
  // console.log('token is ', user);

  useEffect(() => {
    if (userData) {
      const data: any = { ...userData };
      if (!(userData as any).stateProvice) {
        data.stateProvince = -1;
      }
      setUserInfo(data);
      reset((formValues) => ({ ...formValues, ...data }));
    }
  }, [userData]);

  useEffect(() => {
    api({
      method: 'get',
      url: 'certification/findAll',
    })
      .then((res) => {
        // console.log('certification data ', res.data);
        setCertificationsOptions(res.data);
      })
      .catch((err) => console.log(err.message));
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormInput>({
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      displayName: '',
      alternateEmail: '',
      country: '',
      address1: '',
      address2: '',
      city: '',
      stateProvince: '',
      zip: null,
      phone: null,
      phoneType: '',
      certifications: [],
    },
  });

  function onSubmit(data: any) {
    updateUserInfo({ ...userInfo, id: user.id }).then((res: any) => {
      if (res.data) {
        toast.success('Profile saved!');
      } else {
        console.log(res);
        toast.error('Something went wrong!');
      }
    });
  }

  const animatedComponents = makeAnimated();

  function updatedAvatar() {
    setShowAvatarEdit(false);
  }

  const handleInfoChange = (e, key: string) => {
    setUserInfo((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  // console.log('userInfo is ', userInfo);

  return (
    <div className="profile">
      {showChangePasswordMOdal && <ChangePasswordModal setIsShowModal={setShowChangePasswordModal} />}
      {showAvatarEdit && (
        <AvatarEdit
          open={showAvatarEdit}
          onUpdate={updatedAvatar}
          onClose={() => setShowAvatarEdit(false)}
        ></AvatarEdit>
      )}
      <div className="container">
        <div className="profile__wrp">
          <div className="profile__left">
            <div className="profile__left__top profile__left__card">
              <div className="profile__lft__top__wrp">
                <div className="profile__left__img">
                  {userInfo.avatar ? (
                    <Avatar src={`/user/${userInfo.avatar}`} alt="profile" sx={{ width: 128, height: 128 }} />
                  ) : (
                    <Image height={128} width={128} src="/images/sunny.png" alt="profile" loading="eager" />
                  )}
                </div>
                <h3 className="profile__name">{userInfo.displayName}</h3>
              </div>
              <div className="profile__left__img__upload">
                <SecondaryButton text="Change Avatar" isLoading={false} onClick={() => setShowAvatarEdit(true)} />
              </div>
              <div className="profile__left__btn__area">
                <button onClick={() => setShowChangePasswordModal(true)} className="profile__left__btn">
                  Change Password
                </button>
              </div>
            </div>
            <div className="profile__left__btm profile__left__card">
              <h3 className="profile__left__btm__txt">Trial membership (Expired)</h3>
              <h3 className="profile__left__btm__txt">Expired on</h3>
              <h3 className="profile__left__btm__txt">Nov 12, 2022</h3>
              <div className="profile__left__btn__area">
                <button className="profile__left__btn">Join</button>
              </div>
            </div>
          </div>
          <div className="profile__rgt">
            <div className="profile__rgt__header"></div>
            <form onSubmit={handleSubmit(onSubmit)} className="profile__form">
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="email" className="csuinp__lbl">
                    Email *
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('email', {
                        required: 'Please enter a valid email address.',
                        validate: validateEmail,
                      })}
                      id="email"
                      className={`csuinp__input ${errors.email ? 'csuinp__input--error' : ''}`}
                      placeholder="Email for Verification"
                      defaultValue={userInfo.email ?? ''}
                      onChange={(e) => handleInfoChange(e, 'email')}
                    />
                    {errors.email && <p className="csuinp__error__msg">{errors.email.message}</p>}
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="email" className="csuinp__lbl">
                    First Name *
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('firstname', { required: 'Please enter a first name' })}
                      id="firstname"
                      className={`csuinp__input ${errors.firstname ? 'csuinp__input--error' : ''}`}
                      placeholder="First Name"
                      defaultValue={userInfo.firstname ?? ''}
                      onChange={(e) => handleInfoChange(e, 'firstname')}
                    />
                    {errors.firstname && <p className="csuinp__error__msg">{errors.firstname.message}</p>}
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="email" className="csuinp__lbl">
                    Last Name *
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('lastname', { required: 'Please enter a last name' })}
                      id="lastname"
                      className={`csuinp__input ${errors.lastname ? 'csuinp__input--error' : ''}`}
                      placeholder="Last Name"
                      defaultValue={userInfo.lastname ?? ''}
                      onChange={(e) => handleInfoChange(e, 'lastname')}
                    />
                    {errors.lastname && <p className="csuinp__error__msg">{errors.lastname.message}</p>}
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="displayname" className="csuinp__lbl csuinp__lbl--opt">
                    Display Name
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('displayName')}
                      id="displayname"
                      className={`csuinp__input ${errors.displayName ? 'csuinp__input--error' : ''}`}
                      defaultValue={userInfo.displayName ?? ''}
                      onChange={(e) => handleInfoChange(e, 'displayName')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="email" className="csuinp__lbl csuinp__lbl--opt">
                    Alternate Email
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('alternateEmail')}
                      id="alternateEmail"
                      className={`csuinp__input ${errors.alternateEmail ? 'csuinp__input--error' : ''}`}
                      defaultValue={userInfo.alternateEmail ?? ''}
                      onChange={(e) => handleInfoChange(e, 'alternateEmail')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="state" className="csuinp__lbl">
                    Country *
                  </label>
                  <div className="">
                    <select
                      {...register('country', { required: 'Please select a valid country!' })}
                      id="country"
                      className={`csuinp__input csuinp__input--select ${errors.country ? 'csuinp__input--error' : ''}`}
                      defaultValue={userInfo.country ?? 1}
                      onChange={(e) => {
                        handleInfoChange(e, 'country');
                        setTimeout(() => reset({ stateProvince: '-1' }), 30);
                      }}
                    >
                      <option value={2}>CANADA</option>
                      <option value={3}>MEXICO</option>
                      <option value={1}>UNITED STATES</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="address1" className="csuinp__lbl csuinp__lbl--opt">
                    Address 1
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('address1')}
                      id="address1"
                      className={`csuinp__input ${errors.address1 ? 'csuinp__input--error' : ''}`}
                      defaultValue={userInfo.address1 ?? ''}
                      onChange={(e) => handleInfoChange(e, 'address1')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="address2" className="csuinp__lbl csuinp__lbl--opt">
                    Address 2
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('address2')}
                      id="address2"
                      className={`csuinp__input ${errors.lastname ? 'csuinp__input--error' : ''}`}
                      defaultValue={userInfo.address2 ?? ''}
                      onChange={(e) => handleInfoChange(e, 'address2')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="city" className="csuinp__lbl csuinp__lbl--opt">
                    City
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('city')}
                      id="city"
                      className={`csuinp__input ${errors.lastname ? 'csuinp__input--error' : ''}`}
                      defaultValue={userInfo.city ?? ''}
                      onChange={(e) => handleInfoChange(e, 'city')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="state" className="csuinp__lbl">
                    State/Province
                  </label>
                  <div className="">
                    <select
                      key={userInfo.country + '-state'}
                      {...register('stateProvince')}
                      id="state"
                      className={`csuinp__input csuinp__input--select ${
                        errors.stateProvince ? 'csuinp__input--error' : ''
                      }`}
                      onChange={(e) => handleInfoChange(e, 'stateProvince')}
                      placeholder="Select a State/Province"
                    >
                      <option selected value={-1} key="state-placeholder">
                        Select a State/Province
                      </option>
                      {countryStates
                        .filter((c) => c.CountryId === userInfo.country)
                        .sort((a, b) => a.Name.localeCompare(b.Name))
                        .map((state) => (
                          <option value={state.Abbreviation} key={`${state.Name}-${state.Abbreviation}`}>
                            {state.Name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="zip" className="csuinp__lbl csuinp__lbl--opt">
                    Zip
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('zip')}
                      id="zip"
                      className={`csuinp__input ${errors.lastname ? 'csuinp__input--error' : ''}`}
                      defaultValue={userInfo.zip ?? ''}
                      onChange={(e) => handleInfoChange(e, 'zip')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="zip" className="csuinp__lbl csuinp__lbl--opt">
                    Phone
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="phone"
                      {...register('phone')}
                      id="phone"
                      className={`csuinp__input ${errors.phone ? 'csuinp__input--error' : ''}`}
                      defaultValue={userInfo.phone ?? ''}
                      onChange={(e) => handleInfoChange(e, 'phone')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="password" className="csuinp__lbl">
                    Pilot certifications (select all that apply)
                  </label>
                  <div className="">
                    <Controller
                      name="certifications"
                      control={control}
                      render={({ field }) => (
                        <Select
                          id="long-value-select"
                          instanceId="long-value-select"
                          {...field}
                          onChange={(e) => {
                            setUserInfo((prev) => {
                              const info = { ...prev };
                              info.certifications = e;
                              return info;
                            });
                            field.onChange(e);
                          }}
                          placeholder="Select your certification(s)"
                          isMulti
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              borderColor: errors.certifications ? '#dc3545' : state.isFocused ? '#886ab5' : '#E5E5E5',
                            }),
                          }}
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
              <div className="form__swt__area">
                <div className="table__data profile__swtc">
                  <Switch
                    checked={userInfo.receive_news ?? true}
                    onChange={(e) => handleInfoChange({ target: { value: e } }, 'receive_news')}
                    onColor="#791DC6"
                    onHandleColor="#3F0C69"
                    offColor="#eed8ff"
                    handleDiameter={16}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    width={32}
                    height={18}
                    className="profile-switch"
                    id="material-switch"
                  />
                  <label className="modal__label text" htmlFor="material-switch" style={{ cursor: 'pointer' }}>
                    Send me EZNewsletters, EZTips & other general announcements & offers.
                  </label>
                </div>
              </div>
              <div className="profile__submit__area">
                <SecondaryButton
                  text={'Abandon'}
                  type="reset"
                  isLoading={false}
                  onClick={() => {
                    setUserInfo(userData);
                    setTimeout(() => reset(userData), 10);
                  }}
                ></SecondaryButton>
                <PrimaryButton text="Save" isLoading={false}></PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default profile;
