import React from 'react';
import { NextPage } from 'next';
import HomeHero from '../components/Home/HomeHero';
import HomeAbout from '../components/Home/HomeAbout';

const Home: NextPage<{ data: string }> = () => {
  return (
    <div>
      <HomeHero />
      <HomeAbout />
    </div>
  );
};

Home.getInitialProps = ({ query }) => {
  return {
    data: `some initial props including query params and controller data: ${JSON.stringify(
      query,
    )}`,
  };
};

export default Home;
