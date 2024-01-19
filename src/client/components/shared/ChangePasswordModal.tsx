import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { validateConfirmPassword, validatePassword } from '../../utils/utils';
import { SvgRoundClose } from '../utils/SvgIcons';
import { useGetUserQuery, useResetMutation } from '../../store/auth/authApi';
import toast from 'react-hot-toast';
import { PaperComponent } from '../common/PaperComponent';
import { Dialog, DialogTitle } from '@mui/material';

interface IFormInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
interface IProps {
  setIsShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function ChangePasswordModal({ setIsShowModal }: IProps) {
  const { data: user } = useGetUserQuery(null, { refetchOnMountOrArgChange: true });
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPassword, resetResult] = useResetMutation();
  const [invalidCurrentPassword, setInvalidCurrentPassword] = useState(false);
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
    resetPassword({ email: user.email, password: password, newPassword: newPassword }).then((result: any) => {
      if (result.error) {
        setInvalidCurrentPassword(true);
      } else if (result.data) {
        if (result.data !== 1) {
          toast.error('Something went wrong. Please try again later!');
          setIsShowModal(false);
        } else {
          toast.success('Password has been changed!');
          setIsShowModal(false);
        }
      }
    });
  };

  return (
    <Dialog
      PaperComponent={PaperComponent}
      hideBackdrop
      disableEnforceFocus
      style={{ position: 'absolute' }}
      open={true}
      onClose={() => setIsShowModal(false)}
    >
      <div className="dialog__modal">
        <div className="dialog__box" style={{ width: 320 }}>
          <DialogTitle className="dialog__box__heading__container" style={{ cursor: 'move' }}>
            <span id="draggable-dialog-title">Change Password</span>
            <button onClick={() => setIsShowModal(false)} className="dlg-close">
              <SvgRoundClose />
            </button>
          </DialogTitle>
          <div className="dialog__box__body">
            <form onSubmit={handleSubmit(onSubmit)} className="pmodal__form">
              <div className="csuinp">
                <label htmlFor="password" className="csuinp__lbl">
                  Current Password *
                </label>
                <div className="csuinp__wrp__two">
                  <input
                    type="password"
                    {...register('currentPassword', {
                      validate: validatePassword,
                    })}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setInvalidCurrentPassword(false);
                    }}
                    className={`csuinp__input ${errors.currentPassword ? 'csuinp__input--error' : ''}`}
                    placeholder="Password (minimum 6 characters)"
                  />
                  {errors.currentPassword && <p className="csuinp__error__msg">{errors.currentPassword.message}</p>}
                  {invalidCurrentPassword && (
                    <p className="csuinp__error__msg">Password entered does not match the password for this account</p>
                  )}
                </div>
              </div>
              <div className="csuinp">
                <label htmlFor="password" className="csuinp__lbl">
                  New Password *
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
              <div className="csuinp">
                <label htmlFor="password" className="csuinp__lbl">
                  Confirm Password *
                </label>
                <div className="">
                  <input
                    {...register('confirmPassword', {
                      required: 'Confirm password is required',
                      validate: (value) => validateConfirmPassword(value, newPassword),
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
              <div className="pmodal__btn__area">
                <button onClick={() => setIsShowModal(false)} className="pmodal__btn-gray">
                  Close
                </button>
                <button className="pmodal__btn-blue">Change Password</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default ChangePasswordModal;
