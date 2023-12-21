import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ProfileModal from '../shared/ProfileModal';
import SettingsDrawer from '../shared/SettingsDrawer';
import { SvgDropDown, SvgMenuBurger, SvgProfile, SvgRoundClose, SvgSave, SvgSetting, SvgWarn } from '../utils/SvgIcons';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/auth/authSlice';
import ZuluClock from '../shared/ZuluClock';
import { useCookies } from 'react-cookie';
import { useGetUserQuery } from '../../store/auth/authApi';
import { Dialog } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setShowInformation } from '../../store/imagery/imagery';
import AirportSelectModal from '../airportwx/AirportSelectModal';
import { PaperComponent } from '../common/PaperComponent';
import { setViewHeight, setViewWidth } from '../../store/airportwx/airportwx';
import {
  selectShowSavedView,
  selectShowSettingsView,
  setShowSavedView,
  setShowSettingsView,
} from '../../store/header/header';
import { FaBullseye } from 'react-icons/fa';
const FavoritesDrawer = dynamic(() => import('../shared/FavoritesDrawer'), { ssr: false });

const menusHome = [
  {
    id: 1,
    name: 'Home',
    link: '/home',
  },
  {
    id: 2,
    name: 'Dashboard',
    link: '/dashboard',
  },
  {
    id: 3,
    name: 'Map',
    link: '/map',
  },
  {
    id: 4,
    name: 'Airport Wx',
    link: '/airportwx',
  },
  {
    id: 5,
    name: 'Imagery',
    link: '/imagery',
  },
  {
    id: 6,
    name: 'Pilots guide',
    link: '/pilots-guide',
  },
  {
    id: 7,
    name: 'About us',
    link: '#',
    children: [
      {
        id: 9,
        name: 'Contact Us',
        link: '/contact',
      },
      {
        id: 10,
        name: 'Support',
        link: '/support',
      },
      {
        id: 11,
        name: 'Team EZWxBrief',
        link: '/team',
      },
    ],
  },
  {
    id: 8,
    name: 'FAQ',
    link: '/faq',
  },
];
const menusHomeNotAuth = [
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
        link: '/imagery',
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
    name: 'About us',
    link: '#',
    children: [
      {
        id: 9,
        name: 'Contact Us',
        link: '/contact',
      },
      {
        id: 10,
        name: 'Support',
        link: '/support',
      },
      {
        id: 11,
        name: 'Team EZWxBrief',
        link: '/team',
      },
    ],
  },
];

const menusMap = [
  {
    id: 1,
    name: 'Dashboard',
    link: '/dashboard',
  },
  {
    id: 2,
    name: 'Map',
    link: '/map',
  },
  {
    id: 3,
    name: 'Airport Wx',
    link: '/airportwx',
  },
  {
    id: 4,
    name: 'Imagery',
    link: '/imagery',
  },
  {
    id: 5,
    name: 'Pilots Guide',
    link: '/pilots-guide',
  },
];

const menusMapNotAuth = [
  {
    id: 1,
    name: 'Dashboard',
    link: '/dashboard',
  },
  {
    id: 2,
    name: 'Imagery',
    link: '/imagery',
  },
  {
    id: 3,
    name: 'Pilots Guide',
    link: '/pilots-guide',
  },
];

