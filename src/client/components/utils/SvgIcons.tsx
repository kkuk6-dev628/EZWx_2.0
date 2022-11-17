import React from 'react';

function SvgDropDown() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 10L12 14L16 10"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
function SvgMenuBurger() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="8" y="12" width="28" height="4" rx="2" fill="white" />
      <rect x="8" y="20" width="28" height="4" rx="2" fill="white" />
      <rect x="8" y="28" width="28" height="4" rx="2" fill="white" />
    </svg>
  );
}
function SvgRoundClose() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="44" height="44" rx="8" fill="#791DC6" />
      <rect
        x="13.5146"
        y="10.6865"
        width="28"
        height="4"
        rx="2"
        transform="rotate(45 13.5146 10.6865)"
        fill="white"
      />
      <rect
        x="10.6863"
        y="30.4854"
        width="28"
        height="4"
        rx="2"
        transform="rotate(-45 10.6863 30.4854)"
        fill="white"
      />
    </svg>
  );
}

export { SvgDropDown, SvgMenuBurger, SvgRoundClose };
