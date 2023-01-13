import Image from 'next/image';
import React from 'react';
import { CgProfile } from 'react-icons/cg';
import { AiOutlinePoweroff } from 'react-icons/ai';
import { useRouter } from 'next/router';
function ProfileModal() {
  const router = useRouter();

  const changeRoute = () => {
    router.push('/profile');
  };
  return (
    <div className="prom">
      <div className="prom__header">
        <div className="prom__lft">
          <div className="prom__lft__img">
            <Image
              height={50}
              width={50}
              src="/images/sunny.png"
              alt="profile"
            />
          </div>
        </div>
        <div className="prom__rgt">
          <h3 className="prom__name">HADID BILLA</h3>
          <p className="prom__email">hadidbilla449@gmail.com</p>
        </div>
      </div>
      <div className="prom__btm">
        <div onClick={changeRoute} className="prom__btm__itm">
          <CgProfile className="prom__icon" />
          <span>Profile</span>
        </div>
        <div className="prom__btm__itm">
          <AiOutlinePoweroff className="prom__icon" />
          <span>Sign Out</span>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
