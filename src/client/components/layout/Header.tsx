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
import { selectShowInformation, setShowInformation } from '../../store/imagery/imagery';
import AirportSelectModal from '../airportwx/AirportSelectModal';
import { PaperComponent } from '../common/PaperComponent';
import { setViewHeight, setViewWidth } from '../../store/airportwx/airportwx';
import { useOrientation } from 'react-use';
import {
  selectShowSavedView,
  selectShowSettingsView,
  setShowSavedView,
  setShowSettingsView,
} from '../../store/header/header';
import { DraggableDlg } from '../common/DraggableDlg';
const FavoritesDrawer = dynamic(() => import('../shared/FavoritesDrawer'), { ssr: false });

interface menuItem {
  id: number;
  name: string;
  link: string;
  children?: any;
}
const menusHome: menuItem[] = [
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
    name: 'Pricing',
    link: '/pricing',
  },
  {
    id: 4,
    name: 'Training',
    link: 'https://avwxtraining.com',
  },
  {
    id: 5,
    name: 'Blog',
    link: 'https://avwxtraining.com/blog',
  },
  {
    id: 6,
    name: 'About Us',
    link: '#',
    children: [
      {
        id: 8,
        name: 'Contact Us',
        link: '/contact-us',
      },
      {
        id: 9,
        name: 'Support',
        link: '/support',
      },
      {
        id: 10,
        name: 'Team EZWxBrief',
        link: '/team-ezwxbrief',
      },
    ],
  },
  {
    id: 7,
    name: 'FAQ',
    link: '/faq',
  },
];
const menusHomeNotAuth: menuItem[] = [
  {
    id: 1,
    name: 'Home',
    link: '/home',
  },
  {
    id: 2,
    name: 'Try EZWxBrief',
    link: '/signup',
  },
  {
    id: 3,
    name: 'Pricing',
    link: '/pricing',
  },
  {
    id: 4,
    name: 'Training',
    link: 'https://avwxtraining.com',
  },
  {
    id: 5,
    name: 'Blog',
    link: 'https://avwxtraining.com/blog',
  },
  {
    id: 6,
    name: 'About Us',
    link: '#',
    children: [
      {
        id: 7,
        name: 'Contact Us',
        link: '/contact-us',
      },
      {
        id: 8,
        name: 'Support',
        link: '/support',
      },
      {
        id: 9,
        name: 'Team EZWxBrief',
        link: '/team-ezwxbrief',
      },
    ],
  },
  {
    id: 10,
    name: 'FAQ',
    link: '/faq',
  },
];

