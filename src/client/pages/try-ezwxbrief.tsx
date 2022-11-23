import React from 'react';
import { NextPage } from 'next';
import Map from '../components/map/leaflet';

const Home: NextPage<{ data: string }> = () => {
  return (
    <div>
      <Map />
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
