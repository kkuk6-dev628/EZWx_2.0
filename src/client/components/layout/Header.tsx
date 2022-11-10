import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

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
      <div className="header__lft">
        <Link href="/home">
          <div className="header__img__area">
            <Image
              src="/images/Logo.png"
              width={100}
              height={100}
              alt="logo"
              objectFit="contain"
              className="header__img"
            />
          </div>
        </Link>
      </div>
      <div className="header__mid">
        <ul className="header__nav">
          {links.map((link) => (
            <li key={link.id} className="header__nav__item">
              <Link href={link.link}>
                <span className="header__nav__link">{link.name}</span>
              </Link>
              {link.children && (
                <div className="header__nav__dropdown">
                  <ul className="header__nav__dropdown__list">
                    {link.children.map((child) => (
                      <li
                        key={child.id}
                        className="header__nav__dropdown__item"
                      >
                        <Link href={child.link}>
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
        <div className="header__rgt__btns">
          <Link href="/login">
            <button className="header__rgt__btn">New to EZWxBrief?</button>
          </Link>
          <Link href="/signup">
            <button className="header__rgt__btn">Join Now | Sign in</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
