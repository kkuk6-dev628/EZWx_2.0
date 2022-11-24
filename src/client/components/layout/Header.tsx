import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  SvgDropDown,
  SvgMenuBurger,
  SvgProfile,
  SvgRoundClose,
  SvgSave,
  SvgSetting,
  SvgWarn,
} from '../utils/SvgIcons';

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

const responsiveLink = [
  {
    id: 1,
    name: 'Dashboard',
    link: '/dashboard',
  },
  {
    id: 2,
    name: 'Plan a route',
    link: '/plan-route',
  },
  {
    id: 3,
    name: 'Airport weather',
    link: '/airport-weather',
  },
  {
    id: 4,
    name: 'Imagery',
    link: '/imagery',
  },
  {
    id: 5,
    name: 'Workshops',
    link: '/workshops',
  },
  {
    id: 6,
    name: 'Pilots guide',
    link: '/pilots-guide',
  },
  {
    id: 7,
    name: 'Sign out',
    link: '/sign-out',
  },
];

export default function Header() {
  const { pathname } = useRouter();
  console.log(pathname);
  const [activeMenu, setActiveMenu] = useState('');
  const [mapMenu, setMapMenu] = useState(false);
  const [activeResponsiveMenu, setActiveResponsiveMenu] = useState(false);
  useEffect(() => {
    if (pathname === '/try-ezwxbrief') {
      setMapMenu(true);
    } else {
      setMapMenu(false);
    }
  }, [pathname]);
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
            <Link href="/home">
              <div className="header__img__area">
                <Image
                  src="/images/Logo.png"
                  layout={'fill'}
                  alt="logo"
                  className="header__img"
                />
              </div>
            </Link>
            <button
              onClick={() => setActiveResponsiveMenu(!activeResponsiveMenu)}
              className="header__menu btn"
            >
              {activeResponsiveMenu ? <SvgRoundClose /> : <SvgMenuBurger />}
            </button>
            {mapMenu && <button className="header__tab__text">1040Z</button>}
          </div>
          <div className="header__mid">
            <ul className="header__nav">
              {mapMenu
                ? responsiveLink.map((link) => (
                    <li key={link.id} className="header__nav__item">
                      <Link className="header__nav__anc" href={link.link}>
                        <span className="header__nav__link">{link.name}</span>
                      </Link>
                    </li>
                  ))
                : links.map((link) => (
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
                {mapMenu ? (
                  <button className="header__rgt__btn header__rgt__btn--map btn">
                    BACK TO SITE
                  </button>
                ) : (
                  <button className="header__rgt__btn header__rgt__btn--lft btn">
                    New to EZWxBrief?
                  </button>
                )}
              </Link>
              {mapMenu ? (
                <div className="header__icon__area">
                  <button className="header__rgt__btn header__rgt__btn--icon btn">
                    <SvgWarn />
                  </button>
                  <button className="header__rgt__btn header__rgt__btn--icon btn">
                    <SvgSave />
                  </button>
                  <button className="header__rgt__btn header__rgt__btn--icon btn">
                    <SvgSetting />
                  </button>
                  <button className="header__rgt__btn header__rgt__btn--icon btn">
                    <SvgProfile />
                  </button>
                </div>
              ) : (
                <Link href="/signup">
                  <button className="header__rgt__btn header__rgt__btn--rgt btn">
                    Join Now | Sign in
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <ResponsiveMenu
        activeResponsiveMenu={activeResponsiveMenu}
        activeMenu={activeMenu}
        handleActiveMenu={handleActiveMenu}
        mapMenu={mapMenu}
      />
    </div>
  );
}

const ResponsiveMenu = ({
  activeResponsiveMenu,
  activeMenu,
  handleActiveMenu,
  mapMenu,
}) => {
  return (
    <div
      className={`responsive__menu ${
        activeResponsiveMenu ? 'responsive__menu__show' : ''
      }`}
    >
      {mapMenu
        ? responsiveLink.map((link) => (
            <div key={link.id}>
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
              </div>
            </div>
          ))
        : links.map((link) => (
            <div key={link.id}>
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
                    <Link href={child.link} key={child.id}>
                      <span className="responsive__menu__dropdown__link">
                        {child.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
    </div>
  );
};
