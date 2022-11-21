import React from 'react';
import { GrFacebook } from 'react-icons/gr';
import { FaTwitterSquare, FaYoutubeSquare } from 'react-icons/fa';
import { BsInstagram } from 'react-icons/bs';
function Footer() {
  return (
    <div className="ftr">
      <div className="container ">
        <div className="ftr__wrp">
          <div className="ftr__lft">
            <p className="text">
              © Copyright 2022 Avwxworkshops Inc - All Rights Reserved
            </p>
          </div>
          <div className="ftr__rgt">
            <div className="ftr__rgt__items">
              <a href="#" className="ftr__rgt__item">
                License
              </a>
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
      </div>
    </div>
  );
}

export default Footer;