const menusMap: menuItem[] = [
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

const menusMapNotAuth: menuItem[] = [
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
  const showInformation = useSelector(selectShowInformation);
  const [cookies] = useCookies(['logged_in']);
  useGetUserQuery(null, { refetchOnMountOrArgChange: true });
  const dispatch = useDispatch();
  const { type: orientation } = useOrientation();

  useEffect(() => {
    if (
      pathname === '/map' ||
      pathname === '/imagery' ||
      pathname === '/route-profile' ||
      pathname === '/airportwx' ||
      pathname === '/dashboard'
    ) {
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

  useEffect(() => {
    setActiveResponsiveMenu(false);
  }, [orientation]);

  const handleActiveMenu = (id, hideResponsiveMenu) => {
    setActiveMenu((prevState) => (prevState === id ? 0 : id));
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
    setActiveResponsiveMenu(false);
    switch (link) {
      case '/airportwx':
        e.preventDefault();
        setShowAirportSelect(true);
        break;
    }
  }

  let infoTitle = 'Info:';
  let infoBody: any = '';
  switch (pathname) {
    case '/imagery':
      infoTitle = 'Info: Imagery';
      infoBody = '';
      break;
    case '/dashboard':
      infoTitle = 'Info: Dashboard';
      infoBody =
        'This is the EZWxBrief Dashboard. From this page you can visit items in your saved folders as well as the most recent routes, airports and imagery collections. Up to ten recent routes, airports and imagery collections are provided beginning with the most recent at the top of the list. Simply click on the route, airport or imagery listed in these groups to visit the page for that specific saved or recent item. Saved or recent routes can be opened up in the Map or Route Profile page. If a ribbon icon appears next to the route, airport or imagery collection that means that it is saved in one or more of your saved folders. Within this Dashboard you can also view your general and aircraft settings as well as the settings for each of your personal weather minimums.';
      break;
    case '/home':
      infoTitle = 'Info: EZWxBrief Home page';
      infoBody = (
        <>
          EZWxBrief an affordable progressive web app elegantly designed to blend high resolution supplemental weather
          guidance with your personal weather minimums. All of this is seamlessly integrated with the EZDeparture
          Advisor™ a unique approach that quantifies your risk and instantly lets you know the most favorable time to
          depart based on your personal weather minimums. Check out our{' '}
          <a className="link-text" target="_blank" href="https://youtube.com/@ezwxbrief">
            YouTube channel
          </a>{' '}
          for tutorials on how to utilize EZWxBrief.
        </>
      );
      break;
  }
  return (
    <div className={`header ${sticky && 'header--fixed'}`}>
      <div className="container">
        <Toaster />
        <div className="header__wrp">
          {!mapMenu ? (
            <div className="header__left">
              <Link href="/home">
                <div className="header__img__area">
                  <Image
                    src="/images/Logo.png"
                    loading="eager"
                    width={100}
                    height={72}
                    alt="logo"
                    className="header__img"
                  />
                </div>
              </Link>
              <button onClick={() => setActiveResponsiveMenu(!activeResponsiveMenu)} className="header__menu btn">
                {activeResponsiveMenu ? <SvgRoundClose /> : <SvgMenuBurger />}
              </button>
              {mapMenu && <button className="header__tab__text"></button>}
              {isUserLoginUser && <ZuluClock textColor="white" />}
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
              {isUserLoginUser && <ZuluClock textColor="white" />}
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
                      <Link
                        className="header__nav__anc"
                        href={link.link}
                        onClick={(e) => handleClickMenu(e, link.link)}
                      >
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
              {isUserLoginUser ? (
                <div className="header__icon__area">
                  <button
                    className="header__rgt__btn header__rgt__btn--icon btn"
                    onClick={() => {
                      closeAllModals();
                      dispatch(setShowInformation(true));
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
                <>
                  <div className="new-message">
                    <center>New to EZWxBrief?</center>
                  </div>
                  <button className="header__rgt__btn header__rgt__btn--rgt btn">
                    <Link href="/signup">Join Now</Link>
                    <Link href="/signin"> | Sign in</Link>
                  </button>
                </>
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
      {pathname !== '/imagery' && (
        <DraggableDlg
          title={infoTitle}
          open={showInformation}
          onClose={() => dispatch(setShowInformation(false))}
          body={infoBody}
        ></DraggableDlg>
      )}
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
  const { type: orientation } = useOrientation();
  const [height, setHeight] = useState(orientation === 'landscape-primary' ? 'calc(100vh - 70px)' : 330);
  const [submenuOpened, setSubmenuOpened] = useState(false);
  useEffect(() => {
    if (orientation !== 'landscape-primary') {
      setHeight(submenuOpened ? 480 : 330);
    } else {
      setHeight('calc(100vh - 70px)');
    }
  }, [orientation, submenuOpened]);

  return (
    <div className={`responsive__menu ${activeResponsiveMenu ? 'responsive__menu__show' : ''}`} style={{ height }}>
      {mapMenu
        ? responsiveMenu.map((link) => (
            <div key={link.id}>
              <div
                onClick={() => {
                  handleActiveMenu(link.id, link.children !== undefined);
                  if (link.children !== undefined) {
                    orientation !== 'landscape-primary' && setHeight(520);
                    setSubmenuOpened((prevState) => !prevState);
                  }
                }}
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
                onClick={() => {
                  handleActiveMenu(link.id, link.children !== undefined);
                  if (link.children !== undefined) {
                    orientation !== 'landscape-primary' && setHeight(480);
                    setSubmenuOpened((prevState) => !prevState);
                  }
                }}
                key={link.id}
                className={`responsive__menu__item ${
                  activeMenu && activeMenu === link.id ? 'responsive__menu__active' : ''
                }`}
              >
                <Link
                  href={link.link}
                  onClick={(e) => {
                    handleClickMenu(e, link.link);
                  }}
                >
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
                    <Link
                      href={child.link}
                      key={child.id}
                      onClick={(e) => {
                        handleClickMenu(e, link.link);
                      }}
                    >
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
