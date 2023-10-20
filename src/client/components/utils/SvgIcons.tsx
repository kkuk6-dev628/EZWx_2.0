import React from 'react';

function SvgDropDown() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 10L12 14L16 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SvgMenuBurger() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="28" height="4" rx="2" fill="white" />
      <rect x="8" y="20" width="28" height="4" rx="2" fill="white" />
      <rect x="8" y="28" width="28" height="4" rx="2" fill="white" />
    </svg>
  );
}
function SvgRoundClose() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="8" fill="#791DC6" />
      <rect x="13.5146" y="10.6865" width="28" height="4" rx="2" transform="rotate(45 13.5146 10.6865)" fill="white" />
      <rect x="10.6863" y="30.4854" width="28" height="4" rx="2" transform="rotate(-45 10.6863 30.4854)" fill="white" />
    </svg>
  );
}

function SvgRoundPlus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8V16" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 12H8" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 21V21C7.029 21 3 16.971 3 12V12C3 7.029 7.029 3 12 3V3C16.971 3 21 7.029 21 12V12C21 16.971 16.971 21 12 21Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgRoundMinus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M16 12H8" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 21V21C7.029 21 3 16.971 3 12V12C3 7.029 7.029 3 12 3V3C16.971 3 21 7.029 21 12V12C21 16.971 16.971 21 12 21Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SvgBulbDollar() {
  return (
    <svg version="1.1" id="Capa_1" x="0px" y="0px" width="55px" height="55px" viewBox="0 0 571.199 571.199">
      <g>
        <path
          d="M352.898,534.834c-1.795,5.664-7.527,9.166-13.477,9.166h-0.205c-7.854,0-15.035,4.441-18.551,11.465l-0.143,0.285
		c-4.732,9.467-14.408,15.449-24.996,15.449h-19.856c-10.588,0-20.264-5.982-24.997-15.449l-0.143-0.285
		C247.016,548.441,239.835,544,231.981,544h-0.204c-5.943,0-11.676-3.502-13.471-9.166c-2.985-9.391,3.944-18.033,12.893-18.033H340
		C348.947,516.801,355.877,525.443,352.898,534.834z M141.351,383.418l-38.467,38.467c-5.311,5.312-5.311,13.92,0,19.23
		c2.652,2.66,6.133,3.986,9.615,3.986c3.481,0,6.963-1.326,9.615-3.986l38.467-38.467c5.311-5.311,5.311-13.92,0-19.23
		C155.277,378.107,146.655,378.107,141.351,383.418z M108.799,258.4c0-7.507-6.093-13.6-13.6-13.6h-54.4
		c-7.507,0-13.6,6.093-13.6,13.6c0,7.507,6.093,13.6,13.6,13.6h54.4C102.707,272,108.799,265.907,108.799,258.4z M285.599,81.6
		c7.506,0,13.6-6.093,13.6-13.6V13.6c0-7.507-6.094-13.6-13.6-13.6c-7.507,0-13.6,6.093-13.6,13.6V68
		C271.999,75.507,278.092,81.6,285.599,81.6z M420.232,137.367c3.482,0,6.957-1.326,9.615-3.984l38.467-38.468
		c5.311-5.311,5.311-13.92,0-19.23s-13.918-5.311-19.23,0l-38.467,38.468c-5.311,5.311-5.311,13.919,0,19.23
		C413.27,136.041,416.75,137.367,420.232,137.367z M141.351,133.382c2.652,2.659,6.134,3.984,9.615,3.984
		c3.482,0,6.963-1.326,9.615-3.984c5.311-5.311,5.311-13.92,0-19.23l-38.467-38.468c-5.304-5.311-13.927-5.311-19.23,0
		c-5.311,5.311-5.311,13.919,0,19.23L141.351,133.382z M530.398,244.8H476c-7.508,0-13.602,6.093-13.602,13.6
		c0,7.507,6.094,13.6,13.602,13.6h54.398c7.508,0,13.602-6.093,13.602-13.6C544,250.893,537.906,244.8,530.398,244.8z
		 M429.848,383.418c-5.311-5.311-13.92-5.311-19.23,0s-5.311,13.92,0,19.23l38.467,38.467c2.66,2.66,6.135,3.986,9.615,3.986
		c3.482,0,6.957-1.326,9.615-3.986c5.311-5.311,5.311-13.918,0-19.23L429.848,383.418z M340,482.801H231.199
		c-7.507,0-13.6,6.092-13.6,13.6s6.093,13.6,13.6,13.6H340c7.506,0,13.6-6.092,13.6-13.6S347.506,482.801,340,482.801z M353.6,462.4
		c0,7.508-6.094,13.6-13.6,13.6H231.199c-7.507,0-13.6-6.092-13.6-13.6c0-7.242,5.678-13.111,12.818-13.52
		c-8.466-76.527-87.618-93.574-87.618-183.681c0-78.867,63.934-142.8,142.8-142.8c78.866,0,142.799,63.934,142.799,142.8
		c0,90.106-79.15,107.153-87.617,183.681C347.922,449.289,353.6,455.158,353.6,462.4z M339.91,230.5
		c-4.631-13.852-18.773-29.736-43.893-33.184V180.9c0-5.63-4.57-10.2-10.201-10.2s-10.2,4.569-10.2,10.2v16.714
		c-20.862,4.04-36.972,20.23-39.107,40.807c-1.985,19.196,9.187,44.445,47.212,52.408c20.678,4.33,32.6,15.959,31.104,30.34
		c-1.211,11.689-11.561,23.516-29.016,23.516c-20.72,0-31.661-10.752-34.741-19.959c-1.789-5.338-7.562-8.234-12.907-6.439
		c-5.345,1.795-8.228,7.568-6.439,12.906c4.638,13.852,18.782,29.736,43.894,33.178v16.43c0,5.629,4.57,10.199,10.2,10.199
		s10.201-4.57,10.201-10.199v-16.715c20.861-4.039,36.971-20.23,39.105-40.807c1.986-19.197-9.186-44.445-47.213-52.408
		c-20.678-4.332-32.598-15.959-31.102-30.341c1.21-11.689,11.56-23.515,29.016-23.515c20.719,0,31.667,10.751,34.741,19.958
		c1.789,5.338,7.541,8.235,12.906,6.44C338.816,241.625,341.699,235.851,339.91,230.5z"
        />
      </g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
      <g></g>
    </svg>
  );
}

