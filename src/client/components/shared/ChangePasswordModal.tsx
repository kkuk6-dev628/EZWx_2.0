import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

interface IFormInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
interface IProps {
  setIsShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function ChangePasswordModal({ setIsShowModal }: IProps) {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log(data);
  };
  const validatePassword = (value: string) => {
    console.log(value);
    if (!value && value === '') {
      return 'Password is required';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(value)
      ? true
      : 'Password must be at least 6 characters and contain at least one upper case (A-Z), one lower case (a-z), one number (0-9) and one special character (e.g. !@#$%^&*-,.)';
  };

  const validateConfirmPassword = (value: string) => {
    console.log(value, 'hb ', password);
    if (value !== password) {
      return 'The password and confirm password do not match.';
    }
    return true;
  };
  return (
    <div className="pmodal">
      <div className="pmodal__wrp">
        <div className="pmodal__header">
          <h3 className="pmodal__title">Change Password</h3>
          <button onClick={() => setIsShowModal(false)} className="pmodal__close__btn">
            <AiOutlineClose className="pmodal__close__icon" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="pmodal__form">
          <div className="csuinp">
            <div className="csuinp__ipt__wrp">
              <label htmlFor="password" className="csuinp__lbl">
                Please pick a password *
              </label>
              <div className="csuinp__wrp__two">
                <input
                  type="password"
                  {...register('currentPassword', {
                    validate: validatePassword,
                  })}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`csuinp__input ${errors.currentPassword ? 'csuinp__input--error' : ''}`}
                  placeholder="Password (minimum 6 characters)"
                />
                {errors.currentPassword && <p className="csuinp__error__msg">{errors.currentPassword.message}</p>}
              </div>
            </div>
          </div>
          <div className="csuinp">
            <div className="csuinp__ipt__wrp">
              <label htmlFor="password" className="csuinp__lbl">
                Please pick a password *
              </label>
              <div className="csuinp__wrp__two">
                <input
                  type="password"
                  {...register('newPassword', {
                    validate: validatePassword,
                  })}
                  id="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`csuinp__input ${errors.newPassword ? 'csuinp__input--error' : ''}`}
                  placeholder="Password (minimum 6 characters)"
                />
                {errors.newPassword && <p className="csuinp__error__msg">{errors.newPassword.message}</p>}
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
                    validate: validateConfirmPassword,
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
          <div className="pmodal__btn__area">
            <button onClick={() => setIsShowModal(false)} className="pmodal__btn-gray">
              Close
            </button>
            <button className="pmodal__btn-blue">Change Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
