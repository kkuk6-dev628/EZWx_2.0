import React from 'react';
import { NextPage } from 'next';
import HomeHero from '../components/Home/HomeHero';

const Home: NextPage<{ data: string }> = () => {
  return (
    <div>
      <HomeHero />
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
