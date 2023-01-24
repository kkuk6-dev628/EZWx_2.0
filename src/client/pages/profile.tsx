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
  address1: string;
  address2: string;
  city: string;
  stateProvince: string;
  zip: number;
  phone: number;
  phoneType: string;
  certifications: certifications[];
}

interface Props {
  setIsShowModal: (isShowModal: boolean) => void;
}
function profile({ setIsShowModal }: Props) {
  const [showChangePasswordMOdal, setShowChangePasswordModal] = useState(false);
  const [certificationsOptions, setCertificationsOptions] = useState([]);
  const [switchData, setSwitchData] = useState([
    {
      name: 'Send me the monthly EZNewsletter and other EZWxBrief tips.',
      id: 'a',
      checked: true,
    },
    {
      name: 'Notify me of new videos/workshops recently added',
      id: 'b',
      checked: true,
    },
    {
      name: 'Send me live webinar announcements',
      id: 'c',
      checked: true,
    },
    {
      name: 'Notify me of EZWxBrief outages and other general announcements or offers',
      id: 'd',
      checked: true,
    },
  ]);

  const [userInfo, setUserInfo] = useState<{ [key: string]: any }>({});

  const user = useSelector(selectAuth);

  // console.log('info certificaions ', userInfo.certifications);
  // console.log('token is ', user);

  useEffect(() => {
    api({
      method: 'get',
      url: `user/findOne?id=${user.id}`,
    })
      .then((res) => {
        // console.log(res.data);
        setUserInfo(res.data);
      })
      .catch((err) => console.log(err.message));
  }, []);

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
    formState: { errors },
  } = useForm<IFormInput>({
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      displayName: '',
      alternateEmail: '',
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

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    // console.log('form data is ', data);
    // data.email = userInfo.email;
    // data.firstname = userInfo.firstname;
    // data.lastname = userInfo.lastname;
    // data.displayName = userInfo.displayName;
    // data.certifications = userInfo.certifications;
    // data.
    // console.log(data);

    // console.log(userInfo);

    api({
      method: 'put',
      url: `user/update/${user.id}`,
      data: userInfo,
    })
      .then((res) => {
        console.log('updated data ', res.data);
      })
      .catch((err) => console.log(err.message));
  };

  const animatedComponents = makeAnimated();

  const validateEmail = (value: string) => {
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(value) ? true : 'Invaoptiond email';
  };
  // const [checked, setChecked] = useState(true);

  const handleChange = (item) => {
    console.log(item);
    setSwitchData(
      switchData.map((data) => {
        if (data.id === item) {
          data.checked = !data.checked;
        }
        return data;
      }),
    );
  };

  const handleInfoChange = (e, key: string) => {
    setUserInfo((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  // console.log('userInfo is ', userInfo);

  return (
    <div className="profile">
      {showChangePasswordMOdal && (
        <ChangePasswordModal setIsShowModal={setShowChangePasswordModal} />
      )}
      <div className="container">
        <div className="profile__wrp">
          <div className="profile__left">
            <div className="profile__left__top profile__left__card">
              <div className="profile__lft__top__wrp">
                <div className="profile__left__img">
                  <Image
                    height={50}
                    width={50}
                    src="/images/sunny.png"
                    alt="profile"
                  />
                </div>
                <h3 className="profile__name">{userInfo.displayName}</h3>
              </div>
              <div className="profile__left__img__upload">
                <input type="file" name="" id="" />
              </div>
              <div className="profile__left__btn__area">
                <button
                  onClick={() => {
                    setShowChangePasswordModal(true);
                  }}
                  className="profile__left__btn"
                >
                  Change Password
                </button>
              </div>
            </div>
            <div className="profile__left__btm profile__left__card">
              <h3 className="profile__left__btm__txt">
                Trial membership (Expired)
              </h3>
              <h3 className="profile__left__btm__txt">
                Expired on Nov 12, 2022
              </h3>
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
                    Email for login and verification *
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="email"
                      {...register('email')}
                      id="email"
                      className={`csuinp__input ${
                        errors.email ? 'csuinp__input--error' : ''
                      }`}
                      placeholder="Email for Verification"
                      value={userInfo.email ?? ''}
                      readOnly
                    />
                    {errors.email && (
                      <p className="csuinp__error__msg">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="email" className="csuinp__lbl">
                    Your first name *
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('firstname')}
                      id="firstname"
                      className={`csuinp__input ${
                        errors.firstname ? 'csuinp__input--error' : ''
                      }`}
                      placeholder="First Name"
                      value={userInfo.firstname ?? ''}
                      defaultValue={userInfo.firstname}
                      onChange={(e) => handleInfoChange(e, 'firstname')}
                    />
                    {errors.firstname && (
                      <p className="csuinp__error__msg">
                        {errors.firstname.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="email" className="csuinp__lbl">
                    Your last name *
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('lastname')}
                      id="lastname"
                      className={`csuinp__input ${
                        errors.lastname ? 'csuinp__input--error' : ''
                      }`}
                      placeholder="Last Name"
                      value={userInfo.lastname ?? ''}
                      onChange={(e) => handleInfoChange(e, 'lastname')}
                    />
                    {errors.lastname && (
                      <p className="csuinp__error__msg">
                        {errors.lastname.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label
                    htmlFor="displayname"
                    className="csuinp__lbl csuinp__lbl--opt"
                  >
                    Display Name
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('displayName')}
                      id="displayname"
                      className={`csuinp__input ${
                        errors.displayName ? 'csuinp__input--error' : ''
                      }`}
                      value={userInfo.displayName ?? ''}
                      onChange={(e) => handleInfoChange(e, 'displayName')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label
                    htmlFor="email"
                    className="csuinp__lbl csuinp__lbl--opt"
                  >
                    Alternate Email
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('alternateEmail')}
                      id="alternateEmail"
                      className={`csuinp__input ${
                        errors.alternateEmail ? 'csuinp__input--error' : ''
                      }`}
                      value={userInfo.alternateEmail ?? ''}
                      onChange={(e) => handleInfoChange(e, 'alternateEmail')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label
                    htmlFor="address1"
                    className="csuinp__lbl csuinp__lbl--opt"
                  >
                    Address 1
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('address1')}
                      id="address1"
                      className={`csuinp__input ${
                        errors.address1 ? 'csuinp__input--error' : ''
                      }`}
                      value={userInfo.address1 ?? ''}
                      onChange={(e) => handleInfoChange(e, 'address1')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label
                    htmlFor="address2"
                    className="csuinp__lbl csuinp__lbl--opt"
                  >
                    Address 2
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('address2')}
                      id="address2"
                      className={`csuinp__input ${
                        errors.lastname ? 'csuinp__input--error' : ''
                      }`}
                      value={userInfo.address2 ?? ''}
                      onChange={(e) => handleInfoChange(e, 'address2')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label
                    htmlFor="city"
                    className="csuinp__lbl csuinp__lbl--opt"
                  >
                    City
                  </label>
                  <div className="csuinp__wrp__two">
                    <input
                      type="text"
                      {...register('city')}
                      id="city"
                      className={`csuinp__input ${
                        errors.lastname ? 'csuinp__input--error' : ''
                      }`}
                      value={userInfo.city ?? ''}
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
                      {...register('stateProvince')}
                      id="state"
                      className={`csuinp__input csuinp__input--select ${
                        errors.stateProvince ? 'csuinp__input--error' : ''
                      }`}
                      defaultValue={null}
                      value={userInfo.stateProvince ?? ''}
                      onChange={(e) => handleInfoChange(e, 'stateProvince')}
                    >
                      <option value={null}>Select an option</option>
                      <option value="0">Aguascaoptionentes</option>
                      <option value="1">ALABAMA</option>
                      <option value="2">ALASKA</option>
                      <option value="3">Alberta</option>
                      <option value="4">ARIZONA</option>
                      <option value="5">ARKANSAS</option>
                      <option value="6">Baja Caoptionfornia</option>
                      <option value="7">Baja Caoptionfornia Sur</option>
                      <option value="8">British Columbia</option>
                      <option value="9">CAoptionFORNIA</option>
                      <option value="10">Campeche</option>
                      <option value="11">Chiapas</option>
                      <option value="12">Chihuahua</option>
                      <option value="13">Coahuila</option>
                      <option value="14">Cooptionma</option>
                      <option value="15">COLORADO</option>
                      <option value="16">CONNECTICUT</option>
                      <option value="17">DELAWARE</option>
                      <option value="18">DISTRICT OF COLUMBIA</option>
                      <option value="19">Durango</option>
                      <option value="20">FLORIDA</option>
                      <option value="21">GEORGIA</option>
                      <option value="22">Guanajuato</option>
                      <option value="23">Guerrero</option>
                      <option value="24">HAWAII</option>
                      <option value="25">Hidalgo</option>
                      <option value="26">IDAHO</option>
                      <option value="27">ILoptionNOIS</option>
                      <option value="28">INDIANA</option>
                      <option value="29">IOWA</option>
                      <option value="30">Jaoptionsco</option>
                      <option value="31">KANSAS</option>
                      <option value="32">KENTUCKY</option>
                      <option value="33">LOUISIANA</option>
                      <option value="34">MAINE</option>
                      <option value="35">Manitoba</option>
                      <option value="36">MARYLAND</option>
                      <option value="37">MASSACHUSETTS</option>
                      <option value="38">México</option>
                      <option value="39">Mexico City</option>
                      <option value="40">MICHIGAN</option>
                      <option value="41">Michoacán</option>
                      <option value="42">MINNESOTA</option>
                      <option value="43">MISSISSIPPI</option>
                      <option value="44">MISSOURI</option>
                      <option value="45">MONTANA</option>
                      <option value="46">Morelos</option>
                      <option value="47">Nayarit</option>
                      <option value="48">NEBRASKA</option>
                      <option value="49">NEVADA</option>
                      <option value="50">New Brunswick</option>
                      <option value="51">NEW HAMPSHIRE</option>
                      <option value="52">NEW JERSEY</option>
                      <option value="53">NEW MEXICO</option>
                      <option value="54">NEW YORK</option>
                      <option value="55">Newfoundland and Labrador</option>
                      <option value="56">NORTH CAROoptionNA</option>
                      <option value="57">NORTH DAKOTA</option>
                      <option value="58">Northwest Territories</option>
                      <option value="59">Nova Scotia</option>
                      <option value="60">Nuevo León</option>
                      <option value="61">Nunavut</option>
                      <option value="62">Oaxaca</option>
                      <option value="63">OHIO</option>
                      <option value="64">OKLAHOMA</option>
                      <option value="65">Ontario</option>
                      <option value="66">OREGON</option>
                      <option value="67">Other</option>
                      <option value="68">PENNSYLVANIA</option>
                      <option value="69">Prince Edward Island</option>
                      <option value="70">Puebla</option>
                      <option value="71">PUERTO RICO</option>
                      <option value="72">Quebec</option>
                      <option value="73">Querétaro</option>
                      <option value="74">Quintana Roo</option>
                      <option value="75">RHODE ISLAND</option>
                      <option value="76">San Luis Potosí</option>
                      <option value="77">Saskatchewan</option>
                      <option value="78">Sinaloa</option>
                      <option value="79">Sonora</option>
                      <option value="80">SOUTH CAROoptionNA</option>
                      <option value="81">SOUTH DAKOTA</option>
                      <option value="82">Tabasco</option>
                      <option value="83">Tamauoptionpas</option>
                      <option value="84">TENNESSEE</option>
                      <option value="85">TEXAS</option>
                      <option value="86">Tlaxcala</option>
                      <option value="87">UTAH</option>
                      <option value="88">Veracruz</option>
                      <option value="89">VERMONT</option>
                      <option value="90">VIRGIN ISLANDS</option>
                      <option value="91">VIRGINIA</option>
                      <option value="92">WASHINGTON</option>
                      <option value="93">WEST VIRGINIA</option>
                      <option value="94">WISCONSIN</option>
                      <option value="95">WYOMING</option>
                      <option value="96">Yucatán</option>
                      <option value="97">Yukon</option>
                      <option value="98">Zacatecas</option>
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
                      className={`csuinp__input ${
                        errors.lastname ? 'csuinp__input--error' : ''
                      }`}
                      value={userInfo.zip ?? ''}
                      onChange={(e) => handleInfoChange(e, 'zip')}
                    />
                  </div>
                </div>
              </div>
              <div className="csuinp">
                <div className="csuinp__ipt__wrp">
                  <label htmlFor="phoneType" className="csuinp__lbl">
                    Phone Type
                  </label>
                  <div className="">
                    <select
                      {...register('phoneType')}
                      id="phoneType"
                      className={`csuinp__input csuinp__input--select ${
                        errors.phoneType ? 'csuinp__input--error' : ''
                      }`}
                      value={userInfo.phoneType ?? ''}
                      defaultValue={null}
                      onChange={(e) => handleInfoChange(e, 'phoneType')}
                    >
                      <option value={null}>Select an option</option>
                      <option value="0">Home</option>
                      <option value="1">Work</option>
                      <option value="2">Mobile</option>
                      <option value="3">Other</option>
                    </select>
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
                      className={`csuinp__input ${
                        errors.phone ? 'csuinp__input--error' : ''
                      }`}
                      value={userInfo.phone ?? ''}
                      onChange={(e) => handleInfoChange(e, 'phone')}
                    />
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
                      {...register('certifications')}
                      render={({ field }) => (
                        <Select
                          id="long-value-select"
                          instanceId="long-value-select"
                          value={userInfo.certifications ?? []}
                          onChange={(e) =>
                            setUserInfo((prev) => {
                              const info = { ...prev };
                              info.certifications = e;
                              return info;
                            })
                          }
                          placeholder="Select your certificationss"
                          isMulti
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              borderColor: errors.certifications
                                ? '#dc3545'
                                : state.isFocused
                                ? '#886ab5'
                                : '#E5E5E5',
                            }),
                          }}
                          closeMenuOnSelect={false}
                          getOptionLabel={(option: { description: string }) =>
                            option?.description
                          }
                          getOptionValue={(option: { name: string }) =>
                            option?.name
                          }
                          className=" csuinp__input--select"
                          options={
                            certificationsOptions.length > 0 &&
                            certificationsOptions
                          }
                          components={animatedComponents}
                        />
                      )}
                    />
                    {errors.certifications && (
                      <p className="csuinp__error__msg">
                        {errors.certifications.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="form__swt__area">
                {switchData.map((item, index) => (
                  <div key={item.id} className="table__data profile__swtc">
                    <Switch
                      checked={item.checked}
                      onChange={() => handleChange(item.id)}
                      onColor="#791DC6"
                      onHandleColor="#3F0C69"
                      offColor="#fff"
                      handleDiameter={16}
                      uncheckedIcon={false}
                      checkedIcon={false}
                      width={32}
                      height={18}
                      className="react-switch"
                      id="material-switch"
                    />
                    <label
                      onClick={() => handleChange(item.id)}
                      className="modal__label text"
                      htmlFor={item.id}
                    >
                      {item.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="profile__submit__area">
                <button className="profile__sub__btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default profile;
