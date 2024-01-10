import Image from 'next/image';
import React from 'react';
import { CgProfile } from 'react-icons/cg';
import { AiOutlinePoweroff } from 'react-icons/ai';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth, userLoggedOut } from '../../store/auth/authSlice';
import { api } from '../../utils';
import { useSigninMutation, useSignoutMutation } from '../../store/auth/authApi';
import { Drawer } from '@mui/material';
import { RxCross2 } from 'react-icons/rx';
import { useCookies } from 'react-cookie';

//handleProfileModal

interface ProfileModalProps {
  handleProfileModal: () => void;
  isShowProfileModal: boolean;
  setIsUserLoginUser: (value: boolean) => void;
}

function ProfileModal({ handleProfileModal, isShowProfileModal, setIsUserLoginUser }: ProfileModalProps) {
  const router = useRouter();
  const user = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [signoutApi] = useSignoutMutation();
  const [cookies, setCookie, removeCookie] = useCookies(['logged_in']);

  const changeRoute = () => {
    handleProfileModal();
    setIsUserLoginUser(false);
    router.push('/home');
  };

  const handleSignout = () => {
    handleProfileModal();
    router.push('/home');
    removeCookie('logged_in');
    signoutApi(null);
  };

  return (
    <Drawer anchor={'right'} open={isShowProfileModal} onClose={handleProfileModal} className="profile-drawer">
      <div className="prom__header" id="draggable-dialog-title">
        <div className="prom__lft">
          <div className="prom__lft__img">
            <Image height={50} width={50} src="/images/sunny.png" alt="profile" loading="eager" />
          </div>
        </div>
        <div className="prom__rgt">
          <h3 className="prom__name">{user.displayName}</h3>
          <p className="prom__email">{user.email}</p>
        </div>
        <RxCross2 onClick={handleProfileModal} className="close__icon" />
      </div>
      <div className="prom__btm">
        <div onClick={changeRoute} className="prom__btm__itm">
          <CgProfile className="prom__icon" />
          <span>Profile</span>
        </div>
        <div onClick={handleSignout} className="prom__btm__itm">
          <AiOutlinePoweroff className="prom__icon" />
          <span>Sign Out</span>
        </div>
      </div>
    </Drawer>
  );
}

export default ProfileModal;
