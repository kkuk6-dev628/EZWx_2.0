import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { SvgDropDown, SvgMenuBurger, SvgRoundClose } from '../utils/SvgIcons';

const links = [
  {
    id: 1,
    name: 'Home',
    link: '/home',
  },
  {
    id: 2,
    name: 'Samples',
    link: '/samples',
    children: [
      {
        id: 3,
        name: 'Imagery',
        link: '/samples/imagery',
      },
      {
        id: 4,
        name: 'Workshops',
        link: '/samples/workshops',
      },
    ],
  },
  {
    id: 5,
    name: 'Try EZWxBrief',
    link: '/try-ezwxbrief',
  },
  {
    id: 6,
    name: 'Pricing',
    link: '/pricing',
  },
  {
    id: 7,
    name: 'Training',
    link: '/training',
  },
  {
    id: 8,
    name: 'Blog',
    link: '/blog',
  },
  {
    id: 9,
    name: 'About',
    link: '/about',
  },
];

export default function Header() {
  const [activeMenu, setActiveMenu] = useState('');
  const [activeResponsiveMenu, setActiveResponsiveMenu] = useState(false);
  const handleActiveMenu = (id) => {
    setActiveMenu(id);
  };
  // sticky header
  const [sticky, setSticky] = useState(false);
  const handleScroll = () => {
    if (window.scrollY > 0) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <div className={`header ${sticky && 'header--fixed'}`}>
      <div className="container">
        <div className="header__wrp">
          <div className="header__lft">
            <div className="header__img__area">
              <Link href="/home">
                <Image
                  src="/images/Logo.png"
                  layout="fill"
                  alt="logo"
                  objectFit="contain"
                  className="header__img"
                />
              </Link>
            </div>
            <button
              onClick={() => setActiveResponsiveMenu(!activeResponsiveMenu)}
              className="header__menu btn"
            >
              {activeResponsiveMenu ? <SvgRoundClose /> : <SvgMenuBurger />}
            </button>
          </div>
          <div className="header__mid">
            <ul className="header__nav">
              {links.map((link) => (
                <li key={link.id} className="header__nav__item">
                  <Link className="header__nav__anc" href={link.link}>
                    <span className="header__nav__link">{link.name}</span>
                    <div className="header__nav__icon">
                      {link.children && <SvgDropDown />}
                    </div>
                  </Link>
                  {link.children && (
                    <div className="header__nav__dropdown">
                      <ul className="header__nav__dropdown__list flex flex-column">
                        {link.children.map((child) => (
                          <li
                            key={child.id}
                            className="header__nav__dropdown__item"
                          >
                            <Link
                              className="header__nav__dropdown__anc"
                              href={child.link}
                            >
                              <span className="header__nav__dropdown__link">
                                {child.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="header__rgt">
            <div className="header__rgt__btns flex flex-align-center">
              <Link href="/login">
                <button className="header__rgt__btn header__rgt__btn--lft btn">
                  New to EZWxBrief?
                </button>
              </Link>
              <Link href="/signup">
                <button className="header__rgt__btn header__rgt__btn--rgt btn">
                  Join Now | Sign in
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ResponsiveMenu
        activeResponsiveMenu={activeResponsiveMenu}
        activeMenu={activeMenu}
        handleActiveMenu={handleActiveMenu}
      />
    </div>
  );
}

const ResponsiveMenu = ({
  activeResponsiveMenu,
  activeMenu,
  handleActiveMenu,
}) => {
  return (
    <div
      className={`responsive__menu ${
        activeResponsiveMenu ? 'responsive__menu__show' : ''
      }`}
    >
      {links.map((link) => (
        <>
          <div
            onClick={() => handleActiveMenu(link.id)}
            key={link.id}
            className={`responsive__menu__item ${
              activeMenu && activeMenu === link.id
                ? 'responsive__menu__active'
                : ''
            }`}
          >
            <Link href={link.link}>
              <span className="responsive__menu__link">{link.name}</span>
            </Link>
            {link.children && (
              <div className="responsive__menu__dropdown">
                <SvgDropDown />
              </div>
            )}
          </div>
          {link.children && (
            <div
              className={`responsive__menu__dropdown__list ${
                activeMenu == link.id &&
                'responsive__menu__dropdown__list-visible'
              }`}
            >
              {link.children.map((child) => (
                <Link href={child.link}>
                  <span className="responsive__menu__dropdown__link">
                    {child.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      ))}
    </div>
  );
};
