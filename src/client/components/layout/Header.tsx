import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { SvgDropDown } from '../utils/SvgIcons';

export default function Header() {
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
  return (
    <div className="header">
      <div className="container">
        <div className="header__wrp">
          <div className="header__lft">
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
    </div>
  );
}
