import React from 'react';
import { NextPage } from 'next';
import HomeHero from '../components/home/HomeHero';
import HomeAbout from '../components/home/HomeAbout';

import FlexiblePricing from '../components/shared/FlexiblePricing';

const Home: NextPage<{ data: string }> = () => {
  return (
    <>
      <HomeHero />
      <HomeAbout />
      <FlexiblePricing content={undefined} isShowBtn={undefined} />
    </>
  );
};

Home.getInitialProps = ({ query }) => {
  return {
    data: `some initial props including query params and controller data: ${JSON.stringify(query)}`,
  };
};

export default Home;