export default function Header() {
  const { pathname } = useRouter();
  const [activeMenu, setActiveMenu] = useState('');
  const [mapMenu, setMapMenu] = useState(false);
  const [isShowProfileModal, setIsShowProfileModal] = useState(false);
  const [activeResponsiveMenu, setActiveResponsiveMenu] = useState(false);
  const [isUserLoginUser, setIsUserLoginUser] = useState(false);
  const [showAirportSelect, setShowAirportSelect] = useState(false);
  const showSettingsView = useSelector(selectShowSettingsView);
  const showSavedView = useSelector(selectShowSavedView);
  const auth = useSelector(selectAuth);
  const [cookies] = useCookies(['logged_in']);
  useGetUserQuery(null, { refetchOnMountOrArgChange: true });
  const dispatch = useDispatch();

  useEffect(() => {
    if (pathname === '/map' || pathname === '/imagery' || pathname === '/route-profile' || pathname === '/airportwx') {
      setMapMenu(true);
    } else {
      setMapMenu(false);
    }
    if (auth.id || cookies.logged_in) {
      setIsUserLoginUser(true);
    } else {
      setIsUserLoginUser(false);
    }
  }, [pathname]);

  const handleActiveMenu = (id, hideResponsiveMenu) => {
    setActiveMenu(id);
    setActiveResponsiveMenu(hideResponsiveMenu);
  };

  const homeMenu = isUserLoginUser ? menusHome : menusHomeNotAuth;
  const workMenu = isUserLoginUser ? menusMap : menusMapNotAuth;
  // sticky header
  const [sticky, setSticky] = useState(false);
  const handleScroll = () => {
    if (mapMenu && window.scrollY > 0) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      handleWindowSizeChange();
      window.addEventListener('resize', handleWindowSizeChange);
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('resize', handleWindowSizeChange);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const handleWindowSizeChange = () => {
    dispatch(setViewWidth(document.documentElement.clientWidth));
    dispatch(setViewHeight(document.documentElement.clientHeight));
  };

  const closeAllModals = () => {
    setIsShowProfileModal(false);
    dispatch(setShowSettingsView(false));
    dispatch(setShowSavedView(false));
  };

  const handleProfileModal = () => {
    if (isShowProfileModal) closeAllModals();
    setIsShowProfileModal(!isShowProfileModal);
  };

  function handleClickMenu(e, link) {
    switch (link) {
      case '/airportwx':
        e.preventDefault();
        setShowAirportSelect(true);
        break;
    }
  }
  return (
    <div className={`header ${sticky && 'header--fixed'}`}>
      <div className="container">
        <Toaster />
        <div className="header__wrp">
          {!mapMenu ? (
            <div className="header__lft">
              <Link href="/home">
                <div className="header__img__area">
                  <Image src="/images/Logo.png" loading="eager" fill alt="logo" className="header__img" />
                </div>
              </Link>
              <button onClick={() => setActiveResponsiveMenu(!activeResponsiveMenu)} className="header__menu btn">
                {activeResponsiveMenu ? <SvgRoundClose /> : <SvgMenuBurger />}
              </button>
              {mapMenu && <button className="header__tab__text"></button>}
            </div>
          ) : (
            <div className="header__left">
              <Link href="/home">
                <div className="header__img__area">
                  <Image src="/images/avater.png" width={48} height={48} loading="eager" alt="logo" />
                </div>
              </Link>
              <button onClick={() => setActiveResponsiveMenu(!activeResponsiveMenu)} className="header__menu btn">
                {activeResponsiveMenu ? <SvgRoundClose /> : <SvgMenuBurger />}
              </button>
              <ZuluClock textColor="white" />
              {/* <div style={{ color: 'white' }}>version 20230713</div> */}
            </div>
          )}
          <div className="header__mid">
            <ul className="header__nav">
              {mapMenu
                ? workMenu.map((link) => (
                    <li key={link.id} className="header__nav__item">
                      <Link
                        className="header__nav__anc"
                        href={link.link}
                        onClick={(e) => handleClickMenu(e, link.link)}
                      >
                        <span className="header__nav__link">{link.name}</span>
                      </Link>
                    </li>
                  ))
                : homeMenu.map((link) => (
                    <li key={link.id} className="header__nav__item">
                      <Link className="header__nav__anc" href={link.link}>
                        <span className="header__nav__link">{link.name}</span>
                        <div className="header__nav__icon">{link.children && <SvgDropDown />}</div>
                      </Link>
                      {link.children && (
                        <div className="header__nav__dropdown">
                          <ul className="header__nav__dropdown__list flex flex-column">
                            {link.children.map((child) => (
                              <li key={child.id} className="header__nav__dropdown__item">
                                <Link className="header__nav__dropdown__anc" href={child.link}>
                                  <span className="header__nav__dropdown__link">{child.name}</span>
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
              <Link href="/home">
                {mapMenu ? (
                  <button className="header__rgt__btn header__rgt__btn--map btn">Home</button>
                ) : (
                  <button className="header__rgt__btn header__rgt__btn--lft btn">New to EZWxBrief?</button>
                )}
              </Link>
              {isUserLoginUser ? (
                <div className="header__icon__area">
                  <button
                    className="header__rgt__btn header__rgt__btn--icon btn"
                    onClick={() => {
                      closeAllModals();
                      dispatch(setShowInformation());
                    }}
                  >
                    <SvgWarn />
                  </button>
                  <button
                    className="header__rgt__btn header__rgt__btn--icon btn"
                    onClick={() => {
                      closeAllModals();
                      dispatch(setShowSavedView(true));
                    }}
                  >
                    <SvgSave />
                  </button>
                  <button
                    className="header__rgt__btn header__rgt__btn--icon btn"
                    onClick={() => {
                      closeAllModals();
                      dispatch(setShowSettingsView(true));
                    }}
                  >
                    <SvgSetting />
                  </button>
                  <button
                    onClick={() => {
                      closeAllModals();
                      handleProfileModal();
                    }}
                    className="header__rgt__btn header__rgt__btn--icon btn"
                  >
                    <SvgProfile />
                  </button>
                </div>
              ) : (
                <button className="header__rgt__btn header__rgt__btn--rgt btn">
                  <Link href="/signup">Join Now</Link>
                  <Link href="/signin"> | Sign in</Link>
                </button>
              )}
            </div>
          </div>
        </div>
        <SettingsDrawer
          isShowSettingsDrawer={showSettingsView}
          setIsShowSettingsDrawer={(show) => dispatch(setShowSettingsView(show))}
        />
        <FavoritesDrawer isOpen={showSavedView} onClose={() => dispatch(setShowSavedView(false))} />
        <ProfileModal
          setIsUserLoginUser={setIsUserLoginUser}
          isShowProfileModal={isShowProfileModal}
          handleProfileModal={handleProfileModal}
        />
        <Dialog
          PaperComponent={PaperComponent}
          hideBackdrop
          disableEnforceFocus
          style={{ position: 'absolute' }}
          open={showAirportSelect}
          onClose={() => setShowAirportSelect(false)}
        >
          <AirportSelectModal setIsShowModal={setShowAirportSelect} />
        </Dialog>
      </div>
      <ResponsiveMenu
        activeResponsiveMenu={activeResponsiveMenu}
        activeMenu={activeMenu}
        handleActiveMenu={handleActiveMenu}
        mapMenu={mapMenu}
        workMenu={workMenu}
        homeMenu={homeMenu}
        handleClickMenu={handleClickMenu}
      />
    </div>
  );
}

const ResponsiveMenu = ({
  activeResponsiveMenu,
  activeMenu,
  handleActiveMenu,
  mapMenu,
  workMenu,
  homeMenu,
  handleClickMenu,
}) => {
  const responsiveMenu = [
    {
      id: 0,
      name: 'Home',
      link: '/home',
    },
    ...workMenu,
  ];
  return (
    <div className={`responsive__menu ${activeResponsiveMenu ? 'responsive__menu__show' : ''}`}>
      {mapMenu
        ? responsiveMenu.map((link) => (
            <div key={link.id}>
              <div
                onClick={() => handleActiveMenu(link.id, link.children !== undefined)}
                key={link.id}
                className={`responsive__menu__item ${
                  activeMenu && activeMenu === link.id ? 'responsive__menu__active' : ''
                }`}
              >
                <Link href={link.link} onClick={(e) => handleClickMenu(e, link.link)}>
                  <span className="responsive__menu__link">{link.name}</span>
                </Link>
              </div>
            </div>
          ))
        : homeMenu.map((link) => (
            <div key={link.id}>
              <div
                onClick={() => handleActiveMenu(link.id, link.children !== undefined)}
                key={link.id}
                className={`responsive__menu__item ${
                  activeMenu && activeMenu === link.id ? 'responsive__menu__active' : ''
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
                    activeMenu == link.id && 'responsive__menu__dropdown__list-visible'
                  }`}
                >
                  {link.children.map((child) => (
                    <Link href={child.link} key={child.id}>
                      <span className="responsive__menu__dropdown__link">{child.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
    </div>
  );
};