function SvgHomeAirport() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.6567 5.40197V5.40197C20.7809 8.52617 20.7809 13.5915 17.6567 16.7157L13.3329 21.0395C12.5967 21.7757 11.4031 21.7757 10.6668 21.0395L6.34302 16.7157C3.21883 13.5915 3.21883 8.52617 6.34302 5.40197V5.40197C9.46722 2.27778 14.5325 2.27778 17.6567 5.40197Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.75 15.2501V13.0001C10.75 12.3096 11.3095 11.7501 12 11.7501V11.7501C12.6905 11.7501 13.25 12.3096 13.25 13.0001V15.2501H16V10.9571C16 10.6921 15.8945 10.4376 15.707 10.2501L12.3535 6.89662C12.158 6.70112 11.8415 6.70112 11.6465 6.89662L8.293 10.2501C8.1055 10.4376 8 10.6921 8 10.9571V15.2501H10.75Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgSave() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 44 44" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.2084 5.5H29.7917C31.8175 5.5 33.4584 7.14083 33.4584 9.16667V38.5L22 33L10.5417 38.5V9.16667C10.5417 7.15 12.1917 5.5 14.2084 5.5Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgWarn() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 46 46" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30.3364 39.5067H15.6636C10.5997 39.5067 6.49316 35.4001 6.49316 30.3362V15.6634C6.49316 10.5995 10.5997 6.49292 15.6636 6.49292H30.3364C35.4004 6.49292 39.5069 10.5995 39.5069 15.6634V30.3362C39.5069 35.4001 35.4004 39.5067 30.3364 39.5067Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.9982 15.6634C22.7451 15.6634 22.5397 15.8688 22.5415 16.1219C22.5415 16.375 22.747 16.5804 23.0001 16.5804C23.2532 16.5804 23.4586 16.375 23.4586 16.1219C23.4586 15.8688 23.2532 15.6634 22.9982 15.6634"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.4585 30.6736V21.9617H21.6245"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgSetting() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 44 44" fill="none">
      <path
        d="M25.5002 18.4999C27.4333 20.433 27.4333 23.5671 25.5002 25.5002C23.5671 27.4333 20.4329 27.4333 18.4998 25.5002C16.5667 23.5671 16.5667 20.433 18.4998 18.4999C20.4329 16.5668 23.5671 16.5668 25.5002 18.4999"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.62499 22C9.62499 22.5445 9.67449 23.089 9.74049 23.617L6.82915 25.894C6.18382 26.4 6.00782 27.3038 6.41849 28.0133L9.00715 32.4922C9.41599 33.2017 10.285 33.5005 11.0458 33.1962L13.6528 32.1493C14.168 31.9422 14.7418 32.0247 15.2038 32.3308C15.6072 32.5985 16.0252 32.8442 16.4578 33.0642C16.9528 33.3153 17.3122 33.7645 17.391 34.3145L17.7888 37.0883C17.9043 37.8987 18.5992 38.5 19.4168 38.5H24.5813C25.399 38.5 26.0938 37.8987 26.2093 37.0883L26.6071 34.3163C26.686 33.7663 27.049 33.3135 27.5458 33.0642C27.9766 32.8478 28.3928 32.604 28.7943 32.3382C29.26 32.0302 29.8356 31.9422 30.3526 32.1512L32.9541 33.1962C33.7131 33.5005 34.5821 33.2017 34.9928 32.4922L37.5815 28.0133C37.9922 27.3038 37.8161 26.3982 37.1708 25.894L34.2595 23.617C34.3255 23.089 34.375 22.5445 34.375 22C34.375 21.4555 34.3255 20.911 34.2595 20.383L37.1708 18.106C37.8161 17.6 37.9922 16.6962 37.5815 15.9867L34.9928 11.5078C34.584 10.7983 33.715 10.4995 32.9541 10.8038L30.3526 11.8488C29.8356 12.056 29.26 11.9698 28.7943 11.6618C28.3928 11.396 27.9766 11.1522 27.5458 10.9358C27.049 10.6865 26.686 10.2337 26.6071 9.68367L26.2112 6.91167C26.0957 6.10133 25.4008 5.5 24.5831 5.5H19.4187C18.601 5.5 17.9062 6.10133 17.7907 6.91167L17.391 9.68733C17.3122 10.2355 16.951 10.6865 16.4578 10.9377C16.0252 11.1577 15.6072 11.4052 15.2038 11.671C14.74 11.9753 14.1662 12.0578 13.651 11.8507L11.0458 10.8038C10.285 10.4995 9.41599 10.7983 9.00715 11.5078L6.41849 15.9867C6.00782 16.6962 6.18382 17.6018 6.82915 18.106L9.74049 20.383C9.67449 20.911 9.62499 21.4555 9.62499 22V22Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgProfile() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 44 44" fill="none">
      <path
        d="M33.6673 10.3327C40.111 16.7764 40.111 27.2236 33.6673 33.6672C27.2237 40.1109 16.7765 40.1109 10.3329 33.6672C3.88921 27.2236 3.88921 16.7764 10.3329 10.3327C16.7765 3.88909 27.2237 3.88909 33.6673 10.3327"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31.7295 35.3044C31.0255 31.9311 26.9592 29.3333 22 29.3333C17.0408 29.3333 12.9745 31.9311 12.2705 35.3044"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.8891 14.4442C28.037 16.592 28.037 20.0745 25.8891 22.2223C23.7412 24.3702 20.2588 24.3702 18.1109 22.2223C15.963 20.0745 15.963 16.592 18.1109 14.4442C20.2588 12.2963 23.7412 12.2963 25.8891 14.4442"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgRefresh() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
      <path
        d="M17 6.32886C11.6194 6.32968 7.08111 10.3362 6.41311 15.6751C5.74511 21.0141 9.15641 26.0153 14.3709 27.3417C19.5855 28.6682 24.9719 25.905 26.9362 20.8958C28.9006 15.8866 26.8283 10.1985 22.1022 7.62673"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.1021 11.7286V7.01196H26.8187"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgCollapse() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="#3f0c69"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m20 20l-5-5m0 0v4m0-4h4M4 20l5-5m0 0v4m0-4H5M20 4l-5 5m0 0V5m0 4h4M4 4l5 5m0 0V5m0 4H5"
      />
    </svg>
  );
}
function SvgLayer() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M28 22.6399L15.9867 27.9999"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.9867 27.9999L4 22.6399"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M28 16L15.9867 21.36" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.9867 21.36L4 16" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 9.36533L15.9827 14.732L28 9.36533L16.0173 4L4 9.36533Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgRoute() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M10.5523 6.1143C11.5937 7.1557 11.5937 8.84414 10.5523 9.88554C9.51089 10.9269 7.82245 10.9269 6.78105 9.88554C5.73965 8.84414 5.73965 7.1557 6.78105 6.1143C7.82245 5.0729 9.51089 5.0729 10.5523 6.1143"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.312 24H11.5027C9.568 24 8 22.2093 8 20.0013V19.9973C8 17.7893 9.568 15.9987 11.5027 15.9987H20.496C22.4307 15.9987 23.9987 14.208 23.9987 12V12C24 9.788 22.4293 7.99734 20.4933 8L15 8.00667"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.7866 26.912L25.6386 24.6333C26.12 24.348 26.12 23.6506 25.6386 23.3666L21.7866 21.088C21.292 20.7946 20.6666 21.152 20.6666 21.7266V26.2733C20.6666 26.848 21.292 27.2053 21.7866 26.912Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgForward() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256">
      <path
        fill="#3F0C69"
        d="M208 40v176a8 8 0 0 1-16 0v-69.23L72.43 221.55A15.95 15.95 0 0 1 48 208.12V47.88a15.95 15.95 0 0 1 24.43-13.43L192 109.23V40a8 8 0 0 1 16 0Z"
      />
    </svg>
  );
}
function SvgBackward() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
      <path
        fill="#3F0C69"
        d="M112 64a16 16 0 0 1 16 16v136.43L360.77 77.11a35.13 35.13 0 0 1 35.77-.44c12 6.8 19.46 20 19.46 34.33v290c0 14.37-7.46 27.53-19.46 34.33a35.14 35.14 0 0 1-35.77-.45L128 295.57V432a16 16 0 0 1-32 0V80a16 16 0 0 1 16-16Z"
      />
    </svg>
  );
}
function SvgProfileCharge() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
      <path
        d="M10.9974 19.6678L14.3322 16.1103L17.6669 19.6678L23.0024 14.3323"
        stroke="#3F0C69"
        strokeWidth="1.41"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4.995"
        y="4.99512"
        width="24.01"
        height="24.01"
        rx="5"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgBaseMap() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.1573 5.61478L5.824 7.39212C4.73467 7.75478 4 8.77478 4 9.92278V24.5095C4 25.5001 5.04267 26.1455 5.92933 25.7015L10.8067 23.2628C11.5573 22.8868 12.4413 22.8868 13.192 23.2628L18.8067 26.0708C19.5573 26.4468 20.4413 26.4468 21.192 26.0708L26.5253 23.4041C27.4293 22.9521 28 22.0281 28 21.0188V7.18278C28 6.27212 27.108 5.62945 26.2453 5.91745L20.844 7.71745C20.296 7.90012 19.7053 7.90012 19.1573 7.71745L12.8427 5.61478C12.296 5.43212 11.704 5.43212 11.1573 5.61478V5.61478Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 12.7068V20.6268" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 10.04V17.96" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SvgMap() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M23.1027 9.57184C23.1027 5.7585 19.9227 2.6665 16 2.6665C12.0773 2.6665 8.89734 5.7585 8.89734 9.57184C8.89734 13.6025 13.1987 17.9318 15.1067 19.6545C15.6173 20.1145 16.3827 20.1145 16.8933 19.6545C18.8013 17.9318 23.1027 13.6025 23.1027 9.57184Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.6716 8.10725C18.5948 9.01847 18.5948 10.4959 17.6716 11.4071C16.7484 12.3183 15.2516 12.3183 14.3284 11.4071C13.4052 10.4958 13.4052 9.01846 14.3284 8.10725C15.2516 7.19602 16.7484 7.19602 17.6716 8.10725"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0747 13.5693L4 16V26.6667L10.6667 24L16 28L21.3333 24L28 26.6667V16L21.9253 13.5693"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgTemperature() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M7.50671 18.2427V7.25867C7.50671 5.45867 8.96537 4 10.7654 4C12.5654 4 14.024 5.45867 14.024 7.25867V18.2427V18.2453C15.336 19.2373 16.1974 20.7947 16.1974 22.5653C16.1974 25.568 13.7654 28 10.7654 28C7.76537 28 5.33337 25.568 5.33337 22.568C5.33337 20.7973 6.19471 19.2373 7.50671 18.248"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 9.33341H26.6667" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 5.33341H26.6667" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 13.3334H26.6667" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 17.3334H26.6667" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6667 24.6667C11.7713 24.6667 12.6667 23.7713 12.6667 22.6667C12.6667 21.5622 11.7713 20.6667 10.6667 20.6667C9.56218 20.6667 8.66675 21.5622 8.66675 22.6667C8.66675 23.7713 9.56218 24.6667 10.6667 24.6667Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10.6667 20.6667V12" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SvgThreeDot() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 21V21C7.029 21 3 16.971 3 12V12C3 7.029 7.029 3 12 3V3C16.971 3 21 7.029 21 12V12C21 16.971 16.971 21 12 21Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.999 11.625C11.792 11.625 11.624 11.793 11.626 12C11.626 12.207 11.794 12.375 12.001 12.375C12.208 12.375 12.376 12.207 12.376 12C12.375 11.793 12.207 11.625 11.999 11.625"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.999 11.625C15.792 11.625 15.624 11.793 15.626 12C15.626 12.207 15.794 12.375 16.001 12.375C16.208 12.375 16.376 12.207 16.376 12C16.375 11.793 16.207 11.625 15.999 11.625"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.99899 11.625C7.79199 11.625 7.62399 11.793 7.62599 12C7.62599 12.207 7.79399 12.375 8.00099 12.375C8.20799 12.375 8.37599 12.207 8.37599 12C8.37499 11.793 8.20699 11.625 7.99899 11.625"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgAir() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 20H16" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.636 14.636L3 12L4.553 11.224C4.835 11.083 5.166 11.083 5.447 11.224L7 12L10.192 10.023L6 6.023L9 5L14 8L18.707 5.31C19.858 4.652 21.319 5.276 21.64 6.562V6.562C21.854 7.416 21.483 8.31 20.728 8.763L12.325 13.805C12.11 13.934 11.872 14.022 11.625 14.063L6.507 14.916C6.189 14.968 5.864 14.864 5.636 14.636Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgTabs() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26px" height="26px" viewBox="0 0 24 24" fill="none">
      <path
        d="M19.0029 5.99752H4.99707"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.99792 2.9963H17.0021"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="2.99622"
        y="8.99878"
        width="18.0075"
        height="12.005"
        rx="2"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgZoom() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26px" height="26px" viewBox="0 0 24 24" fill="none">
      <path d="M8 16L16 8" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8H16V12" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16H8V12" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgBin() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6.53003H19" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10.47V16.53" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9.31006V17.5801" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 10.47V16.53" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.795 20.4721H8.205C6.987 20.4721 6 19.4851 6 18.2671V6.52808H18V18.2671C18 19.4851 17.013 20.4721 15.795 20.4721Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 6.52808L15.262 4.22308C15.129 3.80908 14.744 3.52808 14.31 3.52808H9.69C9.255 3.52808 8.87 3.80908 8.738 4.22308L8 6.52808"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 6.53003H6" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SvgLeftRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M8.6 3.3999L5 6.9999L8.6 10.5999"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M19 7H5" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M15.4 20.5999L19 16.9999L15.4 13.3999"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 17H19" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SvgBookmark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.3334 4H21.6667C23.14 4 24.3334 5.19333 24.3334 6.66667V28L16 24L7.66669 28V6.66667C7.66669 5.2 8.86669 4 10.3334 4Z"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 14.6667H20" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 18.6665V10.6665" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SvgDownload() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4V22.6667" stroke="#3F0C69" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12 18.6665L16 22.6665L20 18.6665"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6667 13.3335H6.66667C5.19333 13.3335 4 14.5268 4 16.0002V25.3335C4 26.8068 5.19333 28.0002 6.66667 28.0002H25.3333C26.8067 28.0002 28 26.8068 28 25.3335V16.0002C28 14.5268 26.8067 13.3335 25.3333 13.3335H21.3333"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgShare() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="24" viewBox="0 0 17 24" fill="none">
      <path
        d="M11.04 6.02686L5.62665 10.0802"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.873 2.18954C15.9311 3.2476 15.9311 4.96306 14.873 6.02111C13.815 7.07917 12.0995 7.07917 11.0415 6.02111C9.98341 4.96305 9.98341 3.24759 11.0415 2.18954C12.0995 1.13148 13.815 1.13148 14.873 2.18954"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.04 17.9733L5.62665 13.9199"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.873 17.9791C15.9311 19.0372 15.9311 20.7526 14.873 21.8107C13.815 22.8687 12.0995 22.8687 11.0415 21.8107C9.98341 20.7526 9.98341 19.0371 11.0415 17.9791C12.0995 16.921 13.815 16.921 14.873 17.9791"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.62056 10.0862C6.67758 11.1432 6.67758 12.857 5.62056 13.914C4.56355 14.971 2.84978 14.971 1.79276 13.914C0.735745 12.857 0.735745 11.1432 1.79276 10.0862C2.84978 9.0292 4.56355 9.0292 5.62056 10.0862"
        stroke="#3F0C69"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SvgLeftArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M16.5 21L7.5 12L16.5 3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SvgRightArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M7.5 3L16.5 12L7.5 21" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export {
  SvgRightArrow,
  SvgLeftArrow,
  SvgShare,
  SvgDownload,
  SvgBookmark,
  SvgBin,
  SvgLeftRight,
  SvgZoom,
  SvgTabs,
  SvgAir,
  SvgThreeDot,
  SvgTemperature,
  SvgBaseMap,
  SvgMap,
  SvgProfileCharge,
  SvgLayer,
  SvgRoute,
  SvgRefresh,
  SvgProfile,
  SvgSetting,
  SvgCollapse,
  SvgHomeAirport,
  SvgSave,
  SvgWarn,
  SvgDropDown,
  SvgMenuBurger,
  SvgRoundClose,
  SvgBulbDollar,
  SvgRoundMinus,
  SvgRoundPlus,
  SvgForward,
  SvgBackward,
};
