import React from 'react';
import { GrFacebook } from 'react-icons/gr';
import { FaYoutubeSquare } from 'react-icons/fa';
import { BsInstagram } from 'react-icons/bs';
function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="ftr">
      <div className="container ">
        <div className="ftr__wrp">
          <div className="ftr__lft">
            <p className="text">© Copyright {year} Avwxworkshops Inc - All Rights Reserved</p>
          </div>
          <div className="ftr__rgt">
            <div className="ftr__rgt__items">
              <a href="/account/eula" className="ftr__rgt__item">
                License
              </a>
              <a target="_blank" href="https://facebook.com/ezwxbrief" className="ftr__rgt__item ftr__fb">
                <GrFacebook />
              </a>
              <a target="_blank" href="https://instagram.com/ezwxbrief" className="ftr__rgt__item ftr__tw">
                <BsInstagram />
              </a>
              <a target="_blank" href="https://youtube.com/@ezwxbrief" className="ftr__rgt__item ftr__ytb">
                <FaYoutubeSquare />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
