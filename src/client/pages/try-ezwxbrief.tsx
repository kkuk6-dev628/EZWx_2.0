import React from 'react';
import { NextPage } from 'next';
import Map from '../components/map/leaflet';
import Head from 'next/head';

const Home: NextPage<{ data: string }> = () => {
  return (
    <div>
      <Head>
        <title>EZWxBrief 2.0</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, minimal-ui"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      </Head>
      <Map />
    </div>
  );
};

Home.getInitialProps = ({ query }) => {
  return {
    data: `some initial props including query params and controller data: ${JSON.stringify(query)}`,
  };
};

export default Home;
