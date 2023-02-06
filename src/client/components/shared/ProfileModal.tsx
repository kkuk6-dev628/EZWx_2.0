import Image from 'next/image';
import React from 'react';
import { CgProfile } from 'react-icons/cg';
import { AiOutlinePoweroff } from 'react-icons/ai';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth, userLoggedOut } from '../../store/auth/authSlice';
import { api } from '../../utils';

//handleProfileModal

interface ProfileModalProps {
  handleProfileModal: () => void;
  setIsUserLoginUser: (value: boolean) => void;
}

function ProfileModal({ handleProfileModal, setIsUserLoginUser }: ProfileModalProps) {
  const router = useRouter();
  const user = useSelector(selectAuth);
  const dispatch = useDispatch();

  const changeRoute = () => {
    handleProfileModal();
    setIsUserLoginUser(false);
    router.push('/profile');
  };

  const handleSignout = () => {
    handleProfileModal();
    api({
      method: 'get',
      url: '/auth/signout',
      withCredentials: true,
    })
      .then((res) => {
        console.log(res.data);
        dispatch(userLoggedOut());
        router.push('/home');
      })
      .catch((err) => console.log(err.message));
  };

  return (
    <div className="prom">
      <div className="prom__header">
        <div className="prom__lft">
          <div className="prom__lft__img">
            <Image height={50} width={50} src="/images/sunny.png" alt="profile" />
          </div>
        </div>
        <div className="prom__rgt">
          <h3 className="prom__name">{user.displayName}</h3>
          <p className="prom__email">{user.email}</p>
        </div>
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
    </div>
  );
}

export default ProfileModal;
