import React from 'react';
import { AppProps } from 'next/app';
import Script from 'next/script';
import Header from '../components/layout/Header';
import '../assets/styles/globals.scss';
import Footer from '../components/layout/Footer';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            `}
      </Script>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
};

export default App;
